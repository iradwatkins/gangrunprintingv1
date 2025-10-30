/**
 * AddonPricingCalculator - Addon Cost Calculation Service
 *
 * EXTRACTED FROM: SimpleConfigurationForm.tsx (lines 359-433)
 * ALSO USED IN: ProductPriceCalculator.ts (lines 164-210)
 *
 * This service handles all addon-related cost calculations:
 * - FLAT pricing (fixed cost)
 * - PERCENTAGE pricing (% of base product)
 * - PER_UNIT pricing (cost per quantity)
 * - CUSTOM pricing (special formulas for complex addons)
 * - TIERED pricing (volume-based pricing)
 *
 * Special Addons Handled:
 * - Variable Data (setup + per-unit)
 * - Perforation (setup + per-unit)
 * - Banding (per-bundle)
 * - Corner Rounding (setup + per-unit)
 * - Design Services (flat or side-based)
 *
 * Separation Benefits:
 * - Testable (can test without UI)
 * - Reusable (use in ProductPriceCalculator, API routes, quotes)
 * - Single source of truth for addon pricing
 */

// ============================================
// TYPES
// ============================================

export type AddonPricingModel = 'FLAT' | 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'TIERED'

export interface Addon {
  id: string
  name: string
  description?: string
  pricingModel: AddonPricingModel
  price: number // Base price or percentage value
  configuration?: any // Additional configuration for CUSTOM/TIERED addons
}

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

export interface DesignOption {
  id: string
  name: string
  description?: string
  requiresSideSelection?: boolean
  sideOptions?: {
    oneSide: { label: string; price: number }
    twoSides: { label: string; price: number }
  }
  basePrice?: number
}

export interface AddonCostBreakdown {
  addonId: string
  addonName: string
  cost: number
  formula: string // Human-readable formula for transparency
}

// ============================================
// ADDON PRICING CALCULATOR SERVICE
// ============================================

export class AddonPricingCalculator {
  /**
   * Calculate cost for a single addon
   *
   * @param addon - Addon configuration
   * @param basePrice - Base product price (used for PERCENTAGE model)
   * @param quantity - Product quantity (used for PER_UNIT model)
   * @returns Addon cost
   */
  calculateAddonCost(addon: Addon, basePrice: number, quantity: number): number {
    switch (addon.pricingModel) {
      case 'FLAT':
      case 'FIXED_FEE':
        return addon.price

      case 'PERCENTAGE':
        return basePrice * addon.price

      case 'PER_UNIT':
        return quantity * addon.price

      case 'CUSTOM':
        return this.calculateCustomAddonCost(addon, quantity)

      case 'TIERED':
        return this.calculateTieredAddonCost(addon, quantity)

      default:
        console.warn(`Unknown addon pricing model: ${addon.pricingModel}`)
        return 0
    }
  }

  /**
   * Calculate cost for multiple addons
   *
   * @param addons - Array of addons
   * @param basePrice - Base product price
   * @param quantity - Product quantity
   * @returns Total addon costs
   */
  calculateTotalAddonsCost(addons: Addon[], basePrice: number, quantity: number): number {
    return addons.reduce((total, addon) => {
      return total + this.calculateAddonCost(addon, basePrice, quantity)
    }, 0)
  }

  /**
   * Calculate cost with detailed breakdown
   * Useful for displaying itemized costs to customers
   *
   * @param addons - Array of addons
   * @param basePrice - Base product price
   * @param quantity - Product quantity
   * @returns Total cost and breakdown
   */
  calculateWithBreakdown(
    addons: Addon[],
    basePrice: number,
    quantity: number
  ): {
    total: number
    breakdown: AddonCostBreakdown[]
  } {
    const breakdown: AddonCostBreakdown[] = []
    let total = 0

    for (const addon of addons) {
      const cost = this.calculateAddonCost(addon, basePrice, quantity)
      const formula = this.getFormulaDescription(addon, basePrice, quantity)

      breakdown.push({
        addonId: addon.id,
        addonName: addon.name,
        cost,
        formula,
      })

      total += cost
    }

    return { total, breakdown }
  }

  /**
   * Calculate custom addon pricing
   * Handles special addons with complex formulas
   *
   * @param addon - Custom addon configuration
   * @param quantity - Product quantity
   * @returns Calculated cost
   */
  private calculateCustomAddonCost(addon: Addon, quantity: number): number {
    const config = addon.configuration || {}

    // Handle specific custom addon types
    switch (config.type) {
      case 'variable_data':
        // Not calculated here - handled by calculateVariableDataCost()
        return 0

      case 'perforation':
        // Not calculated here - handled by calculatePerforationCost()
        return 0

      case 'banding':
        // Not calculated here - handled by calculateBandingCost()
        return 0

      case 'corner_rounding':
        // Not calculated here - handled by calculateCornerRoundingCost()
        return 0

      case 'folding':
        // Setup cost + per-unit cost
        const baseFoldCost = config.basePrice || 10
        const perUnitCost = config.perUnitCost || 0.01
        return baseFoldCost + perUnitCost * quantity

      default:
        // Default to flat price if no custom logic
        return config.price || addon.price || 0
    }
  }

  /**
   * Calculate tiered addon pricing
   * Price varies based on quantity tiers
   *
   * Example tiers:
   * - 0-100 units: $0.10 each
   * - 101-500: $0.08 each
   * - 501+: $0.05 each
   *
   * @param addon - Tiered addon configuration
   * @param quantity - Product quantity
   * @returns Calculated cost
   */
  private calculateTieredAddonCost(addon: Addon, quantity: number): number {
    const tiers = addon.configuration?.tiers || []
    if (tiers.length === 0) {
      return 0
    }

    // Find applicable tier based on quantity
    let applicableTier = tiers[0]
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        applicableTier = tier
      } else {
        break
      }
    }

    // Calculate based on tier pricing type
    if (applicableTier.pricingType === 'PER_UNIT') {
      return applicableTier.price * quantity
    } else {
      // Flat tier price
      return applicableTier.price
    }
  }

  /**
   * Calculate Variable Data addon cost
   * Formula: $60 setup + $0.02 per unit
   *
   * @param quantity - Product quantity
   * @param config - Variable data configuration
   * @returns Calculated cost
   */
  calculateVariableDataCost(quantity: number, config: VariableDataConfig): number {
    if (!config.enabled) return 0

    const setupCost = 60
    const perUnitCost = 0.02
    return setupCost + perUnitCost * quantity
  }

  /**
   * Calculate Perforation addon cost
   * Formula: $20 setup + $0.01 per unit
   *
   * @param quantity - Product quantity
   * @param config - Perforation configuration
   * @returns Calculated cost
   */
  calculatePerforationCost(quantity: number, config: PerforationConfig): number {
    if (!config.enabled) return 0

    const setupCost = 20
    const perUnitCost = 0.01
    return setupCost + perUnitCost * quantity
  }

  /**
   * Calculate Banding addon cost
   * Formula: Number of bundles × $0.75 per bundle
   *
   * @param quantity - Product quantity
   * @param config - Banding configuration
   * @returns Calculated cost
   */
  calculateBandingCost(quantity: number, config: BandingConfig): number {
    if (!config.enabled || config.itemsPerBundle <= 0) return 0

    const numberOfBundles = Math.ceil(quantity / config.itemsPerBundle)
    const costPerBundle = 0.75
    return numberOfBundles * costPerBundle
  }

  /**
   * Calculate Corner Rounding addon cost
   * Formula: $20 setup + $0.01 per unit
   *
   * @param quantity - Product quantity
   * @param config - Corner rounding configuration
   * @returns Calculated cost
   */
  calculateCornerRoundingCost(quantity: number, config: CornerRoundingConfig): number {
    if (!config.enabled) return 0

    const setupCost = 20
    const perUnitCost = 0.01
    return setupCost + perUnitCost * quantity
  }

  /**
   * Calculate Design Services cost
   * Handles both flat pricing and side-based pricing
   *
   * @param designOption - Selected design option
   * @param selectedSide - Selected side ('oneSide' | 'twoSides') for side-based pricing
   * @returns Calculated cost
   */
  calculateDesignCost(
    designOption: DesignOption,
    selectedSide?: 'oneSide' | 'twoSides'
  ): number {
    // Side-based pricing (Standard/Rush design)
    if (designOption.requiresSideSelection && designOption.sideOptions && selectedSide) {
      return designOption.sideOptions[selectedSide].price
    }

    // Flat pricing (Minor/Major changes) or FREE (upload_own)
    return designOption.basePrice || 0
  }

  /**
   * Get human-readable formula description
   * Useful for showing customers how addon cost was calculated
   *
   * @param addon - Addon configuration
   * @param basePrice - Base product price
   * @param quantity - Product quantity
   * @returns Formula description
   */
  private getFormulaDescription(addon: Addon, basePrice: number, quantity: number): string {
    switch (addon.pricingModel) {
      case 'FLAT':
      case 'FIXED_FEE':
        return `Flat fee: $${addon.price.toFixed(2)}`

      case 'PERCENTAGE':
        const percentage = (addon.price * 100).toFixed(0)
        return `${percentage}% of base price ($${basePrice.toFixed(2)})`

      case 'PER_UNIT':
        return `$${addon.price.toFixed(2)} × ${quantity} units`

      case 'TIERED':
        return this.getTieredFormulaDescription(addon, quantity)

      case 'CUSTOM':
        return this.getCustomFormulaDescription(addon, quantity)

      default:
        return 'Unknown pricing model'
    }
  }

  /**
   * Get tiered pricing formula description
   */
  private getTieredFormulaDescription(addon: Addon, quantity: number): string {
    const tiers = addon.configuration?.tiers || []
    if (tiers.length === 0) return 'No tiers configured'

    // Find applicable tier
    let applicableTier = tiers[0]
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        applicableTier = tier
      } else {
        break
      }
    }

    if (applicableTier.pricingType === 'PER_UNIT') {
      return `Tier ${applicableTier.minQuantity}+: $${applicableTier.price.toFixed(2)} × ${quantity} units`
    } else {
      return `Tier ${applicableTier.minQuantity}+: Flat $${applicableTier.price.toFixed(2)}`
    }
  }

  /**
   * Get custom pricing formula description
   */
  private getCustomFormulaDescription(addon: Addon, quantity: number): string {
    const config = addon.configuration || {}

    switch (config.type) {
      case 'folding':
        return `Setup $${config.basePrice || 10} + $${config.perUnitCost || 0.01} × ${quantity} units`
      default:
        return `Custom pricing: $${(config.price || addon.price || 0).toFixed(2)}`
    }
  }
}

// Export singleton instance for easy use
export const addonPricingCalculator = new AddonPricingCalculator()
