/**
 * Central Module Types Index
 * Exports all standardized module types and utilities for the GangRun Printing modular architecture
 */

// =============================================================================
// CORE STANDARD TYPES
// =============================================================================

// Import ModuleType as value (enum) for runtime use
import { ModuleType, type ModulePricingContribution } from './StandardModuleTypes'

export type {
  BaseModuleProps,
  StandardModuleProps,
  StandardModuleValue,
  ModulePricingContribution,
  ModuleError,
  ModuleErrorHandling,
  ModuleChangeHandler,
  ValidationRule,
  ValidationContext,
  ModuleType,
  ModuleMetadata,
} from './StandardModuleTypes'

// =============================================================================
// SPECIFIC MODULE STANDARD TYPES
// =============================================================================

export type {
  // Quantity Module
  QuantityItem,
  QuantityValue,
  QuantityModuleProps as StandardQuantityModuleProps,
  QuantityModuleValue as StandardQuantityModuleValue,

  // Size Module
  SizeItem,
  SizeValue,
  SizeModuleProps as StandardSizeModuleProps,
  SizeModuleValue as StandardSizeModuleValue,

  // Paper Stock Module
  PaperStockItem,
  PaperStockValue,
  CoatingItem,
  SidesItem,
  PaperStockModuleProps as StandardPaperStockModuleProps,
  PaperStockModuleValue as StandardPaperStockModuleValue,

  // Add-ons Module
  AddonItem,
  AddonValue,
  AddonsModuleProps as StandardAddonsModuleProps,
  AddonsModuleValue as StandardAddonsModuleValue,
  VariableDataConfig,
  PerforationConfig,
  BandingConfig,
  CornerRoundingConfig,

  // Turnaround Module
  TurnaroundItem,
  TurnaroundValue,
  TurnaroundModuleProps as StandardTurnaroundModuleProps,
  TurnaroundModuleValue as StandardTurnaroundModuleValue,

  // Image Module
  ImageItem,
  ImageValue,
  UploadedFile,
  ImageModuleProps as StandardImageModuleProps,
  ImageModuleValue as StandardImageModuleValue,

  // Utility Types
  AnyModuleItem,
  AnyModuleValue,
  ExtractModuleItem,
  ExtractModuleValue,
} from './StandardModuleTypes'

// =============================================================================
// MODULE REGISTRY
// =============================================================================

/**
 * Module Registry - Central catalog of all available modules
 * This enables dynamic module loading and validation
 */
export const MODULE_REGISTRY = {
  quantity: {
    type: ModuleType.QUANTITY,
    name: 'Quantity',
    description: 'Product quantity selection with custom quantity support',
    isRequired: true,
    defaultEnabled: true,
  },
  size: {
    type: ModuleType.SIZE,
    name: 'Size',
    description: 'Product size selection with custom dimensions',
    isRequired: false,
    defaultEnabled: true,
  },
  'paper-stock': {
    type: ModuleType.PAPER_STOCK,
    name: 'Paper Stock',
    description: 'Paper stock, coating, and sides selection',
    isRequired: false,
    defaultEnabled: true,
  },
  addons: {
    type: ModuleType.ADDONS,
    name: 'Add-ons',
    description: 'Product add-ons and upgrades with special configurations',
    isRequired: false,
    defaultEnabled: true,
  },
  turnaround: {
    type: ModuleType.TURNAROUND,
    name: 'Turnaround Time',
    description: 'Production turnaround time selection with coating restrictions',
    isRequired: false,
    defaultEnabled: true,
  },
  images: {
    type: ModuleType.IMAGES,
    name: 'Images',
    description: 'Image upload and management with multi-format support',
    isRequired: false,
    defaultEnabled: false,
  },
} as const

export type ModuleRegistryKey = keyof typeof MODULE_REGISTRY

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get module metadata by type
 */
export function getModuleMetadata(moduleType: string) {
  return MODULE_REGISTRY[moduleType as ModuleRegistryKey] || null
}

/**
 * Get all enabled modules
 */
export function getEnabledModules() {
  return Object.values(MODULE_REGISTRY).filter((module) => module.defaultEnabled)
}

/**
 * Get all required modules
 */
export function getRequiredModules() {
  return Object.values(MODULE_REGISTRY).filter((module) => module.isRequired)
}

/**
 * Validate module configuration
 */
export function validateModuleConfiguration(config: Record<string, any>) {
  const requiredModules = getRequiredModules()
  const missingRequired = requiredModules.filter((module) => !config[module.type])

  if (missingRequired.length > 0) {
    throw new Error(`Missing required modules: ${missingRequired.map((m) => m.name).join(', ')}`)
  }

  return true
}

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

/**
 * Development helper to validate module interface compliance
 */
export function validateModuleInterface<T>(moduleProps: T, expectedInterface: string): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return true
  }

  // Future implementation: Runtime interface validation
  return true
}

/**
 * Development helper to log module pricing contributions
 */
export function debugModulePricing(
  moduleName: string,
  pricingContribution: ModulePricingContribution
): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  console.group(`💰 ${moduleName} Pricing Contribution`)
  if (pricingContribution.calculation) {
  }
  console.groupEnd()
}
