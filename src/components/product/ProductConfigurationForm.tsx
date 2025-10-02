'use client'

import { Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LoadingSkeleton, ErrorState } from '@/components/common/loading'

import { AddonAccordion } from './addons/AddonAccordion'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { usePriceCalculation } from '@/hooks/usePriceCalculation'

// Types for configuration data
interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText?: string
  paperStockCoatings: Array<{
    coatingId: string
    isDefault: boolean
    coating: {
      id: string
      name: string
    }
  }>
  paperStockSides: Array<{
    sidesOptionId: string
    priceMultiplier: number
    isEnabled: boolean
    sidesOption: {
      id: string
      name: string
    }
  }>
}

interface TurnaroundTime {
  id: string
  name: string
  displayName: string
  description?: string
  daysMin: number
  daysMax?: number
  pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
  basePrice: number
  priceMultiplier: number
  requiresNoCoating: boolean
  restrictedCoatings: string[]
  isDefault: boolean
}

interface Addon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT'
  price: number
  priceDisplay: string
  isDefault: boolean
  additionalTurnaroundDays: number
}

interface ConfigurationData {
  quantities: Array<{
    id: string
    value: number
    label: string
  }>
  sizes: Array<{
    id: string
    name: string
    displayName: string
    width: number
    height: number
    squareInches: number
    priceMultiplier: number
    isDefault: boolean
  }>
  paperStocks: PaperStock[]
  turnaroundTimes: TurnaroundTime[]
  addons: Addon[]
  addonsGrouped?: {
    aboveDropdown: Addon[]
    inDropdown: Addon[]
    belowDropdown: Addon[]
  }
  defaults: {
    quantity?: string
    size?: string
    paper?: string
    coating?: string
    sides?: string
    turnaround?: string
    addons?: string[]
  }
}

interface ProductConfiguration {
  quantity: string
  size: string
  exactSize: boolean
  sides: string
  paperStock: string
  coating: string
  turnaround: string
  selectedAddons: string[]
  // Special addon configurations
  variableDataConfig?: {
    enabled: boolean
    locationsCount: string
    locations: string
  }
  perforationConfig?: {
    enabled: boolean
    verticalCount: string
    verticalPosition: string
    horizontalCount: string
    horizontalPosition: string
  }
  bandingConfig?: {
    enabled: boolean
    bandingType: string
    itemsPerBundle: number
  }
  cornerRoundingConfig?: {
    enabled: boolean
    cornerType: string
  }
}

interface ProductConfigurationFormProps {
  productId: string
  basePrice?: number
  setupFee?: number
  onConfigurationChange?: (config: ProductConfiguration, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}

export default function ProductConfigurationForm({
  productId,
  basePrice = 0,
  setupFee = 0,
  onConfigurationChange,
  onPriceChange,
}: ProductConfigurationFormProps) {
  // Use the refactored hooks for state management
  const {
    configData,
    configuration,
    loading,
    error,
    updateConfiguration,
    getQuantityValue,
  } = useProductConfiguration({
    productId,
    onConfigurationChange: (config) => {
      const isComplete = Boolean(
        config.quantity &&
        config.size &&
        config.sides &&
        config.paper &&
        config.coating &&
        config.turnaround
      )

      // Convert to legacy format for backward compatibility
      const legacyConfig: ProductConfiguration = {
        quantity: config.quantity,
        size: config.size,
        exactSize: false, // TODO: Add exact size to new hook
        sides: config.sides,
        paperStock: config.paper, // Map from new 'paper' to legacy 'paperStock'
        coating: config.coating,
        turnaround: config.turnaround,
        selectedAddons: config.selectedAddons,
        variableDataConfig: config.variableDataConfig,
        perforationConfig: config.perforationConfig,
        bandingConfig: config.bandingConfig,
        cornerRoundingConfig: config.cornerRoundingConfig,
      }

      onConfigurationChange?.(legacyConfig, isComplete)

      // Calculate price and trigger price change
      const price = calculateFinalPrice(config)
      onPriceChange?.(price)
    },
  })

  // Price calculation using the new hook
  const { calculateFinalPrice } = usePriceCalculation({
    configData,
    getQuantityValue,
  })

  // Get legacy-compatible data structures for existing UI
  const legacyConfigData = configData ? convertToLegacyFormat(configData) : null

  function convertToLegacyFormat(data: any): ConfigurationData {
    return {
      quantities: data.quantities || [],
      sizes: data.sizes || [],
      paperStocks: data.paperStocks?.map((paper: any) => ({
        ...paper,
        paperStockCoatings: paper.coatings?.map((coating: any) => ({
          coatingId: coating.id,
          isDefault: coating.isDefault,
          coating: {
            id: coating.id,
            name: coating.name,
          },
        })) || [],
        paperStockSides: paper.sides?.map((side: any) => ({
          sidesOptionId: side.id,
          priceMultiplier: side.priceMultiplier,
          isEnabled: true,
          sidesOption: {
            id: side.id,
            name: side.name,
          },
        })) || [],
      })) || [],
      turnaroundTimes: data.turnaroundTimes || [],
      addons: data.addons || [],
      addonsGrouped: data.addonsGrouped || {
        aboveDropdown: [],
        inDropdown: [],
        belowDropdown: []
      },
      defaults: data.defaults || {},
    }
  }

  // Get available coatings and sides based on selected paper
  const availableCoatings = legacyConfigData?.paperStocks
    .find((p) => p.id === configuration.paper)
    ?.paperStockCoatings.map((psc) => ({
      id: psc.coatingId,
      name: psc.coating.name,
      isDefault: psc.isDefault,
    })) || []

  const availableSides = legacyConfigData?.paperStocks
    .find((p) => p.id === configuration.paper)
    ?.paperStockSides
    .filter((pss) => pss.isEnabled)
    .map((pss) => ({
      id: pss.sidesOptionId,
      name: pss.sidesOption.name,
      multiplier: pss.priceMultiplier,
    })) || []

  // Handle paper stock change (uses the new hook's automatic cascade logic)
  const handlePaperStockChange = (paperId: string) => {
    updateConfiguration({ paper: paperId })
  }

  // Calculate current price using the new hook
  const currentPrice = calculateFinalPrice(configuration)

  // Simplified handlers using the new hook
  const handleConfigChange = (field: string, value: any) => {
    updateConfiguration({ [field]: value })
  }

  const handleAddonChange = (selectedAddonIds: string[]) => {
    updateConfiguration({ selectedAddons: selectedAddonIds })
  }

  if (loading) {
    return <LoadingSkeleton count={8} />
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        title="Configuration Error"
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!legacyConfigData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No configuration data available</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Quantity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              QUANTITY
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select the number of pieces you need</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={configuration.quantity}
            onValueChange={(value) => handleConfigChange('quantity', value)}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              {(legacyConfigData.quantities || []).map((qty) => (
                <SelectItem key={qty.id} value={qty.id}>
                  {qty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Print Size */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              PRINT SIZE
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose your print dimensions</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={configuration.size}
            onValueChange={(value) => handleConfigChange('size', value)}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {(legacyConfigData.sizes || []).map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exact Size Checkbox */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              EXACT SIZE
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Check if you need exact size specifications</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={false} // TODO: Add exactSize to new configuration
              id="exactSize"
              onCheckedChange={(checked) => {
                // TODO: Handle exact size with new configuration
                console.log('Exact size:', checked)
              }}
            />
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="exactSize"
            >
              Exact size required
            </Label>
          </div>
        </div>

        {/* Sides */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              SIDES
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select single or double sided printing</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            disabled={availableSides.length === 0}
            value={configuration.sides}
            onValueChange={(value) => handleConfigChange('sides', value)}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select sides" />
            </SelectTrigger>
            <SelectContent>
              {availableSides.map((side) => (
                <SelectItem key={side.id} value={side.id}>
                  {side.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Paper */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              PAPER
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose your paper stock type</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={configuration.paper} onValueChange={handlePaperStockChange}>
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select paper" />
            </SelectTrigger>
            <SelectContent>
              {(legacyConfigData.paperStocks || []).map((paper) => (
                <SelectItem key={paper.id} value={paper.id}>
                  {paper.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Coating */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              COATING
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select coating finish for your paper</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            disabled={availableCoatings.length === 0}
            value={configuration.coating}
            onValueChange={(value) => handleConfigChange('coating', value)}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select coating" />
            </SelectTrigger>
            <SelectContent>
              {availableCoatings.map((coating) => (
                <SelectItem key={coating.id} value={coating.id}>
                  {coating.name}
                  {coating.isDefault && ' (Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add-ons & Upgrades Section - TEMPORARILY DISABLED FOR TESTING */}
        {/* {legacyConfigData.addons && legacyConfigData.addons.length > 0 && (
          <AddonAccordion
            addons={legacyConfigData.addons}
            addonsGrouped={legacyConfigData.addonsGrouped}
            disabled={loading}
            selectedAddons={configuration.selectedAddons}
            turnaroundTimes={legacyConfigData.turnaroundTimes}
            quantity={getQuantityValue(configuration)}
            onAddonChange={handleAddonChange}
            variableDataConfig={configuration.variableDataConfig}
            onVariableDataChange={(config) =>
              handleConfigChange('variableDataConfig', config)
            }
            perforationConfig={configuration.perforationConfig}
            onPerforationChange={(config) =>
              handleConfigChange('perforationConfig', config)
            }
            bandingConfig={configuration.bandingConfig}
            onBandingChange={(config) => handleConfigChange('bandingConfig', config)}
            cornerRoundingConfig={configuration.cornerRoundingConfig}
            onCornerRoundingChange={(config) =>
              handleConfigChange('cornerRoundingConfig', config)
            }
          />
        )} */}

        {/* Turnaround Time Selection */}
        {legacyConfigData.turnaroundTimes && legacyConfigData.turnaroundTimes.length > 0 && (
          <TurnaroundTimeSelector
            baseProductPrice={currentPrice}
            currentCoating={configuration.coating}
            disabled={loading}
            quantity={getQuantityValue(configuration)}
            selectedTurnaroundId={configuration.turnaround}
            turnaroundTimes={legacyConfigData.turnaroundTimes}
            onTurnaroundChange={(turnaroundId) => handleConfigChange('turnaround', turnaroundId)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
