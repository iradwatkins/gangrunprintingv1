/**
 * SizeCalculator Tests
 *
 * Comprehensive test suite for size calculation service
 * Ensures accurate size calculations, multipliers, and validation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SizeCalculator, type SizeOption } from './SizeCalculator'

describe('SizeCalculator', () => {
  let calculator: SizeCalculator

  beforeEach(() => {
    calculator = new SizeCalculator()
  })

  describe('getDimensions', () => {
    it('should return preset dimensions for standard size', () => {
      const sizeOption: SizeOption = {
        id: 'size_business_card',
        name: 'Business Card',
        displayName: 'Business Card (3.5" × 2")',
        width: 3.5,
        height: 2.0,
        squareInches: 7.0,
        priceMultiplier: 1.0,
        isDefault: true,
        isCustom: false,
      }

      const result = calculator.getDimensions(sizeOption)

      expect(result).toEqual({
        width: 3.5,
        height: 2.0,
        squareInches: 7.0,
      })
    })

    it('should return custom dimensions when custom size selected', () => {
      const sizeOption: SizeOption = {
        id: 'size_custom',
        name: 'Custom',
        displayName: 'Custom Size',
        width: null,
        height: null,
        squareInches: null,
        priceMultiplier: 1.0,
        isDefault: false,
        isCustom: true,
        customMinWidth: 1,
        customMaxWidth: 50,
        customMinHeight: 1,
        customMaxHeight: 50,
      }

      const result = calculator.getDimensions(sizeOption, { width: 10, height: 8 })

      expect(result).toEqual({
        width: 10,
        height: 8,
        squareInches: 80,
      })
    })

    it('should return zero dimensions when custom size has no input', () => {
      const sizeOption: SizeOption = {
        id: 'size_custom',
        name: 'Custom',
        displayName: 'Custom Size',
        width: null,
        height: null,
        squareInches: null,
        priceMultiplier: 1.0,
        isDefault: false,
        isCustom: true,
      }

      const result = calculator.getDimensions(sizeOption)

      expect(result).toEqual({
        width: 0,
        height: 0,
        squareInches: 0,
      })
    })
  })

  describe('calculateSquareInches', () => {
    it('should calculate square inches correctly', () => {
      expect(calculator.calculateSquareInches(8.5, 11)).toBe(93.5)
      expect(calculator.calculateSquareInches(3.5, 2)).toBe(7)
      expect(calculator.calculateSquareInches(10, 10)).toBe(100)
    })

    it('should handle decimal dimensions', () => {
      expect(calculator.calculateSquareInches(4.25, 5.5)).toBe(23.375)
    })

    it('should handle zero dimensions', () => {
      expect(calculator.calculateSquareInches(0, 0)).toBe(0)
    })
  })

  describe('calculateSizeMultiplier - Standard Sizes', () => {
    it('should return preset multiplier for standard size', () => {
      const sizeOption: SizeOption = {
        id: 'size_letter',
        name: 'Letter',
        displayName: 'Letter (8.5" × 11")',
        width: 8.5,
        height: 11,
        squareInches: 93.5,
        priceMultiplier: 1.5,
        isDefault: true,
        isCustom: false,
      }

      const result = calculator.calculateSizeMultiplier(sizeOption)

      expect(result).toBe(1.5)
    })

    it('should ignore custom dimensions for standard size', () => {
      const sizeOption: SizeOption = {
        id: 'size_letter',
        name: 'Letter',
        displayName: 'Letter (8.5" × 11")',
        width: 8.5,
        height: 11,
        squareInches: 93.5,
        priceMultiplier: 1.5,
        isDefault: true,
        isCustom: false,
      }

      // Even if custom dimensions provided, should use preset multiplier
      const result = calculator.calculateSizeMultiplier(sizeOption, { width: 20, height: 20 })

      expect(result).toBe(1.5)
    })
  })

  describe('calculateSizeMultiplier - Custom Sizes (Progressive Pricing)', () => {
    const customSizeOption: SizeOption = {
      id: 'size_custom',
      name: 'Custom',
      displayName: 'Custom Size',
      width: null,
      height: null,
      squareInches: null,
      priceMultiplier: 1.0,
      isDefault: false,
      isCustom: true,
      customMinWidth: 1,
      customMaxWidth: 50,
      customMinHeight: 1,
      customMaxHeight: 50,
    }

    it('should apply 1.0x multiplier for tiny sizes (≤10 sq in)', () => {
      // 3" × 3" = 9 sq in
      const result = calculator.calculateSizeMultiplier(customSizeOption, { width: 3, height: 3 })
      expect(result).toBe(1.0)

      // 2" × 5" = 10 sq in (boundary)
      const boundary = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 2,
        height: 5,
      })
      expect(boundary).toBe(1.0)
    })

    it('should apply 1.2x multiplier for small sizes (11-25 sq in)', () => {
      // 4" × 3" = 12 sq in
      const result = calculator.calculateSizeMultiplier(customSizeOption, { width: 4, height: 3 })
      expect(result).toBe(1.2)

      // 5" × 5" = 25 sq in (boundary)
      const boundary = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 5,
        height: 5,
      })
      expect(boundary).toBe(1.2)
    })

    it('should apply 1.5x multiplier for medium sizes (26-50 sq in)', () => {
      // 5" × 6" = 30 sq in
      const result = calculator.calculateSizeMultiplier(customSizeOption, { width: 5, height: 6 })
      expect(result).toBe(1.5)

      // 7" × 7" = 49 sq in
      const almostBoundary = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 7,
        height: 7,
      })
      expect(almostBoundary).toBe(1.5)

      // 5" × 10" = 50 sq in (boundary)
      const boundary = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 5,
        height: 10,
      })
      expect(boundary).toBe(1.5)
    })

    it('should apply 2.0x multiplier for large sizes (51-100 sq in)', () => {
      // 8" × 8" = 64 sq in
      const result = calculator.calculateSizeMultiplier(customSizeOption, { width: 8, height: 8 })
      expect(result).toBe(2.0)

      // 10" × 10" = 100 sq in (boundary)
      const boundary = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 10,
        height: 10,
      })
      expect(boundary).toBe(2.0)
    })

    it('should apply progressive multiplier for extra large sizes (>100 sq in)', () => {
      // 11" × 11" = 121 sq in
      // Formula: 2.5 + (121 - 100) * 0.01 = 2.5 + 0.21 = 2.71
      const result = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 11,
        height: 11,
      })
      expect(result).toBe(2.71)

      // 15" × 15" = 225 sq in
      // Formula: 2.5 + (225 - 100) * 0.01 = 2.5 + 1.25 = 3.75
      const large = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 15,
        height: 15,
      })
      expect(large).toBe(3.75)

      // 20" × 20" = 400 sq in
      // Formula: 2.5 + (400 - 100) * 0.01 = 2.5 + 3.0 = 5.5
      const extraLarge = calculator.calculateSizeMultiplier(customSizeOption, {
        width: 20,
        height: 20,
      })
      expect(extraLarge).toBe(5.5)
    })
  })

  describe('validateCustomSize', () => {
    const customSizeOption: SizeOption = {
      id: 'size_custom',
      name: 'Custom',
      displayName: 'Custom Size',
      width: null,
      height: null,
      squareInches: null,
      priceMultiplier: 1.0,
      isDefault: false,
      isCustom: true,
      customMinWidth: 2,
      customMaxWidth: 24,
      customMinHeight: 2,
      customMaxHeight: 36,
    }

    it('should validate valid custom dimensions', () => {
      const result = calculator.validateCustomSize(customSizeOption, 8.5, 11)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.dimensions).toEqual({
        width: 8.5,
        height: 11,
        squareInches: 93.5,
      })
    })

    it('should reject width below minimum', () => {
      const result = calculator.validateCustomSize(customSizeOption, 1, 10)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Width must be at least 2 inches')
    })

    it('should reject width above maximum', () => {
      const result = calculator.validateCustomSize(customSizeOption, 30, 10)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Width cannot exceed 24 inches')
    })

    it('should reject height below minimum', () => {
      const result = calculator.validateCustomSize(customSizeOption, 10, 1)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Height must be at least 2 inches')
    })

    it('should reject height above maximum', () => {
      const result = calculator.validateCustomSize(customSizeOption, 10, 40)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Height cannot exceed 36 inches')
    })

    it('should accept dimensions at exact boundaries', () => {
      // Minimum boundaries
      const minResult = calculator.validateCustomSize(customSizeOption, 2, 2)
      expect(minResult.isValid).toBe(true)

      // Maximum boundaries
      const maxResult = calculator.validateCustomSize(customSizeOption, 24, 36)
      expect(maxResult.isValid).toBe(true)
    })

    it('should reject non-custom size option', () => {
      const standardSizeOption: SizeOption = {
        id: 'size_letter',
        name: 'Letter',
        displayName: 'Letter (8.5" × 11")',
        width: 8.5,
        height: 11,
        squareInches: 93.5,
        priceMultiplier: 1.5,
        isDefault: true,
        isCustom: false,
      }

      const result = calculator.validateCustomSize(standardSizeOption, 10, 10)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Size option does not support custom dimensions')
    })
  })

  describe('normalizeDimensions', () => {
    it('should keep dimensions that match target ratio', () => {
      // 3:2 ratio = 1.5
      const result = calculator.normalizeDimensions(9, 6, 1.5)

      expect(result.width).toBe(9)
      expect(result.height).toBe(6)
      expect(result.squareInches).toBe(54)
    })

    it('should adjust height to match target ratio', () => {
      // Target: 1.5 ratio (3:2), width stays 10
      const result = calculator.normalizeDimensions(10, 5, 1.5)

      expect(result.width).toBe(10)
      expect(result.height).toBeCloseTo(6.667, 2)
      expect(result.squareInches).toBeCloseTo(66.667, 2)
    })

    it('should use default 1.5 ratio when not specified', () => {
      const result = calculator.normalizeDimensions(12, 10)

      expect(result.width).toBe(12)
      expect(result.height).toBe(8) // 12 / 1.5
      expect(result.squareInches).toBe(96)
    })
  })

  describe('formatSizeDescription', () => {
    it('should format size description correctly', () => {
      const dimensions = { width: 8.5, height: 11, squareInches: 93.5 }
      const result = calculator.formatSizeDescription(dimensions)

      expect(result).toBe('8.5" × 11" (93.5 sq in)')
    })

    it('should format with decimal precision', () => {
      const dimensions = { width: 4.25, height: 5.5, squareInches: 23.375 }
      const result = calculator.formatSizeDescription(dimensions)

      expect(result).toBe('4.25" × 5.5" (23.4 sq in)')
    })
  })

  describe('getSizeCategory', () => {
    it('should categorize tiny sizes as Small (≤10 sq in)', () => {
      expect(calculator.getSizeCategory(5)).toBe('Small')
      expect(calculator.getSizeCategory(10)).toBe('Small')
    })

    it('should categorize small sizes as Medium (11-25 sq in)', () => {
      expect(calculator.getSizeCategory(15)).toBe('Medium')
      expect(calculator.getSizeCategory(25)).toBe('Medium')
    })

    it('should categorize medium sizes as Large (26-50 sq in)', () => {
      expect(calculator.getSizeCategory(30)).toBe('Large')
      expect(calculator.getSizeCategory(50)).toBe('Large')
    })

    it('should categorize large sizes as XLarge (51-100 sq in)', () => {
      expect(calculator.getSizeCategory(75)).toBe('XLarge')
      expect(calculator.getSizeCategory(100)).toBe('XLarge')
    })

    it('should categorize extra large sizes as Custom (>100 sq in)', () => {
      expect(calculator.getSizeCategory(150)).toBe('Custom')
      expect(calculator.getSizeCategory(500)).toBe('Custom')
    })
  })

  describe('Integration Tests - Real-World Scenarios', () => {
    it('should handle business card configuration', () => {
      const businessCard: SizeOption = {
        id: 'size_business_card',
        name: 'Business Card',
        displayName: 'Business Card (3.5" × 2")',
        width: 3.5,
        height: 2.0,
        squareInches: 7.0,
        priceMultiplier: 1.0,
        isDefault: true,
        isCustom: false,
      }

      const dimensions = calculator.getDimensions(businessCard)
      const multiplier = calculator.calculateSizeMultiplier(businessCard)
      const category = calculator.getSizeCategory(dimensions.squareInches)
      const description = calculator.formatSizeDescription(dimensions)

      expect(dimensions.squareInches).toBe(7.0)
      expect(multiplier).toBe(1.0)
      expect(category).toBe('Small')
      expect(description).toBe('3.5" × 2" (7.0 sq in)')
    })

    it('should handle custom poster configuration', () => {
      const customSize: SizeOption = {
        id: 'size_custom',
        name: 'Custom',
        displayName: 'Custom Size',
        width: null,
        height: null,
        squareInches: null,
        priceMultiplier: 1.0,
        isDefault: false,
        isCustom: true,
        customMinWidth: 1,
        customMaxWidth: 50,
        customMinHeight: 1,
        customMaxHeight: 50,
      }

      const validation = calculator.validateCustomSize(customSize, 24, 36)
      expect(validation.isValid).toBe(true)

      const dimensions = calculator.getDimensions(customSize, { width: 24, height: 36 })
      expect(dimensions.squareInches).toBe(864)

      const multiplier = calculator.calculateSizeMultiplier(customSize, { width: 24, height: 36 })
      // 864 sq in: 2.5 + (864 - 100) * 0.01 = 2.5 + 7.64 = 10.14
      expect(multiplier).toBe(10.14)

      const category = calculator.getSizeCategory(dimensions.squareInches)
      expect(category).toBe('Custom')
    })
  })
})
