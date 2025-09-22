/**
 * Refactored Addon Accordion component
 * Orchestrates addon selection with modular components
 */

'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AddonAccordionProps } from './types/addon.types'
import { useVariableData } from './hooks/useVariableData'
import { usePerforation } from './hooks/usePerforation'
import { useBanding } from './hooks/useBanding'
import { useCornerRounding } from './hooks/useCornerRounding'
import { VariableDataSection } from './components/VariableDataSection'
import { PerforationSection } from './components/PerforationSection'
import { BandingSection } from './components/BandingSection'
import { CornerRoundingSection } from './components/CornerRoundingSection'
import { AddonCheckbox } from './components/AddonCheckbox'

export function AddonAccordion({
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
}: AddonAccordionProps) {
  // Use custom hooks for state management
  const variableData = useVariableData(variableDataConfig, onVariableDataChange)
  const perforation = usePerforation(perforationConfig, onPerforationChange)
  const banding = useBanding(bandingConfig, onBandingChange)
  const cornerRounding = useCornerRounding(cornerRoundingConfig, onCornerRoundingChange)

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    if (disabled) return

    const newSelectedAddons = checked
      ? [...selectedAddons, addonId]
      : selectedAddons.filter((id) => id !== addonId)

    onAddonChange(newSelectedAddons)
  }

  // Group addons for display
  const displayAddons = addonsGrouped || {
    aboveDropdown: [],
    inDropdown: addons,
    belowDropdown: [],
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="addons">
        <AccordionTrigger className="text-lg font-semibold">
          Additional Options
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            {/* Standard Addons Above Dropdown */}
            {displayAddons.aboveDropdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Popular Options</h4>
                {displayAddons.aboveDropdown.map((addon) => (
                  <AddonCheckbox
                    key={addon.id}
                    addon={addon}
                    checked={selectedAddons.includes(addon.id)}
                    disabled={disabled}
                    onToggle={handleAddonToggle}
                  />
                ))}
              </div>
            )}

            {/* Special Feature Sections */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground">Special Features</h4>

              <VariableDataSection
                {...variableData}
                quantity={quantity}
                disabled={disabled}
              />

              <PerforationSection
                {...perforation}
                quantity={quantity}
                disabled={disabled}
              />

              <BandingSection
                {...banding}
                quantity={quantity}
                disabled={disabled}
              />

              <CornerRoundingSection
                {...cornerRounding}
                quantity={quantity}
                disabled={disabled}
              />
            </div>

            {/* Standard Addons In Dropdown */}
            {displayAddons.inDropdown.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Additional Services</h4>
                {displayAddons.inDropdown.map((addon) => (
                  <AddonCheckbox
                    key={addon.id}
                    addon={addon}
                    checked={selectedAddons.includes(addon.id)}
                    disabled={disabled}
                    onToggle={handleAddonToggle}
                  />
                ))}
              </div>
            )}

            {/* Standard Addons Below Dropdown */}
            {displayAddons.belowDropdown.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Premium Services</h4>
                {displayAddons.belowDropdown.map((addon) => (
                  <AddonCheckbox
                    key={addon.id}
                    addon={addon}
                    checked={selectedAddons.includes(addon.id)}
                    disabled={disabled}
                    onToggle={handleAddonToggle}
                  />
                ))}
              </div>
            )}

            {/* Turnaround Time Note */}
            {turnaroundTimes.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Note: Some options may affect production time.
                  Current turnaround: {turnaroundTimes[0]?.displayName || 'Standard'}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}