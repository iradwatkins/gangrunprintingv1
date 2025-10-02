/**
 * ModulePricingEngine.ts
 * Clean, organized pricing system that handles module dependencies correctly
 * KEEPS all required dependencies but organizes them systematically
 * OPTIMIZED with high-performance caching system
 */

import { ModuleType, ModulePricingContribution } from '../types/StandardModuleTypes'
import {
  PricingCacheManager,
  generatePricingCacheKey,
  generateModuleContextKey,
  measureExecutionTime
} from './PricingCache'

// =============================================================================
// PRICING FLOW ARCHITECTURE
// =============================================================================

/**
 * CORRECT Pricing Flow (as per user requirements):
 *
 * STEP 1: Base Price = quantity × paper_stock × size × coating × sides
 * STEP 2: Addon Price = quantity × addon (PER_UNIT) OR base_price × addon (PERCENTAGE)
 * STEP 3: Final Price = base_price + addon_price × turnaround
 */

/**
 * Pricing context passed between modules
 * This is the CLEAN way to handle dependencies
 */
export interface ModulePricingContext {
  // From Quantity Module
  quantity: number
  quantityMultiplier: number

  // From Size Module
  sizeMultiplier: number
  squareInches: number

  // From Paper Stock Module
  paperPricePerUnit: number
  coatingMultiplier: number
  sidesMultiplier: number

  // Calculated values
  basePrice: number           // quantity × paper × size × coating × sides
  productPrice: number        // basePrice + addon costs
  finalPrice: number          // productPrice × turnaround

  // Validation
  isValid: boolean
  hasAllRequiredModules: boolean
}

/**
 * Module pricing requirements
 * Defines what each module needs to calculate pricing
 */
export interface ModulePricingRequirements {
  moduleType: ModuleType
  requiredInputs: string[]    // What this module needs from other modules
  provides: string[]          // What this module provides to others
  calculationOrder: number    // Order in pricing calculation chain
}

// =============================================================================
// PRICING ENGINE
// =============================================================================

/**
 * Central pricing engine that manages dependencies cleanly
 * All pricing calculations go through this engine
 */
export class ModulePricingEngine {
  private context: ModulePricingContext
  private moduleContributions: Map<ModuleType, ModulePricingContribution> = new Map()
  private calculationOrder: ModuleType[] = [
    ModuleType.QUANTITY,      // 1st: Provides quantity
    ModuleType.PAPER_STOCK,   // 2nd: Provides base price per unit
    ModuleType.SIZE,          // 3rd: Provides size multiplier
    ModuleType.ADDONS,        // 4th: Uses quantity + base price
    ModuleType.TURNAROUND,    // 5th: Uses product price
    ModuleType.IMAGES         // 6th: Always optional
  ]

  // High-performance caching system
  private cache: PricingCacheManager

  constructor(cacheOptions?: {
    maxCacheSize?: number
    maxAge?: number
    enableCaching?: boolean
  }) {
    this.context = this.createEmptyContext()
    this.cache = new PricingCacheManager({
      maxCacheSize: cacheOptions?.maxCacheSize || 1000,
      maxAge: cacheOptions?.maxAge || 5 * 60 * 1000, // 5 minutes
    })
  }

  /**
   * Create empty pricing context
   */
  private createEmptyContext(): ModulePricingContext {
    return {
      quantity: 0,
      quantityMultiplier: 1,
      sizeMultiplier: 1,
      squareInches: 0,
      paperPricePerUnit: 0,
      coatingMultiplier: 1,
      sidesMultiplier: 1,
      basePrice: 0,
      productPrice: 0,
      finalPrice: 0,
      isValid: false,
      hasAllRequiredModules: false
    }
  }

  /**
   * Update a module's pricing contribution
   * This triggers recalculation of dependent modules
   * OPTIMIZED with cache invalidation
   */
  updateModuleContribution(
    moduleType: ModuleType,
    contribution: ModulePricingContribution
  ): ModulePricingContext {
    this.moduleContributions.set(moduleType, contribution)

    // Invalidate cache for this module and dependents
    this.cache.invalidateModule(moduleType)

    return this.recalculateAll()
  }

  /**
   * Remove a module's contribution
   * Handles optional modules gracefully
   * OPTIMIZED with cache invalidation
   */
  removeModuleContribution(moduleType: ModuleType): ModulePricingContext {
    this.moduleContributions.delete(moduleType)

    // Invalidate cache for this module and dependents
    this.cache.invalidateModule(moduleType)

    return this.recalculateAll()
  }

  /**
   * Get current pricing context
   */
  getPricingContext(): ModulePricingContext {
    return { ...this.context }
  }

  /**
   * Get specific module's contribution
   */
  getModuleContribution(moduleType: ModuleType): ModulePricingContribution | null {
    return this.moduleContributions.get(moduleType) || null
  }

  /**
   * Check if module has valid contribution
   */
  hasModuleContribution(moduleType: ModuleType): boolean {
    const contribution = this.moduleContributions.get(moduleType)
    return !!(contribution && contribution.isValid)
  }

  /**
   * Get all active module contributions
   */
  getAllContributions(): Record<ModuleType, ModulePricingContribution> {
    const result: Partial<Record<ModuleType, ModulePricingContribution>> = {}
    this.moduleContributions.forEach((contribution, moduleType) => {
      if (contribution.isValid) {
        result[moduleType] = contribution
      }
    })
    return result as Record<ModuleType, ModulePricingContribution>
  }

  /**
   * STEP 1: Calculate base price from quantity, paper, size
   * This is the foundation for all other calculations
   */
  private calculateBasePrice(): number {
    const quantityContrib = this.moduleContributions.get(ModuleType.QUANTITY)
    const paperContrib = this.moduleContributions.get(ModuleType.PAPER_STOCK)
    const sizeContrib = this.moduleContributions.get(ModuleType.SIZE)

    // Required modules for base price
    if (!quantityContrib?.isValid || !paperContrib?.isValid || !sizeContrib?.isValid) {
      return 0
    }

    // Extract values from contributions
    const quantity = this.context.quantity
    const paperPrice = paperContrib.basePrice || 0
    const sizeMultiplier = sizeContrib.multiplier || 1
    const coatingMultiplier = this.context.coatingMultiplier || 1
    const sidesMultiplier = this.context.sidesMultiplier || 1

    return quantity * paperPrice * sizeMultiplier * coatingMultiplier * sidesMultiplier
  }

  /**
   * STEP 2: Calculate addon costs using quantity and base price
   * Addons NEED these dependencies - this is CORRECT
   */
  private calculateAddonCosts(): number {
    const addonContrib = this.moduleContributions.get(ModuleType.ADDONS)

    if (!addonContrib?.isValid) {
      return 0
    }

    let addonCosts = 0

    // Fixed addon costs (already calculated in module)
    addonCosts += addonContrib.addonCost || 0

    // PER_UNIT costs - NEEDS quantity (this dependency is CORRECT)
    if (addonContrib.perUnitCost) {
      addonCosts += addonContrib.perUnitCost * this.context.quantity
    }

    // PERCENTAGE costs - NEEDS base price (this dependency is CORRECT)
    if (addonContrib.percentageCost) {
      addonCosts += addonContrib.percentageCost * this.context.basePrice
    }

    return addonCosts
  }

  /**
   * STEP 3: Calculate turnaround pricing using product price
   * Turnaround NEEDS base/product price - this is CORRECT
   */
  private calculateTurnaroundCosts(): number {
    const turnaroundContrib = this.moduleContributions.get(ModuleType.TURNAROUND)

    if (!turnaroundContrib?.isValid) {
      return 0
    }

    let turnaroundCosts = 0

    // Flat turnaround fee
    turnaroundCosts += turnaroundContrib.addonCost || 0

    // PER_UNIT turnaround - NEEDS quantity (this dependency is CORRECT)
    if (turnaroundContrib.perUnitCost) {
      turnaroundCosts += turnaroundContrib.perUnitCost * this.context.quantity
    }

    // PERCENTAGE turnaround - NEEDS product price (this dependency is CORRECT)
    if (turnaroundContrib.multiplier && turnaroundContrib.multiplier !== 1) {
      turnaroundCosts += this.context.productPrice * (turnaroundContrib.multiplier - 1)
    }

    return turnaroundCosts
  }

  /**
   * Recalculate all pricing following the correct dependency flow
   * This is the CLEAN way to handle module dependencies
   * OPTIMIZED with high-performance caching
   */
  private recalculateAll(): ModulePricingContext {
    // Generate cache key for current module state
    const cacheKey = generatePricingCacheKey(this.moduleContributions)

    // Try cache first
    const cachedResult = this.cache.getPricingResult(cacheKey)
    if (cachedResult) {
      this.context = cachedResult
      return this.context
    }

    // Cache miss - perform calculation with performance measurement
    return this.performCalculationWithCaching(cacheKey)
  }

  /**
   * Perform full calculation with caching and performance measurement
   */
  private performCalculationWithCaching(cacheKey: string): ModulePricingContext {
    const startTime = performance.now()

    // Reset context but preserve module contributions
    this.context = this.createEmptyContext()

    // STEP 1: Extract base values from module contributions
    this.extractBaseValues()

    // STEP 2: Calculate base price (quantity × paper × size × coating × sides)
    this.context.basePrice = this.calculateBasePrice()

    // STEP 3: Calculate addon costs (using quantity + base price)
    const addonCosts = this.calculateAddonCosts()
    this.context.productPrice = this.context.basePrice + addonCosts

    // STEP 4: Calculate final price with turnaround (using product price)
    const turnaroundCosts = this.calculateTurnaroundCosts()
    this.context.finalPrice = this.context.productPrice + turnaroundCosts

    // STEP 5: Validate final result
    this.context.isValid = this.validatePricingContext()
    this.context.hasAllRequiredModules = this.hasRequiredModules()

    // Record performance and cache result
    const endTime = performance.now()
    const timeMs = endTime - startTime

    this.cache.recordCalculationTime(timeMs)
    this.cache.setPricingResult(cacheKey, this.context)

    return this.context
  }

  /**
   * Extract base values from module contributions
   */
  private extractBaseValues(): void {
    // From Quantity Module
    const quantityContrib = this.moduleContributions.get(ModuleType.QUANTITY)
    if (quantityContrib?.isValid) {
      this.context.quantity = this.extractQuantityFromContribution(quantityContrib)
      this.context.quantityMultiplier = quantityContrib.multiplier || 1
    }

    // From Size Module
    const sizeContrib = this.moduleContributions.get(ModuleType.SIZE)
    if (sizeContrib?.isValid) {
      this.context.sizeMultiplier = sizeContrib.multiplier || 1
      this.context.squareInches = this.extractSquareInchesFromContribution(sizeContrib)
    }

    // From Paper Stock Module
    const paperContrib = this.moduleContributions.get(ModuleType.PAPER_STOCK)
    if (paperContrib?.isValid) {
      this.context.paperPricePerUnit = paperContrib.basePrice || 0
      // Note: coating and sides multipliers are handled within paper stock calculation
      // Extract them if available in calculation breakdown
      const breakdown = paperContrib.calculation?.breakdown || []
      const coatingItem = breakdown.find(item => item.type === 'coating')
      const sidesItem = breakdown.find(item => item.type === 'sides')

      this.context.coatingMultiplier = coatingItem?.cost || 1
      this.context.sidesMultiplier = sidesItem?.cost || 1
    }
  }

  /**
   * Extract actual quantity value from contribution
   */
  private extractQuantityFromContribution(contribution: ModulePricingContribution): number {
    // Look in calculation breakdown for actual quantity value
    const breakdown = contribution.calculation?.breakdown || []
    const quantityItem = breakdown.find(item => item.type === 'quantity')

    if (quantityItem) {
      // Extract number from description like "5000 units"
      const match = quantityItem.item.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }

    return 0
  }

  /**
   * Extract square inches from size contribution
   */
  private extractSquareInchesFromContribution(contribution: ModulePricingContribution): number {
    const breakdown = contribution.calculation?.breakdown || []
    const sizeItem = breakdown.find(item => item.type === 'size')

    if (sizeItem) {
      // Extract number from description like "187 square inches"
      const match = sizeItem.item.match(/(\d+(?:\.\d+)?)\s*square inches/)
      return match ? parseFloat(match[1]) : 0
    }

    return 0
  }

  /**
   * Validate pricing context
   */
  private validatePricingContext(): boolean {
    return !!(
      this.context.quantity > 0 &&
      this.context.basePrice >= 0 &&
      this.context.finalPrice >= 0
    )
  }

  /**
   * Check if all required modules are present
   */
  private hasRequiredModules(): boolean {
    // Required modules: Quantity, Paper Stock, Size
    const requiredModules = [
      ModuleType.QUANTITY,
      ModuleType.PAPER_STOCK,
      ModuleType.SIZE
    ]

    return requiredModules.every(moduleType =>
      this.hasModuleContribution(moduleType)
    )
  }

  /**
   * Get pricing breakdown for display
   */
  getPricingBreakdown(): {
    basePrice: number
    addonCosts: number
    turnaroundCosts: number
    finalPrice: number
    breakdown: Array<{
      module: ModuleType
      description: string
      cost: number
      details?: string
    }>
  } {
    const breakdown = []

    // Base price breakdown
    if (this.context.basePrice > 0) {
      breakdown.push({
        module: ModuleType.QUANTITY,
        description: 'Base Product',
        cost: this.context.basePrice,
        details: `${this.context.quantity} × $${this.context.paperPricePerUnit} × ${this.context.sizeMultiplier}`
      })
    }

    // Addon costs breakdown
    const addonCosts = this.context.productPrice - this.context.basePrice
    if (addonCosts > 0) {
      breakdown.push({
        module: ModuleType.ADDONS,
        description: 'Add-ons',
        cost: addonCosts
      })
    }

    // Turnaround costs breakdown
    const turnaroundCosts = this.context.finalPrice - this.context.productPrice
    if (turnaroundCosts > 0) {
      breakdown.push({
        module: ModuleType.TURNAROUND,
        description: 'Turnaround',
        cost: turnaroundCosts
      })
    }

    return {
      basePrice: this.context.basePrice,
      addonCosts,
      turnaroundCosts,
      finalPrice: this.context.finalPrice,
      breakdown
    }
  }

  /**
   * Create pricing context for specific module
   * This provides clean access to dependencies each module needs
   * OPTIMIZED with context caching
   */
  getContextForModule(moduleType: ModuleType): Partial<ModulePricingContext> {
    // Generate cache key for module context
    const cacheKey = generateModuleContextKey(moduleType, this.context)

    // Try cache first
    const cachedContext = this.cache.getModuleContext(cacheKey)
    if (cachedContext) {
      return cachedContext
    }

    // Calculate context based on module type
    let context: Partial<ModulePricingContext>

    switch (moduleType) {
      case ModuleType.QUANTITY:
        // Quantity module doesn't need any dependencies
        context = {}
        break

      case ModuleType.SIZE:
        // Size module doesn't need any dependencies
        context = {}
        break

      case ModuleType.PAPER_STOCK:
        // Paper stock module doesn't need any dependencies
        context = {}
        break

      case ModuleType.ADDONS:
        // Addons module NEEDS quantity and base price - this is CORRECT
        context = {
          quantity: this.context.quantity,
          basePrice: this.context.basePrice,
          isValid: this.context.isValid
        }
        break

      case ModuleType.TURNAROUND:
        // Turnaround module NEEDS base price and quantity - this is CORRECT
        context = {
          quantity: this.context.quantity,
          basePrice: this.context.basePrice,
          productPrice: this.context.productPrice,
          isValid: this.context.isValid
        }
        break

      case ModuleType.IMAGES:
        // Images module is always optional and doesn't need dependencies
        context = {}
        break

      default:
        context = {}
        break
    }

    // Cache the result
    this.cache.setModuleContext(cacheKey, context)

    return context
  }

  /**
   * Get performance statistics from the caching system
   */
  getPerformanceStats() {
    return this.cache.getStats()
  }

  /**
   * Clear all pricing caches (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clearCache()
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cache.destroy()
  }
}

// =============================================================================
// REACT HOOK FOR PRICING ENGINE
// =============================================================================

import { useState, useCallback, useMemo } from 'react'

export interface UseModulePricingEngineOptions {
  onPriceChange?: (context: ModulePricingContext) => void
  onError?: (error: Error) => void
  autoCalculate?: boolean
}

/**
 * React hook for clean pricing engine management
 */
export function useModulePricingEngine(options: UseModulePricingEngineOptions = {}) {
  const { onPriceChange, onError, autoCalculate = true } = options

  // Create stable pricing engine instance
  const [engine] = useState(() => new ModulePricingEngine())

  // Current pricing context
  const [pricingContext, setPricingContext] = useState<ModulePricingContext>(
    engine.getPricingContext()
  )

  // Update module contribution
  const updateModuleContribution = useCallback((
    moduleType: ModuleType,
    contribution: ModulePricingContribution
  ) => {
    try {
      const newContext = engine.updateModuleContribution(moduleType, contribution)
      setPricingContext(newContext)

      if (autoCalculate) {
        onPriceChange?.(newContext)
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Pricing calculation failed'))
    }
  }, [engine, autoCalculate, onPriceChange, onError])

  // Remove module contribution
  const removeModuleContribution = useCallback((moduleType: ModuleType) => {
    try {
      const newContext = engine.removeModuleContribution(moduleType)
      setPricingContext(newContext)

      if (autoCalculate) {
        onPriceChange?.(newContext)
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Pricing update failed'))
    }
  }, [engine, autoCalculate, onPriceChange, onError])

  // Get context for specific module
  const getContextForModule = useCallback((moduleType: ModuleType) => {
    return engine.getContextForModule(moduleType)
  }, [engine])

  // Get pricing breakdown
  const pricingBreakdown = useMemo(() => {
    return engine.getPricingBreakdown()
  }, [engine, pricingContext]) // Update when context changes

  return {
    // Current state
    pricingContext,
    pricingBreakdown,

    // Module management
    updateModuleContribution,
    removeModuleContribution,
    getContextForModule,

    // Direct engine access for advanced use
    engine,

    // Convenience getters
    basePrice: pricingContext.basePrice,
    finalPrice: pricingContext.finalPrice,
    isValid: pricingContext.isValid,
    hasAllRequiredModules: pricingContext.hasAllRequiredModules
  }
}