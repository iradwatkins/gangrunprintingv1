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

interface AddonAccordionWithVariableProps {
  addons: Addon[]
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  variableDataConfig?: VariableDataConfig
  onVariableDataChange?: (config: VariableDataConfig) => void
  quantity?: number
  turnaroundTimes?: TurnaroundTime[]
  disabled?: boolean
}

export default function AddonAccordionWithVariable({
  addons,
  selectedAddons,
  onAddonChange,
  variableDataConfig,
  onVariableDataChange,
  quantity = 100,
  turnaroundTimes = [],
  disabled = false,
}: AddonAccordionWithVariableProps) {
  // Variable Data state
  const [variableDataChecked, setVariableDataChecked] = useState(false)
  const [locationsCount, setLocationsCount] = useState('')
  const [locations, setLocations] = useState('')

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

  // Don't render if no addons available (but still render for Variable Data)
  const hasContent = addons.length > 0 || true // Always show because of Variable Data

  if (!hasContent) {
    return null
  }

  return (
    <div className="space-y-3">
      <Accordion collapsible className="w-full" type="single">
        <AccordionItem className="border rounded-lg" value="addons">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <h3 className="text-base font-medium text-gray-900">Add-ons & Upgrades</h3>
              {(selectedAddons.length > 0 || variableDataChecked) && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedAddons.length + (variableDataChecked ? 1 : 0)} selected
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

              {/* Variable Data Addon */}
              <div className="space-y-4 border rounded-lg p-4 bg-white">
                {/* Checkbox with price */}
                <div className="space-y-3">
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                              <p>Variable data printing allows each piece to have unique information like names, numbers, or custom text.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  {/* Description box (always visible) */}
                  <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    Select this option if you need your order to have a unique name, number, or word on each card.
                  </div>
                </div>

                {/* Conditional fields - only show when checked */}
                {variableDataChecked && (
                  <div className="ml-6 space-y-4">
                    {/* How many locations field */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="locations-count"
                          className="text-sm font-semibold uppercase"
                        >
                          How many locations for the variables?
                        </Label>
                        <TooltipProvider>
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

                    {/* Where are the locations field */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="locations-text"
                          className="text-sm font-semibold uppercase"
                        >
                          Where are the locations for the variables?
                        </Label>
                        <TooltipProvider>
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

              {/* Regular Add-ons */}
              <div className="grid gap-4">
                {addons.filter(addon => addon.configuration?.type !== 'variable_data').map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id)

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
                })}
              </div>

              {(selectedAddons.length > 0 || variableDataChecked) && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>{selectedAddons.length + (variableDataChecked ? 1 : 0)}</strong> add-on
                    {(selectedAddons.length + (variableDataChecked ? 1 : 0)) > 1 ? 's' : ''} selected
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