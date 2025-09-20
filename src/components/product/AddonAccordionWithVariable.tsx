'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

interface Addon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  price?: number
  priceDisplay?: string
  configuration?: any
  isDefault?: boolean
  additionalTurnaroundDays?: number
}

interface TurnaroundTime {
  id: string
  displayName: string
  description?: string
  daysMin: number
  daysMax?: number
}

interface AddonsGrouped {
  aboveDropdown: Addon[]
  inDropdown: Addon[]
  belowDropdown: Addon[]
}

interface AddonAccordionWithVariableProps {
  addons: Addon[]
  addonsGrouped?: AddonsGrouped
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  variableDataConfig?: VariableDataConfig
  onVariableDataChange?: (config: VariableDataConfig) => void
  perforationConfig?: PerforationConfig
  onPerforationChange?: (config: PerforationConfig) => void
  bandingConfig?: BandingConfig
  onBandingChange?: (config: BandingConfig) => void
  cornerRoundingConfig?: CornerRoundingConfig
  onCornerRoundingChange?: (config: CornerRoundingConfig) => void
  quantity?: number
  turnaroundTimes?: TurnaroundTime[]
  disabled?: boolean
}

export default function AddonAccordionWithVariable({
  addons,
  addonsGrouped,
  selectedAddons,
  onAddonChange,
  variableDataConfig,
  onVariableDataChange,
  perforationConfig,
  onPerforationChange,
  bandingConfig,
  onBandingChange,
  cornerRoundingConfig,
  onCornerRoundingChange,
  quantity = 100,
  turnaroundTimes = [],
  disabled = false,
}: AddonAccordionWithVariableProps) {
  // Variable Data state
  const [variableDataChecked, setVariableDataChecked] = useState(false)
  const [locationsCount, setLocationsCount] = useState('')
  const [locations, setLocations] = useState('')

  // Perforation state
  const [perforationChecked, setPerforationChecked] = useState(false)
  const [verticalCount, setVerticalCount] = useState('0')
  const [verticalPosition, setVerticalPosition] = useState('')
  const [horizontalCount, setHorizontalCount] = useState('0')
  const [horizontalPosition, setHorizontalPosition] = useState('')

  // Banding state
  const [bandingChecked, setBandingChecked] = useState(false)
  const [bandingType, setBandingType] = useState('paper')
  const [itemsPerBundle, setItemsPerBundle] = useState(100)

  // Corner Rounding state
  const [cornerRoundingChecked, setCornerRoundingChecked] = useState(false)
  const [cornerType, setCornerType] = useState('All Four')

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    let newSelectedAddons: string[]

    if (checked) {
      // Add addon if not already selected
      newSelectedAddons = [...selectedAddons, addonId]
    } else {
      // Remove addon if currently selected
      newSelectedAddons = selectedAddons.filter((id) => id !== addonId)
    }

    onAddonChange(newSelectedAddons)
  }

  // Handle Variable Data checkbox
  const handleVariableDataToggle = (checked: boolean) => {
    if (disabled) return

    setVariableDataChecked(checked)

    // Clear fields when unchecked
    if (!checked) {
      setLocationsCount('')
      setLocations('')
    }

    // Notify parent
    onVariableDataChange?.({
      enabled: checked,
      locationsCount: checked ? locationsCount : '',
      locations: checked ? locations : '',
    })
  }

  // Handle Variable Data field changes
  const handleLocationsCountChange = (value: string) => {
    setLocationsCount(value)

    if (variableDataChecked) {
      onVariableDataChange?.({
        enabled: true,
        locationsCount: value,
        locations,
      })
    }
  }

  const handleLocationsChange = (value: string) => {
    setLocations(value)

    if (variableDataChecked) {
      onVariableDataChange?.({
        enabled: true,
        locationsCount,
        locations: value,
      })
    }
  }

  // Calculate Variable Data price
  const calculateVariableDataPrice = () => {
    return 60 + (0.02 * quantity)
  }

  // Calculate Perforation price
  const calculatePerforationPrice = () => {
    return 20 + (0.01 * quantity)
  }

  // Calculate Banding price
  const calculateBandingPrice = () => {
    if (!itemsPerBundle || itemsPerBundle <= 0) return 0
    const numberOfBundles = Math.ceil(quantity / itemsPerBundle)
    return numberOfBundles * 0.75
  }

  // Calculate Corner Rounding price
  const calculateCornerRoundingPrice = () => {
    return 20 + (0.01 * quantity)
  }

  // Handle Perforation checkbox
  const handlePerforationToggle = (checked: boolean) => {
    if (disabled) return

    setPerforationChecked(checked)

    // Clear fields when unchecked
    if (!checked) {
      setVerticalCount('0')
      setVerticalPosition('')
      setHorizontalCount('0')
      setHorizontalPosition('')
    }

    // Notify parent
    onPerforationChange?.({
      enabled: checked,
      verticalCount: checked ? verticalCount : '0',
      verticalPosition: checked ? verticalPosition : '',
      horizontalCount: checked ? horizontalCount : '0',
      horizontalPosition: checked ? horizontalPosition : '',
    })
  }

  // Handle Perforation field changes
  const handleVerticalCountChange = (value: string) => {
    setVerticalCount(value)
    if (value === '0') {
      setVerticalPosition('')
    }

    if (perforationChecked) {
      onPerforationChange?.({
        enabled: true,
        verticalCount: value,
        verticalPosition: value === '0' ? '' : verticalPosition,
        horizontalCount,
        horizontalPosition,
      })
    }
  }

  const handleVerticalPositionChange = (value: string) => {
    setVerticalPosition(value)

    if (perforationChecked) {
      onPerforationChange?.({
        enabled: true,
        verticalCount,
        verticalPosition: value,
        horizontalCount,
        horizontalPosition,
      })
    }
  }

  const handleHorizontalCountChange = (value: string) => {
    setHorizontalCount(value)
    if (value === '0') {
      setHorizontalPosition('')
    }

    if (perforationChecked) {
      onPerforationChange?.({
        enabled: true,
        verticalCount,
        verticalPosition,
        horizontalCount: value,
        horizontalPosition: value === '0' ? '' : horizontalPosition,
      })
    }
  }

  const handleHorizontalPositionChange = (value: string) => {
    setHorizontalPosition(value)

    if (perforationChecked) {
      onPerforationChange?.({
        enabled: true,
        verticalCount,
        verticalPosition,
        horizontalCount,
        horizontalPosition: value,
      })
    }
  }

  // Handle Banding checkbox
  const handleBandingToggle = (checked: boolean) => {
    if (disabled) return

    setBandingChecked(checked)

    // Reset to defaults when unchecked
    if (!checked) {
      setBandingType('paper')
      setItemsPerBundle(100)
    }

    // Notify parent
    onBandingChange?.({
      enabled: checked,
      bandingType: checked ? bandingType : 'paper',
      itemsPerBundle: checked ? itemsPerBundle : 100,
    })
  }

  // Handle Banding field changes
  const handleBandingTypeChange = (value: string) => {
    setBandingType(value)

    if (bandingChecked) {
      onBandingChange?.({
        enabled: true,
        bandingType: value,
        itemsPerBundle,
      })
    }
  }

  const handleItemsPerBundleChange = (value: string) => {
    const numValue = parseInt(value, 10)

    if (!value || isNaN(numValue) || numValue <= 0) {
      setItemsPerBundle(1)
      if (bandingChecked) {
        onBandingChange?.({
          enabled: true,
          bandingType,
          itemsPerBundle: 1,
        })
      }
    } else {
      setItemsPerBundle(numValue)
      if (bandingChecked) {
        onBandingChange?.({
          enabled: true,
          bandingType,
          itemsPerBundle: numValue,
        })
      }
    }
  }

  // Handle Corner Rounding checkbox
  const handleCornerRoundingToggle = (checked: boolean) => {
    if (disabled) return

    setCornerRoundingChecked(checked)

    // Reset to default when unchecked
    if (!checked) {
      setCornerType('All Four')
    }

    // Notify parent
    onCornerRoundingChange?.({
      enabled: checked,
      cornerType: checked ? cornerType : 'All Four',
    })
  }

  // Handle Corner Type change
  const handleCornerTypeChange = (value: string) => {
    setCornerType(value)

    if (cornerRoundingChecked) {
      onCornerRoundingChange?.({
        enabled: true,
        cornerType: value,
      })
    }
  }

  // Don't render if no addons available (but still render for Variable Data)
  const hasContent = addons.length > 0 || true // Always show because of Variable Data

  if (!hasContent) {
    return null
  }

  // Helper function to render an addon
  const renderAddon = (addon: Addon) => {
    const isSelected = selectedAddons.includes(addon.id)

    // Handle special addon types
    if (addon.configuration?.type === 'variable_data') {
      return (
        <div key={addon.id} className="space-y-4 border rounded-lg p-4 bg-white">
          <div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="variable-data"
                checked={variableDataChecked}
                onCheckedChange={handleVariableDataToggle}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="variable-data"
                    className="text-sm font-semibold cursor-pointer uppercase"
                  >
                    VARIABLE DATA
                  </Label>
                  <span className="text-sm font-medium">
                    $60.00 + $.02/piece
                  </span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Select this option if you need your order to have a unique name, number, or word on each card.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {variableDataChecked && (
            <div className="ml-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="locations-count" className="text-sm font-semibold uppercase">
                    How many locations for the variables?
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Enter the number of variables you are going to have on each piece. If only a first name for example, this number should be 1.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="locations-count"
                  type="number"
                  min="1"
                  max="10"
                  value={locationsCount}
                  onChange={(e) => handleLocationsCountChange(e.target.value)}
                  className="max-w-full"
                  placeholder=""
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="locations-text" className="text-sm font-semibold uppercase">
                    Where are the locations for the variables?
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Enter the location(s) or word(s) that will be replaced with variable words.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="locations-text"
                  type="text"
                  value={locations}
                  onChange={(e) => handleLocationsChange(e.target.value)}
                  className="max-w-full"
                  placeholder=""
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    if (addon.configuration?.type === 'perforation') {
      return (
        <div key={addon.id} className="space-y-4 border rounded-lg p-4 bg-white">
          <div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="perforation"
                checked={perforationChecked}
                onCheckedChange={handlePerforationToggle}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="perforation" className="text-sm font-semibold cursor-pointer uppercase">
                    PERFORATION
                  </Label>
                  <span className="text-sm font-medium">$20.00 + $.01/piece</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {perforationChecked && (
            <div className="ml-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vertical-count" className="text-sm font-semibold uppercase">
                    How Many Vertical
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Select the number of vertical perforation rows that you need.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={verticalCount} onValueChange={handleVerticalCountChange} disabled={disabled}>
                  <SelectTrigger id="vertical-count" className="max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {verticalCount !== '0' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vertical-position" className="text-sm font-semibold uppercase">
                      Vertical Position
                    </Label>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                          <p>Enter the position of the vertical perforation. For example, 2 inches from the right front.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="vertical-position"
                    type="text"
                    value={verticalPosition}
                    onChange={(e) => handleVerticalPositionChange(e.target.value)}
                    className="max-w-full"
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="horizontal-count" className="text-sm font-semibold uppercase">
                    How Many Horizontal
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Select the number of horizontal perforation rows that you need.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={horizontalCount} onValueChange={handleHorizontalCountChange} disabled={disabled}>
                  <SelectTrigger id="horizontal-count" className="max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {horizontalCount !== '0' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="horizontal-position" className="text-sm font-semibold uppercase">
                      Horizontal Position
                    </Label>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                          <p>Enter the position of the horizontal perforation. For example, 2 inches from the top front.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="horizontal-position"
                    type="text"
                    value={horizontalPosition}
                    onChange={(e) => handleHorizontalPositionChange(e.target.value)}
                    className="max-w-full"
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    if (addon.configuration?.type === 'banding') {
      return (
        <div key={addon.id} className="space-y-4 border rounded-lg p-4 bg-white">
          <div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="banding"
                checked={bandingChecked}
                onCheckedChange={handleBandingToggle}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="banding" className="text-sm font-semibold cursor-pointer uppercase">
                    BANDING
                  </Label>
                  <span className="text-sm font-medium">$.75/bundle</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Have your product bundled in specific individual quantity groups with paper bands or rubber bands. Please choose the amount you would like in each bundle.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {bandingChecked && (
            <div className="ml-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="banding-type" className="text-sm font-semibold uppercase">
                    Banding Type
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Please select whether or not you want paper banding or rubber banding.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={bandingType} onValueChange={handleBandingTypeChange} disabled={disabled}>
                  <SelectTrigger id="banding-type" className="max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">Paper Bands</SelectItem>
                    <SelectItem value="rubber">Rubber Bands</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="items-per-bundle" className="text-sm font-semibold uppercase">
                    Items/Bundle
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="items-per-bundle"
                  type="number"
                  min="1"
                  max="10000"
                  value={itemsPerBundle}
                  onChange={(e) => handleItemsPerBundleChange(e.target.value)}
                  className="max-w-full"
                  placeholder="100"
                  disabled={disabled}
                />
                {itemsPerBundle > 0 && (
                  <p className="text-xs text-gray-500">
                    Total bundles: {Math.ceil(quantity / itemsPerBundle)}
                    {quantity > 0 && ` (${quantity} ÷ ${itemsPerBundle})`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (addon.configuration?.type === 'corner_rounding') {
      return (
        <div key={addon.id} className="space-y-4 border rounded-lg p-4 bg-white">
          <div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="corner-rounding"
                checked={cornerRoundingChecked}
                onCheckedChange={handleCornerRoundingToggle}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="corner-rounding" className="text-sm font-semibold cursor-pointer uppercase">
                    CORNER ROUNDING
                  </Label>
                  <span className="text-sm font-medium">$20.00 + $.01/piece</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {cornerRoundingChecked && (
            <div className="ml-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="corner-type" className="text-sm font-semibold uppercase">
                    ROUNDED CORNERS
                  </Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                        <p>Select the type of corner rounding for your order.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={cornerType} onValueChange={handleCornerTypeChange} disabled={disabled}>
                  <SelectTrigger id="corner-type" className="max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Four">All Four</SelectItem>
                    <SelectItem value="Top Two">Top Two</SelectItem>
                    <SelectItem value="Bottom Two">Bottom Two</SelectItem>
                    <SelectItem value="Left Two">Left Two</SelectItem>
                    <SelectItem value="Right Two">Right Two</SelectItem>
                    <SelectItem value="Top Left">Top Left</SelectItem>
                    <SelectItem value="Top Right">Top Right</SelectItem>
                    <SelectItem value="Bottom Left">Bottom Left</SelectItem>
                    <SelectItem value="Bottom Right">Bottom Right</SelectItem>
                    <SelectItem value="Top Left & Bottom Right">Top Left & Bottom Right</SelectItem>
                    <SelectItem value="Top Right & Bottom Left">Top Right & Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Regular addon
    return (
      <div
        key={addon.id}
        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
          isSelected
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && handleAddonToggle(addon.id, !isSelected)}
      >
        <Checkbox
          checked={isSelected}
          className="mt-0.5"
          disabled={disabled}
          id={addon.id}
          onCheckedChange={(checked) =>
            handleAddonToggle(addon.id, checked as boolean)
          }
        />

        <div className="flex-1 min-w-0">
          <Label
            className={`block font-medium cursor-pointer ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
            htmlFor={addon.id}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-900">{addon.name}</span>
              <span
                className={`text-sm font-semibold ml-2 ${
                  isSelected ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {addon.priceDisplay || (addon.price ? `$${addon.price.toFixed(2)}` : 'Variable')}
              </span>
            </div>
          </Label>

          <p className="text-xs text-gray-600 mt-1">{addon.description}</p>

          {addon.additionalTurnaroundDays && addon.additionalTurnaroundDays > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              +{addon.additionalTurnaroundDays} day
              {addon.additionalTurnaroundDays > 1 ? 's' : ''} turnaround
            </p>
          )}
        </div>
      </div>
    )
  }

  // Calculate total selected addons for display
  const totalSelectedAddons = selectedAddons.length +
    (variableDataChecked ? 1 : 0) +
    (perforationChecked ? 1 : 0) +
    (bandingChecked ? 1 : 0) +
    (cornerRoundingChecked ? 1 : 0)

  // Use grouped addons if available, otherwise fall back to legacy behavior
  if (addonsGrouped) {
    return (
      <div className="space-y-3">
        {/* Above Dropdown Addons - Always Visible */}
        {addonsGrouped.aboveDropdown.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900">Add-ons & Upgrades</h3>
            {addonsGrouped.aboveDropdown.map(renderAddon)}
          </div>
        )}

        {/* In Dropdown Addons - Accordion */}
        {addonsGrouped.inDropdown.length > 0 && (
          <Accordion collapsible className="w-full" type="single">
            <AccordionItem className="border rounded-lg" value="addons">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <h3 className="text-base font-medium text-gray-900">
                    {addonsGrouped.aboveDropdown.length > 0 ? 'More Add-ons' : 'Add-ons & Upgrades'}
                  </h3>
                  {totalSelectedAddons > 0 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {totalSelectedAddons} selected
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enhance your order with professional add-ons. Select any combination that meets your needs.
                  </p>

                  {/* Available Turnaround Times Info */}
                  {turnaroundTimes && turnaroundTimes.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Available Turnaround Times:
                      </h4>
                      <div className="text-xs text-blue-800 space-y-1">
                        {turnaroundTimes.map((turnaround) => (
                          <div key={turnaround.id} className="flex justify-between">
                            <span>{turnaround.displayName}</span>
                            <span>
                              {turnaround.daysMin}
                              {turnaround.daysMax && turnaround.daysMax !== turnaround.daysMin
                                ? `-${turnaround.daysMax}`
                                : ''}{' '}
                              days
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-2 italic">
                        Select your turnaround time below in the Print Turnaround section
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {addonsGrouped.inDropdown.map(renderAddon)}
                  </div>

                  {totalSelectedAddons > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>{totalSelectedAddons}</strong> add-on{totalSelectedAddons > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Below Dropdown Addons - Always Visible */}
        {addonsGrouped.belowDropdown.length > 0 && (
          <div className="space-y-3">
            {addonsGrouped.belowDropdown.map(renderAddon)}
          </div>
        )}
      </div>
    )
  }

  // Legacy behavior - if no addonsGrouped provided
  return (
    <div className="space-y-3">
      <Accordion collapsible className="w-full" type="single">
        <AccordionItem className="border rounded-lg" value="addons">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <h3 className="text-base font-medium text-gray-900">Add-ons & Upgrades</h3>
              {totalSelectedAddons > 0 && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {totalSelectedAddons} selected
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enhance your order with professional add-ons. Select any combination that meets your
                needs.
              </p>

              {/* Available Turnaround Times Info */}
              {turnaroundTimes && turnaroundTimes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Available Turnaround Times:
                  </h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    {turnaroundTimes.map((turnaround) => (
                      <div key={turnaround.id} className="flex justify-between">
                        <span>{turnaround.displayName}</span>
                        <span>
                          {turnaround.daysMin}
                          {turnaround.daysMax && turnaround.daysMax !== turnaround.daysMin
                            ? `-${turnaround.daysMax}`
                            : ''}{' '}
                          days
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2 italic">
                    Select your turnaround time below in the Print Turnaround section
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Render special addons */}
                {addons.filter(addon => ['variable_data', 'perforation', 'banding', 'corner_rounding'].includes(addon.configuration?.type)).map(renderAddon)}

                {/* Render regular addons */}
                <div className="grid gap-4">
                  {addons.filter(addon => !['variable_data', 'perforation', 'banding', 'corner_rounding'].includes(addon.configuration?.type)).map(renderAddon)}
                </div>
              </div>

              {totalSelectedAddons > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>{totalSelectedAddons}</strong> add-on{totalSelectedAddons > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}