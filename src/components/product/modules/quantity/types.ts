import {
  StandardModuleProps,
  StandardModuleValue,
  QuantityItem,
  QuantityValue,
  QuantityModuleProps as StandardQuantityModuleProps,
  QuantityModuleValue as StandardQuantityModuleValue
} from '../types/StandardModuleTypes'

// Legacy interface for backward compatibility
export interface Quantity extends QuantityItem {
  name: string // Additional field for backward compatibility
}

// Use standardized props interface with legacy compatibility
export interface QuantityModuleProps extends Omit<StandardQuantityModuleProps, 'onChange'> {
  quantities: Quantity[] // Use legacy type for now
  onChange: (quantityId: string, customValue?: number) => void // Keep legacy signature
}

// Use standardized value interface
export interface QuantityModuleValue extends Omit<StandardQuantityModuleValue, 'value'> {
  // Legacy properties for backward compatibility
  quantityId: string
  customValue?: number
  actualValue: number
}