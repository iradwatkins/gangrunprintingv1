'use client'

import { useEffect, useMemo, useState } from 'react'
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

import AddonAccordion from './AddonAccordion'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'

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
  const [configData, setConfigData] = useState<ConfigurationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Configuration state
  const [configuration, setConfiguration] = useState<ProductConfiguration>({
    quantity: '',
    size: '',
    exactSize: false,
    sides: '',
    paperStock: '',
    coating: '',
    turnaround: '',
    selectedAddons: [],
  })

  // Fetch configuration data
  useEffect(() => {
    const fetchConfigurationData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}/configuration`, {
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        if (!response.ok && response.status !== 200) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()

        // Check if we're using fallback data
        if (data._isFallback) {
          // Using fallback configuration
        }

        setConfigData(data)

        // Set default values
        if (data.defaults) {
          const newConfig = {
            quantity: data.defaults.quantity || data.quantities[0]?.id || '',
            size: data.defaults.size || data.sizes[0]?.id || '',
            exactSize: false,
            paperStock: data.defaults.paper || data.paperStocks[0]?.id || '',
            sides: '',
            coating: '',
            turnaround: data.defaults.turnaround || data.turnaroundTimes?.[0]?.id || '',
            selectedAddons: data.defaults.addons || [],
          }

          // Set default sides and coating based on selected paper
          if (newConfig.paperStock && data.paperStocks) {
            const selectedPaper = data.paperStocks.find((p: any) => p.id === newConfig.paperStock)
            if (selectedPaper) {
              // Set default coating
              const defaultCoating = selectedPaper.coatings.find((c: any) => c.isDefault)
              newConfig.coating = defaultCoating?.id || selectedPaper.coatings[0]?.id || ''

              // Set default sides (first enabled option)
              const firstEnabledSide = selectedPaper.sides.find((s: any) => s.isDefault)
              newConfig.sides = firstEnabledSide?.id || selectedPaper.sides[0]?.id || ''
            }
          }

          setConfiguration(newConfig)

          // Check if configuration is complete
          const isComplete =
            newConfig.quantity &&
            newConfig.size &&
            newConfig.sides &&
            newConfig.paperStock &&
            newConfig.coating &&
            newConfig.turnaround

          onConfigurationChange?.(newConfig, Boolean(isComplete))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchConfigurationData()
    }
  }, [productId, onConfigurationChange])

  // Get available coatings for selected paper
  const availableCoatings = useMemo(() => {
    if (!configData || !configuration.paperStock) return []

    const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paperStock)
    return (
      selectedPaper?.paperStockCoatings.map((psc) => ({
        id: psc.coatingId,
        name: psc.coating.name,
        isDefault: psc.isDefault,
      })) || []
    )
  }, [configData, configuration.paperStock])

  // Get available sides for selected paper
  const availableSides = useMemo(() => {
    if (!configData || !configuration.paperStock) return []

    const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paperStock)
    return (
      selectedPaper?.paperStockSides
        .filter((pss) => pss.isEnabled)
        .map((pss) => ({
          id: pss.sidesOptionId,
          name: pss.sidesOption.name,
          multiplier: pss.priceMultiplier,
        })) || []
    )
  }, [configData, configuration.paperStock])

  // Handle paper stock change (triggers cascade)
  const handlePaperStockChange = (paperId: string) => {
    if (!configData) return

    const selectedPaper = configData.paperStocks.find((p) => p.id === paperId)
    if (!selectedPaper) return

    // Get new available options for this paper
    const newAvailableCoatings = selectedPaper.paperStockCoatings.map((psc) => psc.coatingId)
    const newAvailableSides = selectedPaper.paperStockSides
      .filter((pss) => pss.isEnabled)
      .map((pss) => pss.sidesOptionId)

    // Reset coating if current selection is no longer available
    let newCoating = configuration.coating
    if (!newAvailableCoatings.includes(configuration.coating)) {
      const defaultCoating = selectedPaper.paperStockCoatings.find((c) => c.isDefault)
      newCoating = defaultCoating?.coatingId || newAvailableCoatings[0] || ''
    }

    // Reset sides if current selection is no longer available
    let newSides = configuration.sides
    if (!newAvailableSides.includes(configuration.sides)) {
      newSides = newAvailableSides[0] || ''
    }

    const newConfig = {
      ...configuration,
      paperStock: paperId,
      coating: newCoating,
      sides: newSides,
    }

    setConfiguration(newConfig)

    // Check if configuration is complete
    const isComplete =
      newConfig.quantity &&
      newConfig.size &&
      newConfig.sides &&
      newConfig.paperStock &&
      newConfig.coating

    onConfigurationChange?.(newConfig, Boolean(isComplete))
  }

  // Calculate pricing based on current configuration
  const calculatePrice = useMemo(() => {
    if (
      !configData ||
      !configuration.quantity ||
      !configuration.size ||
      !configuration.paperStock ||
      !configuration.sides
    ) {
      return 0
    }

    try {
      // Get selected quantities, sizes, and paper
      const selectedQuantity = configData.quantities.find((q) => q.id === configuration.quantity)
      const selectedSize = configData.sizes.find((s) => s.id === configuration.size)
      const selectedPaper = configData.paperStocks.find((p) => p.id === configuration.paperStock)
      const selectedSide = selectedPaper?.paperStockSides.find(
        (ps) => ps.sidesOptionId === configuration.sides
      )

      if (!selectedQuantity || !selectedSize || !selectedPaper || !selectedSide) {
        return 0
      }

      // Base pricing calculation
      let totalPrice = basePrice

      // Add paper cost (price per square inch * area)
      const paperArea = selectedSize.preCalculatedValue
      const paperCost = selectedPaper.pricePerSqInch * paperArea * selectedQuantity.calculationValue
      totalPrice += paperCost

      // Apply sides multiplier
      totalPrice *= selectedSide.priceMultiplier

      // Apply quantity discounts (simplified example)
      let quantityDiscount = 1.0
      if (selectedQuantity.calculationValue >= 5000) {
        quantityDiscount = 0.85 // 15% discount for 5000+
      } else if (selectedQuantity.calculationValue >= 2500) {
        quantityDiscount = 0.9 // 10% discount for 2500+
      } else if (selectedQuantity.calculationValue >= 1000) {
        quantityDiscount = 0.95 // 5% discount for 1000+
      }

      totalPrice *= quantityDiscount

      // Add setup fee
      totalPrice += setupFee

      return Math.max(0, totalPrice)
    } catch (error) {
      return 0
    }
  }, [configData, configuration, basePrice, setupFee])

  // Update price when configuration changes
  useEffect(() => {
    if (calculatePrice > 0) {
      onPriceChange?.(calculatePrice)
    }
  }, [calculatePrice, onPriceChange])

  // Check if configuration is complete
  const isConfigurationComplete = () => {
    return (
      configuration.quantity &&
      configuration.size &&
      configuration.sides &&
      configuration.paperStock &&
      configuration.coating &&
      configuration.turnaround
    )
  }

  // Handle other configuration changes
  const handleConfigChange = (
    field: keyof ProductConfiguration,
    value: string | boolean | string[]
  ) => {
    const newConfig = { ...configuration, [field]: value }
    setConfiguration(newConfig)

    // Check if configuration is complete
    const isComplete =
      newConfig.quantity &&
      newConfig.size &&
      newConfig.sides &&
      newConfig.paperStock &&
      newConfig.coating &&
      newConfig.turnaround

    onConfigurationChange?.(newConfig, Boolean(isComplete))
  }

  // Handle turnaround changes
  const handleTurnaroundChange = (turnaroundId: string) => {
    if (!configData) return

    const selectedTurnaround = configData.turnaroundTimes.find((t) => t.id === turnaroundId)
    let newConfig = { ...configuration, turnaround: turnaroundId }

    // If turnaround requires no coating, force coating to "No Coating" if available
    if (selectedTurnaround?.requiresNoCoating) {
      const selectedPaper = configData.paperStocks.find(
        (p: any) => p.id === configuration.paperStock
      )
      const noCoatingOption = selectedPaper?.paperStockCoatings.find(
        (c: any) => c.coating.name === 'No Coating'
      )
      if (noCoatingOption) {
        newConfig = { ...newConfig, coating: noCoatingOption.coatingId }
      }
    }

    setConfiguration(newConfig)

    // Check if configuration is complete
    const isComplete =
      newConfig.quantity &&
      newConfig.size &&
      newConfig.sides &&
      newConfig.paperStock &&
      newConfig.coating &&
      newConfig.turnaround

    onConfigurationChange?.(newConfig, Boolean(isComplete))
  }

  // Handle addon changes
  const handleAddonChange = (selectedAddonIds: string[]) => {
    const newConfig = { ...configuration, selectedAddons: selectedAddonIds }
    setConfiguration(newConfig)

    // Check if configuration is complete
    const isComplete =
      newConfig.quantity &&
      newConfig.size &&
      newConfig.sides &&
      newConfig.paperStock &&
      newConfig.coating &&
      newConfig.turnaround

    onConfigurationChange?.(newConfig, Boolean(isComplete))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !configData) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Error loading configuration options</p>
        <p className="text-sm text-muted-foreground">{error}</p>
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
              {configData.quantities.map((qty) => (
                <SelectItem key={qty.id} value={qty.id}>
                  {qty.displayValue.toLocaleString()}
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
              {configData.sizes.map((size) => (
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
              checked={configuration.exactSize}
              id="exactSize"
              onCheckedChange={(checked) => handleConfigChange('exactSize', String(checked))}
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
          <Select value={configuration.paperStock} onValueChange={handlePaperStockChange}>
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select paper" />
            </SelectTrigger>
            <SelectContent>
              {configData.paperStocks.map((paper) => (
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

        {/* Add-ons & Upgrades Section */}
        {configData.addons && configData.addons.length > 0 && (
          <AddonAccordion
            addons={configData.addons}
            disabled={loading}
            selectedAddons={configuration.selectedAddons}
            turnaroundTimes={configData.turnaroundTimes}
            onAddonChange={handleAddonChange}
          />
        )}

        {/* Turnaround Time Selection */}
        {configData.turnaroundTimes && configData.turnaroundTimes.length > 0 && (
          <TurnaroundTimeSelector
            baseProductPrice={calculatePrice || 0}
            currentCoating={configuration.coating}
            disabled={loading}
            quantity={
              configData.quantities.find((q) => q.id === configuration.quantity)?.value || 1
            }
            selectedTurnaroundId={configuration.turnaround}
            turnaroundTimes={configData.turnaroundTimes}
            onTurnaroundChange={handleTurnaroundChange}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
