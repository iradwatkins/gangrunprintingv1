/**
 * Type definitions for addon components
 */

export interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

export interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

export interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

export interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

export interface Addon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  price?: number
  priceDisplay?: string
  configuration?: any
  isDefault?: boolean
  additionalTurnaroundDays?: number
}

export interface TurnaroundTime {
  id: string
  displayName: string
  description?: string
  daysMin: number
  daysMax?: number
}

export interface AddonsGrouped {
  aboveDropdown: Addon[]
  inDropdown: Addon[]
  belowDropdown: Addon[]
}

export interface AddonAccordionProps {
  addons: Addon[]
  addonsGrouped?: AddonsGrouped
  selectedAddons: string[]
  onAddonChange: (addonIds: string[]) => void
  variableDataConfig?: VariableDataConfig
  onVariableDataChange?: (config: VariableDataConfig) => void
  perforationConfig?: PerforationConfig
  onPerforationChange?: (config: PerforationConfig) => void
  bandingConfig?: BandingConfig
  onBandingChange?: (config: BandingConfig) => void
  cornerRoundingConfig?: CornerRoundingConfig
  onCornerRoundingChange?: (config: CornerRoundingConfig) => void
  quantity?: number
  turnaroundTimes?: TurnaroundTime[]
  disabled?: boolean
}