/**
 * Standardized Module Hooks Index
 * Centralized export for all standardized module hooks
 */

// Export all standardized hooks
export {
  useQuantityModule,
  useSizeModule,
  usePaperStockModule,
  useAddonsModule,
  useTurnaroundModule,
  useImageModule,

  // Utility functions
  combineModulePricingContributions,
  validateAllModules
} from './StandardModuleHooks'

// Export hook prop types for easy importing
export type {
  UseQuantityModuleProps,
  UseSizeModuleProps,
  UsePaperStockModuleProps,
  UseAddonsModuleProps,
  UseTurnaroundModuleProps,
  UseImageModuleProps
} from './StandardModuleHooks'

// Re-export related types for convenience
export type {
  ModulePricingContribution,
  StandardModuleValue,
  ModuleError
} from '../types/StandardModuleTypes'

/**
 * Hook Registry for dynamic access
 */
export const HOOK_REGISTRY = {
  quantity: 'useQuantityModule',
  size: 'useSizeModule',
  'paper-stock': 'usePaperStockModule',
  addons: 'useAddonsModule',
  turnaround: 'useTurnaroundModule',
  images: 'useImageModule'
} as const

export type HookRegistryKey = keyof typeof HOOK_REGISTRY