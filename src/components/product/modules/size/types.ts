import {
  StandardModuleProps,
  StandardModuleValue,
  type SizeItem,
  SizeValue,
  type SizeModuleProps as StandardSizeModuleProps,
  type SizeModuleValue as StandardSizeModuleValue,
} from '../types/StandardModuleTypes'

// Use standardized interface with legacy compatibility
export interface Size extends Omit<SizeItem, 'displayName' | 'squareInches' | 'priceMultiplier' | 'isDefault'> {
  displayName: string | null // Legacy allows null
  minWidth?: number | null // Legacy allows null
  maxWidth?: number | null // Legacy allows null
  minHeight?: number | null // Legacy allows null
  maxHeight?: number | null // Legacy allows null
  unit?: string // Additional legacy field
  squareInches?: number | null // Legacy allows null
  priceMultiplier?: number // Legacy makes optional
  isDefault?: boolean // Legacy makes optional
}

// Use standardized props interface with legacy compatibility
export interface SizeModuleProps
  extends Omit<StandardSizeModuleProps, 'onChange' | 'items' | 'value'> {
  sizes: Size[]
  value: string
  onChange: (sizeId: string, customWidth?: number, customHeight?: number) => void
  exactSizeRequired?: boolean
  onExactSizeChange?: (exactSize: boolean) => void
}

// Use standardized value interface with legacy compatibility
export interface SizeModuleValue extends Omit<StandardSizeModuleValue, 'value'> {
  // Legacy properties for backward compatibility
  sizeId: string
  customWidth?: number
  customHeight?: number
  width: number
  height: number
  squareInches: number
  exactSizeRequired?: boolean
}
