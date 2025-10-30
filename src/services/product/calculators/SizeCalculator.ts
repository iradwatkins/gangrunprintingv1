/**
 * SizeCalculator - Size and Dimensions Calculation Service
 *
 * EXTRACTED FROM: SimpleConfigurationForm.tsx (lines 299-319, 341-350, 479-489)
 *
 * This service handles all size-related calculations for product configuration:
 * - Custom size validation and dimensions
 * - Square inches calculation
 * - Progressive size multiplier pricing
 * - Size normalization
 *
 * Separation Benefits:
 * - Testable (can test without UI)
 * - Reusable (use in API routes, quotes, invoices)
 * - Single source of truth for size calculations
 */

// ============================================
// TYPES
// ============================================

export interface SizeOption {
  id: string
  name: string
  displayName: string
  width: number | null
  height: number | null
  squareInches: number | null
  priceMultiplier: number
  isDefault: boolean
  isCustom?: boolean
  customMinWidth?: number | null
  customMaxWidth?: number | null
  customMinHeight?: number | null
  customMaxHeight?: number | null
}

export interface SizeDimensions {
  width: number
  height: number
  squareInches: number
}

export interface CustomSizeInput {
  width?: number
  height?: number
}

export interface SizeValidationResult {
  isValid: boolean
  error?: string
  dimensions?: SizeDimensions
}

// ============================================
// SIZE CALCULATOR SERVICE
// ============================================

export class SizeCalculator {
  /**
   * Get actual size dimensions from configuration
   * Handles both standard preset sizes and custom sizes
   *
   * @param sizeOption - Selected size option from database
   * @param customSize - Optional custom dimensions (required if sizeOption.isCustom is true)
   * @returns Size dimensions with width, height, and square inches
   */
  getDimensions(sizeOption: SizeOption, customSize?: CustomSizeInput): SizeDimensions {
    // If custom size is selected and dimensions provided
    if (sizeOption.isCustom && customSize?.width && customSize?.height) {
      const squareInches = this.calculateSquareInches(customSize.width, customSize.height)
      return {
        width: customSize.width,
        height: customSize.height,
        squareInches,
      }
    }

    // Use preset size dimensions
    return {
      width: sizeOption.width || 0,
      height: sizeOption.height || 0,
      squareInches: sizeOption.squareInches || 0,
    }
  }

  /**
   * Calculate square inches from width and height
   *
   * @param width - Width in inches
   * @param height - Height in inches
   * @returns Square inches
   */
  calculateSquareInches(width: number, height: number): number {
    return width * height
  }

  /**
   * Calculate size multiplier for pricing
   * For custom sizes, uses progressive pricing based on square inches
   * For standard sizes, uses preset multiplier from database
   *
   * PRICING TIERS (Custom Sizes):
   * - ≤ 10 sq in: 1.0x (base price)
   * - 11-25 sq in: 1.2x (20% markup)
   * - 26-50 sq in: 1.5x (50% markup)
   * - 51-100 sq in: 2.0x (100% markup)
   * - > 100 sq in: 2.5x + 0.01 per additional sq in
   *
   * @param sizeOption - Selected size option
   * @param customSize - Optional custom dimensions
   * @returns Price multiplier for size
   */
  calculateSizeMultiplier(sizeOption: SizeOption, customSize?: CustomSizeInput): number {
    // For custom sizes, calculate progressive multiplier based on square inches
    if (sizeOption.isCustom && customSize?.width && customSize?.height) {
      const squareInches = this.calculateSquareInches(customSize.width, customSize.height)

      // Progressive pricing tiers
      if (squareInches <= 10) return 1.0
      if (squareInches <= 25) return 1.2
      if (squareInches <= 50) return 1.5
      if (squareInches <= 100) return 2.0

      // For very large sizes, add progressive increment
      return 2.5 + (squareInches - 100) * 0.01
    }

    // For standard sizes, use preset multiplier from database
    return sizeOption.priceMultiplier
  }

  /**
   * Validate custom size dimensions against constraints
   *
   * @param sizeOption - Size option with min/max constraints
   * @param width - Custom width to validate
   * @param height - Custom height to validate
   * @returns Validation result with error message if invalid
   */
  validateCustomSize(sizeOption: SizeOption, width: number, height: number): SizeValidationResult {
    if (!sizeOption.isCustom) {
      return {
        isValid: false,
        error: 'Size option does not support custom dimensions',
      }
    }

    // Validate width constraints
    if (sizeOption.customMinWidth && width < sizeOption.customMinWidth) {
      return {
        isValid: false,
        error: `Width must be at least ${sizeOption.customMinWidth} inches`,
      }
    }

    if (sizeOption.customMaxWidth && width > sizeOption.customMaxWidth) {
      return {
        isValid: false,
        error: `Width cannot exceed ${sizeOption.customMaxWidth} inches`,
      }
    }

    // Validate height constraints
    if (sizeOption.customMinHeight && height < sizeOption.customMinHeight) {
      return {
        isValid: false,
        error: `Height must be at least ${sizeOption.customMinHeight} inches`,
      }
    }

    if (sizeOption.customMaxHeight && height > sizeOption.customMaxHeight) {
      return {
        isValid: false,
        error: `Height cannot exceed ${sizeOption.customMaxHeight} inches`,
      }
    }

    // Valid - return dimensions
    const squareInches = this.calculateSquareInches(width, height)
    return {
      isValid: true,
      dimensions: { width, height, squareInches },
    }
  }

  /**
   * Normalize dimensions to standard aspect ratio (optional utility)
   * Useful for maintaining print quality ratios
   *
   * @param width - Original width
   * @param height - Original height
   * @param targetRatio - Target aspect ratio (default: 1.5 for 3:2)
   * @returns Normalized dimensions
   */
  normalizeDimensions(
    width: number,
    height: number,
    targetRatio: number = 1.5
  ): SizeDimensions {
    const currentRatio = width / height

    // If already close to target ratio, return as-is
    if (Math.abs(currentRatio - targetRatio) < 0.1) {
      return {
        width,
        height,
        squareInches: this.calculateSquareInches(width, height),
      }
    }

    // Adjust to match target ratio (keep width, adjust height)
    const normalizedHeight = width / targetRatio
    return {
      width,
      height: normalizedHeight,
      squareInches: this.calculateSquareInches(width, normalizedHeight),
    }
  }

  /**
   * Get human-readable size description
   *
   * @param dimensions - Size dimensions
   * @returns Formatted size string (e.g., "8.5\" × 11\" (93.5 sq in)")
   */
  formatSizeDescription(dimensions: SizeDimensions): string {
    return `${dimensions.width}" × ${dimensions.height}" (${dimensions.squareInches.toFixed(1)} sq in)`
  }

  /**
   * Get size category for organizational purposes
   *
   * @param squareInches - Square inches
   * @returns Size category (Small, Medium, Large, XLarge, Custom)
   */
  getSizeCategory(squareInches: number): 'Small' | 'Medium' | 'Large' | 'XLarge' | 'Custom' {
    if (squareInches <= 10) return 'Small'
    if (squareInches <= 25) return 'Medium'
    if (squareInches <= 50) return 'Large'
    if (squareInches <= 100) return 'XLarge'
    return 'Custom'
  }
}

// Export singleton instance for easy use
export const sizeCalculator = new SizeCalculator()
