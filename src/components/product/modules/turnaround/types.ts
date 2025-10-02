import {
  StandardModuleProps,
  StandardModuleValue,
  TurnaroundItem,
  TurnaroundValue,
  TurnaroundModuleProps as StandardTurnaroundModuleProps,
  TurnaroundModuleValue as StandardTurnaroundModuleValue
} from '../types/StandardModuleTypes'

// Use standardized interface with legacy compatibility
export interface TurnaroundTime extends TurnaroundItem {
  // All properties already defined in TurnaroundItem
}

// Use standardized props interface with legacy compatibility
export interface TurnaroundModuleProps extends Omit<StandardTurnaroundModuleProps, 'onChange' | 'items' | 'value'> {
  turnaroundTimes: TurnaroundTime[]
  selectedTurnaroundId: string
  onTurnaroundChange: (turnaroundId: string) => void

  // ❌ DEPRECATED: These dependencies will be removed in next phase
  // These create tight coupling and prevent module independence
  baseProductPrice?: number
  quantity?: number

  // Note: currentCoating moved to standard interface as it's needed for validation
}

// Use standardized value interface with legacy compatibility
export interface TurnaroundModuleValue extends Omit<StandardTurnaroundModuleValue, 'value'> {
  // Legacy properties for backward compatibility
  turnaroundId: string
  turnaround?: TurnaroundTime
  estimatedDeliveryDate?: Date
  turnaroundPrice: number // ❌ DEPRECATED: Will be moved to pricing contribution
  daysMin: number
  daysMax?: number
}