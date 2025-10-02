/**
 * ModularArchitectureTest.ts
 * Comprehensive test suite for ultra-independent modular product architecture
 *
 * TESTS ULTRA-CLEAR REQUIREMENTS:
 * - Modules work TOGETHER for pricing (quantity × paper × size = base price)
 * - Dependencies are REQUIRED and CORRECT (addons need quantity, turnaround needs base price)
 * - Modules are independent for ERROR HANDLING and MAINTENANCE only
 * - Images are ALWAYS optional and NEVER block pricing/checkout
 */

import { describe, test, expect, beforeEach } from '@jest/jest'
import { ModulePricingEngine } from '../pricing/ModulePricingEngine'
import { ModuleType } from '../types/StandardModuleTypes'
import type { ModulePricingContribution } from '../types/StandardModuleTypes'

// Mock data for testing different module combinations
const MOCK_QUANTITY_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0,
  multiplier: 1,
  isValid: true,
  calculation: {
    description: '5000 business cards',
    breakdown: [{
      type: 'quantity',
      item: '5000 units',
      cost: 5000
    }]
  }
}

const MOCK_PAPER_STOCK_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0.08, // $0.08 per unit
  multiplier: 1.5, // coating/sides multiplier
  isValid: true,
  calculation: {
    description: '14pt Cardstock, Gloss UV, 4/4',
    breakdown: [
      { type: 'paper', item: '14pt Cardstock', cost: 0.06 },
      { type: 'coating', item: 'Gloss UV', cost: 1.25 },
      { type: 'sides', item: '4/4 (both sides)', cost: 1.2 }
    ]
  }
}

const MOCK_SIZE_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0,
  multiplier: 1.0, // Standard business card size
  isValid: true,
  calculation: {
    description: '3.5" x 2" (7 square inches)',
    breakdown: [{
      type: 'size',
      item: '7 square inches',
      cost: 1.0
    }]
  }
}

const MOCK_ADDONS_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0,
  addonCost: 25, // $25 flat fee
  perUnitCost: 0.02, // $0.02 per unit
  percentageCost: 0.15, // 15% of base price
  isValid: true,
  calculation: {
    description: 'Rounded corners + Foil stamping',
    breakdown: [
      { type: 'addon_flat', item: 'Setup fee', cost: 25 },
      { type: 'addon_per_unit', item: 'Rounded corners', cost: 0.02 },
      { type: 'addon_percentage', item: 'Foil stamping (15%)', cost: 0.15 }
    ]
  }
}

const MOCK_TURNAROUND_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0,
  multiplier: 1.5, // 50% rush charge
  isValid: true,
  calculation: {
    description: 'Rush delivery (1-2 days)',
    breakdown: [{
      type: 'turnaround',
      item: 'Rush charge (50%)',
      cost: 1.5
    }]
  }
}

const MOCK_IMAGE_CONTRIBUTION: ModulePricingContribution = {
  basePrice: 0,
  multiplier: 1,
  isValid: true,
  calculation: {
    description: 'Images (no pricing impact)',
    breakdown: [{
      type: 'info',
      item: 'Image uploads are optional',
      cost: 0
    }]
  }
}

describe('Ultra-Independent Modular Architecture', () => {
  let pricingEngine: ModulePricingEngine

  beforeEach(() => {
    pricingEngine = new ModulePricingEngine()
  })

  describe('CRITICAL REQUIREMENT: Pricing Dependencies Work Together', () => {
    test('Base Price Calculation: quantity × paper × size = base price', () => {
      // Add required modules for base price
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // Expected: 5000 × $0.08 × 1.0 × 1.5 = $600
      expect(context.basePrice).toBe(600)
      expect(context.isValid).toBe(true)
      expect(context.hasAllRequiredModules).toBe(true)
    })

    test('Addon Dependencies: NEEDS quantity and base price', () => {
      // Set up base price first
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      // Add addons that depend on quantity and base price
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // Expected addon costs:
      // - $25 flat fee
      // - 5000 × $0.02 = $100 per unit cost
      // - $600 × 15% = $90 percentage cost
      // Total addon cost: $25 + $100 + $90 = $215
      const expectedAddonCost = 25 + (5000 * 0.02) + (600 * 0.15)
      expect(context.productPrice).toBe(600 + expectedAddonCost) // base + addons
    })

    test('Turnaround Dependencies: NEEDS base price and quantity', () => {
      // Set up full product price
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)

      // Add turnaround that multiplies product price
      pricingEngine.updateModuleContribution(ModuleType.TURNAROUND, MOCK_TURNAROUND_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // Product price without turnaround
      const productPrice = 600 + 215 // base + addons

      // Expected final price: product price × 1.5 (50% rush)
      const expectedFinalPrice = productPrice + (productPrice * 0.5)
      expect(context.finalPrice).toBeCloseTo(expectedFinalPrice, 2)
    })
  })

  describe('CRITICAL REQUIREMENT: Image Module Always Optional', () => {
    test('System works WITHOUT images', () => {
      // Create complete pricing without images
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.TURNAROUND, MOCK_TURNAROUND_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      expect(context.isValid).toBe(true)
      expect(context.finalPrice).toBeGreaterThan(0)
      expect(context.hasAllRequiredModules).toBe(true)

      // Images are NOT in required modules
      expect(pricingEngine.hasModuleContribution(ModuleType.IMAGES)).toBe(false)
    })

    test('Images NEVER affect pricing when added', () => {
      // Get pricing without images
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      const priceWithoutImages = pricingEngine.getPricingContext().finalPrice

      // Add images
      pricingEngine.updateModuleContribution(ModuleType.IMAGES, MOCK_IMAGE_CONTRIBUTION)

      const priceWithImages = pricingEngine.getPricingContext().finalPrice

      // Price should be IDENTICAL
      expect(priceWithImages).toBe(priceWithoutImages)
    })

    test('Images module context shows no dependencies needed', () => {
      const imageContext = pricingEngine.getContextForModule(ModuleType.IMAGES)

      // Images module should need NO dependencies
      expect(Object.keys(imageContext)).toHaveLength(0)
    })
  })

  describe('Module Combination Testing', () => {
    test('Quantity-Only Product (Minimal)', () => {
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      expect(context.quantity).toBe(5000)
      expect(context.basePrice).toBe(0) // No paper stock = no base price
      expect(context.hasAllRequiredModules).toBe(false) // Missing paper & size
    })

    test('Quantity + Size + Paper (Standard)', () => {
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      expect(context.basePrice).toBe(600)
      expect(context.finalPrice).toBe(600)
      expect(context.hasAllRequiredModules).toBe(true)
      expect(context.isValid).toBe(true)
    })

    test('Full-Featured Product (All Modules)', () => {
      // Add all modules
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.TURNAROUND, MOCK_TURNAROUND_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.IMAGES, MOCK_IMAGE_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()
      const breakdown = pricingEngine.getPricingBreakdown()

      expect(context.isValid).toBe(true)
      expect(context.hasAllRequiredModules).toBe(true)
      expect(context.basePrice).toBe(600)
      expect(context.productPrice).toBe(815) // base + addons
      expect(context.finalPrice).toBeCloseTo(1222.5, 2) // product * 1.5

      // Breakdown should show all components
      expect(breakdown.breakdown).toHaveLength(3) // base, addons, turnaround
      expect(breakdown.breakdown.find(item => item.module === ModuleType.QUANTITY)).toBeDefined()
      expect(breakdown.breakdown.find(item => item.module === ModuleType.ADDONS)).toBeDefined()
      expect(breakdown.breakdown.find(item => item.module === ModuleType.TURNAROUND)).toBeDefined()
    })
  })

  describe('CRITICAL REQUIREMENT: Error Independence', () => {
    test('Invalid module does not break others', () => {
      // Add valid modules
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      // Add invalid paper stock
      const invalidPaper: ModulePricingContribution = {
        basePrice: 0,
        isValid: false
      }
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, invalidPaper)

      const context = pricingEngine.getPricingContext()

      // Should not crash, but won't have valid pricing
      expect(context.basePrice).toBe(0) // No valid paper stock
      expect(context.hasAllRequiredModules).toBe(false)
      expect(context.quantity).toBe(5000) // Other modules still work
    })

    test('Removing module does not break others', () => {
      // Add all modules
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)

      const withAddons = pricingEngine.getPricingContext().productPrice

      // Remove addons
      pricingEngine.removeModuleContribution(ModuleType.ADDONS)

      const withoutAddons = pricingEngine.getPricingContext().productPrice

      expect(withoutAddons).toBeLessThan(withAddons)
      expect(pricingEngine.getPricingContext().basePrice).toBe(600) // Still valid
    })
  })

  describe('Context Dependency Management', () => {
    test('Addons module gets correct context', () => {
      // Set up dependencies for addons
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      const addonContext = pricingEngine.getContextForModule(ModuleType.ADDONS)

      // Addons NEEDS quantity and base price
      expect(addonContext.quantity).toBe(5000)
      expect(addonContext.basePrice).toBe(600)
      expect(addonContext.isValid).toBe(true)
    })

    test('Turnaround module gets correct context', () => {
      // Set up dependencies for turnaround
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)

      const turnaroundContext = pricingEngine.getContextForModule(ModuleType.TURNAROUND)

      // Turnaround NEEDS quantity, base price, and product price
      expect(turnaroundContext.quantity).toBe(5000)
      expect(turnaroundContext.basePrice).toBe(600)
      expect(turnaroundContext.productPrice).toBe(815) // base + addons
      expect(turnaroundContext.isValid).toBe(true)
    })

    test('Independent modules need no context', () => {
      const quantityContext = pricingEngine.getContextForModule(ModuleType.QUANTITY)
      const sizeContext = pricingEngine.getContextForModule(ModuleType.SIZE)
      const paperContext = pricingEngine.getContextForModule(ModuleType.PAPER_STOCK)
      const imageContext = pricingEngine.getContextForModule(ModuleType.IMAGES)

      // These modules should need no dependencies
      expect(Object.keys(quantityContext)).toHaveLength(0)
      expect(Object.keys(sizeContext)).toHaveLength(0)
      expect(Object.keys(paperContext)).toHaveLength(0)
      expect(Object.keys(imageContext)).toHaveLength(0)
    })
  })

  describe('Pricing Flow Validation', () => {
    test('STEP 1: Base price calculation is correct', () => {
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // quantity × paper_price × size_multiplier × coating_multiplier × sides_multiplier
      // 5000 × $0.08 × 1.0 × 1.5 = $600
      expect(context.basePrice).toBe(600)
    })

    test('STEP 2: Addon calculations use dependencies correctly', () => {
      // Set up base price
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // Addon calculations:
      // - Flat: $25
      // - Per unit: 5000 × $0.02 = $100
      // - Percentage: $600 × 15% = $90
      // Total: $215
      const expectedProductPrice = 600 + 25 + 100 + 90
      expect(context.productPrice).toBe(expectedProductPrice)
    })

    test('STEP 3: Final price includes turnaround correctly', () => {
      // Full setup
      pricingEngine.updateModuleContribution(ModuleType.QUANTITY, MOCK_QUANTITY_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.PAPER_STOCK, MOCK_PAPER_STOCK_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.SIZE, MOCK_SIZE_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.ADDONS, MOCK_ADDONS_CONTRIBUTION)
      pricingEngine.updateModuleContribution(ModuleType.TURNAROUND, MOCK_TURNAROUND_CONTRIBUTION)

      const context = pricingEngine.getPricingContext()

      // Final price: product_price × turnaround_multiplier
      // $815 × 1.5 = $1222.50
      const productPrice = 815
      const expectedFinalPrice = productPrice + (productPrice * 0.5)
      expect(context.finalPrice).toBeCloseTo(expectedFinalPrice, 2)
    })
  })
})

export { }