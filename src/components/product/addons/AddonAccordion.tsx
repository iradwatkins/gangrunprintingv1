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
import { useDesignAddon } from './hooks/useDesignAddon'
import { VariableDataSection } from './components/VariableDataSection'
import { PerforationSection } from './components/PerforationSection'
import { BandingSection } from './components/BandingSection'
import { CornerRoundingSection } from './components/CornerRoundingSection'
import { AddonCheckbox } from './components/AddonCheckbox'
import { DesignAddonSelector } from './DesignAddonSelector'

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
  designAddonConfig,
  onDesignAddonChange,
  designAddons = [],
  quantity = 100,
  turnaroundTimes = [],
  disabled = false,
}: AddonAccordionProps) {
  // Use custom hooks for state management
  const variableData = useVariableData(variableDataConfig, onVariableDataChange)
  const perforation = usePerforation(perforationConfig, onPerforationChange)
  const banding = useBanding(bandingConfig, onBandingChange)
  const cornerRounding = useCornerRounding(cornerRoundingConfig, onCornerRoundingChange)
  const designAddon = useDesignAddon({
    config: designAddonConfig,
    onChange: onDesignAddonChange,
    designAddons
  })

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
    <div className="w-full space-y-4">
      {/* Design Add-on Selector - Always visible at top */}
      {designAddons.length > 0 && (
        <DesignAddonSelector
          designAddons={designAddons}
          selectedDesignOption={designAddon.selectedOption}
          selectedSide={designAddon.selectedSide}
          uploadedFiles={designAddon.uploadedFiles}
          onDesignOptionChange={designAddon.handleDesignOptionChange}
          onFilesUploaded={designAddon.handleFilesUploaded}
          disabled={disabled}
        />
      )}

      {/* Addons positioned ABOVE dropdown - always visible */}
      {displayAddons.aboveDropdown.length > 0 && (
        <div className="space-y-2">
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

      {/* Main Accordion for IN dropdown items and special features */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="addons">
          <AccordionTrigger className="text-lg font-semibold">
            Additional Options
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Special Feature Sections */}
              <div className="space-y-4">
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

              {/* Standard Addons IN Dropdown */}
              {displayAddons.inDropdown.length > 0 && (
                <div className="space-y-2 border-t pt-4">
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

      {/* Addons positioned BELOW dropdown - always visible */}
      {displayAddons.belowDropdown.length > 0 && (
        <div className="space-y-2">
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
    </div>
  )
}
