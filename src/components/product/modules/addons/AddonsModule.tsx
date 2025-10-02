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
        disabled={disabled}
        selectedAddons={selectedAddons}
        turnaroundTimes={turnaroundTimes}
        quantity={quantity}
        onAddonChange={onAddonChange}
        variableDataConfig={variableDataConfig}
        onVariableDataChange={onVariableDataChange}
        perforationConfig={perforationConfig}
        onPerforationChange={onPerforationChange}
        bandingConfig={bandingConfig}
        onBandingChange={onBandingChange}
        cornerRoundingConfig={cornerRoundingConfig}
        onCornerRoundingChange={onCornerRoundingChange}
      />
    </div>
  )
}

// Export standardized hook for external use
export { useAddonsModule } from '../hooks/StandardModuleHooks'