'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface StandardizedAddon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  price: number
  priceDisplay: string
  isDefault: boolean
  additionalTurnaroundDays: number
  configuration?: any
}

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

interface SimpleAddonSelectorProps {
  addons: StandardizedAddon[]
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
  disabled?: boolean
}

export default function SimpleAddonSelector({
  addons,
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
  disabled = false,
}: SimpleAddonSelectorProps) {
  // Variable Data state
  const [variableDataChecked, setVariableDataChecked] = useState(
    variableDataConfig?.enabled || false
  )
  const [locationsCount, setLocationsCount] = useState(variableDataConfig?.locationsCount || '')
  const [locations, setLocations] = useState(variableDataConfig?.locations || '')

  // Perforation state
  const [perforationChecked, setPerforationChecked] = useState(perforationConfig?.enabled || false)
  const [verticalCount, setVerticalCount] = useState(perforationConfig?.verticalCount || '0')
  const [verticalPosition, setVerticalPosition] = useState(
    perforationConfig?.verticalPosition || ''
  )
  const [horizontalCount, setHorizontalCount] = useState(perforationConfig?.horizontalCount || '0')
  const [horizontalPosition, setHorizontalPosition] = useState(
    perforationConfig?.horizontalPosition || ''
  )

  // Banding state
  const [bandingChecked, setBandingChecked] = useState(bandingConfig?.enabled || false)
  const [bandingType, setBandingType] = useState(bandingConfig?.bandingType || 'paper')
  const [itemsPerBundle, setItemsPerBundle] = useState(bandingConfig?.itemsPerBundle || 100)

  // Corner Rounding state
  const [cornerRoundingChecked, setCornerRoundingChecked] = useState(
    cornerRoundingConfig?.enabled || false
  )
  const [cornerType, setCornerType] = useState(cornerRoundingConfig?.cornerType || 'All Four')

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    let newSelectedAddons: string[]

    if (checked) {
      newSelectedAddons = [...selectedAddons, addonId]
    } else {
      newSelectedAddons = selectedAddons.filter((id) => id !== addonId)
    }

    onAddonChange(newSelectedAddons)
  }

  // Render a standard addon like sizes are rendered
  const renderStandardAddon = (addon: StandardizedAddon) => {
    const isSelected = selectedAddons.includes(addon.id)

    return (
      <div
        key={addon.id}
        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && handleAddonToggle(addon.id, !isSelected)}
      >
        <Checkbox
          checked={isSelected}
          className="mt-0.5"
          disabled={disabled}
          id={addon.id}
          onCheckedChange={(checked) => handleAddonToggle(addon.id, checked as boolean)}
        />

        <div className="flex-1 min-w-0">
          <Label
            className={`block font-medium cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
            htmlFor={addon.id}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-900">{addon.name}</span>
              <span
                className={`text-sm font-semibold ml-2 ${
                  isSelected ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {addon.priceDisplay}
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

  // Render Variable Data addon with special UI
  const renderVariableDataAddon = (addon: StandardizedAddon) => {
    const handleVariableDataToggle = (checked: boolean) => {
      if (disabled) return

      setVariableDataChecked(checked)

      if (!checked) {
        setLocationsCount('')
        setLocations('')
      }

      onVariableDataChange?.({
        enabled: checked,
        locationsCount: checked ? locationsCount : '',
        locations: checked ? locations : '',
      })
    }

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

    return (
      <div key={addon.id} className="space-y-4 border rounded-lg p-4 bg-white">
        <div>
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={variableDataChecked}
              className="mt-0.5"
              disabled={disabled}
              id="variable-data"
              onCheckedChange={handleVariableDataToggle}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label
                  className="text-sm font-semibold cursor-pointer uppercase"
                  htmlFor="variable-data"
                >
                  VARIABLE DATA
                </Label>
                <span className="text-sm font-medium">$60.00 + $.02/piece</span>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                      <p>
                        Select this option if you need your order to have a unique name, number, or
                        word on each card.
                      </p>
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
                <Label className="text-sm font-semibold uppercase" htmlFor="locations-count">
                  How many locations for the variables?
                </Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                      <p>
                        Enter the number of variables you are going to have on each piece. If only a
                        first name for example, this number should be 1.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                className="max-w-full"
                disabled={disabled}
                id="locations-count"
                max="10"
                min="1"
                placeholder=""
                type="number"
                value={locationsCount}
                onChange={(e) => handleLocationsCountChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold uppercase" htmlFor="locations-text">
                  Where are the locations for the variables?
                </Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                      <p>
                        Enter the location(s) or word(s) that will be replaced with variable words.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                className="max-w-full"
                disabled={disabled}
                id="locations-text"
                placeholder=""
                type="text"
                value={locations}
                onChange={(e) => handleLocationsChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Don't render if no addons available
  if (!addons || addons.length === 0) {
    return null
  }

  // Separate standard and special addons
  const standardAddons = addons.filter(
    (addon) =>
      !['variable_data', 'perforation', 'banding', 'corner_rounding'].includes(
        addon.configuration?.type
      )
  )
  const specialAddons = addons.filter((addon) =>
    ['variable_data', 'perforation', 'banding', 'corner_rounding'].includes(
      addon.configuration?.type
    )
  )

  // Calculate total selected addons for display
  const totalSelectedAddons =
    selectedAddons.length +
    (variableDataChecked ? 1 : 0) +
    (perforationChecked ? 1 : 0) +
    (bandingChecked ? 1 : 0) +
    (cornerRoundingChecked ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">Add-ons & Upgrades</h3>
        {totalSelectedAddons > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {totalSelectedAddons} selected
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Enhance your order with professional add-ons. Select any combination that meets your needs.
      </p>

      <div className="space-y-4">
        {/* Special addons first */}
        {specialAddons.map((addon) => {
          if (addon.configuration?.type === 'variable_data') {
            return renderVariableDataAddon(addon)
          }
          // Other special addons can be added here following similar patterns
          return renderStandardAddon(addon)
        })}

        {/* Standard addons */}
        {standardAddons.map(renderStandardAddon)}
      </div>

      {totalSelectedAddons > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600">
            <strong>{totalSelectedAddons}</strong> add-on{totalSelectedAddons > 1 ? 's' : ''}{' '}
            selected
          </p>
        </div>
      )}
    </div>
  )
}
