/**
 * Base Price Engine - Implements EXACT Pricing Formula
 *
 * Formula: Base Price = Paper Stock × Sides Multiplier × Size × Quantity
 *
 * CRITICAL RULES:
 * 1. Size = Pre-calculated backend value for standard sizes OR width×height for custom
 * 2. Quantity = Calculation value for <5000 quantities OR exact for >=5000
 * 3. Sides Multiplier = From PaperStockSides.priceMultiplier (e.g., 1.75 for double-sided text)
 * 4. Paper stock price includes markup set by admin (PaperStock.markupValue applied to vendorPricePerSqInch)
 */

export interface StandardSize {
  id: string
  name: string
  displayName: string
  width: number
  height: number
  preCalculatedValue: number
  sortOrder: number
  isActive: boolean
}

export interface StandardQuantity {
  id: string
  displayValue: number // What customer sees
  calculationValue: number // What backend uses (for <5000)
  adjustmentValue?: number // Optional override
  sortOrder: number
  isActive: boolean
}

export interface PricingInput {
  // Size selection
  sizeSelection: 'standard' | 'custom'
  standardSize?: StandardSize
  customWidth?: number
  customHeight?: number

  // Quantity selection
  quantitySelection: 'standard' | 'custom'
  standardQuantity?: StandardQuantity
  customQuantity?: number

  // Paper and pricing
  basePaperPrice: number
  sidesMultiplier: number // Resolved multiplier from caller
}

export interface BasePriceResult {
  basePrice: number
  breakdown: {
    basePaperPrice: number
    size: number
    quantity: number
    sidesMultiplier: number
    formula: string
    calculation: string
  }
  validation: {
    isValid: boolean
    errors: string[]
  }
}

export class BasePriceEngine {
  /**
   * Calculate base price using EXACT formula requirements
   * Formula: Paper Stock × Sides Multiplier × Size × Quantity
   */
  calculateBasePrice(input: PricingInput): BasePriceResult {
    const validation = this.validateInput(input)

    if (!validation.isValid) {
      return {
        basePrice: 0,
        breakdown: {
          basePaperPrice: input.basePaperPrice,
          size: 0,
          quantity: 0,
          sidesMultiplier: input.sidesMultiplier || 1,
          formula: 'Paper Stock × Sides Multiplier × Size × Quantity',
          calculation: 'Invalid input',
        },
        validation,
      }
    }

    // Step 1: Calculate Size
    const size = this.calculateSize(input)

    // Step 2: Calculate Quantity
    const quantity = this.calculateQuantity(input)

    // Step 3: Get Sides Multiplier
    const sidesMultiplier = input.sidesMultiplier

    // Step 4: Apply EXACT formula: Paper Stock × Sides Multiplier × Size × Quantity
    const basePrice = input.basePaperPrice * sidesMultiplier * size * quantity

    const calculation = `(${input.basePaperPrice} × ${sidesMultiplier} × ${size} × ${quantity}) = ${basePrice}`

    return {
      basePrice,
      breakdown: {
        basePaperPrice: input.basePaperPrice,
        size,
        quantity,
        sidesMultiplier,
        formula: 'Paper Stock × Sides Multiplier × Size × Quantity',
        calculation,
      },
      validation,
    }
  }

  /**
   * SIZE CALCULATION - MANDATORY LOGIC
   * IF user selects "Custom Size" from dropdown
   *   THEN Size = Width × Height
   * ELSE
   *   Size = pre-calculated backend value for selected standard size
   */
  private calculateSize(input: PricingInput): number {
    if (input.sizeSelection === 'custom') {
      if (!input.customWidth || !input.customHeight) {
        throw new Error('Custom size requires width and height')
      }
      return input.customWidth * input.customHeight
    } else {
      if (!input.standardSize) {
        throw new Error('Standard size selection requires size data')
      }
      // USE PRE-CALCULATED VALUE - NOT width × height
      return input.standardSize.preCalculatedValue
    }
  }

  /**
   * QUANTITY CALCULATION - MANDATORY LOGIC
   * IF user selects "Custom" from Quantity dropdown
   *   THEN Quantity = custom quantity input value
   * ELSE IF selected quantity < 5000 AND adjustment exists
   *   THEN Quantity = adjustment value (hidden from customer)
   * ELSE
   *   Quantity = selected standard quantity value
   */
  private calculateQuantity(input: PricingInput): number {
    if (input.quantitySelection === 'custom') {
      if (!input.customQuantity) {
        throw new Error('Custom quantity selection requires quantity value')
      }

      // CRITICAL: Enforce 5000 increment rule for custom quantities above 5000
      if (input.customQuantity > 5000 && input.customQuantity % 5000 !== 0) {
        throw new Error(
          `Custom quantities above 5000 must be in increments of 5000. ` +
            `Received: ${input.customQuantity}. ` +
            `Valid examples: 10000, 15000, 20000, 55000, 60000, etc.`
        )
      }

      return input.customQuantity
    } else {
      if (!input.standardQuantity) {
        throw new Error('Standard quantity selection requires quantity data')
      }

      const qty = input.standardQuantity

      // For quantities >= 5000, use exact displayed value
      if (qty.displayValue >= 5000) {
        return qty.displayValue
      }

      // For quantities < 5000, check for adjustments
      if (qty.adjustmentValue !== null && qty.adjustmentValue !== undefined) {
        return qty.adjustmentValue
      } else {
        return qty.calculationValue
      }
    }
  }

  /**
   * Validate input data
   */
  private validateInput(input: PricingInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate base paper price
    if (!input.basePaperPrice || input.basePaperPrice <= 0) {
      errors.push('Base paper price must be greater than 0')
    }

    // Validate size selection
    if (input.sizeSelection === 'custom') {
      if (!input.customWidth || input.customWidth <= 0) {
        errors.push('Custom width must be greater than 0')
      }
      if (!input.customHeight || input.customHeight <= 0) {
        errors.push('Custom height must be greater than 0')
      }
    } else if (input.sizeSelection === 'standard') {
      if (!input.standardSize) {
        errors.push('Standard size data is required')
      } else if (
        !input.standardSize.preCalculatedValue ||
        input.standardSize.preCalculatedValue <= 0
      ) {
        errors.push('Standard size must have valid pre-calculated value')
      }
    } else {
      errors.push('Size selection must be either "standard" or "custom"')
    }

    // Validate quantity selection
    if (input.quantitySelection === 'custom') {
      if (!input.customQuantity || input.customQuantity <= 0) {
        errors.push('Custom quantity must be greater than 0')
      }
      // Validate 5000 increment rule for quantities above 5000
      if (input.customQuantity && input.customQuantity > 5000 && input.customQuantity % 5000 !== 0) {
        errors.push(
          `Custom quantities above 5000 must be in increments of 5000. Received: ${input.customQuantity}`
        )
      }
    } else if (input.quantitySelection === 'standard') {
      if (!input.standardQuantity) {
        errors.push('Standard quantity data is required')
      } else {
        if (!input.standardQuantity.displayValue || input.standardQuantity.displayValue <= 0) {
          errors.push('Standard quantity must have valid display value')
        }
        if (
          !input.standardQuantity.calculationValue ||
          input.standardQuantity.calculationValue <= 0
        ) {
          errors.push('Standard quantity must have valid calculation value')
        }
      }
    } else {
      errors.push('Quantity selection must be either "standard" or "custom"')
    }

    // Validate sides multiplier
    if (!input.sidesMultiplier || input.sidesMultiplier <= 0) {
      errors.push('Sides multiplier must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Format calculation breakdown for display
   */
  formatCalculationBreakdown(result: BasePriceResult): string[] {
    const lines: string[] = []

    lines.push('BASE PRICING FORMULA CALCULATION:')
    lines.push('')
    lines.push(`Formula: ${result.breakdown.formula}`)
    lines.push('')
    lines.push('Components:')
    lines.push(`  Base Paper Price: $${result.breakdown.basePaperPrice.toFixed(8)}`)
    lines.push(`  Size: ${result.breakdown.size} square inches`)
    lines.push(`  Quantity: ${result.breakdown.quantity}`)
    lines.push(`  Sides Multiplier: ${result.breakdown.sidesMultiplier}x`)
    lines.push('')
    lines.push(`Calculation: ${result.breakdown.calculation}`)
    lines.push('')
    lines.push(`BASE PRICE: $${result.basePrice.toFixed(2)}`)

    if (!result.validation.isValid) {
      lines.push('')
      lines.push('VALIDATION ERRORS:')
      result.validation.errors.forEach((error) => {
        lines.push(`  ❌ ${error}`)
      })
    }

    return lines
  }

  /**
   * Quick price calculation for simple cases
   * Formula: Paper Stock × Sides Multiplier × Size × Quantity
   */
  quickCalculatePrice(
    basePaperPrice: number,
    preCalculatedSize: number,
    calculationQuantity: number,
    sidesMultiplier: number = 1.0
  ): number {
    return basePaperPrice * sidesMultiplier * preCalculatedSize * calculationQuantity
  }
}

// Export singleton instance
export const basePriceEngine = new BasePriceEngine()

// Example usage and verification
/*
// Test Case 1: Standard size + Standard quantity + Single-sided cardstock
const result1 = basePriceEngine.calculateBasePrice({
  sizeSelection: 'standard',
  standardSize: { preCalculatedValue: 24 }, // 4x6 pre-calculated
  quantitySelection: 'standard',
  standardQuantity: { displayValue: 5000, calculationValue: 5000 }, // No adjustment for >=5000
  basePaperPrice: 0.00145833333,
  sides: 'single',
  isExceptionPaper: false
})
// Expected: ((0.00145833333 × 1.0) × 24 × 5000) = 175

// Test Case 2: Custom size + Standard quantity + Double-sided text paper
const result2 = basePriceEngine.calculateBasePrice({
  sizeSelection: 'custom',
  customWidth: 4,
  customHeight: 6,
  quantitySelection: 'standard',
  standardQuantity: { displayValue: 200, calculationValue: 250 }, // Adjustment for <5000
  basePaperPrice: 0.002,
  sides: 'double',
  isExceptionPaper: true,
  paperException: { doubleSidedMultiplier: 1.75 }
})
// Expected: ((0.002 × 1.75) × 24 × 250) = 210
*/
