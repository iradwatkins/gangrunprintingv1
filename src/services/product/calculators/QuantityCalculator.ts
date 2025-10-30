/**
 * QuantityCalculator - Quantity Calculation and Validation Service
 *
 * EXTRACTED FROM: SimpleConfigurationForm.tsx (lines 283-296)
 *
 * This service handles all quantity-related logic for product configuration:
 * - Resolving actual quantity values from selections
 * - Custom quantity validation
 * - Quantity range enforcement
 * - Quantity tier detection
 *
 * Separation Benefits:
 * - Testable (can test without UI)
 * - Reusable (use in API routes, quotes, invoices)
 * - Single source of truth for quantity calculations
 */

// ============================================
// TYPES
// ============================================

export interface QuantityOption {
  id: string
  value: number | null
  label: string
  isCustom?: boolean
  customMin?: number
  customMax?: number
}

export interface QuantityValidationResult {
  isValid: boolean
  error?: string
  value?: number
}

export type QuantityTier = 'Small' | 'Medium' | 'Large' | 'Bulk' | 'WholesalePlus'

// ============================================
// QUANTITY CALCULATOR SERVICE
// ============================================

export class QuantityCalculator {
  /**
   * Get actual quantity value from configuration
   * Handles both preset quantities and custom quantity input
   *
   * @param quantityOption - Selected quantity option from database
   * @param customQuantity - Optional custom quantity (required if quantityOption.isCustom is true)
   * @returns Actual quantity value
   */
  getValue(quantityOption: QuantityOption, customQuantity?: number): number {
    // If Custom is selected and a custom value is provided, use it
    if (quantityOption.isCustom && customQuantity !== undefined && customQuantity > 0) {
      return customQuantity
    }

    // Otherwise use the preset value
    return quantityOption.value || 0
  }

  /**
   * Validate custom quantity against constraints
   *
   * @param quantityOption - Quantity option with min/max constraints
   * @param quantity - Custom quantity to validate
   * @returns Validation result with error message if invalid
   */
  validateCustomQuantity(
    quantityOption: QuantityOption,
    quantity: number
  ): QuantityValidationResult {
    if (!quantityOption.isCustom) {
      return {
        isValid: false,
        error: 'Quantity option does not support custom values',
      }
    }

    // Check if quantity is a positive number
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        isValid: false,
        error: 'Quantity must be a positive number',
      }
    }

    // Validate minimum constraint
    if (quantityOption.customMin && quantity < quantityOption.customMin) {
      return {
        isValid: false,
        error: `Quantity must be at least ${quantityOption.customMin}`,
      }
    }

    // Validate maximum constraint
    if (quantityOption.customMax && quantity > quantityOption.customMax) {
      return {
        isValid: false,
        error: `Quantity cannot exceed ${quantityOption.customMax}`,
      }
    }

    // Valid quantity
    return {
      isValid: true,
      value: quantity,
    }
  }

  /**
   * Determine quantity tier for pricing or categorization
   * Useful for tiered pricing models and analytics
   *
   * QUANTITY TIERS:
   * - Small: 1-100 units
   * - Medium: 101-500 units
   * - Large: 501-1,000 units
   * - Bulk: 1,001-5,000 units
   * - WholesalePlus: 5,001+ units
   *
   * @param quantity - Quantity to categorize
   * @returns Quantity tier
   */
  getTier(quantity: number): QuantityTier {
    if (quantity <= 100) return 'Small'
    if (quantity <= 500) return 'Medium'
    if (quantity <= 1000) return 'Large'
    if (quantity <= 5000) return 'Bulk'
    return 'WholesalePlus'
  }

  /**
   * Check if quantity qualifies for bulk discount
   * Typically applies to orders over 1,000 units
   *
   * @param quantity - Quantity to check
   * @param bulkThreshold - Minimum quantity for bulk discount (default: 1000)
   * @returns True if quantity qualifies for bulk discount
   */
  qualifiesForBulkDiscount(quantity: number, bulkThreshold: number = 1000): boolean {
    return quantity >= bulkThreshold
  }

  /**
   * Calculate suggested quantity increments for better pricing
   * Helps customers understand optimal order quantities
   *
   * @param currentQuantity - Current quantity
   * @returns Suggested increment to reach next tier
   */
  getSuggestedIncrement(currentQuantity: number): {
    nextTier: QuantityTier
    incrementNeeded: number
    potentialSavings?: string
  } {
    const currentTier = this.getTier(currentQuantity)

    switch (currentTier) {
      case 'Small':
        return {
          nextTier: 'Medium',
          incrementNeeded: 101 - currentQuantity,
          potentialSavings: 'up to 10%',
        }
      case 'Medium':
        return {
          nextTier: 'Large',
          incrementNeeded: 501 - currentQuantity,
          potentialSavings: 'up to 15%',
        }
      case 'Large':
        return {
          nextTier: 'Bulk',
          incrementNeeded: 1001 - currentQuantity,
          potentialSavings: 'up to 20%',
        }
      case 'Bulk':
        return {
          nextTier: 'WholesalePlus',
          incrementNeeded: 5001 - currentQuantity,
          potentialSavings: 'up to 30%',
        }
      default:
        return {
          nextTier: 'WholesalePlus',
          incrementNeeded: 0,
          potentialSavings: 'already at highest tier',
        }
    }
  }

  /**
   * Format quantity for display
   * Adds commas for thousands, handles units
   *
   * @param quantity - Quantity to format
   * @param unit - Optional unit label (default: "pieces")
   * @returns Formatted quantity string (e.g., "1,000 pieces")
   */
  formatQuantity(quantity: number, unit: string = 'pieces'): string {
    const formattedNumber = new Intl.NumberFormat('en-US').format(quantity)
    return `${formattedNumber} ${unit}`
  }

  /**
   * Calculate minimum order quantity (MOQ) enforcement
   * Useful for products with production minimums
   *
   * @param quantity - Requested quantity
   * @param moq - Minimum order quantity
   * @returns Validation result with adjustment if needed
   */
  enforceMinimumOrderQuantity(
    quantity: number,
    moq: number
  ): QuantityValidationResult {
    if (quantity < moq) {
      return {
        isValid: false,
        error: `Minimum order quantity is ${moq}`,
        value: moq,
      }
    }

    return {
      isValid: true,
      value: quantity,
    }
  }

  /**
   * Round quantity to nearest valid increment
   * Some products must be ordered in specific increments (e.g., packs of 50)
   *
   * @param quantity - Requested quantity
   * @param increment - Required increment (e.g., 50 for "packs of 50")
   * @returns Rounded quantity
   */
  roundToIncrement(quantity: number, increment: number): number {
    return Math.ceil(quantity / increment) * increment
  }

  /**
   * Get quantity range description
   * Useful for displaying allowed ranges to users
   *
   * @param quantityOption - Quantity option with constraints
   * @returns Human-readable range description
   */
  getRangeDescription(quantityOption: QuantityOption): string {
    if (!quantityOption.isCustom) {
      return quantityOption.label
    }

    const min = quantityOption.customMin || 1
    const max = quantityOption.customMax || '∞'

    return `${this.formatQuantity(min)} - ${max === '∞' ? 'unlimited' : this.formatQuantity(max as number)}`
  }
}

// Export singleton instance for easy use
export const quantityCalculator = new QuantityCalculator()
