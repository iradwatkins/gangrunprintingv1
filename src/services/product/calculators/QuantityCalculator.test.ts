/**
 * QuantityCalculator Tests
 *
 * Comprehensive test suite for quantity calculation service
 * Ensures accurate quantity validation, tier detection, and formatting
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { QuantityCalculator, type QuantityOption } from './QuantityCalculator'

describe('QuantityCalculator', () => {
  let calculator: QuantityCalculator

  beforeEach(() => {
    calculator = new QuantityCalculator()
  })

  describe('getValue', () => {
    it('should return preset value for standard quantity', () => {
      const quantityOption: QuantityOption = {
        id: 'qty_500',
        value: 500,
        label: '500',
        isCustom: false,
      }

      const result = calculator.getValue(quantityOption)

      expect(result).toBe(500)
    })

    it('should return custom value when custom quantity selected', () => {
      const quantityOption: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
        customMin: 1,
        customMax: 10000,
      }

      const result = calculator.getValue(quantityOption, 750)

      expect(result).toBe(750)
    })

    it('should return 0 when custom quantity has no input', () => {
      const quantityOption: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
      }

      const result = calculator.getValue(quantityOption)

      expect(result).toBe(0)
    })

    it('should prefer custom value over preset value when custom is selected', () => {
      const quantityOption: QuantityOption = {
        id: 'qty_custom',
        value: 100,
        label: 'Custom',
        isCustom: true,
        customMin: 1,
        customMax: 10000,
      }

      const result = calculator.getValue(quantityOption, 2500)

      expect(result).toBe(2500) // Should use custom, not preset 100
    })

    it('should return preset value when custom is 0 or undefined', () => {
      const quantityOption: QuantityOption = {
        id: 'qty_500',
        value: 500,
        label: '500',
        isCustom: false,
      }

      const resultZero = calculator.getValue(quantityOption, 0)
      const resultUndefined = calculator.getValue(quantityOption, undefined)

      expect(resultZero).toBe(500)
      expect(resultUndefined).toBe(500)
    })
  })

  describe('validateCustomQuantity', () => {
    const customQuantityOption: QuantityOption = {
      id: 'qty_custom',
      value: null,
      label: 'Custom',
      isCustom: true,
      customMin: 50,
      customMax: 10000,
    }

    it('should validate valid custom quantity', () => {
      const result = calculator.validateCustomQuantity(customQuantityOption, 500)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.value).toBe(500)
    })

    it('should reject quantity below minimum', () => {
      const result = calculator.validateCustomQuantity(customQuantityOption, 25)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity must be at least 50')
    })

    it('should reject quantity above maximum', () => {
      const result = calculator.validateCustomQuantity(customQuantityOption, 15000)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity cannot exceed 10000')
    })

    it('should reject zero quantity', () => {
      const result = calculator.validateCustomQuantity(customQuantityOption, 0)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity must be a positive number')
    })

    it('should reject negative quantity', () => {
      const result = calculator.validateCustomQuantity(customQuantityOption, -100)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity must be a positive number')
    })

    it('should reject non-finite numbers', () => {
      const resultNaN = calculator.validateCustomQuantity(customQuantityOption, NaN)
      const resultInfinity = calculator.validateCustomQuantity(customQuantityOption, Infinity)

      expect(resultNaN.isValid).toBe(false)
      expect(resultInfinity.isValid).toBe(false)
    })

    it('should accept quantities at exact boundaries', () => {
      const minResult = calculator.validateCustomQuantity(customQuantityOption, 50)
      const maxResult = calculator.validateCustomQuantity(customQuantityOption, 10000)

      expect(minResult.isValid).toBe(true)
      expect(maxResult.isValid).toBe(true)
    })

    it('should reject non-custom quantity option', () => {
      const standardQuantity: QuantityOption = {
        id: 'qty_500',
        value: 500,
        label: '500',
        isCustom: false,
      }

      const result = calculator.validateCustomQuantity(standardQuantity, 750)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity option does not support custom values')
    })
  })

  describe('getTier', () => {
    it('should categorize small quantities (1-100)', () => {
      expect(calculator.getTier(1)).toBe('Small')
      expect(calculator.getTier(50)).toBe('Small')
      expect(calculator.getTier(100)).toBe('Small')
    })

    it('should categorize medium quantities (101-500)', () => {
      expect(calculator.getTier(101)).toBe('Medium')
      expect(calculator.getTier(250)).toBe('Medium')
      expect(calculator.getTier(500)).toBe('Medium')
    })

    it('should categorize large quantities (501-1,000)', () => {
      expect(calculator.getTier(501)).toBe('Large')
      expect(calculator.getTier(750)).toBe('Large')
      expect(calculator.getTier(1000)).toBe('Large')
    })

    it('should categorize bulk quantities (1,001-5,000)', () => {
      expect(calculator.getTier(1001)).toBe('Bulk')
      expect(calculator.getTier(2500)).toBe('Bulk')
      expect(calculator.getTier(5000)).toBe('Bulk')
    })

    it('should categorize wholesale+ quantities (5,001+)', () => {
      expect(calculator.getTier(5001)).toBe('WholesalePlus')
      expect(calculator.getTier(10000)).toBe('WholesalePlus')
      expect(calculator.getTier(50000)).toBe('WholesalePlus')
    })
  })

  describe('qualifiesForBulkDiscount', () => {
    it('should qualify quantities at or above threshold', () => {
      expect(calculator.qualifiesForBulkDiscount(1000)).toBe(true)
      expect(calculator.qualifiesForBulkDiscount(1001)).toBe(true)
      expect(calculator.qualifiesForBulkDiscount(5000)).toBe(true)
    })

    it('should not qualify quantities below threshold', () => {
      expect(calculator.qualifiesForBulkDiscount(999)).toBe(false)
      expect(calculator.qualifiesForBulkDiscount(500)).toBe(false)
      expect(calculator.qualifiesForBulkDiscount(100)).toBe(false)
    })

    it('should support custom bulk threshold', () => {
      expect(calculator.qualifiesForBulkDiscount(250, 250)).toBe(true)
      expect(calculator.qualifiesForBulkDiscount(249, 250)).toBe(false)

      expect(calculator.qualifiesForBulkDiscount(500, 500)).toBe(true)
      expect(calculator.qualifiesForBulkDiscount(499, 500)).toBe(false)
    })
  })

  describe('getSuggestedIncrement', () => {
    it('should suggest increment from Small to Medium tier', () => {
      const result = calculator.getSuggestedIncrement(75)

      expect(result.nextTier).toBe('Medium')
      expect(result.incrementNeeded).toBe(26) // 101 - 75
      expect(result.potentialSavings).toBe('up to 10%')
    })

    it('should suggest increment from Medium to Large tier', () => {
      const result = calculator.getSuggestedIncrement(300)

      expect(result.nextTier).toBe('Large')
      expect(result.incrementNeeded).toBe(201) // 501 - 300
      expect(result.potentialSavings).toBe('up to 15%')
    })

    it('should suggest increment from Large to Bulk tier', () => {
      const result = calculator.getSuggestedIncrement(750)

      expect(result.nextTier).toBe('Bulk')
      expect(result.incrementNeeded).toBe(251) // 1001 - 750
      expect(result.potentialSavings).toBe('up to 20%')
    })

    it('should suggest increment from Bulk to WholesalePlus tier', () => {
      const result = calculator.getSuggestedIncrement(2000)

      expect(result.nextTier).toBe('WholesalePlus')
      expect(result.incrementNeeded).toBe(3001) // 5001 - 2000
      expect(result.potentialSavings).toBe('up to 30%')
    })

    it('should handle quantities already at WholesalePlus tier', () => {
      const result = calculator.getSuggestedIncrement(10000)

      expect(result.nextTier).toBe('WholesalePlus')
      expect(result.incrementNeeded).toBe(0)
      expect(result.potentialSavings).toBe('already at highest tier')
    })
  })

  describe('formatQuantity', () => {
    it('should format small quantities', () => {
      expect(calculator.formatQuantity(50)).toBe('50 pieces')
      expect(calculator.formatQuantity(100)).toBe('100 pieces')
    })

    it('should format thousands with commas', () => {
      expect(calculator.formatQuantity(1000)).toBe('1,000 pieces')
      expect(calculator.formatQuantity(5000)).toBe('5,000 pieces')
    })

    it('should format large quantities with commas', () => {
      expect(calculator.formatQuantity(10000)).toBe('10,000 pieces')
      expect(calculator.formatQuantity(100000)).toBe('100,000 pieces')
    })

    it('should support custom unit labels', () => {
      expect(calculator.formatQuantity(500, 'cards')).toBe('500 cards')
      expect(calculator.formatQuantity(1000, 'flyers')).toBe('1,000 flyers')
      expect(calculator.formatQuantity(250, 'brochures')).toBe('250 brochures')
    })
  })

  describe('enforceMinimumOrderQuantity', () => {
    it('should accept quantity at or above MOQ', () => {
      const resultAtMOQ = calculator.enforceMinimumOrderQuantity(100, 100)
      const resultAboveMOQ = calculator.enforceMinimumOrderQuantity(500, 100)

      expect(resultAtMOQ.isValid).toBe(true)
      expect(resultAtMOQ.value).toBe(100)

      expect(resultAboveMOQ.isValid).toBe(true)
      expect(resultAboveMOQ.value).toBe(500)
    })

    it('should reject quantity below MOQ', () => {
      const result = calculator.enforceMinimumOrderQuantity(50, 100)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Minimum order quantity is 100')
      expect(result.value).toBe(100) // Suggested adjustment
    })

    it('should handle different MOQ values', () => {
      const moq250 = calculator.enforceMinimumOrderQuantity(200, 250)
      const moq500 = calculator.enforceMinimumOrderQuantity(300, 500)

      expect(moq250.isValid).toBe(false)
      expect(moq250.value).toBe(250)

      expect(moq500.isValid).toBe(false)
      expect(moq500.value).toBe(500)
    })
  })

  describe('roundToIncrement', () => {
    it('should round to nearest increment (packs of 50)', () => {
      expect(calculator.roundToIncrement(25, 50)).toBe(50)
      expect(calculator.roundToIncrement(75, 50)).toBe(100)
      expect(calculator.roundToIncrement(100, 50)).toBe(100) // Already at increment
      expect(calculator.roundToIncrement(125, 50)).toBe(150)
    })

    it('should round to nearest increment (packs of 100)', () => {
      expect(calculator.roundToIncrement(50, 100)).toBe(100)
      expect(calculator.roundToIncrement(150, 100)).toBe(200)
      expect(calculator.roundToIncrement(500, 100)).toBe(500) // Already at increment
    })

    it('should round to nearest increment (packs of 25)', () => {
      expect(calculator.roundToIncrement(10, 25)).toBe(25)
      expect(calculator.roundToIncrement(30, 25)).toBe(50)
      expect(calculator.roundToIncrement(75, 25)).toBe(75) // Already at increment
    })

    it('should always round up, never down', () => {
      expect(calculator.roundToIncrement(1, 50)).toBe(50) // 1 → 50, not 0
      expect(calculator.roundToIncrement(51, 100)).toBe(100) // 51 → 100, not 50
    })
  })

  describe('getRangeDescription', () => {
    it('should return label for standard quantity', () => {
      const standardQty: QuantityOption = {
        id: 'qty_500',
        value: 500,
        label: '500 pieces',
        isCustom: false,
      }

      const result = calculator.getRangeDescription(standardQty)

      expect(result).toBe('500 pieces')
    })

    it('should format range for custom quantity with min and max', () => {
      const customQty: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
        customMin: 50,
        customMax: 10000,
      }

      const result = calculator.getRangeDescription(customQty)

      expect(result).toBe('50 pieces - 10,000 pieces')
    })

    it('should show unlimited for custom quantity without max', () => {
      const customQty: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
        customMin: 100,
      }

      const result = calculator.getRangeDescription(customQty)

      expect(result).toBe('100 pieces - unlimited')
    })

    it('should default to 1 minimum if not specified', () => {
      const customQty: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
        customMax: 5000,
      }

      const result = calculator.getRangeDescription(customQty)

      expect(result).toBe('1 pieces - 5,000 pieces')
    })
  })

  describe('Integration Tests - Real-World Scenarios', () => {
    it('should handle business card quantity (500 pcs)', () => {
      const quantity: QuantityOption = {
        id: 'qty_500',
        value: 500,
        label: '500',
        isCustom: false,
      }

      const value = calculator.getValue(quantity)
      const tier = calculator.getTier(value)
      const formatted = calculator.formatQuantity(value, 'cards')
      const bulkDiscount = calculator.qualifiesForBulkDiscount(value)

      expect(value).toBe(500)
      expect(tier).toBe('Medium')
      expect(formatted).toBe('500 cards')
      expect(bulkDiscount).toBe(false)
    })

    it('should handle bulk flyer order (2,500 pcs)', () => {
      const quantity: QuantityOption = {
        id: 'qty_custom',
        value: null,
        label: 'Custom',
        isCustom: true,
        customMin: 100,
        customMax: 50000,
      }

      const validation = calculator.validateCustomQuantity(quantity, 2500)
      expect(validation.isValid).toBe(true)

      const value = calculator.getValue(quantity, 2500)
      const tier = calculator.getTier(value)
      const formatted = calculator.formatQuantity(value, 'flyers')
      const bulkDiscount = calculator.qualifiesForBulkDiscount(value)
      const suggestion = calculator.getSuggestedIncrement(value)

      expect(value).toBe(2500)
      expect(tier).toBe('Bulk')
      expect(formatted).toBe('2,500 flyers')
      expect(bulkDiscount).toBe(true)
      expect(suggestion.nextTier).toBe('WholesalePlus')
    })

    it('should handle MOQ enforcement for specialty products', () => {
      const requestedQty = 75
      const moq = 100

      const enforcement = calculator.enforceMinimumOrderQuantity(requestedQty, moq)

      expect(enforcement.isValid).toBe(false)
      expect(enforcement.value).toBe(100)
      expect(enforcement.error).toContain('Minimum order quantity')
    })

    it('should handle pack-based ordering (packs of 50)', () => {
      const requestedQty = 375
      const packSize = 50

      const rounded = calculator.roundToIncrement(requestedQty, packSize)

      expect(rounded).toBe(400) // 375 rounded up to nearest pack of 50
    })
  })
})
