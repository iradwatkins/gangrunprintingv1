'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'

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

interface AddonAccordionProps {
  addons: Addon[]
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  turnaroundTimes?: TurnaroundTime[]
  disabled?: boolean
}

export default function AddonAccordion({
  addons,
  selectedAddons,
  onAddonChange,
  turnaroundTimes = [],
  disabled = false,
}: AddonAccordionProps) {
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
                              {addon.priceDisplay ||
                                (addon.price ? `$${addon.price.toFixed(2)}` : 'Variable')}
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
