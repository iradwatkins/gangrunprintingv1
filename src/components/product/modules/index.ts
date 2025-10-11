// Quantity Module
export { QuantityModule, useQuantityModule } from './quantity'
export type { Quantity, QuantityModuleProps, QuantityModuleValue } from './quantity'

// Size Module
export { SizeModule, useSizeModule } from './size'
export type { Size, SizeModuleProps, SizeModuleValue } from './size'

// Paper Stock Module
export { PaperStockModule, usePaperStockModule } from './paper-stock'
export type {
  PaperStock,
  Coating,
  SidesOption,
  PaperStockModuleProps,
  PaperStockModuleValue,
} from './paper-stock'

// Addons Module
export { AddonsModule, useAddonsModule } from './addons'
export type {
  Addon,
  AddonsGrouped,
  VariableDataConfig,
  PerforationConfig,
  BandingConfig,
  CornerRoundingConfig,
  AddonsModuleProps,
  AddonsModuleValue,
} from './addons'

// Turnaround Module
export { TurnaroundModule, useTurnaroundModule } from './turnaround'
export type { TurnaroundTime, TurnaroundModuleProps, TurnaroundModuleValue } from './turnaround'
