import {
  StandardModuleProps,
  StandardModuleValue,
  type AddonItem,
  AddonValue,
  type AddonsModuleProps as StandardAddonsModuleProps,
  type AddonsModuleValue as StandardAddonsModuleValue,
  VariableDataConfig,
  PerforationConfig,
  BandingConfig,
  CornerRoundingConfig,
} from '../types/StandardModuleTypes'

// Use standardized interface with legacy compatibility
export interface Addon extends AddonItem {
  // All properties already defined in AddonItem
}

// Legacy grouped interface
export interface AddonsGrouped {
  aboveDropdown: Addon[]
  inDropdown: Addon[]
  belowDropdown: Addon[]
}

// Re-export standard config interfaces
export type { VariableDataConfig, PerforationConfig, BandingConfig, CornerRoundingConfig }

// Use standardized props interface with legacy compatibility
export interface AddonsModuleProps
  extends Omit<StandardAddonsModuleProps, 'onChange' | 'items' | 'value'> {
  addons: Addon[]
  selectedAddons: string[]
  onAddonChange: (selectedAddonIds: string[]) => void

  // Keep addonsGrouped for backward compatibility
  addonsGrouped?: AddonsGrouped

  // ❌ DEPRECATED: These dependencies will be removed in next phase
  // These create tight coupling and prevent module independence
  turnaroundTimes?: any[]
  quantity?: number
}

// Use standardized value interface with legacy compatibility
export interface AddonsModuleValue extends Omit<StandardAddonsModuleValue, 'value'> {
  // Legacy properties for backward compatibility
  selectedAddons: string[]
  variableDataConfig?: VariableDataConfig
  perforationConfig?: PerforationConfig
  bandingConfig?: BandingConfig
  cornerRoundingConfig?: CornerRoundingConfig
  totalAddonsPrice: number // ❌ DEPRECATED: Will be moved to pricing contribution
}
