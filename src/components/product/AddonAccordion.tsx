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

interface AddonAccordionProps {
  addons: Addon[]
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  disabled?: boolean
}

export default function AddonAccordion({
  addons,
  selectedAddons,
  onAddonChange,
  disabled = false
}: AddonAccordionProps) {
  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    let newSelectedAddons: string[]

    if (checked) {
      // Add addon if not already selected
      newSelectedAddons = [...selectedAddons, addonId]
    } else {
      // Remove addon if currently selected
      newSelectedAddons = selectedAddons.filter(id => id !== addonId)
    }

    onAddonChange(newSelectedAddons)
  }

  // Don't render if no addons available
  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="addons" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <h3 className="text-base font-medium text-gray-900">
                Add-ons & Upgrades
              </h3>
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
                Enhance your order with professional add-ons. Select any combination that meets your needs.
              </p>

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
                        id={addon.id}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleAddonToggle(addon.id, checked as boolean)
                        }
                        disabled={disabled}
                        className="mt-0.5"
                      />

                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={addon.id}
                          className={`block font-medium cursor-pointer ${
                            disabled ? 'cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-900">
                              {addon.name}
                            </span>
                            <span className={`text-sm font-semibold ml-2 ${
                              isSelected ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {addon.priceDisplay}
                            </span>
                          </div>
                        </Label>

                        <p className="text-xs text-gray-600 mt-1">
                          {addon.description}
                        </p>

                        {addon.additionalTurnaroundDays > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            +{addon.additionalTurnaroundDays} day{addon.additionalTurnaroundDays > 1 ? 's' : ''} turnaround
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
                    <strong>{selectedAddons.length}</strong> add-on{selectedAddons.length > 1 ? 's' : ''} selected
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