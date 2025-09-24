'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ConditionalFieldConfig {
  locationsCount?: {
    label: string
    type: string
    min: number
    max: number
    helpText: string
    required: boolean
  }
  locationsInput?: {
    label: string
    type: string
    helpText: string
    placeholder: string
    required: boolean
  }
}

interface Addon {
  id: string
  name: string
  description: string
  tooltipText?: string | null
  pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FIXED_FEE'
  price?: number
  priceDisplay?: string
  configuration?: {
    type?: string
    basePrice?: number
    pricePerPiece?: number
    displayPrice?: string
    conditionalFields?: ConditionalFieldConfig
    requiresCheckbox?: boolean
    showConditionalOnCheck?: boolean
    [key: string]: Record<string, unknown>
  }
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

interface VariableDataConfig {
  locationsCount: number
  locations: string[]
}

interface AddonAccordionEnhancedProps {
  addons: Addon[]
  selectedAddons: string[]
  variableDataConfig?: VariableDataConfig
  onAddonChange: (addonIds: string[], variableData?: VariableDataConfig) => void
  turnaroundTimes?: TurnaroundTime[]
  disabled?: boolean
  quantity?: number
}

export default function AddonAccordionEnhanced({
  addons,
  selectedAddons,
  variableDataConfig,
  onAddonChange,
  turnaroundTimes = [],
  disabled = false,
  quantity = 100,
}: AddonAccordionEnhancedProps) {
  const [variableData, setVariableData] = useState<VariableDataConfig>({
    locationsCount: 1,
    locations: [''],
  })
  const [showVariableFields, setShowVariableFields] = useState(false)
  const [variableFieldErrors, setVariableFieldErrors] = useState<{
    locationsCount?: string
    locations?: string
  }>({})

  useEffect(() => {
    if (variableDataConfig) {
      setVariableData(variableDataConfig)
    }
  }, [variableDataConfig])

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    const addon = addons.find((a) => a.id === addonId)
    const isVariableData = addon?.configuration?.type === 'variable_data'

    let newSelectedAddons: string[]

    if (checked) {
      newSelectedAddons = [...selectedAddons, addonId]

      // Show conditional fields for Variable Data addon
      if (isVariableData) {
        setShowVariableFields(true)
        setVariableData({ locationsCount: 1, locations: [''] })
      }
    } else {
      newSelectedAddons = selectedAddons.filter((id) => id !== addonId)

      // Hide conditional fields and clear data when unchecked
      if (isVariableData) {
        setShowVariableFields(false)
        setVariableData({ locationsCount: 1, locations: [''] })
        setVariableFieldErrors({})
        onAddonChange(newSelectedAddons, undefined)
        return
      }
    }

    onAddonChange(newSelectedAddons, isVariableData && checked ? variableData : undefined)
  }

  const handleLocationsCountChange = (value: string) => {
    const count = parseInt(value, 10)

    if (isNaN(count) || count < 1 || count > 10) {
      setVariableFieldErrors({
        ...variableFieldErrors,
        locationsCount: 'Please enter a number between 1 and 10',
      })
      return
    }

    setVariableFieldErrors({ ...variableFieldErrors, locationsCount: undefined })

    const newLocations = Array.from({ length: count }, (_, i) => variableData.locations[i] || '')

    const newVariableData = {
      locationsCount: count,
      locations: newLocations,
    }

    setVariableData(newVariableData)

    // Update parent component
    const variableDataAddon = addons.find((a) => a.configuration?.type === 'variable_data')
    if (variableDataAddon && selectedAddons.includes(variableDataAddon.id)) {
      onAddonChange(selectedAddons, newVariableData)
    }
  }

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...variableData.locations]
    newLocations[index] = value

    const newVariableData = {
      ...variableData,
      locations: newLocations,
    }

    setVariableData(newVariableData)

    // Update parent component
    const variableDataAddon = addons.find((a) => a.configuration?.type === 'variable_data')
    if (variableDataAddon && selectedAddons.includes(variableDataAddon.id)) {
      onAddonChange(selectedAddons, newVariableData)
    }
  }

  const formatPriceDisplay = (addon: Addon): string => {
    if (addon.priceDisplay) return addon.priceDisplay

    const config = addon.configuration
    if (config?.type === 'variable_data' && config.displayPrice) {
      return config.displayPrice
    }

    if (addon.pricingModel === 'CUSTOM' && config) {
      if (config.basePrice !== undefined && config.pricePerPiece !== undefined) {
        return `$${config.basePrice.toFixed(2)} + $${config.pricePerPiece.toFixed(2)}/piece`
      }
    }

    if (addon.price !== undefined) {
      switch (addon.pricingModel) {
        case 'FLAT':
        case 'FIXED_FEE':
          return `$${addon.price.toFixed(2)}`
        case 'PERCENTAGE':
          return `${addon.price}%`
        case 'PER_UNIT':
          return `$${addon.price.toFixed(2)}/piece`
        default:
          return 'Variable'
      }
    }

    return 'Variable'
  }

  const calculateVariableDataPrice = (addon: Addon): number => {
    const config = addon.configuration
    if (config?.type === 'variable_data') {
      const basePrice = config.basePrice || 60
      const pricePerPiece = config.pricePerPiece || 0.02
      return basePrice + pricePerPiece * quantity
    }
    return 0
  }

  // Don't render if no addons available
  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <Accordion collapsible className="w-full" type="single">
        <AccordionItem className="border rounded-lg" value="addons">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <h3 className="text-base font-medium text-gray-900">Add-ons & Upgrades</h3>
              {selectedAddons.length > 0 && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedAddons.length} selected
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

              <div className="grid gap-4">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id)
                  const isVariableData = addon.configuration?.type === 'variable_data'
                  const displayPrice =
                    isVariableData && isSelected
                      ? `$${calculateVariableDataPrice(addon).toFixed(2)}`
                      : formatPriceDisplay(addon)

                  return (
                    <div key={addon.id}>
                      <div
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={(e) => {
                          // Prevent toggle when clicking on input fields
                          if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            !disabled && handleAddonToggle(addon.id, !isSelected)
                          }
                        }}
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
                              <span className="text-sm font-medium text-gray-900">
                                {addon.name}
                              </span>
                              <span
                                className={`text-sm font-semibold ml-2 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-700'
                                }`}
                              >
                                {displayPrice}
                              </span>
                            </div>
                          </Label>

                          <p className="text-xs text-gray-600 mt-1">
                            {addon.tooltipText || addon.description}
                          </p>

                          {addon.additionalTurnaroundDays && addon.additionalTurnaroundDays > 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              +{addon.additionalTurnaroundDays} day
                              {addon.additionalTurnaroundDays > 1 ? 's' : ''} turnaround
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Variable Data Conditional Fields */}
                      {isVariableData && isSelected && showVariableFields && (
                        <div className="ml-8 mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                          {/* Locations Count Field */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Label className="text-sm font-medium" htmlFor="locationsCount">
                                How many locations for the variables?{' '}
                                <span className="text-red-500">*</span>
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>
                                      Enter the number of variables you are going to have on each
                                      piece. If only a first name for example, this number should be
                                      1.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Input
                              className="max-w-xs"
                              id="locationsCount"
                              max="10"
                              min="1"
                              type="number"
                              value={variableData.locationsCount}
                              onChange={(e) => handleLocationsCountChange(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {variableFieldErrors.locationsCount && (
                              <p className="text-xs text-red-500 mt-1">
                                {variableFieldErrors.locationsCount}
                              </p>
                            )}
                          </div>

                          {/* Dynamic Location Input Fields */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Label className="text-sm font-medium">
                                Where are the locations for the variables?{' '}
                                <span className="text-red-500">*</span>
                              </Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>
                                      Enter the location(s) or word(s) that will be replaced with
                                      variable words.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="space-y-2">
                              {Array.from({ length: variableData.locationsCount }, (_, index) => (
                                <div key={index}>
                                  <Label
                                    className="text-xs text-gray-600"
                                    htmlFor={`location-${index}`}
                                  >
                                    Variable Location {index + 1}
                                  </Label>
                                  <Input
                                    className="max-w-md"
                                    id={`location-${index}`}
                                    placeholder={
                                      index === 0
                                        ? '[FirstName]'
                                        : index === 1
                                          ? '[Number]'
                                          : '[CustomText]'
                                    }
                                    type="text"
                                    value={variableData.locations[index] || ''}
                                    onChange={(e) => handleLocationChange(index, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ))}
                            </div>
                            {variableFieldErrors.locations && (
                              <p className="text-xs text-red-500 mt-1">
                                {variableFieldErrors.locations}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedAddons.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>{selectedAddons.length}</strong> add-on
                    {selectedAddons.length > 1 ? 's' : ''} selected
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
