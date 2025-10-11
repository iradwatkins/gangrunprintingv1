/**
 * AdditionalOptionsAccordion - Data-driven collapsible addon section
 * Features circular +/- toggle and conditional sub-option fields
 */

'use client'

import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SubOptionField } from './SubOptionField'

interface AddonSubOption {
  id: string
  name: string
  optionType: 'SELECT' | 'NUMBER' | 'TEXT'
  options?: string[] | null
  defaultValue?: string
  isRequired?: boolean
  affectsPricing?: boolean
  tooltipText?: string
}

interface Addon {
  id: string
  name: string
  description?: string
  pricingModel: string
  price?: number
  priceDisplay?: string
  isDefault?: boolean
  additionalTurnaroundDays?: number
}

interface AdditionalOptionsAccordionProps {
  addons: Addon[]
  addonsGrouped?: {
    aboveDropdown: Addon[]
    inDropdown: Addon[]
    belowDropdown: Addon[]
  }
  addonSubOptions?: Record<string, AddonSubOption[]>
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  subOptionValues?: Record<string, any>
  onSubOptionChange?: (subOptionId: string, value: any) => void
  disabled?: boolean
}

export function AdditionalOptionsAccordion({
  addons,
  addonsGrouped,
  addonSubOptions = {},
  selectedAddons,
  onAddonChange,
  subOptionValues = {},
  onSubOptionChange,
  disabled = false,
}: AdditionalOptionsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    const newSelectedAddons = checked
      ? [...selectedAddons, addonId]
      : selectedAddons.filter((id) => id !== addonId)

    onAddonChange(newSelectedAddons)
  }

  const handleSubOptionChange = (subOptionId: string, value: any) => {
    if (disabled) return
    onSubOptionChange?.(subOptionId, value)
  }

  // Use grouped addons if available, otherwise fallback to flat list
  const displayAddons = addonsGrouped?.inDropdown || addons

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* Addons positioned ABOVE dropdown - always visible */}
        {addonsGrouped?.aboveDropdown && addonsGrouped.aboveDropdown.length > 0 && (
          <div className="mb-4 space-y-3">
            {addonsGrouped.aboveDropdown.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                checked={selectedAddons.includes(addon.id)}
                disabled={disabled}
                subOptions={addonSubOptions[addon.id]}
                subOptionValues={subOptionValues}
                onSubOptionChange={handleSubOptionChange}
                onToggle={handleAddonToggle}
              />
            ))}
          </div>
        )}

        {/* Main collapsible section */}
        <div className="border rounded-lg">
          {/* Header with circular toggle */}
          <button
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            disabled={disabled}
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Circular +/- icon */}
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              {isExpanded ? (
                <Minus className="w-5 h-5 text-white" strokeWidth={3} />
              ) : (
                <Plus className="w-5 h-5 text-white" strokeWidth={3} />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              ADDITIONAL OPTIONS
            </h3>
          </button>

          {/* Collapsible content */}
          {isExpanded && (
            <div className="px-4 pb-4 space-y-4 border-t">
              {displayAddons.map((addon) => (
                <AddonRow
                  key={addon.id}
                  addon={addon}
                  checked={selectedAddons.includes(addon.id)}
                  disabled={disabled}
                  subOptions={addonSubOptions[addon.id]}
                  subOptionValues={subOptionValues}
                  onSubOptionChange={handleSubOptionChange}
                  onToggle={handleAddonToggle}
                />
              ))}
            </div>
          )}
        </div>

        {/* Addons positioned BELOW dropdown - always visible */}
        {addonsGrouped?.belowDropdown && addonsGrouped.belowDropdown.length > 0 && (
          <div className="mt-4 space-y-3">
            {addonsGrouped.belowDropdown.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                checked={selectedAddons.includes(addon.id)}
                disabled={disabled}
                subOptions={addonSubOptions[addon.id]}
                subOptionValues={subOptionValues}
                onSubOptionChange={handleSubOptionChange}
                onToggle={handleAddonToggle}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Individual addon row with checkbox and conditional sub-options
interface AddonRowProps {
  addon: Addon
  subOptions?: AddonSubOption[]
  checked: boolean
  subOptionValues: Record<string, any>
  onToggle: (addonId: string, checked: boolean) => void
  onSubOptionChange: (subOptionId: string, value: any) => void
  disabled?: boolean
}

function AddonRow({
  addon,
  subOptions,
  checked,
  subOptionValues,
  onToggle,
  onSubOptionChange,
  disabled,
}: AddonRowProps) {
  return (
    <div className="space-y-3 py-2">
      {/* Main addon checkbox row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            disabled={disabled}
            id={`addon-${addon.id}`}
            onCheckedChange={(checked) => onToggle(addon.id, checked as boolean)}
          />
          <Label
            className="text-sm font-bold text-gray-900 uppercase tracking-wide cursor-pointer"
            htmlFor={`addon-${addon.id}`}
          >
            {addon.name}
          </Label>
          {addon.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{addon.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {addon.additionalTurnaroundDays && addon.additionalTurnaroundDays > 0 && (
            <span className="text-xs text-muted-foreground">
              +{addon.additionalTurnaroundDays}{' '}
              {addon.additionalTurnaroundDays === 1 ? 'day' : 'days'}
            </span>
          )}
          {addon.priceDisplay && (
            <span className="text-sm font-medium text-gray-900">{addon.priceDisplay}</span>
          )}
        </div>
      </div>

      {/* Conditional sub-options (only visible when addon is checked) */}
      {checked && subOptions && subOptions.length > 0 && (
        <div className="pl-6 space-y-3">
          {subOptions.map((subOption) => (
            <SubOptionField
              key={subOption.id}
              disabled={disabled}
              subOption={subOption}
              value={subOptionValues[subOption.id] ?? subOption.defaultValue}
              onChange={(value) => onSubOptionChange(subOption.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
