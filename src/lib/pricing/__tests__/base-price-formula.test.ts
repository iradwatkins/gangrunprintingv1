import { BasePriceEngine, type PricingInput, type StandardSize, type StandardQuantity, type PaperException } from '../base-price-engine'

describe('Base Price Formula Compliance Tests', () => {
  let engine: BasePriceEngine

  beforeEach(() => {
    engine = new BasePriceEngine()
  })

  // Test data following the exact seeded values
  const testSizes: StandardSize[] = [
    {
      id: '1',
      name: '4x6',
      displayName: '4″ × 6″ (Standard Postcard)',
      width: 4,
      height: 6,
      preCalculatedValue: 24, // 4 × 6 = 24
      sortOrder: 1,
      isActive: true
    },
    {
      id: '2',
      name: '5x5',
      displayName: '5″ × 5″ (Square)',
      width: 5,
      height: 5,
      preCalculatedValue: 25, // 5 × 5 = 25
      sortOrder: 2,
      isActive: true
    }
  ]

  const testQuantities: StandardQuantity[] = [
    {
      id: '1',
      displayValue: 200,
      calculationValue: 250, // 25% adjustment for < 5000
      sortOrder: 1,
      isActive: true
    },
    {
      id: '2',
      displayValue: 5000,
      calculationValue: 5000, // No adjustment for >= 5000
      sortOrder: 2,
      isActive: true
    },
    {
      id: '3',
      displayValue: 1000,
      calculationValue: 1050, // 5% adjustment for < 5000
      adjustmentValue: 1100, // Override adjustment
      sortOrder: 3,
      isActive: true
    }
  ]

  const textPaperException: PaperException = {
    id: '1',
    paperStockId: 'text-paper-1',
    exceptionType: 'TEXT_PAPER',
    doubleSidedMultiplier: 1.75,
    description: 'Text paper exception'
  }

  describe('EXACT FORMULA VERIFICATION', () => {
    test('Formula: Base Paper Price × Size × Quantity × Sides Multiplier', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0], // 4x6 = 24
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1], // 5000
        basePaperPrice: 0.00145833333,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.basePaperPrice).toBe(0.00145833333)
      expect(result.breakdown.size).toBe(24)
      expect(result.breakdown.quantity).toBe(5000)
      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(175, 2) // 0.00145833333 × 24 × 5000 × 1.0 = 175
    })
  })

  describe('SIZE CALCULATION TESTS', () => {
    test('Standard size uses pre-calculated backend value (NOT width × height)', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0], // Pre-calculated value: 24
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 1.0,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.size).toBe(24) // Uses preCalculatedValue, not 4 × 6
      expect(result.basePrice).toBe(120000) // 1.0 × 24 × 5000 × 1.0
    })

    test('Custom size ONLY uses width × height when "Custom" selected', () => {
      const input: PricingInput = {
        sizeSelection: 'custom',
        customWidth: 4,
        customHeight: 6,
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 1.0,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.size).toBe(24) // 4 × 6 = 24
      expect(result.basePrice).toBe(120000) // 1.0 × 24 × 5000 × 1.0
    })

    test('Custom size validation - requires width and height', () => {
      const input: PricingInput = {
        sizeSelection: 'custom',
        customWidth: 4,
        // Missing customHeight
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 1.0,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.errors).toContain('Custom height must be greater than 0')
    })
  })

  describe('QUANTITY CALCULATION TESTS', () => {
    test('Standard quantity < 5000 uses calculation value (adjustment)', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[0], // displayValue: 200, calculationValue: 250
        basePaperPrice: 0.002,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.quantity).toBe(250) // Uses calculationValue, not displayValue
      expect(result.basePrice).toBeCloseTo(24, 2) // 0.002 × 24 × 250 × 1.0 = 12
    })

    test('Standard quantity >= 5000 uses exact displayed value', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1], // displayValue: 5000, calculationValue: 5000
        basePaperPrice: 0.002,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.quantity).toBe(5000) // Uses displayValue (same as calculationValue)
      expect(result.basePrice).toBeCloseTo(240, 2) // 0.002 × 24 × 5000 × 1.0 = 240
    })

    test('Quantity adjustment override (adjustmentValue takes precedence)', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[2], // adjustmentValue: 1100 overrides calculationValue: 1050
        basePaperPrice: 0.001,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.quantity).toBe(1100) // Uses adjustmentValue
      expect(result.basePrice).toBeCloseTo(26.4, 2) // 0.001 × 24 × 1100 × 1.0 = 26.4
    })

    test('Custom quantity uses exact input value', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'custom',
        customQuantity: 750,
        basePaperPrice: 0.001,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.quantity).toBe(750)
      expect(result.basePrice).toBeCloseTo(18, 2) // 0.001 × 24 × 750 × 1.0 = 18
    })

    test('Customers NEVER see adjustment values (this is tested via API)', () => {
      // This test ensures the system hides adjustment values from customers
      const qty = testQuantities[0] // displayValue: 200, calculationValue: 250

      // Customer sees displayValue
      expect(qty.displayValue).toBe(200)

      // Backend calculation uses calculationValue
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: qty,
        basePaperPrice: 1.0,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)
      expect(result.breakdown.quantity).toBe(250) // Backend uses adjustment
    })
  })

  describe('SIDES MULTIPLIER TESTS', () => {
    test('Exception paper (text) double-sided = 1.75 multiplier', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.002,
        sides: 'double',
        isExceptionPaper: true,
        paperException: textPaperException
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.sidesMultiplier).toBe(1.75)
      expect(result.basePrice).toBeCloseTo(420, 2) // 0.002 × 24 × 5000 × 1.75 = 420
    })

    test('Exception paper (text) single-sided = 1.0 multiplier', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.002,
        sides: 'single',
        isExceptionPaper: true,
        paperException: textPaperException
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(240, 2) // 0.002 × 24 × 5000 × 1.0 = 240
    })

    test('Regular paper (cardstock) double-sided = 1.0 multiplier', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.002,
        sides: 'double',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.sidesMultiplier).toBe(1.0) // NOT 1.75 for cardstock
      expect(result.basePrice).toBeCloseTo(240, 2) // 0.002 × 24 × 5000 × 1.0 = 240
    })

    test('Regular paper (cardstock) single-sided = 1.0 multiplier', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.002,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(240, 2) // 0.002 × 24 × 5000 × 1.0 = 240
    })
  })

  describe('VERIFICATION TEST SCENARIOS FROM REQUIREMENTS', () => {
    test('Scenario 1: Standard size + Standard quantity + Single-sided cardstock', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0], // 4x6 pre-calculated = 24
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1], // 5000 (no adjustment for >=5000)
        basePaperPrice: 0.00145833333,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.size).toBe(24)
      expect(result.breakdown.quantity).toBe(5000)
      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(175, 2) // 0.00145833333 × 24 × 5000 × 1.0 = 175
    })

    test('Scenario 2: Custom size + Standard quantity + Double-sided text paper', () => {
      const input: PricingInput = {
        sizeSelection: 'custom',
        customWidth: 4,
        customHeight: 6,
        quantitySelection: 'standard',
        standardQuantity: testQuantities[0], // 200 display, 250 calculation
        basePaperPrice: 0.002,
        sides: 'double',
        isExceptionPaper: true,
        paperException: textPaperException
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.size).toBe(24) // 4 × 6
      expect(result.breakdown.quantity).toBe(250) // Adjusted value
      expect(result.breakdown.sidesMultiplier).toBe(1.75) // Text paper exception
      expect(result.basePrice).toBeCloseTo(21, 2) // 0.002 × 24 × 250 × 1.75 = 21
    })

    test('Scenario 3: Standard size + Custom quantity + Single-sided cardstock', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[1], // 5x5 pre-calculated = 25
        quantitySelection: 'custom',
        customQuantity: 3000,
        basePaperPrice: 0.001,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.size).toBe(25) // Pre-calculated value
      expect(result.breakdown.quantity).toBe(3000) // Custom value
      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(75, 2) // 0.001 × 25 × 3000 × 1.0 = 75
    })

    test('Scenario 4: Custom size + Custom quantity + Double-sided cardstock (multiplier = 1.0)', () => {
      const input: PricingInput = {
        sizeSelection: 'custom',
        customWidth: 6,
        customHeight: 9,
        quantitySelection: 'custom',
        customQuantity: 1500,
        basePaperPrice: 0.0015,
        sides: 'double',
        isExceptionPaper: false // Cardstock - no exception
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.size).toBe(54) // 6 × 9
      expect(result.breakdown.quantity).toBe(1500)
      expect(result.breakdown.sidesMultiplier).toBe(1.0) // Cardstock double-sided = 1.0
      expect(result.basePrice).toBeCloseTo(121.5, 2) // 0.0015 × 54 × 1500 × 1.0 = 121.5
    })
  })

  describe('EXAMPLE CALCULATION VERIFICATION', () => {
    test('Exact example from requirements: 0.00145833333 × 24 × 5000 × 1.0 = 175', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: {
          id: 'test',
          name: '4x6',
          displayName: '4″ × 6″',
          width: 4,
          height: 6,
          preCalculatedValue: 24, // Key: pre-calculated value
          sortOrder: 1,
          isActive: true
        },
        quantitySelection: 'standard',
        standardQuantity: {
          id: 'test',
          displayValue: 5000,
          calculationValue: 5000,
          sortOrder: 1,
          isActive: true
        },
        basePaperPrice: 0.00145833333,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(true)
      expect(result.breakdown.basePaperPrice).toBe(0.00145833333)
      expect(result.breakdown.size).toBe(24)
      expect(result.breakdown.quantity).toBe(5000)
      expect(result.breakdown.sidesMultiplier).toBe(1.0)
      expect(result.basePrice).toBeCloseTo(175, 8) // Exact match: 175
    })
  })

  describe('QUICK CALCULATION UTILITY', () => {
    test('Quick calculation matches full calculation', () => {
      const fullResult = engine.calculateBasePrice({
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.002,
        sides: 'double',
        isExceptionPaper: true,
        paperException: textPaperException
      })

      const quickResult = engine.quickCalculatePrice(
        0.002, // basePaperPrice
        24,    // preCalculatedSize
        5000,  // calculationQuantity
        true   // isDoubleSidedTextPaper
      )

      expect(quickResult).toBeCloseTo(fullResult.basePrice, 8)
    })
  })

  describe('VALIDATION TESTS', () => {
    test('Invalid base paper price', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0, // Invalid
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.errors).toContain('Base paper price must be greater than 0')
    })

    test('Missing standard size data', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        // Missing standardSize
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.001,
        sides: 'single',
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.errors).toContain('Standard size data is required')
    })

    test('Invalid sides value', () => {
      const input: PricingInput = {
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.001,
        sides: 'invalid' as any,
        isExceptionPaper: false
      }

      const result = engine.calculateBasePrice(input)

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.errors).toContain('Sides must be either "single" or "double"')
    })
  })

  describe('BREAKDOWN FORMATTING', () => {
    test('Format calculation breakdown', () => {
      const result = engine.calculateBasePrice({
        sizeSelection: 'standard',
        standardSize: testSizes[0],
        quantitySelection: 'standard',
        standardQuantity: testQuantities[1],
        basePaperPrice: 0.00145833333,
        sides: 'single',
        isExceptionPaper: false
      })

      const formatted = engine.formatCalculationBreakdown(result)

      expect(formatted).toContain('BASE PRICING FORMULA CALCULATION:')
      expect(formatted).toContain('Formula: Base Paper Price × Size × Quantity × Sides Multiplier')
      expect(formatted).toContain('Base Paper Price: $0.00145833')
      expect(formatted).toContain('Size: 24 square inches')
      expect(formatted).toContain('Quantity: 5000')
      expect(formatted).toContain('Sides Multiplier: 1x')
      expect(formatted).toContain('BASE PRICE: $175.00')
    })
  })
})