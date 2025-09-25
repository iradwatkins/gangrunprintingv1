/**
 * Test suite for Unified Pricing Engine
 * Validates all critical business rules and pricing calculations
 */

import { unifiedPricingEngine, UnifiedPricingRequest, AddonPricingModel } from './unified-pricing-engine'

// Mock catalog data
const mockCatalog = {
  sizes: [
    {
      id: 'size-4x6',
      name: '4x6',
      displayName: '4" × 6"',
      width: 4,
      height: 6,
      preCalculatedValue: 24, // Backend calculation value
      isCustom: false,
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'size-8.5x11',
      name: '8.5x11',
      displayName: '8.5" × 11"',
      width: 8.5,
      height: 11,
      preCalculatedValue: 93.5,
      isCustom: false,
      sortOrder: 2,
      isActive: true
    }
  ],
  quantities: [
    {
      id: 'qty-100',
      displayValue: 100,
      calculationValue: 125, // Adjustment for <5000
      adjustmentValue: undefined,
      isCustom: false,
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'qty-500',
      displayValue: 500,
      calculationValue: 600,
      adjustmentValue: 550, // Override adjustment
      isCustom: false,
      sortOrder: 2,
      isActive: true
    },
    {
      id: 'qty-5000',
      displayValue: 5000,
      calculationValue: 5000, // No adjustment for >=5000
      adjustmentValue: undefined,
      isCustom: false,
      sortOrder: 3,
      isActive: true
    },
    {
      id: 'qty-10000',
      displayValue: 10000,
      calculationValue: 10000,
      adjustmentValue: undefined,
      isCustom: false,
      sortOrder: 4,
      isActive: true
    }
  ],
  paperStocks: [
    {
      id: 'paper-14pt-cardstock',
      name: '14pt Cardstock',
      pricePerSqInch: 0.00145833333,
      isExceptionPaper: false,
      doubleSidedMultiplier: 1.0,
      paperType: 'cardstock' as const,
      thickness: '14pt',
      coating: 'UV'
    },
    {
      id: 'paper-text-70lb',
      name: '70lb Text Paper',
      pricePerSqInch: 0.002,
      isExceptionPaper: true,
      doubleSidedMultiplier: 1.75,
      paperType: 'text' as const,
      thickness: '70lb',
      coating: 'Matte'
    }
  ],
  turnarounds: [
    {
      id: 'turnaround-standard',
      name: 'Standard (5-7 days)',
      businessDays: 7,
      priceMarkupPercent: 0,
      isStandard: true,
      sortOrder: 1
    },
    {
      id: 'turnaround-rush',
      name: 'Rush (2-3 days)',
      businessDays: 3,
      priceMarkupPercent: 25,
      isStandard: false,
      sortOrder: 2
    }
  ],
  addons: [
    {
      id: 'addon-digital-proof',
      name: 'Digital Proof',
      category: 'Proofing',
      pricingModel: AddonPricingModel.FLAT,
      configuration: { flatPrice: 5 },
      isActive: true,
      sortOrder: 1
    },
    {
      id: 'addon-perforation',
      name: 'Perforation',
      category: 'Finishing',
      pricingModel: AddonPricingModel.PER_UNIT,
      configuration: {
        setupFee: 20,
        pricePerUnit: 0.01,
        unitType: 'piece'
      },
      isActive: true,
      sortOrder: 2
    },
    {
      id: 'addon-our-tagline',
      name: 'Our Tagline',
      category: 'Discount',
      pricingModel: AddonPricingModel.PERCENTAGE,
      configuration: {
        percentage: 5,
        appliesTo: 'base_price'
      },
      isActive: true,
      sortOrder: 3
    },
    {
      id: 'addon-exact-size',
      name: 'Exact Size',
      category: 'Premium',
      pricingModel: AddonPricingModel.PERCENTAGE,
      configuration: {
        percentage: 12.5,
        appliesTo: 'adjusted_base'
      },
      isActive: true,
      sortOrder: 4
    }
  ]
}

describe('Unified Pricing Engine', () => {
  describe('Base Price Calculation', () => {
    test('should calculate correct base price with standard size and quantity', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-5000',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      // Formula: ((0.00145833333 × 1.0) × 24 × 5000) = 175
      expect(result.baseCalculation.basePrice).toBeCloseTo(175, 2)
      expect(result.baseCalculation.size).toBe(24) // Pre-calculated value
      expect(result.baseCalculation.quantity).toBe(5000)
      expect(result.baseCalculation.sidesMultiplier).toBe(1.0)
    })

    test('should use calculation value for quantities < 5000', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100', // Display: 100, Calculation: 125
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.quantity).toBe(125) // Calculation value, not display value
    })

    test('should use adjustment value when available for quantities < 5000', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-500', // Has adjustment value: 550
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.quantity).toBe(550) // Adjustment value
    })

    test('should apply 1.75x multiplier for double-sided text paper', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-text-70lb', // Exception paper
        sides: 'double',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.sidesMultiplier).toBe(1.75)
      // Formula: ((0.002 × 1.75) × 24 × 125) = 10.5
      expect(result.baseCalculation.basePrice).toBeCloseTo(10.5, 2)
    })

    test('should NOT apply multiplier for double-sided cardstock', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'double',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.sidesMultiplier).toBe(1.0) // No multiplier for cardstock
    })
  })

  describe('Custom Size Validation', () => {
    test('should calculate custom size as width × height', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'custom',
        customWidth: 5.5, // Valid 0.25 increment
        customHeight: 8.5, // Valid 0.25 increment
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.size).toBe(46.75) // 5.5 × 8.5
    })

    test('should reject custom size not in 0.25 inch increments', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'custom',
        customWidth: 5.3, // Invalid increment
        customHeight: 8.5,
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      expect(() => {
        unifiedPricingEngine.calculatePrice(request, mockCatalog)
      }).toThrow('Width must be in 0.25 inch increments')
    })

    test('validateCustomSize should provide helpful suggestions', () => {
      const result = unifiedPricingEngine.validateCustomSize(5.3, 8.7)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Width must be in 0.25 inch increments. Try 5.25" or 5.5"')
      expect(result.errors).toContain('Height must be in 0.25 inch increments. Try 8.5" or 8.75"')
    })
  })

  describe('Custom Quantity Validation (5000 Increment Rule)', () => {
    test('should accept custom quantities <= 5000 without increment restriction', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'custom',
        customQuantity: 2500, // Valid: <= 5000
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.baseCalculation.quantity).toBe(2500)
      expect(result.validation.isValid).toBe(true)
    })

    test('should accept custom quantities > 5000 in 5000 increments', () => {
      const validQuantities = [10000, 15000, 20000, 55000, 60000, 100000]

      validQuantities.forEach(qty => {
        const request: UnifiedPricingRequest = {
          sizeSelection: 'standard',
          standardSizeId: 'size-4x6',
          quantitySelection: 'custom',
          customQuantity: qty,
          paperStockId: 'paper-14pt-cardstock',
          sides: 'single',
          turnaroundId: 'turnaround-standard',
          selectedAddons: [],
          isBroker: false
        }

        const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)
        expect(result.baseCalculation.quantity).toBe(qty)
        expect(result.validation.isValid).toBe(true)
      })
    })

    test('should reject custom quantities > 5000 not in 5000 increments', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'custom',
        customQuantity: 5001, // Invalid: not a 5000 increment
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: false
      }

      expect(() => {
        unifiedPricingEngine.calculatePrice(request, mockCatalog)
      }).toThrow('Custom quantities above 5000 must be in increments of 5000')
    })

    test('validateCustomQuantity should provide suggestions for invalid quantities', () => {
      const testCases = [
        { input: 6000, lower: 5000, upper: 10000 },
        { input: 12500, lower: 10000, upper: 15000 },
        { input: 57000, lower: 55000, upper: 60000 },
        { input: 99999, lower: 95000, upper: 100000 }
      ]

      testCases.forEach(test => {
        const result = unifiedPricingEngine.validateCustomQuantity(test.input)
        expect(result.isValid).toBe(false)
        expect(result.suggestion).toEqual({ lower: test.lower, upper: test.upper })
      })
    })
  })

  describe('Price Adjustments', () => {
    test('should apply broker discount when applicable', () => {
      const request: UnifiedPricingRequest = {
        categoryId: 'cat-business-cards',
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [],
        isBroker: true,
        brokerCategoryDiscounts: [
          { categoryId: 'cat-business-cards', discountPercent: 10 }
        ]
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      const basePrice = result.baseCalculation.basePrice
      expect(result.adjustments.brokerDiscount.applied).toBe(true)
      expect(result.adjustments.brokerDiscount.percentage).toBe(10)
      expect(result.adjustments.brokerDiscount.amount).toBeCloseTo(basePrice * 0.1, 2)
      expect(result.totals.afterAdjustments).toBeCloseTo(basePrice * 0.9, 2)
    })

    test('should apply Our Tagline discount when selected and not a broker', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [
          { addonId: 'addon-our-tagline' }
        ],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      const basePrice = result.baseCalculation.basePrice
      expect(result.adjustments.taglineDiscount.applied).toBe(true)
      expect(result.adjustments.taglineDiscount.percentage).toBe(5)
      expect(result.adjustments.taglineDiscount.amount).toBeCloseTo(basePrice * 0.05, 2)
    })

    test('should NOT apply Our Tagline discount for brokers', () => {
      const request: UnifiedPricingRequest = {
        categoryId: 'cat-business-cards',
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [
          { addonId: 'addon-our-tagline' }
        ],
        isBroker: true,
        brokerCategoryDiscounts: [
          { categoryId: 'cat-business-cards', discountPercent: 10 }
        ]
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.adjustments.brokerDiscount.applied).toBe(true)
      expect(result.adjustments.taglineDiscount.applied).toBe(false) // Should not apply
    })

    test('should apply Exact Size markup', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [
          { addonId: 'addon-exact-size' }
        ],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.adjustments.exactSizeMarkup.applied).toBe(true)
      expect(result.adjustments.exactSizeMarkup.percentage).toBe(12.5)

      const adjustedBase = result.baseCalculation.basePrice
      expect(result.adjustments.exactSizeMarkup.amount).toBeCloseTo(adjustedBase * 0.125, 2)
    })
  })

  describe('Turnaround Markup', () => {
    test('should apply rush turnaround markup', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-rush', // 25% markup
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.turnaround.markupPercent).toBe(25)
      expect(result.turnaround.markupAmount).toBeCloseTo(
        result.totals.afterAdjustments * 0.25,
        2
      )
    })

    test('should not apply markup for standard turnaround', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard', // 0% markup
        selectedAddons: [],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.turnaround.markupPercent).toBe(0)
      expect(result.turnaround.markupAmount).toBe(0)
    })
  })

  describe('Add-on Calculations', () => {
    test('should calculate flat fee addons correctly', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [
          { addonId: 'addon-digital-proof' } // $5 flat
        ],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      const digitalProof = result.addons.find(a => a.name === 'Digital Proof')
      expect(digitalProof?.cost).toBe(5)
      expect(result.totalAddonsCost).toBe(5)
    })

    test('should calculate per-unit addons with setup fee', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-5000',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-standard',
        selectedAddons: [
          { addonId: 'addon-perforation' } // $20 setup + $0.01/piece
        ],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      const perforation = result.addons.find(a => a.name === 'Perforation')
      expect(perforation?.cost).toBe(20 + (0.01 * 5000)) // $20 + $50 = $70
      expect(perforation?.calculation).toContain('$20 setup + $0.01 × 5000 pieces')
    })
  })

  describe('Display Breakdown', () => {
    test('should generate comprehensive pricing breakdown', () => {
      const request: UnifiedPricingRequest = {
        sizeSelection: 'standard',
        standardSizeId: 'size-4x6',
        quantitySelection: 'standard',
        standardQuantityId: 'qty-100',
        paperStockId: 'paper-14pt-cardstock',
        sides: 'single',
        turnaroundId: 'turnaround-rush',
        selectedAddons: [
          { addonId: 'addon-digital-proof' },
          { addonId: 'addon-exact-size' }
        ],
        isBroker: false
      }

      const result = unifiedPricingEngine.calculatePrice(request, mockCatalog)

      expect(result.displayBreakdown).toBeTruthy()
      expect(result.displayBreakdown.length).toBeGreaterThan(0)

      const breakdown = result.displayBreakdown.join('\n')
      expect(breakdown).toContain('BASE CALCULATION')
      expect(breakdown).toContain('ADJUSTMENTS')
      expect(breakdown).toContain('TURNAROUND')
      expect(breakdown).toContain('ADD-ONS')
      expect(breakdown).toContain('FINAL TOTALS')
    })
  })

  describe('Quick Calculation', () => {
    test('should perform quick calculation correctly', () => {
      // Test cardstock single-sided
      const result1 = unifiedPricingEngine.quickCalculate(
        0.00145833333, // Paper price per sq inch
        24, // Size (4x6)
        5000, // Quantity
        false, // Single sided
        false // Not exception paper
      )
      expect(result1).toBeCloseTo(175, 2)

      // Test text paper double-sided
      const result2 = unifiedPricingEngine.quickCalculate(
        0.002, // Paper price per sq inch
        24, // Size
        250, // Quantity
        true, // Double sided
        true // Exception paper (text)
      )
      // Formula: 0.002 × 1.75 × 24 × 250 = 21
      expect(result2).toBeCloseTo(21, 2)
    })
  })
})

// Run tests with: npm test unified-pricing-engine.test.ts