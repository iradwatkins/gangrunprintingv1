/**
 * Refactored Addon Accordion component
 * Orchestrates addon selection with modular components
 */

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { type AddonAccordionProps } from './types/addon.types'
import { useVariableData } from './hooks/useVariableData'
import { usePerforation } from './hooks/usePerforation'
import { useBanding } from './hooks/useBanding'
import { useCornerRounding } from './hooks/useCornerRounding'
import { VariableDataSection } from './components/VariableDataSection'
import { PerforationSection } from './components/PerforationSection'
import { BandingSection } from './components/BandingSection'
import { CornerRoundingSection } from './components/CornerRoundingSection'
// REMOVED: import { DesignSection } from './components/DesignSection' - Design is now a primary dropdown
// REMOVED: import { ImageUploadSection } from './components/ImageUploadSection' - File upload moved to post-cart flow
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
  designConfig,
  onDesignChange,
  imageUploadConfig,
  onImageUploadChange,
  quantity = 100,
  turnaroundTimes = [],
  disabled = false,
}: AddonAccordionProps) {
  // Use custom hooks for state management
  const variableData = useVariableData(variableDataConfig, onVariableDataChange)
  const perforation = usePerforation(perforationConfig, onPerforationChange)
  const banding = useBanding(bandingConfig, onBandingChange)
  const cornerRounding = useCornerRounding(cornerRoundingConfig, onCornerRoundingChange)

  // REMOVED: Design state - Design is now a primary dropdown in the main form
  // Design state (professional design services only - no file uploads)
  // const design = {
  //   enabled: designConfig?.enabled || false,
  //   selectedOption: designConfig?.selectedOption || null,
  //   selectedSide: designConfig?.selectedSide || null,
  //   onToggle: (checked: boolean) => onDesignChange?.({ ...designConfig, enabled: checked }),
  //   onOptionChange: (optionId: string | null, side?: string | null) =>
  //     onDesignChange?.({
  //       ...designConfig,
  //       selectedOption: optionId,
  //       selectedSide: side,
  //     }),
  // }

  // REMOVED: Image Upload state - File upload moved to post-cart flow
  // const imageUpload = {
  //   enabled: imageUploadConfig?.enabled || false,
  //   selectedOption: imageUploadConfig?.selectedOption || null,
  //   uploadedFiles: imageUploadConfig?.uploadedFiles || [],
  //   onToggle: (checked: boolean) =>
  //     onImageUploadChange?.({ ...imageUploadConfig, enabled: checked }),
  //   onOptionChange: (optionId: string | null, files?: any[]) =>
  //     onImageUploadChange?.({
  //       ...imageUploadConfig,
  //       selectedOption: optionId,
  //       uploadedFiles: files || [],
  //     }),
  //   onFilesUploaded: (files: any[]) =>
  //     onImageUploadChange?.({ ...imageUploadConfig, uploadedFiles: files }),
  // }

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
      <Accordion collapsible className="w-full" type="single" defaultValue="addons">
        <AccordionItem value="addons">
          <AccordionTrigger className="text-lg font-semibold">Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Special Feature Sections */}
              <div className="space-y-4">
                {/* REMOVED: DesignSection - Design is now a primary dropdown in the main form */}

                <VariableDataSection {...variableData} disabled={disabled} quantity={quantity} />

                <PerforationSection {...perforation} disabled={disabled} quantity={quantity} />

                <BandingSection {...banding} disabled={disabled} quantity={quantity} />

                <CornerRoundingSection
                  {...cornerRounding}
                  disabled={disabled}
                  quantity={quantity}
                />

                {/* REMOVED: ImageUploadSection - File upload moved to post-cart flow */}
                {/* <ImageUploadSection {...imageUpload} disabled={disabled} /> */}
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
                    Note: Some options may affect production time. Current turnaround:{' '}
                    {turnaroundTimes[0]?.displayName || 'Standard'}
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
