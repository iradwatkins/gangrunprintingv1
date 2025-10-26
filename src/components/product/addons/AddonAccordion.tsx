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
import { AddonRenderer } from './components/AddonRenderer'
// Special section components (VariableDataSection, PerforationSection, etc.)
// are now rendered via AddonRenderer based on displayPosition

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
      {/* Addons positioned ABOVE dropdown - always visible (ALL addon types) */}
      {displayAddons.aboveDropdown.length > 0 && (
        <div className="space-y-2">
          {displayAddons.aboveDropdown.map((addon) => (
            <AddonRenderer
              key={addon.id}
              addon={addon}
              bandingConfig={{
                enabled: banding.enabled,
                bandingType: banding.bandingType,
                itemsPerBundle: banding.itemsPerBundle,
              }}
              cornerRoundingConfig={{
                enabled: cornerRounding.enabled,
                cornerType: cornerRounding.cornerType,
              }}
              disabled={disabled}
              perforationConfig={{
                enabled: perforation.enabled,
                verticalCount: perforation.verticalCount,
                verticalPosition: perforation.verticalPosition,
                horizontalCount: perforation.horizontalCount,
                horizontalPosition: perforation.horizontalPosition,
              }}
              quantity={quantity}
              selectedAddons={selectedAddons}
              variableDataConfig={{
                enabled: variableData.enabled,
                locationsCount: variableData.locationsCount,
                locations: variableData.locations,
              }}
              onAddonToggle={handleAddonToggle}
              onBandingItemsPerBundleChange={banding.handleItemsPerBundleChange}
              onBandingToggle={banding.handleToggle}
              onBandingTypeChange={banding.handleBandingTypeChange}
              onCornerRoundingToggle={cornerRounding.handleToggle}
              onCornerRoundingTypeChange={cornerRounding.handleCornerTypeChange}
              onPerforationToggle={perforation.handleToggle}
              onPerforationUpdateConfig={perforation.updateConfig}
              onVariableDataLocationsChange={variableData.handleLocationsChange}
              onVariableDataLocationsCountChange={variableData.handleLocationsCountChange}
              onVariableDataToggle={variableData.handleToggle}
            />
          ))}
        </div>
      )}

      {/* Main Accordion for IN dropdown items and special features */}
      <Accordion collapsible className="w-full" type="single">
        <AccordionItem value="addons">
          <AccordionTrigger className="text-lg font-semibold">Additional Add-ons</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* ALL Addons IN Dropdown - includes special feature sections and standard addons */}
              {displayAddons.inDropdown.length > 0 && (
                <div className="space-y-4">
                  {displayAddons.inDropdown.map((addon) => (
                    <AddonRenderer
                      key={addon.id}
                      addon={addon}
                      bandingConfig={{
                        enabled: banding.enabled,
                        bandingType: banding.bandingType,
                        itemsPerBundle: banding.itemsPerBundle,
                      }}
                      cornerRoundingConfig={{
                        enabled: cornerRounding.enabled,
                        cornerType: cornerRounding.cornerType,
                      }}
                      disabled={disabled}
                      perforationConfig={{
                        enabled: perforation.enabled,
                        verticalCount: perforation.verticalCount,
                        verticalPosition: perforation.verticalPosition,
                        horizontalCount: perforation.horizontalCount,
                        horizontalPosition: perforation.horizontalPosition,
                      }}
                      quantity={quantity}
                      selectedAddons={selectedAddons}
                      variableDataConfig={{
                        enabled: variableData.enabled,
                        locationsCount: variableData.locationsCount,
                        locations: variableData.locations,
                      }}
                      onAddonToggle={handleAddonToggle}
                      onBandingItemsPerBundleChange={banding.handleItemsPerBundleChange}
                      onBandingToggle={banding.handleToggle}
                      onBandingTypeChange={banding.handleBandingTypeChange}
                      onCornerRoundingToggle={cornerRounding.handleToggle}
                      onCornerRoundingTypeChange={cornerRounding.handleCornerTypeChange}
                      onPerforationToggle={perforation.handleToggle}
                      onPerforationUpdateConfig={perforation.updateConfig}
                      onVariableDataLocationsChange={variableData.handleLocationsChange}
                      onVariableDataLocationsCountChange={variableData.handleLocationsCountChange}
                      onVariableDataToggle={variableData.handleToggle}
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

      {/* Addons positioned BELOW dropdown - always visible (ALL addon types) */}
      {displayAddons.belowDropdown.length > 0 && (
        <div className="space-y-2">
          {displayAddons.belowDropdown.map((addon) => (
            <AddonRenderer
              key={addon.id}
              addon={addon}
              bandingConfig={{
                enabled: banding.enabled,
                bandingType: banding.bandingType,
                itemsPerBundle: banding.itemsPerBundle,
              }}
              cornerRoundingConfig={{
                enabled: cornerRounding.enabled,
                cornerType: cornerRounding.cornerType,
              }}
              disabled={disabled}
              perforationConfig={{
                enabled: perforation.enabled,
                verticalCount: perforation.verticalCount,
                verticalPosition: perforation.verticalPosition,
                horizontalCount: perforation.horizontalCount,
                horizontalPosition: perforation.horizontalPosition,
              }}
              quantity={quantity}
              selectedAddons={selectedAddons}
              variableDataConfig={{
                enabled: variableData.enabled,
                locationsCount: variableData.locationsCount,
                locations: variableData.locations,
              }}
              onAddonToggle={handleAddonToggle}
              onBandingItemsPerBundleChange={banding.handleItemsPerBundleChange}
              onBandingToggle={banding.handleToggle}
              onBandingTypeChange={banding.handleBandingTypeChange}
              onCornerRoundingToggle={cornerRounding.handleToggle}
              onCornerRoundingTypeChange={cornerRounding.handleCornerTypeChange}
              onPerforationToggle={perforation.handleToggle}
              onPerforationUpdateConfig={perforation.updateConfig}
              onVariableDataLocationsChange={variableData.handleLocationsChange}
              onVariableDataLocationsCountChange={variableData.handleLocationsCountChange}
              onVariableDataToggle={variableData.handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
