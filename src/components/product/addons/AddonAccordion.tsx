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
import { DesignSection } from './components/DesignSection'
import { ImageUploadSection } from './components/ImageUploadSection'
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

  // Design state (simplified since it's now a single addon)
  const design = {
    enabled: designConfig?.enabled || false,
    selectedOption: designConfig?.selectedOption || null,
    selectedSide: designConfig?.selectedSide || null,
    uploadedFiles: designConfig?.uploadedFiles || [],
    onToggle: (checked: boolean) => onDesignChange?.({ ...designConfig, enabled: checked }),
    onOptionChange: (optionId: string | null, side?: string | null, files?: any[]) =>
      onDesignChange?.({
        ...designConfig,
        selectedOption: optionId,
        selectedSide: side,
        uploadedFiles: files || []
      }),
    onFilesUploaded: (files: any[]) =>
      onDesignChange?.({ ...designConfig, uploadedFiles: files })
  }

  // Image Upload state
  const imageUpload = {
    enabled: imageUploadConfig?.enabled || false,
    selectedOption: imageUploadConfig?.selectedOption || null,
    uploadedFiles: imageUploadConfig?.uploadedFiles || [],
    onToggle: (checked: boolean) => onImageUploadChange?.({ ...imageUploadConfig, enabled: checked }),
    onOptionChange: (optionId: string | null, files?: any[]) =>
      onImageUploadChange?.({
        ...imageUploadConfig,
        selectedOption: optionId,
        uploadedFiles: files || []
      }),
    onFilesUploaded: (files: any[]) =>
      onImageUploadChange?.({ ...imageUploadConfig, uploadedFiles: files })
  }

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
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="addons">
          <AccordionTrigger className="text-lg font-semibold">
            Additional Options
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Special Feature Sections */}
              <div className="space-y-4">
                <DesignSection
                  {...design}
                  disabled={disabled}
                />

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

                <ImageUploadSection
                  {...imageUpload}
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
