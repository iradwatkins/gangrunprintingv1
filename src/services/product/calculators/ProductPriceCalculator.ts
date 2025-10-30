/**
 * ProductPriceCalculator - Pricing Logic Service
 *
 * EXTRACTED FROM: SimpleConfigurationForm.tsx (lines 322-598)
 *
 * This service contains ALL pricing calculation logic for product configuration.
 * It is separated from UI components for:
 * - Testability (can test without rendering UI)
 * - Reusability (use in API routes, admin, quotes, invoices)
 * - Maintainability (single source of truth for pricing)
 *
 * CRITICAL: This pricing logic is PROTECTED (see PRICING-REFERENCE.md)
 * The formula MUST NOT be changed without reading documentation.
 *
 * Formula: FINAL PRICE = (Base Product × Turnaround Multiplier) + All Addons
 */

import Decimal from 'decimal.js'

// ============================================
// TYPES
// ============================================

export interface ProductConfiguration {
  productId: string
  quantity: number
  size: {
    id: string
    width: number
    height: number
    isCustom: boolean
  }
  paperStock: {
    id: string
    name: string
    basePrice?: number
  }
  coating?: {
    id: string
    name: string
  }
  sides?: {
    id: string
    name: string
    multiplier: number
  }
  design?: {
    id: string
    price: number
  }
  turnaround: {
    id: string
    name: string
    multiplier: number // 1.1, 1.3, 1.5, 2.0
  }
  addons: Array<{
    id: string
    name: string
    pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'TIERED'
    configuration: any
  }>
}

export interface PriceResult {
  basePrice: number
  sizeCost: number
  turnaroundCost: number
  addonsCost: number
  designCost: number
  subtotal: number
  finalPrice: number
  breakdown: Array<{
    label: string
    amount: number
    description?: string
  }>
}

// ============================================
// PRODUCT PRICE CALCULATOR SERVICE
// ============================================

export class ProductPriceCalculator {
  /**
   * Calculate complete price for product configuration
   *
   * @param config - Product configuration
   * @param includeTurnaround - Whether to include turnaround cost (default: true)
   * @returns Complete price breakdown
   */
  calculate(config: ProductConfiguration, includeTurnaround: boolean = true): PriceResult {
    // Step 1: Calculate base price (product + size + quantity)
    const basePrice = this.calculateBasePrice(config)

    // Step 2: Apply turnaround multiplier (if included)
    const turnaroundMultiplier = includeTurnaround ? config.turnaround.multiplier : 1.0
    const turnaroundCost = basePrice * (turnaroundMultiplier - 1.0)

    // Step 3: Calculate addons cost
    const addonsCost = this.calculateAddons(config, basePrice + turnaroundCost)

    // Step 4: Calculate design cost
    const designCost = config.design ? config.design.price : 0

    // Step 5: Calculate totals
    const subtotal = basePrice + turnaroundCost + addonsCost + designCost
    const finalPrice = subtotal

    // Step 6: Build detailed breakdown
    const breakdown = this.buildBreakdown(config, {
      basePrice,
      turnaroundCost,
      addonsCost,
      designCost,
      subtotal,
      finalPrice,
    })

    return {
      basePrice,
      sizeCost: 0, // Included in base price
      turnaroundCost,
      addonsCost,
      designCost,
      subtotal,
      finalPrice,
      breakdown,
    }
  }

  /**
   * Calculate base price (product + size + quantity)
   * This is the starting point before any multipliers or addons
   */
  private calculateBasePrice(config: ProductConfiguration): number {
    // For custom sizes, calculate based on square inches and quantity
    if (config.size.isCustom) {
      const squareInches = config.size.width * config.size.height
      const baseRate = config.paperStock.basePrice || 0.10 // Default rate per sq inch
      const sizeMultiplier = squareInches / 8.5 / 11 // Normalize to letter size
      const basePrice = baseRate * config.quantity * sizeMultiplier

      // Apply sides multiplier if applicable
      const sidesMultiplier = config.sides?.multiplier || 1.0
      return basePrice * sidesMultiplier
    }

    // For standard sizes, use catalog pricing
    // In a real implementation, you would fetch this from the database
    // For now, we'll use a placeholder calculation
    const baseRate = config.paperStock.basePrice || 0.10
    const basePrice = baseRate * config.quantity

    // Apply sides multiplier if applicable
    const sidesMultiplier = config.sides?.multiplier || 1.0
    return basePrice * sidesMultiplier
  }

  /**
   * Calculate total cost of all selected addons
   *
   * CRITICAL: Addons are calculated AFTER turnaround multiplier is applied to base price
   */
  private calculateAddons(config: ProductConfiguration, baseWithTurnaround: number): number {
    if (!config.addons || config.addons.length === 0) {
      return 0
    }

    let totalAddonsCost = 0

    for (const addon of config.addons) {
      let addonCost = 0

      switch (addon.pricingModel) {
        case 'FLAT':
          // Fixed price regardless of quantity
          addonCost = addon.configuration?.price || 0
          break

        case 'PERCENTAGE':
          // Percentage of (base + turnaround)
          const percentage = addon.configuration?.percentage || 0
          addonCost = (baseWithTurnaround * percentage) / 100
          break

        case 'PER_UNIT':
          // Price per unit/quantity
          const pricePerUnit = addon.configuration?.pricePerUnit || 0
          addonCost = pricePerUnit * config.quantity
          break

        case 'CUSTOM':
          // Custom pricing logic (e.g., folding, special features)
          addonCost = this.calculateCustomAddonPrice(addon, config)
          break

        case 'TIERED':
          // Tiered pricing based on quantity
          addonCost = this.calculateTieredAddonPrice(addon, config)
          break

        default:
          console.warn(`Unknown addon pricing model: ${addon.pricingModel}`)
      }

      totalAddonsCost += addonCost
    }

    return totalAddonsCost
  }

  /**
   * Calculate custom addon pricing (folding, special finishes, etc.)
   */
  private calculateCustomAddonPrice(addon: any, config: ProductConfiguration): number {
    // Example: Folding might have complex pricing based on fold type and quantity
    if (addon.name.toLowerCase().includes('fold')) {
      const baseFoldCost = addon.configuration?.basePrice || 10
      const perUnitCost = addon.configuration?.perUnitCost || 0.01
      return baseFoldCost + perUnitCost * config.quantity
    }

    // Default to flat price if no custom logic
    return addon.configuration?.price || 0
  }

  /**
   * Calculate tiered addon pricing
   * Example: 0-100 units: $0.10 each, 101-500: $0.08 each, 501+: $0.05 each
   */
  private calculateTieredAddonPrice(addon: any, config: ProductConfiguration): number {
    const tiers = addon.configuration?.tiers || []
    if (tiers.length === 0) {
      return 0
    }

    // Find applicable tier based on quantity
    let applicableTier = tiers[0]
    for (const tier of tiers) {
      if (config.quantity >= tier.minQuantity) {
        applicableTier = tier
      } else {
        break
      }
    }

    // Calculate based on tier pricing
    if (applicableTier.pricingType === 'PER_UNIT') {
      return applicableTier.price * config.quantity
    } else {
      // Flat tier price
      return applicableTier.price
    }
  }

  /**
   * Build detailed price breakdown for display
   */
  private buildBreakdown(
    config: ProductConfiguration,
    costs: {
      basePrice: number
      turnaroundCost: number
      addonsCost: number
      designCost: number
      subtotal: number
      finalPrice: number
    }
  ): Array<{ label: string; amount: number; description?: string }> {
    const breakdown: Array<{ label: string; amount: number; description?: string }> = []

    // Base product
    breakdown.push({
      label: 'Base Product',
      amount: costs.basePrice,
      description: `${config.quantity} × ${config.size.width}" × ${config.size.height}"`,
    })

    // Turnaround cost
    if (costs.turnaroundCost > 0) {
      breakdown.push({
        label: `Turnaround: ${config.turnaround.name}`,
        amount: costs.turnaroundCost,
        description: `${((config.turnaround.multiplier - 1) * 100).toFixed(0)}% markup`,
      })
    }

    // Addons
    if (costs.addonsCost > 0) {
      breakdown.push({
        label: 'Add-ons',
        amount: costs.addonsCost,
        description: `${config.addons.length} selected`,
      })
    }

    // Design
    if (costs.designCost > 0) {
      breakdown.push({
        label: 'Design Services',
        amount: costs.designCost,
      })
    }

    return breakdown
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Quick price estimate (simplified calculation)
   * Use for real-time preview as user types
   */
  quickEstimate(quantity: number, baseRate: number, turnaroundMultiplier: number = 1.0): number {
    return quantity * baseRate * turnaroundMultiplier
  }
}

// Export singleton instance for easy use
export const productPriceCalculator = new ProductPriceCalculator()
