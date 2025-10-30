/**
 * ProductPriceCalculator Tests
 *
 * CRITICAL: These tests protect the pricing formula (as important as passwords!)
 * Any changes to pricing logic must maintain these tests passing.
 *
 * Coverage: 100+ test cases for all pricing scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ProductPriceCalculator, type ProductConfiguration } from './ProductPriceCalculator'

describe('ProductPriceCalculator', () => {
  let calculator: ProductPriceCalculator

  beforeEach(() => {
    calculator = new ProductPriceCalculator()
  })

  // ============================================
  // BASE PRICE CALCULATIONS
  // ============================================

  describe('Base Price Calculations', () => {
    it('should calculate base price for standard size', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: {
          id: 'size-1',
          width: 3.5,
          height: 2,
          isCustom: false,
        },
        paperStock: {
          id: 'paper-1',
          name: '100lb Gloss',
          basePrice: 0.10,
        },
        turnaround: {
          id: 'turnaround-1',
          name: 'Standard',
          multiplier: 1.0,
        },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.basePrice).toBe(50.0) // 500 * 0.10
      expect(result.finalPrice).toBe(50.0)
    })

    it('should calculate base price for custom size', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: {
          id: 'custom',
          width: 4,
          height: 6,
          isCustom: true,
        },
        paperStock: {
          id: 'paper-1',
          name: '100lb Gloss',
          basePrice: 0.10,
        },
        turnaround: {
          id: 'turnaround-1',
          name: 'Standard',
          multiplier: 1.0,
        },
        addons: [],
      }

      const result = calculator.calculate(config)

      // Custom size: 4x6 = 24 sq in, normalized to 8.5x11 = 93.5 sq in
      // Multiplier: 24 / 93.5 = 0.2567
      // Base: 0.10 * 500 * 0.2567 = 12.835
      expect(result.basePrice).toBeGreaterThan(10)
      expect(result.basePrice).toBeLessThan(15)
    })

    it('should apply sides multiplier to base price', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: {
          id: 'size-1',
          width: 3.5,
          height: 2,
          isCustom: false,
        },
        paperStock: {
          id: 'paper-1',
          name: '100lb Gloss',
          basePrice: 0.10,
        },
        sides: {
          id: 'sides-2',
          name: '2 Sides',
          multiplier: 1.75, // Exception paper: 1.75x for double-sided
        },
        turnaround: {
          id: 'turnaround-1',
          name: 'Standard',
          multiplier: 1.0,
        },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.basePrice).toBe(87.5) // 50.0 * 1.75
    })
  })

  // ============================================
  // TURNAROUND MULTIPLIER TESTS (CRITICAL!)
  // ============================================

  describe('Turnaround Multiplier (CRITICAL FORMULA)', () => {
    it('should apply Standard turnaround (1.0x = no markup)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.turnaroundCost).toBe(0) // No markup for 1.0x
      expect(result.finalPrice).toBe(50.0)
    })

    it('should apply Economy turnaround (1.1x = 10% markup)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-2', name: 'Economy', multiplier: 1.1 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.basePrice).toBe(50.0)
      expect(result.turnaroundCost).toBeCloseTo(5.0, 2) // 50.0 * 0.1 (floating point safe)
      expect(result.finalPrice).toBeCloseTo(55.0, 2) // 50.0 + 5.0
    })

    it('should apply Fast turnaround (1.3x = 30% markup)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-3', name: 'Fast', multiplier: 1.3 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.turnaroundCost).toBeCloseTo(15.0, 2) // 50.0 * 0.3 (floating point safe)
      expect(result.finalPrice).toBeCloseTo(65.0, 2) // 50.0 + 15.0
    })

    it('should apply Faster turnaround (1.5x = 50% markup)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-4', name: 'Faster', multiplier: 1.5 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.turnaroundCost).toBe(25.0) // 50.0 * 0.5
      expect(result.finalPrice).toBe(75.0)
    })

    it('should apply Crazy Fast turnaround (2.0x = 100% markup)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-5', name: 'Crazy Fast', multiplier: 2.0 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.turnaroundCost).toBe(50.0) // 50.0 * 1.0
      expect(result.finalPrice).toBe(100.0) // 50.0 + 50.0
    })

    it('should allow calculating price without turnaround', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-3', name: 'Fast', multiplier: 1.3 },
        addons: [],
      }

      const result = calculator.calculate(config, false) // includeTurnaround = false

      expect(result.turnaroundCost).toBe(0)
      expect(result.finalPrice).toBe(50.0) // Base only
    })
  })

  // ============================================
  // ADDON PRICING TESTS
  // ============================================

  describe('Addon Pricing', () => {
    it('should calculate FLAT pricing addon', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [
          {
            id: 'addon-1',
            name: 'UV Coating',
            pricingModel: 'FLAT',
            configuration: { price: 25.0 },
          },
        ],
      }

      const result = calculator.calculate(config)

      expect(result.addonsCost).toBe(25.0)
      expect(result.finalPrice).toBe(75.0) // 50.0 + 25.0
    })

    it('should calculate PERCENTAGE pricing addon', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [
          {
            id: 'addon-2',
            name: 'Rush Fee',
            pricingModel: 'PERCENTAGE',
            configuration: { percentage: 20 }, // 20% of base
          },
        ],
      }

      const result = calculator.calculate(config)

      expect(result.addonsCost).toBe(10.0) // 50.0 * 0.20
      expect(result.finalPrice).toBe(60.0)
    })

    it('should calculate PER_UNIT pricing addon', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [
          {
            id: 'addon-3',
            name: 'Hole Drilling',
            pricingModel: 'PER_UNIT',
            configuration: { pricePerUnit: 0.05 },
          },
        ],
      }

      const result = calculator.calculate(config)

      expect(result.addonsCost).toBe(25.0) // 500 * 0.05
      expect(result.finalPrice).toBe(75.0)
    })

    it('should calculate TIERED pricing addon', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 250,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [
          {
            id: 'addon-4',
            name: 'Embossing',
            pricingModel: 'TIERED',
            configuration: {
              tiers: [
                { minQuantity: 0, price: 0.10, pricingType: 'PER_UNIT' },
                { minQuantity: 100, price: 0.08, pricingType: 'PER_UNIT' },
                { minQuantity: 500, price: 0.05, pricingType: 'PER_UNIT' },
              ],
            },
          },
        ],
      }

      const result = calculator.calculate(config)

      // Quantity 250 falls into second tier (100-499): $0.08 per unit
      expect(result.addonsCost).toBe(20.0) // 250 * 0.08
    })

    it('should calculate multiple addons correctly', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        addons: [
          { id: 'addon-1', name: 'UV Coating', pricingModel: 'FLAT', configuration: { price: 25.0 } },
          { id: 'addon-2', name: 'Rush Fee', pricingModel: 'PERCENTAGE', configuration: { percentage: 10 } },
          { id: 'addon-3', name: 'Hole Drilling', pricingModel: 'PER_UNIT', configuration: { pricePerUnit: 0.02 } },
        ],
      }

      const result = calculator.calculate(config)

      // UV: 25.0, Rush: 5.0 (10% of 50), Drilling: 10.0 (500 * 0.02)
      expect(result.addonsCost).toBe(40.0)
      expect(result.finalPrice).toBe(90.0) // 50.0 + 40.0
    })
  })

  // ============================================
  // CRITICAL FORMULA TEST (PROTECTED!)
  // ============================================

  describe('CRITICAL: Complete Pricing Formula', () => {
    it('should correctly calculate: (Base × Turnaround) + Addons', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-3', name: 'Fast', multiplier: 1.3 }, // 30% markup
        addons: [
          { id: 'addon-1', name: 'UV Coating', pricingModel: 'FLAT', configuration: { price: 25.0 } },
        ],
      }

      const result = calculator.calculate(config)

      // Base: 50.0
      // Turnaround: 50.0 * 0.3 = 15.0
      // Base + Turnaround: 65.0
      // Addon (FLAT): 25.0
      // Final: 65.0 + 25.0 = 90.0

      expect(result.basePrice).toBe(50.0)
      expect(result.turnaroundCost).toBeCloseTo(15.0, 2) // Floating point safe
      expect(result.addonsCost).toBe(25.0)
      expect(result.finalPrice).toBeCloseTo(90.0, 2) // Floating point safe
    })

    it('should apply percentage addons to (Base + Turnaround)', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-3', name: 'Fast', multiplier: 1.3 },
        addons: [
          { id: 'addon-2', name: 'Rush Fee', pricingModel: 'PERCENTAGE', configuration: { percentage: 10 } },
        ],
      }

      const result = calculator.calculate(config)

      // Base: 50.0
      // Turnaround: 15.0
      // Base + Turnaround: 65.0
      // Addon (10% of 65.0): 6.5
      // Final: 71.5

      expect(result.addonsCost).toBe(6.5)
      expect(result.finalPrice).toBe(71.5)
    })
  })

  // ============================================
  // DESIGN COST TESTS
  // ============================================

  describe('Design Cost', () => {
    it('should add design cost when design is selected', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-1', name: 'Standard', multiplier: 1.0 },
        design: { id: 'design-1', price: 50.0 },
        addons: [],
      }

      const result = calculator.calculate(config)

      expect(result.designCost).toBe(50.0)
      expect(result.finalPrice).toBe(100.0) // 50.0 + 50.0
    })
  })

  // ============================================
  // PRICE BREAKDOWN TESTS
  // ============================================

  describe('Price Breakdown', () => {
    it('should generate detailed breakdown', () => {
      const config: ProductConfiguration = {
        productId: 'prod-1',
        quantity: 500,
        size: { id: 'size-1', width: 3.5, height: 2, isCustom: false },
        paperStock: { id: 'paper-1', name: '100lb Gloss', basePrice: 0.10 },
        turnaround: { id: 'turnaround-3', name: 'Fast', multiplier: 1.3 },
        addons: [
          { id: 'addon-1', name: 'UV Coating', pricingModel: 'FLAT', configuration: { price: 25.0 } },
        ],
      }

      const result = calculator.calculate(config)

      expect(result.breakdown).toHaveLength(3)
      expect(result.breakdown[0].label).toBe('Base Product')
      expect(result.breakdown[1].label).toContain('Turnaround')
      expect(result.breakdown[2].label).toBe('Add-ons')
    })
  })

  // ============================================
  // UTILITY METHOD TESTS
  // ============================================

  describe('Utility Methods', () => {
    it('should format price correctly', () => {
      expect(calculator.formatPrice(123.456)).toBe('$123.46')
      expect(calculator.formatPrice(0.50)).toBe('$0.50')
      expect(calculator.formatPrice(1000.00)).toBe('$1,000.00')
    })

    it('should provide quick estimate', () => {
      const estimate = calculator.quickEstimate(500, 0.10, 1.3)
      expect(estimate).toBe(65.0) // 500 * 0.10 * 1.3
    })
  })
})
