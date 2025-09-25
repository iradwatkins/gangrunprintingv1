/**
 * Unified Pricing Engine for Gang Run Printing
 *
 * This is the SINGLE SOURCE OF TRUTH for all pricing calculations.
 * Combines the exact formula from base-price-engine with comprehensive
 * add-on calculations from pricing-engine.
 *
 * CRITICAL FORMULA: Base Price = ((Base Paper Price × Sides Multiplier) × Size × Quantity)
 *
 * BUSINESS RULES:
 * 1. Size = Pre-calculated backend value for standard sizes OR width×height for custom
 * 2. Quantity = Calculation value for <5000 quantities OR exact for >=5000
 * 3. Custom quantities >5000 MUST be in 5000 increments (55000, 60000, etc.)
 * 4. Custom sizes must be in 0.25 inch increments
 * 5. Sides Multiplier = 1.75 for exception papers (text) double-sided, 1.0 otherwise
 */

import { Decimal } from 'decimal.js'
import { PRICING } from '@/config/constants'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface UnifiedSize {
  id: string
  name: string
  displayName: string
  width: number // inches
  height: number // inches
  preCalculatedValue: number // Backend calculation value
  isCustom: boolean
  sortOrder: number
  isActive: boolean
}

export interface UnifiedQuantity {
  id: string
  displayValue: number // What customer sees
  calculationValue: number // What backend uses for <5000
  adjustmentValue?: number // Optional override
  isCustom: boolean
  sortOrder: number
  isActive: boolean
}

export interface UnifiedPaperStock {
  id: string
  name: string
  pricePerSqInch: number
  isExceptionPaper: boolean // Text papers, etc.
  doubleSidedMultiplier: number // 1.75 for exception papers, 1.0 for others
  paperType: 'cardstock' | 'text' | 'specialty'
  thickness?: string
  coating?: string
}

export interface UnifiedTurnaround {
  id: string
  name: string
  businessDays: number
  priceMarkupPercent: number // e.g., 25 for 25%
  isStandard: boolean
  sortOrder: number
}

export enum AddonPricingModel {
  FLAT = 'FLAT', // Fixed price
  PERCENTAGE = 'PERCENTAGE', // % of base or total
  PER_UNIT = 'PER_UNIT', // Price per piece/bundle
  CUSTOM = 'CUSTOM', // Complex calculation
  TIERED = 'TIERED' // Different prices at different quantities
}

export interface UnifiedAddon {
  id: string
  name: string
  category: string
  pricingModel: AddonPricingModel
  configuration: AddonConfiguration
  isActive: boolean
  sortOrder: number
  requiresConfiguration?: boolean
  conflictsWith?: string[] // IDs of incompatible addons
  requiredFor?: string[] // IDs of dependent addons
}

export interface AddonConfiguration {
  // For FLAT pricing
  flatPrice?: number

  // For PERCENTAGE pricing
  percentage?: number
  appliesTo?: 'base_price' | 'adjusted_base' | 'after_turnaround'

  // For PER_UNIT pricing
  setupFee?: number
  pricePerUnit?: number
  unitType?: 'piece' | 'bundle' | 'score' | 'hole'
  defaultUnitsPerBundle?: number

  // For CUSTOM pricing
  customCalculation?: {
    textPaperPrice?: number
    cardStockPrice?: number
    textPaperPerPiece?: number
    cardStockPerPiece?: number
  }

  // For TIERED pricing
  tiers?: Array<{
    minQuantity: number
    maxQuantity?: number
    price: number
    pricePerUnit?: number
  }>

  // Additional configuration
  requiresUserInput?: boolean
  userInputFields?: Array<{
    name: string
    type: 'text' | 'number' | 'select'
    options?: string[]
    required: boolean
  }>
}

export interface UnifiedPricingRequest {
  // Product selection
  productId?: string
  categoryId?: string

  // Size configuration
  sizeSelection: 'standard' | 'custom'
  standardSizeId?: string
  customWidth?: number // Must be in 0.25 increments
  customHeight?: number // Must be in 0.25 increments

  // Quantity configuration
  quantitySelection: 'standard' | 'custom'
  standardQuantityId?: string
  customQuantity?: number // Must be in 5000 increments if >5000

  // Paper configuration
  paperStockId: string
  sides: 'single' | 'double'

  // Turnaround
  turnaroundId: string

  // Add-ons
  selectedAddons: Array<{
    addonId: string
    configuration?: Record<string, any>
    quantity?: number // For per-unit addons
  }>

  // Customer type
  isBroker: boolean
  brokerCategoryDiscounts?: Array<{
    categoryId: string
    discountPercent: number
  }>
}

export interface UnifiedPricingResult {
  // Core calculation components
  baseCalculation: {
    size: number
    quantity: number
    paperPrice: number
    sidesMultiplier: number
    formula: string
    basePrice: number
  }

  // Price adjustments
  adjustments: {
    brokerDiscount: {
      applied: boolean
      percentage: number
      amount: number
    }
    taglineDiscount: {
      applied: boolean
      percentage: number
      amount: number
    }
    exactSizeMarkup: {
      applied: boolean
      percentage: number
      amount: number
    }
  }

  // Turnaround
  turnaround: {
    name: string
    days: number
    markupPercent: number
    markupAmount: number
  }

  // Add-ons breakdown
  addons: Array<{
    id: string
    name: string
    cost: number
    calculation: string
  }>
  totalAddonsCost: number

  // Progressive totals
  totals: {
    basePrice: number
    afterAdjustments: number
    afterTurnaround: number
    beforeTax: number
    unitPrice: number
  }

  // Validation results
  validation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }

  // Display-friendly breakdown
  displayBreakdown: string[]
}

// =============================================================================
// UNIFIED PRICING ENGINE CLASS
// =============================================================================

export class UnifiedPricingEngine {
  // Use Decimal.js for precision
  private decimal(value: number): Decimal {
    return new Decimal(value)
  }

  /**
   * Main pricing calculation method
   */
  public calculatePrice(
    request: UnifiedPricingRequest,
    catalog: {
      sizes: UnifiedSize[]
      quantities: UnifiedQuantity[]
      paperStocks: UnifiedPaperStock[]
      turnarounds: UnifiedTurnaround[]
      addons: UnifiedAddon[]
    }
  ): UnifiedPricingResult {
    // Initialize result
    const result: UnifiedPricingResult = this.initializeResult()

    // Validate request
    const validation = this.validateRequest(request, catalog)
    if (!validation.isValid) {
      result.validation = validation
      return result
    }

    // Get catalog items
    const paperStock = catalog.paperStocks.find(p => p.id === request.paperStockId)!
    const turnaround = catalog.turnarounds.find(t => t.id === request.turnaroundId)!

    // Calculate size
    const size = this.calculateSize(request, catalog)

    // Calculate quantity
    const quantity = this.calculateQuantity(request, catalog)

    // Calculate sides multiplier
    const sidesMultiplier = this.calculateSidesMultiplier(request.sides, paperStock)

    // CRITICAL: Apply exact formula
    // Base Price = ((Base Paper Price × Sides Multiplier) × Size × Quantity)
    const basePrice = this.decimal(paperStock.pricePerSqInch)
      .times(sidesMultiplier)
      .times(size)
      .times(quantity)
      .toNumber()

    // Store base calculation
    result.baseCalculation = {
      size,
      quantity,
      paperPrice: paperStock.pricePerSqInch,
      sidesMultiplier,
      formula: '((Base Paper Price × Sides Multiplier) × Size × Quantity)',
      basePrice
    }

    // Apply adjustments
    let adjustedPrice = basePrice

    // Broker discount
    if (request.isBroker && request.brokerCategoryDiscounts) {
      const discount = request.brokerCategoryDiscounts.find(
        d => d.categoryId === request.categoryId
      )
      if (discount) {
        const discountAmount = this.decimal(basePrice)
          .times(discount.discountPercent)
          .div(100)
          .toNumber()

        adjustedPrice -= discountAmount
        result.adjustments.brokerDiscount = {
          applied: true,
          percentage: discount.discountPercent,
          amount: discountAmount
        }
      }
    }

    // Check for "Our Tagline" addon (5% discount)
    const taglineAddon = request.selectedAddons.find(
      a => catalog.addons.find(ad => ad.id === a.addonId)?.name.includes('Our Tagline')
    )
    if (taglineAddon && !result.adjustments.brokerDiscount.applied) {
      const discountAmount = this.decimal(basePrice)
        .times(5)
        .div(100)
        .toNumber()

      adjustedPrice -= discountAmount
      result.adjustments.taglineDiscount = {
        applied: true,
        percentage: 5,
        amount: discountAmount
      }
    }

    // Check for "Exact Size" addon (12.5% markup)
    const exactSizeAddon = request.selectedAddons.find(
      a => catalog.addons.find(ad => ad.id === a.addonId)?.name.includes('Exact Size')
    )
    if (exactSizeAddon) {
      const markupAmount = this.decimal(adjustedPrice)
        .times(12.5)
        .div(100)
        .toNumber()

      adjustedPrice += markupAmount
      result.adjustments.exactSizeMarkup = {
        applied: true,
        percentage: 12.5,
        amount: markupAmount
      }
    }

    result.totals.afterAdjustments = adjustedPrice

    // Apply turnaround markup
    const turnaroundMarkup = this.decimal(adjustedPrice)
      .times(turnaround.priceMarkupPercent)
      .div(100)
      .toNumber()

    const priceAfterTurnaround = adjustedPrice + turnaroundMarkup

    result.turnaround = {
      name: turnaround.name,
      days: turnaround.businessDays,
      markupPercent: turnaround.priceMarkupPercent,
      markupAmount: turnaroundMarkup
    }
    result.totals.afterTurnaround = priceAfterTurnaround

    // Calculate add-ons
    const addonsResult = this.calculateAddons(
      request,
      catalog,
      quantity,
      paperStock,
      adjustedPrice,
      priceAfterTurnaround
    )

    result.addons = addonsResult.addons
    result.totalAddonsCost = addonsResult.total

    // Final totals
    result.totals.basePrice = basePrice
    result.totals.beforeTax = priceAfterTurnaround + addonsResult.total
    result.totals.unitPrice = result.totals.beforeTax / quantity

    // Generate display breakdown
    result.displayBreakdown = this.generateDisplayBreakdown(result)

    // Set validation
    result.validation = validation

    return result
  }

  /**
   * Calculate size based on selection
   */
  private calculateSize(
    request: UnifiedPricingRequest,
    catalog: { sizes: UnifiedSize[] }
  ): number {
    if (request.sizeSelection === 'custom') {
      if (!request.customWidth || !request.customHeight) {
        throw new Error('Custom size requires width and height')
      }

      // Validate 0.25 inch increments
      if (request.customWidth % 0.25 !== 0) {
        throw new Error(`Width must be in 0.25 inch increments. Received: ${request.customWidth}`)
      }
      if (request.customHeight % 0.25 !== 0) {
        throw new Error(`Height must be in 0.25 inch increments. Received: ${request.customHeight}`)
      }

      return request.customWidth * request.customHeight
    } else {
      const size = catalog.sizes.find(s => s.id === request.standardSizeId)
      if (!size) {
        throw new Error('Standard size not found')
      }
      // CRITICAL: Use pre-calculated value, not width × height
      return size.preCalculatedValue
    }
  }

  /**
   * Calculate quantity based on selection
   */
  private calculateQuantity(
    request: UnifiedPricingRequest,
    catalog: { quantities: UnifiedQuantity[] }
  ): number {
    if (request.quantitySelection === 'custom') {
      if (!request.customQuantity) {
        throw new Error('Custom quantity selection requires quantity value')
      }

      // CRITICAL: Enforce 5000 increment rule
      if (request.customQuantity > 5000 && request.customQuantity % 5000 !== 0) {
        const lower = Math.floor(request.customQuantity / 5000) * 5000
        const upper = Math.ceil(request.customQuantity / 5000) * 5000
        throw new Error(
          `Custom quantities above 5000 must be in increments of 5000. ` +
          `Received: ${request.customQuantity}. ` +
          `Try ${lower.toLocaleString()} or ${upper.toLocaleString()}`
        )
      }

      return request.customQuantity
    } else {
      const quantity = catalog.quantities.find(q => q.id === request.standardQuantityId)
      if (!quantity) {
        throw new Error('Standard quantity not found')
      }

      // For quantities >= 5000, use exact displayed value
      if (quantity.displayValue >= 5000) {
        return quantity.displayValue
      }

      // For quantities < 5000, check for adjustments
      if (quantity.adjustmentValue !== null && quantity.adjustmentValue !== undefined) {
        return quantity.adjustmentValue
      }

      return quantity.calculationValue
    }
  }

  /**
   * Calculate sides multiplier based on paper type
   */
  private calculateSidesMultiplier(
    sides: 'single' | 'double',
    paperStock: UnifiedPaperStock
  ): number {
    if (sides === 'double' && paperStock.isExceptionPaper) {
      return paperStock.doubleSidedMultiplier // 1.75 for text papers
    }
    return 1.0
  }

  /**
   * Calculate all add-on costs
   */
  private calculateAddons(
    request: UnifiedPricingRequest,
    catalog: { addons: UnifiedAddon[] },
    quantity: number,
    paperStock: UnifiedPaperStock,
    adjustedBasePrice: number,
    priceAfterTurnaround: number
  ): { addons: Array<{ id: string; name: string; cost: number; calculation: string }>; total: number } {
    const addonCosts: Array<{ id: string; name: string; cost: number; calculation: string }> = []
    let totalCost = 0

    for (const selectedAddon of request.selectedAddons) {
      const addon = catalog.addons.find(a => a.id === selectedAddon.addonId)
      if (!addon) continue

      // Skip pricing modifiers (handled in adjustments)
      if (addon.name.includes('Our Tagline') || addon.name.includes('Exact Size')) {
        continue
      }

      let cost = 0
      let calculation = ''

      switch (addon.pricingModel) {
        case AddonPricingModel.FLAT:
          cost = addon.configuration.flatPrice || 0
          calculation = `Flat fee: $${cost.toFixed(2)}`
          break

        case AddonPricingModel.PERCENTAGE:
          const percentage = addon.configuration.percentage || 0
          let baseAmount = adjustedBasePrice

          if (addon.configuration.appliesTo === 'after_turnaround') {
            baseAmount = priceAfterTurnaround
          }

          cost = this.decimal(baseAmount)
            .times(percentage)
            .div(100)
            .toNumber()
          calculation = `${percentage}% of ${addon.configuration.appliesTo}: $${cost.toFixed(2)}`
          break

        case AddonPricingModel.PER_UNIT:
          const setupFee = addon.configuration.setupFee || 0
          const pricePerUnit = addon.configuration.pricePerUnit || 0
          const units = selectedAddon.quantity || quantity

          cost = setupFee + (pricePerUnit * units)

          if (setupFee > 0) {
            calculation = `$${setupFee} setup + $${pricePerUnit} × ${units} ${addon.configuration.unitType}s`
          } else {
            calculation = `$${pricePerUnit} × ${units} ${addon.configuration.unitType}s`
          }
          break

        case AddonPricingModel.CUSTOM:
          // Handle complex calculations like folding
          if (addon.configuration.customCalculation) {
            const calc = addon.configuration.customCalculation

            if (paperStock.paperType === 'text') {
              const setup = calc.textPaperPrice || 0
              const perPiece = calc.textPaperPerPiece || 0
              cost = setup + (perPiece * quantity)
              calculation = `Text paper: $${setup} + $${perPiece}/pc × ${quantity}`
            } else if (paperStock.paperType === 'cardstock') {
              const setup = calc.cardStockPrice || 0
              const perPiece = calc.cardStockPerPiece || 0
              cost = setup + (perPiece * quantity)
              calculation = `Card stock: $${setup} + $${perPiece}/pc × ${quantity}`
            }
          }

          // Handle bundle pricing
          if (addon.configuration.pricePerUnit && addon.configuration.defaultUnitsPerBundle) {
            const bundles = Math.ceil(quantity / addon.configuration.defaultUnitsPerBundle)
            cost = addon.configuration.pricePerUnit * bundles
            calculation = `${bundles} bundles × $${addon.configuration.pricePerUnit}`
          }
          break

        case AddonPricingModel.TIERED:
          // Find applicable tier
          if (addon.configuration.tiers) {
            const tier = addon.configuration.tiers.find(t => {
              const min = t.minQuantity
              const max = t.maxQuantity || Infinity
              return quantity >= min && quantity <= max
            })

            if (tier) {
              if (tier.pricePerUnit) {
                cost = tier.price + (tier.pricePerUnit * quantity)
                calculation = `Tier ${tier.minQuantity}+: $${tier.price} + $${tier.pricePerUnit}/pc`
              } else {
                cost = tier.price
                calculation = `Tier ${tier.minQuantity}+: $${tier.price}`
              }
            }
          }
          break
      }

      if (cost > 0) {
        addonCosts.push({
          id: addon.id,
          name: addon.name,
          cost,
          calculation
        })
        totalCost += cost
      }
    }

    return { addons: addonCosts, total: totalCost }
  }

  /**
   * Validate pricing request
   */
  private validateRequest(
    request: UnifiedPricingRequest,
    catalog: any
  ): { isValid: boolean; warnings: string[]; errors: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate paper stock
    if (!request.paperStockId) {
      errors.push('Paper stock is required')
    } else if (!catalog.paperStocks.find((p: any) => p.id === request.paperStockId)) {
      errors.push('Invalid paper stock ID')
    }

    // Validate size
    if (request.sizeSelection === 'custom') {
      if (!request.customWidth || !request.customHeight) {
        errors.push('Custom size requires both width and height')
      } else {
        // Validate 0.25 inch increments
        if (request.customWidth % 0.25 !== 0) {
          errors.push(`Width must be in 0.25 inch increments. Received: ${request.customWidth}`)
        }
        if (request.customHeight % 0.25 !== 0) {
          errors.push(`Height must be in 0.25 inch increments. Received: ${request.customHeight}`)
        }

        // Validate reasonable limits
        if (request.customWidth < 1 || request.customWidth > 48) {
          warnings.push('Custom width should be between 1 and 48 inches')
        }
        if (request.customHeight < 1 || request.customHeight > 48) {
          warnings.push('Custom height should be between 1 and 48 inches')
        }
      }
    } else if (request.sizeSelection === 'standard') {
      if (!request.standardSizeId) {
        errors.push('Standard size ID is required')
      } else if (!catalog.sizes.find((s: any) => s.id === request.standardSizeId)) {
        errors.push('Invalid standard size ID')
      }
    } else {
      errors.push('Size selection must be either "standard" or "custom"')
    }

    // Validate quantity
    if (request.quantitySelection === 'custom') {
      if (!request.customQuantity || request.customQuantity <= 0) {
        errors.push('Custom quantity must be greater than 0')
      } else {
        // Validate 5000 increment rule
        if (request.customQuantity > 5000 && request.customQuantity % 5000 !== 0) {
          const lower = Math.floor(request.customQuantity / 5000) * 5000
          const upper = Math.ceil(request.customQuantity / 5000) * 5000
          errors.push(
            `Custom quantities above 5000 must be in increments of 5000. ` +
            `Received: ${request.customQuantity}. ` +
            `Try ${lower.toLocaleString()} or ${upper.toLocaleString()}`
          )
        }

        // Validate reasonable limits
        if (request.customQuantity > 1000000) {
          warnings.push('Quantities above 1,000,000 may require special handling')
        }
      }
    } else if (request.quantitySelection === 'standard') {
      if (!request.standardQuantityId) {
        errors.push('Standard quantity ID is required')
      } else if (!catalog.quantities.find((q: any) => q.id === request.standardQuantityId)) {
        errors.push('Invalid standard quantity ID')
      }
    } else {
      errors.push('Quantity selection must be either "standard" or "custom"')
    }

    // Validate sides
    if (!['single', 'double'].includes(request.sides)) {
      errors.push('Sides must be either "single" or "double"')
    }

    // Validate turnaround
    if (!request.turnaroundId) {
      errors.push('Turnaround time is required')
    } else if (!catalog.turnarounds.find((t: any) => t.id === request.turnaroundId)) {
      errors.push('Invalid turnaround ID')
    }

    // Check for conflicting addons
    const selectedAddonIds = request.selectedAddons.map(a => a.addonId)
    for (const selectedId of selectedAddonIds) {
      const addon = catalog.addons.find((a: any) => a.id === selectedId)
      if (addon?.conflictsWith) {
        const conflicts = addon.conflictsWith.filter((id: string) => selectedAddonIds.includes(id))
        if (conflicts.length > 0) {
          const conflictNames = conflicts.map((id: string) =>
            catalog.addons.find((a: any) => a.id === id)?.name
          ).join(', ')
          warnings.push(`${addon.name} conflicts with: ${conflictNames}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    }
  }

  /**
   * Initialize empty result
   */
  private initializeResult(): UnifiedPricingResult {
    return {
      baseCalculation: {
        size: 0,
        quantity: 0,
        paperPrice: 0,
        sidesMultiplier: 1,
        formula: '((Base Paper Price × Sides Multiplier) × Size × Quantity)',
        basePrice: 0
      },
      adjustments: {
        brokerDiscount: { applied: false, percentage: 0, amount: 0 },
        taglineDiscount: { applied: false, percentage: 0, amount: 0 },
        exactSizeMarkup: { applied: false, percentage: 0, amount: 0 }
      },
      turnaround: {
        name: '',
        days: 0,
        markupPercent: 0,
        markupAmount: 0
      },
      addons: [],
      totalAddonsCost: 0,
      totals: {
        basePrice: 0,
        afterAdjustments: 0,
        afterTurnaround: 0,
        beforeTax: 0,
        unitPrice: 0
      },
      validation: {
        isValid: true,
        warnings: [],
        errors: []
      },
      displayBreakdown: []
    }
  }

  /**
   * Generate display-friendly breakdown
   */
  private generateDisplayBreakdown(result: UnifiedPricingResult): string[] {
    const lines: string[] = []

    lines.push('=== PRICING CALCULATION ===')
    lines.push('')
    lines.push('BASE CALCULATION:')
    lines.push(`  Formula: ${result.baseCalculation.formula}`)
    lines.push(`  Paper Price: $${result.baseCalculation.paperPrice.toFixed(8)}/sq in`)
    lines.push(`  Sides Multiplier: ${result.baseCalculation.sidesMultiplier}x`)
    lines.push(`  Size: ${result.baseCalculation.size} sq in`)
    lines.push(`  Quantity: ${result.baseCalculation.quantity.toLocaleString()}`)
    lines.push(`  Base Price: $${result.baseCalculation.basePrice.toFixed(2)}`)
    lines.push('')

    if (result.adjustments.brokerDiscount.applied ||
        result.adjustments.taglineDiscount.applied ||
        result.adjustments.exactSizeMarkup.applied) {
      lines.push('ADJUSTMENTS:')

      if (result.adjustments.brokerDiscount.applied) {
        lines.push(`  Broker Discount (-${result.adjustments.brokerDiscount.percentage}%): -$${result.adjustments.brokerDiscount.amount.toFixed(2)}`)
      }
      if (result.adjustments.taglineDiscount.applied) {
        lines.push(`  Our Tagline Discount (-${result.adjustments.taglineDiscount.percentage}%): -$${result.adjustments.taglineDiscount.amount.toFixed(2)}`)
      }
      if (result.adjustments.exactSizeMarkup.applied) {
        lines.push(`  Exact Size Markup (+${result.adjustments.exactSizeMarkup.percentage}%): +$${result.adjustments.exactSizeMarkup.amount.toFixed(2)}`)
      }

      lines.push(`  After Adjustments: $${result.totals.afterAdjustments.toFixed(2)}`)
      lines.push('')
    }

    lines.push('TURNAROUND:')
    lines.push(`  ${result.turnaround.name} (${result.turnaround.days} days)`)
    lines.push(`  Markup (+${result.turnaround.markupPercent}%): +$${result.turnaround.markupAmount.toFixed(2)}`)
    lines.push(`  After Turnaround: $${result.totals.afterTurnaround.toFixed(2)}`)
    lines.push('')

    if (result.addons.length > 0) {
      lines.push('ADD-ONS:')
      for (const addon of result.addons) {
        lines.push(`  ${addon.name}: $${addon.cost.toFixed(2)}`)
        lines.push(`    (${addon.calculation})`)
      }
      lines.push(`  Total Add-ons: $${result.totalAddonsCost.toFixed(2)}`)
      lines.push('')
    }

    lines.push('FINAL TOTALS:')
    lines.push(`  Subtotal (before tax): $${result.totals.beforeTax.toFixed(2)}`)
    lines.push(`  Unit Price: $${result.totals.unitPrice.toFixed(4)}`)

    if (result.validation.warnings.length > 0) {
      lines.push('')
      lines.push('WARNINGS:')
      result.validation.warnings.forEach(w => lines.push(`  ⚠️ ${w}`))
    }

    if (result.validation.errors.length > 0) {
      lines.push('')
      lines.push('ERRORS:')
      result.validation.errors.forEach(e => lines.push(`  ❌ ${e}`))
    }

    return lines
  }

  /**
   * Quick price calculation for simple cases
   */
  public quickCalculate(
    paperPricePerSqIn: number,
    size: number,
    quantity: number,
    isDoubleSided: boolean = false,
    isExceptionPaper: boolean = false
  ): number {
    const sidesMultiplier = (isDoubleSided && isExceptionPaper) ? 1.75 : 1.0
    return this.decimal(paperPricePerSqIn)
      .times(sidesMultiplier)
      .times(size)
      .times(quantity)
      .toNumber()
  }

  /**
   * Validate custom quantity for 5000 increment rule
   */
  public validateCustomQuantity(value: number): { isValid: boolean; error?: string; suggestion?: { lower: number; upper: number } } {
    if (value <= 0) {
      return { isValid: false, error: 'Quantity must be greater than 0' }
    }

    if (value > 5000 && value % 5000 !== 0) {
      const lower = Math.floor(value / 5000) * 5000
      const upper = Math.ceil(value / 5000) * 5000
      return {
        isValid: false,
        error: `Quantities above 5000 must be in increments of 5000`,
        suggestion: { lower, upper }
      }
    }

    return { isValid: true }
  }

  /**
   * Validate custom size for 0.25 inch increment rule
   */
  public validateCustomSize(width: number, height: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (width <= 0) {
      errors.push('Width must be greater than 0')
    } else if (width % 0.25 !== 0) {
      const lower = Math.floor(width / 0.25) * 0.25
      const upper = Math.ceil(width / 0.25) * 0.25
      errors.push(`Width must be in 0.25 inch increments. Try ${lower}" or ${upper}"`)
    }

    if (height <= 0) {
      errors.push('Height must be greater than 0')
    } else if (height % 0.25 !== 0) {
      const lower = Math.floor(height / 0.25) * 0.25
      const upper = Math.ceil(height / 0.25) * 0.25
      errors.push(`Height must be in 0.25 inch increments. Try ${lower}" or ${upper}"`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const unifiedPricingEngine = new UnifiedPricingEngine()

// Export for backwards compatibility
export default unifiedPricingEngine