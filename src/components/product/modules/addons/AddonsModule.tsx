'use client'

import { AddonAccordion } from '../../addons/AddonAccordion'
import type { AddonsModuleProps, AddonsModuleValue } from './types'

/**
 * AddonsModule - A modular wrapper for product add-ons and upgrades
 * Handles various add-on types including variable data, perforation, banding, etc.
 */
export function AddonsModule({
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
  turnaroundTimes = [],
  quantity = 0,
  disabled = false,
  className = '',
}: AddonsModuleProps) {
  // If no addons, don't render anything
  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className={`addons-module ${className}`}>
      <AddonAccordion
        addons={addons}
        addonsGrouped={addonsGrouped}
        bandingConfig={bandingConfig}
        cornerRoundingConfig={cornerRoundingConfig}
        disabled={disabled}
        perforationConfig={perforationConfig}
        quantity={quantity}
        selectedAddons={selectedAddons}
        turnaroundTimes={turnaroundTimes}
        variableDataConfig={variableDataConfig}
        onAddonChange={onAddonChange}
        onBandingChange={onBandingChange}
        onCornerRoundingChange={onCornerRoundingChange}
        onPerforationChange={onPerforationChange}
        onVariableDataChange={onVariableDataChange}
      />
    </div>
  )
}

// Export standardized hook for external use
export { useAddonsModule } from '../hooks/StandardModuleHooks'
