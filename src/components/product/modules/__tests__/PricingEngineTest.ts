/**
 * PricingEngineTest.ts
 * Tests for the ModulePricingEngine class
 *
 * VALIDATES CRITICAL PRICING FLOW:
 * STEP 1: Base Price = quantity × paper_stock × size × coating × sides
 * STEP 2: Addon Price = quantity × addon (PER_UNIT) OR base_price × addon (PERCENTAGE)
 * STEP 3: Final Price = base_price + addon_price × turnaround
 */

import { describe, test, expect, beforeEach } from '@jest/jest'
import { ModulePricingEngine } from '../pricing/ModulePricingEngine'
import { ModuleType } from '../types/StandardModuleTypes'
import type { ModulePricingContribution } from '../types/StandardModuleTypes'

describe('ModulePricingEngine', () => {
  let engine: ModulePricingEngine

  beforeEach(() => {
    engine = new ModulePricingEngine()
  })

  describe('Pricing Context Management', () => {
    test('Empty engine returns invalid context', () => {
      const context = engine.getPricingContext()

      expect(context.isValid).toBe(false)
      expect(context.hasAllRequiredModules).toBe(false)
      expect(context.finalPrice).toBe(0)
      expect(context.basePrice).toBe(0)
    })

    test('Adding valid module contribution updates context', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
        calculation: {
          description: '1000 business cards',
          breakdown: [
            {
              type: 'quantity',
              item: '1000 units',
              cost: 1000,
            },
          ],
        },
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)

      const context = engine.getPricingContext()
      expect(context.quantity).toBe(1000)
    })

    test('Removing module contribution updates context', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      expect(engine.hasModuleContribution(ModuleType.QUANTITY)).toBe(true)

      engine.removeModuleContribution(ModuleType.QUANTITY)
      expect(engine.hasModuleContribution(ModuleType.QUANTITY)).toBe(false)
    })
  })

  describe('STEP 1: Base Price Calculation', () => {
    test('Calculates base price correctly with all required modules', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
        calculation: {
          breakdown: [
            {
              type: 'quantity',
              item: '2000 units',
              cost: 2000,
            },
          ],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.05, // $0.05 per unit
        multiplier: 1,
        isValid: true,
        calculation: {
          breakdown: [
            { type: 'coating', cost: 1.2 }, // 20% coating upcharge
            { type: 'sides', cost: 1.1 }, // 10% sides upcharge
          ],
        },
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1.5, // 50% size upcharge
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)

      const context = engine.getPricingContext()

      // Expected: 2000 × $0.05 × 1.5 × 1.2 × 1.1 = $198
      expect(context.basePrice).toBeCloseTo(198, 2)
      expect(context.hasAllRequiredModules).toBe(true)
    })

    test('Base price is zero when missing required modules', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)

      const context = engine.getPricingContext()
      expect(context.basePrice).toBe(0) // Missing paper stock and size
      expect(context.hasAllRequiredModules).toBe(false)
    })
  })

  describe('STEP 2: Addon Price Calculation', () => {
    beforeEach(() => {
      // Set up base price for addon calculations
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '1000 units', cost: 1000 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.1, // $0.10 per unit
        multiplier: 1,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)

      // Base price should be: 1000 × $0.10 × 1 = $100
      expect(engine.getPricingContext().basePrice).toBe(100)
    })

    test('PER_UNIT addons use quantity correctly', () => {
      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        perUnitCost: 0.03, // $0.03 per unit
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)

      const context = engine.getPricingContext()

      // Expected product price: $100 (base) + (1000 × $0.03) = $130
      expect(context.productPrice).toBe(130)
    })

    test('PERCENTAGE addons use base price correctly', () => {
      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        percentageCost: 0.2, // 20% of base price
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)

      const context = engine.getPricingContext()

      // Expected product price: $100 (base) + ($100 × 20%) = $120
      expect(context.productPrice).toBe(120)
    })

    test('Combined addon types work together', () => {
      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        addonCost: 25, // $25 flat fee
        perUnitCost: 0.02, // $0.02 per unit
        percentageCost: 0.15, // 15% of base price
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)

      const context = engine.getPricingContext()

      // Expected addon costs:
      // - Flat: $25
      // - Per unit: 1000 × $0.02 = $20
      // - Percentage: $100 × 15% = $15
      // Total addon: $60
      // Product price: $100 + $60 = $160
      expect(context.productPrice).toBe(160)
    })
  })

  describe('STEP 3: Final Price with Turnaround', () => {
    beforeEach(() => {
      // Set up base price and addons
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '500 units', cost: 500 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.2, // $0.20 per unit
        multiplier: 1,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        addonCost: 50, // $50 flat addon cost
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)
      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)

      // Product price should be: (500 × $0.20) + $50 = $150
      expect(engine.getPricingContext().productPrice).toBe(150)
    })

    test('Turnaround multiplier applies to product price', () => {
      const turnaroundContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1.3, // 30% rush charge
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.TURNAROUND, turnaroundContrib)

      const context = engine.getPricingContext()

      // Expected final price: $150 + ($150 × 30%) = $195
      expect(context.finalPrice).toBe(195)
    })

    test('Turnaround flat fee added to product price', () => {
      const turnaroundContrib: ModulePricingContribution = {
        basePrice: 0,
        addonCost: 35, // $35 rush fee
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.TURNAROUND, turnaroundContrib)

      const context = engine.getPricingContext()

      // Expected final price: $150 + $35 = $185
      expect(context.finalPrice).toBe(185)
    })

    test('Turnaround per-unit cost uses quantity', () => {
      const turnaroundContrib: ModulePricingContribution = {
        basePrice: 0,
        perUnitCost: 0.1, // $0.10 per unit rush charge
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.TURNAROUND, turnaroundContrib)

      const context = engine.getPricingContext()

      // Expected final price: $150 + (500 × $0.10) = $200
      expect(context.finalPrice).toBe(200)
    })
  })

  describe('Context Dependency Access', () => {
    test('Addons context includes quantity and base price', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '750 units', cost: 750 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.08,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1.2,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)

      const addonContext = engine.getContextForModule(ModuleType.ADDONS)

      expect(addonContext.quantity).toBe(750)
      expect(addonContext.basePrice).toBeCloseTo(72, 2) // 750 × 0.08 × 1.2
      expect(addonContext.isValid).toBe(true)
    })

    test('Turnaround context includes all pricing data', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '300 units', cost: 300 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.15,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        addonCost: 20,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)
      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)

      const turnaroundContext = engine.getContextForModule(ModuleType.TURNAROUND)

      expect(turnaroundContext.quantity).toBe(300)
      expect(turnaroundContext.basePrice).toBe(45) // 300 × 0.15
      expect(turnaroundContext.productPrice).toBe(65) // 45 + 20
      expect(turnaroundContext.isValid).toBe(true)
    })

    test('Independent modules get empty context', () => {
      const quantityContext = engine.getContextForModule(ModuleType.QUANTITY)
      const sizeContext = engine.getContextForModule(ModuleType.SIZE)
      const paperContext = engine.getContextForModule(ModuleType.PAPER_STOCK)
      const imageContext = engine.getContextForModule(ModuleType.IMAGES)

      expect(Object.keys(quantityContext)).toHaveLength(0)
      expect(Object.keys(sizeContext)).toHaveLength(0)
      expect(Object.keys(paperContext)).toHaveLength(0)
      expect(Object.keys(imageContext)).toHaveLength(0)
    })
  })

  describe('Pricing Breakdown Generation', () => {
    test('Generates accurate pricing breakdown', () => {
      // Set up complete pricing scenario
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '1000 units', cost: 1000 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.12,
        multiplier: 1,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1.1,
        isValid: true,
      }

      const addonContrib: ModulePricingContribution = {
        basePrice: 0,
        addonCost: 30,
        isValid: true,
      }

      const turnaroundContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1.25,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)
      engine.updateModuleContribution(ModuleType.ADDONS, addonContrib)
      engine.updateModuleContribution(ModuleType.TURNAROUND, turnaroundContrib)

      const breakdown = engine.getPricingBreakdown()

      expect(breakdown.basePrice).toBeCloseTo(132, 2) // 1000 × 0.12 × 1.1
      expect(breakdown.addonCosts).toBe(30)
      expect(breakdown.turnaroundCosts).toBeCloseTo(40.5, 2) // 162 × 25%
      expect(breakdown.finalPrice).toBeCloseTo(202.5, 2)

      expect(breakdown.breakdown).toHaveLength(3) // Base, addon, turnaround
      expect(breakdown.breakdown[0].module).toBe(ModuleType.QUANTITY)
      expect(breakdown.breakdown[1].module).toBe(ModuleType.ADDONS)
      expect(breakdown.breakdown[2].module).toBe(ModuleType.TURNAROUND)
    })

    test('Breakdown excludes zero-cost items', () => {
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        isValid: true,
        calculation: {
          breakdown: [{ type: 'quantity', item: '100 units', cost: 100 }],
        },
      }

      const paperContrib: ModulePricingContribution = {
        basePrice: 0.5,
        isValid: true,
      }

      const sizeContrib: ModulePricingContribution = {
        basePrice: 0,
        multiplier: 1,
        isValid: true,
      }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)
      // No addons or turnaround

      const breakdown = engine.getPricingBreakdown()

      expect(breakdown.breakdown).toHaveLength(1) // Only base price
      expect(breakdown.addonCosts).toBe(0)
      expect(breakdown.turnaroundCosts).toBe(0)
    })
  })

  describe('CRITICAL: Images Never Affect Pricing', () => {
    test('Adding images does not change any pricing', () => {
      // Set up pricing without images
      const quantityContrib: ModulePricingContribution = {
        basePrice: 0,
        isValid: true,
        calculation: { breakdown: [{ type: 'quantity', item: '100 units', cost: 100 }] },
      }
      const paperContrib: ModulePricingContribution = { basePrice: 1.0, isValid: true }
      const sizeContrib: ModulePricingContribution = { basePrice: 0, multiplier: 1, isValid: true }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)

      const priceWithoutImages = engine.getPricingContext().finalPrice

      // Add images
      const imageContrib: ModulePricingContribution = {
        basePrice: 0,
        isValid: true,
        calculation: {
          description: 'Images (no pricing impact)',
          breakdown: [{ type: 'info', item: 'Image uploads are optional', cost: 0 }],
        },
      }

      engine.updateModuleContribution(ModuleType.IMAGES, imageContrib)

      const priceWithImages = engine.getPricingContext().finalPrice

      expect(priceWithImages).toBe(priceWithoutImages)
      expect(priceWithImages).toBe(100) // 100 × $1.00
    })

    test('Images are not included in required modules', () => {
      const quantityContrib: ModulePricingContribution = { basePrice: 0, isValid: true }
      const paperContrib: ModulePricingContribution = { basePrice: 0.5, isValid: true }
      const sizeContrib: ModulePricingContribution = { basePrice: 0, multiplier: 1, isValid: true }
      const imageContrib: ModulePricingContribution = { basePrice: 0, isValid: true }

      engine.updateModuleContribution(ModuleType.QUANTITY, quantityContrib)
      engine.updateModuleContribution(ModuleType.PAPER_STOCK, paperContrib)
      engine.updateModuleContribution(ModuleType.SIZE, sizeContrib)
      engine.updateModuleContribution(ModuleType.IMAGES, imageContrib)

      const context = engine.getPricingContext()

      expect(context.hasAllRequiredModules).toBe(true) // Images not required
    })
  })
})

export {}
