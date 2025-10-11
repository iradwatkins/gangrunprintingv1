/**
 * Pricing Module Index
 * Complete pricing system for modular product architecture
 *
 * ULTRA-CLEAR ARCHITECTURE:
 * - Modules work TOGETHER for pricing (quantity × paper × size = base price)
 * - Dependencies are REQUIRED and CORRECT (addons need quantity, turnaround needs base price)
 * - Modules are independent for ERROR HANDLING and MAINTENANCE only
 */

// Core pricing engine
export {
  ModulePricingEngine,
  ModulePricingContext,
  ModulePricingRequirements,
  useModulePricingEngine,
  UseModulePricingEngineOptions,
} from './ModulePricingEngine'

// High-performance caching system
export {
  PricingCacheManager,
  generatePricingCacheKey,
  generateModuleContextKey,
  measureExecutionTime,
  debounce,
  throttle,
} from './PricingCache'

export type { CachedPricingResult, CachedModuleContext, PricingCacheStats } from './PricingCache'

// Re-export types from standard module types that are needed for pricing
export type {
  ModulePricingContribution,
  ModulePricingCalculation,
  ModuleType,
} from '../types/StandardModuleTypes'

/**
 * Pricing Constants
 */
export const PricingConstants = {
  // Default multipliers
  DEFAULT_QUANTITY_MULTIPLIER: 1,
  DEFAULT_SIZE_MULTIPLIER: 1,
  DEFAULT_COATING_MULTIPLIER: 1,
  DEFAULT_SIDES_MULTIPLIER: 1,

  // Calculation precision
  PRICE_DECIMAL_PLACES: 2,
  PROGRESS_DECIMAL_PLACES: 0,

  // Operation timeouts
  CALCULATION_TIMEOUT_MS: 5000,
  VALIDATION_TIMEOUT_MS: 2000,

  // Performance limits
  MAX_CONCURRENT_CALCULATIONS: 3,
  MAX_PRICING_HISTORY: 10,

  // Caching configuration
  DEFAULT_CACHE_SIZE: 1000,
  DEFAULT_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_CLEANUP_INTERVAL_MS: 60 * 1000, // 1 minute

  // Performance thresholds
  SLOW_CALCULATION_THRESHOLD_MS: 100,
  VERY_SLOW_CALCULATION_THRESHOLD_MS: 500,

  // Debounce/throttle defaults
  DEFAULT_DEBOUNCE_MS: 300,
  DEFAULT_THROTTLE_MS: 100,
} as const

/**
 * Pricing Utilities
 */
export const PricingUtils = {
  /**
   * Format price for display
   */
  formatPrice: (price: number, includeCurrency: boolean = true): string => {
    const formatted = price.toFixed(PricingConstants.PRICE_DECIMAL_PLACES)
    return includeCurrency ? `$${formatted}` : formatted
  },

  /**
   * Calculate percentage of base price
   */
  calculatePercentage: (basePrice: number, percentage: number): number => {
    return basePrice * (percentage / 100)
  },

  /**
   * Calculate per-unit cost
   */
  calculatePerUnit: (quantity: number, unitCost: number): number => {
    return quantity * unitCost
  },

  /**
   * Validate price value
   */
  isValidPrice: (price: number): boolean => {
    return !isNaN(price) && isFinite(price) && price >= 0
  },

  /**
   * Round price to standard precision
   */
  roundPrice: (price: number): number => {
    return Math.round(price * 100) / 100
  },

  /**
   * Check if pricing context is complete
   */
  hasCompletePricingData: (context: ModulePricingContext): boolean => {
    return !!(
      context.quantity > 0 &&
      context.paperPricePerUnit >= 0 &&
      context.sizeMultiplier > 0 &&
      context.isValid
    )
  },
} as const

/**
 * Pricing Flow Documentation
 *
 * STEP 1: Base Price Calculation
 * quantity × paper_stock_price × size_multiplier × coating_multiplier × sides_multiplier = BASE_PRICE
 *
 * STEP 2: Add-on Price Calculation
 * FOR EACH ADDON:
 *   - PER_UNIT: quantity × addon_price
 *   - PERCENTAGE: BASE_PRICE × addon_percentage
 *   - FLAT: addon_flat_fee
 *
 * STEP 3: Final Price Calculation
 * BASE_PRICE + ADDON_COSTS = PRODUCT_PRICE
 * PRODUCT_PRICE × turnaround_multiplier (OR + turnaround_flat_fee) = FINAL_PRICE
 */

/**
 * Example Usage:
 *
 * ```typescript
 * import { ModulePricingEngine, useModulePricingEngine } from '@/components/product/modules/pricing'
 *
 * // In a component
 * function ProductPricing() {
 *   const {
 *     pricingContext,
 *     updateModuleContribution,
 *     finalPrice,
 *     isValid
 *   } = useModulePricingEngine({
 *     onPriceChange: (context) => {
 *       console.log('New price:', PricingUtils.formatPrice(context.finalPrice))
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       Final Price: {PricingUtils.formatPrice(finalPrice)}
 *     </div>
 *   )
 * }
 * ```
 */
