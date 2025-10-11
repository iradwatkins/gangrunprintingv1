import {
  StandardModuleProps,
  StandardModuleValue,
  type PaperStockItem,
  PaperStockValue,
  type CoatingItem,
  type SidesItem,
  type PaperStockModuleProps as StandardPaperStockModuleProps,
  type PaperStockModuleValue as StandardPaperStockModuleValue,
} from '../types/StandardModuleTypes'

// Use standardized interface with legacy compatibility
export interface Coating extends CoatingItem {
  priceMultiplier?: number // Legacy makes optional
  isDefault?: boolean // Legacy makes optional
}

export interface SidesOption extends SidesItem {
  priceMultiplier?: number // Legacy makes optional
  isDefault?: boolean // Legacy makes optional
  isEnabled?: boolean // Additional legacy field
}

export interface PaperStock extends Omit<PaperStockItem, 'description' | 'pricePerUnit'> {
  weight?: number // Additional legacy field
  description?: string // Legacy makes optional
  pricePerUnit?: number // Legacy makes optional
  pricePerSqInch?: number // Additional legacy field
  tooltipText?: string // Additional legacy field
  thumbnailUrl?: string // Additional legacy field
  texture?: string // Additional legacy field
  coatings: Coating[] // Use legacy coating type
  sides: SidesOption[] // Use legacy sides type
}

// Use standardized props interface with legacy compatibility
export interface PaperStockModuleProps
  extends Omit<
    StandardPaperStockModuleProps,
    'onChange' | 'items' | 'value' | 'onCoatingChange' | 'onSidesChange'
  > {
  paperStocks: PaperStock[]
  paperValue: string
  coatingValue: string
  sidesValue: string
  onPaperChange: (paperId: string) => void
  onCoatingChange: (coatingId: string) => void
  onSidesChange: (sidesId: string) => void
}

// Use standardized value interface with legacy compatibility
export interface PaperStockModuleValue extends Omit<StandardPaperStockModuleValue, 'value'> {
  // Legacy properties for backward compatibility
  paperId: string
  coatingId: string
  sidesId: string
  paper?: PaperStock
  coating?: Coating
  sides?: SidesOption
}
