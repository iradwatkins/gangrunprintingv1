/**
 * Unified Addon Renderer Component
 * Renders any addon type (simple or special with sub-options) in any position
 * Detects addon type and delegates to appropriate section component
 */

'use client'

import { AddonCheckbox } from './AddonCheckbox'
import { VariableDataSection } from './VariableDataSection'
import { PerforationSection } from './PerforationSection'
import { BandingSection } from './BandingSection'
import { CornerRoundingSection } from './CornerRoundingSection'
import type { Addon } from '../types/addon.types'

interface AddonRendererProps {
  addon: Addon
  selectedAddons: string[]
  disabled: boolean
  quantity: number

  // Handler for simple addon toggle
  onAddonToggle: (addonId: string, checked: boolean) => void

  // State and handlers for Variable Data
  variableDataConfig?: {
    enabled: boolean
    locationsCount: string
    locations: string
  }
  onVariableDataToggle?: (checked: boolean) => void
  onVariableDataLocationsCountChange?: (value: string) => void
  onVariableDataLocationsChange?: (value: string) => void

  // State and handlers for Perforation
  perforationConfig?: {
    enabled: boolean
    verticalCount: string
    verticalPosition: string
    horizontalCount: string
    horizontalPosition: string
  }
  onPerforationToggle?: (checked: boolean) => void
  onPerforationUpdateConfig?: (field: string, value: string) => void

  // State and handlers for Banding
  bandingConfig?: {
    enabled: boolean
    bandingType: string
    itemsPerBundle: number
  }
  onBandingToggle?: (checked: boolean) => void
  onBandingTypeChange?: (value: string) => void
  onBandingItemsPerBundleChange?: (value: number) => void

  // State and handlers for Corner Rounding
  cornerRoundingConfig?: {
    enabled: boolean
    cornerType: string
  }
  onCornerRoundingToggle?: (checked: boolean) => void
  onCornerRoundingTypeChange?: (value: string) => void
}

export function AddonRenderer({
  addon,
  selectedAddons,
  disabled,
  quantity,
  onAddonToggle,
  variableDataConfig,
  onVariableDataToggle,
  onVariableDataLocationsCountChange,
  onVariableDataLocationsChange,
  perforationConfig,
  onPerforationToggle,
  onPerforationUpdateConfig,
  bandingConfig,
  onBandingToggle,
  onBandingTypeChange,
  onBandingItemsPerBundleChange,
  cornerRoundingConfig,
  onCornerRoundingToggle,
  onCornerRoundingTypeChange,
}: AddonRendererProps) {
  // Detect special addon types by configuration.type
  const addonType = addon.configuration?.type

  // Render Variable Data section with 2 text inputs
  if (addonType === 'variable_data' && variableDataConfig) {
    return (
      <VariableDataSection
        disabled={disabled}
        enabled={variableDataConfig.enabled}
        locations={variableDataConfig.locations}
        locationsCount={variableDataConfig.locationsCount}
        quantity={quantity}
        onLocationsChange={onVariableDataLocationsChange || (() => {})}
        onLocationsCountChange={onVariableDataLocationsCountChange || (() => {})}
        onToggle={onVariableDataToggle || (() => {})}
      />
    )
  }

  // Render Perforation section with 2 dropdowns + 2 text inputs
  if (addonType === 'perforation' && perforationConfig) {
    return (
      <PerforationSection
        disabled={disabled}
        enabled={perforationConfig.enabled}
        horizontalCount={perforationConfig.horizontalCount}
        horizontalPosition={perforationConfig.horizontalPosition}
        quantity={quantity}
        verticalCount={perforationConfig.verticalCount}
        verticalPosition={perforationConfig.verticalPosition}
        onToggle={onPerforationToggle || (() => {})}
        onUpdateConfig={onPerforationUpdateConfig || (() => {})}
      />
    )
  }

  // Render Banding section with 1 dropdown + 1 number input
  if (addonType === 'banding' && bandingConfig) {
    return (
      <BandingSection
        bandingType={bandingConfig.bandingType}
        disabled={disabled}
        enabled={bandingConfig.enabled}
        itemsPerBundle={bandingConfig.itemsPerBundle}
        quantity={quantity}
        onBandingTypeChange={onBandingTypeChange || (() => {})}
        onItemsPerBundleChange={onBandingItemsPerBundleChange || (() => {})}
        onToggle={onBandingToggle || (() => {})}
      />
    )
  }

  // Render Corner Rounding section with 1 dropdown
  if (addonType === 'corner_rounding' && cornerRoundingConfig) {
    return (
      <CornerRoundingSection
        cornerType={cornerRoundingConfig.cornerType}
        disabled={disabled}
        enabled={cornerRoundingConfig.enabled}
        quantity={quantity}
        onCornerTypeChange={onCornerRoundingTypeChange || (() => {})}
        onToggle={onCornerRoundingToggle || (() => {})}
      />
    )
  }

  // Default: Render simple checkbox for standard addons
  return (
    <AddonCheckbox
      addon={addon}
      checked={selectedAddons.includes(addon.id)}
      disabled={disabled}
      onToggle={onAddonToggle}
    />
  )
}
