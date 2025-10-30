/**
 * AddonPricingCalculator Tests
 *
 * Comprehensive test suite for addon pricing service
 * Ensures accurate addon cost calculations across all pricing models
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  AddonPricingCalculator,
  type Addon,
  type VariableDataConfig,
  type PerforationConfig,
  type BandingConfig,
  type CornerRoundingConfig,
  type DesignOption,
} from './AddonPricingCalculator'

describe('AddonPricingCalculator', () => {
  let calculator: AddonPricingCalculator
  const basePrice = 100
  const quantity = 500

  beforeEach(() => {
    calculator = new AddonPricingCalculator()
  })

  describe('calculateAddonCost - FLAT Pricing', () => {
    it('should calculate flat fee correctly', () => {
      const addon: Addon = {
        id: 'addon_flat',
        name: 'Flat Fee Addon',
        pricingModel: 'FLAT',
        price: 25,
      }

      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(25)
    })

    it('should handle FIXED_FEE alias for FLAT', () => {
      const addon: Addon = {
        id: 'addon_fixed',
        name: 'Fixed Fee Addon',
        pricingModel: 'FIXED_FEE',
        price: 50,
      }

      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(50)
    })
  })

  describe('calculateAddonCost - PERCENTAGE Pricing', () => {
    it('should calculate percentage of base price', () => {
      const addon: Addon = {
        id: 'addon_percentage',
        name: 'Percentage Addon',
        pricingModel: 'PERCENTAGE',
        price: 0.15, // 15%
      }

      // 15% of $100 = $15
      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(15)
    })

    it('should handle different percentages', () => {
      const addon10: Addon = {
        id: 'addon_10pct',
        name: '10% Addon',
        pricingModel: 'PERCENTAGE',
        price: 0.1,
      }

      const addon25: Addon = {
        id: 'addon_25pct',
        name: '25% Addon',
        pricingModel: 'PERCENTAGE',
        price: 0.25,
      }

      expect(calculator.calculateAddonCost(addon10, 200, quantity)).toBe(20) // 10% of 200
      expect(calculator.calculateAddonCost(addon25, 200, quantity)).toBe(50) // 25% of 200
    })
  })

  describe('calculateAddonCost - PER_UNIT Pricing', () => {
    it('should calculate per-unit cost correctly', () => {
      const addon: Addon = {
        id: 'addon_per_unit',
        name: 'Per Unit Addon',
        pricingModel: 'PER_UNIT',
        price: 0.05, // 5 cents per unit
      }

      // 500 units × $0.05 = $25
      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(25)
    })

    it('should handle different quantities', () => {
      const addon: Addon = {
        id: 'addon_per_unit',
        name: 'Per Unit Addon',
        pricingModel: 'PER_UNIT',
        price: 0.10,
      }

      expect(calculator.calculateAddonCost(addon, basePrice, 100)).toBe(10) // 100 × 0.10
      expect(calculator.calculateAddonCost(addon, basePrice, 1000)).toBe(100) // 1000 × 0.10
      expect(calculator.calculateAddonCost(addon, basePrice, 2500)).toBe(250) // 2500 × 0.10
    })
  })

  describe('calculateAddonCost - TIERED Pricing', () => {
    it('should calculate tiered per-unit pricing', () => {
      const addon: Addon = {
        id: 'addon_tiered',
        name: 'Tiered Addon',
        pricingModel: 'TIERED',
        price: 0,
        configuration: {
          tiers: [
            { minQuantity: 0, price: 0.1, pricingType: 'PER_UNIT' },
            { minQuantity: 101, price: 0.08, pricingType: 'PER_UNIT' },
            { minQuantity: 501, price: 0.05, pricingType: 'PER_UNIT' },
          ],
        },
      }

      // 100 units: 100 × $0.10 = $10
      const tier1 = calculator.calculateAddonCost(addon, basePrice, 100)
      expect(tier1).toBe(10)

      // 250 units: 250 × $0.08 = $20
      const tier2 = calculator.calculateAddonCost(addon, basePrice, 250)
      expect(tier2).toBe(20)

      // 600 units: 600 × $0.05 = $30
      const tier3 = calculator.calculateAddonCost(addon, basePrice, 600)
      expect(tier3).toBe(30)
    })

    it('should calculate tiered flat pricing', () => {
      const addon: Addon = {
        id: 'addon_tiered_flat',
        name: 'Tiered Flat Addon',
        pricingModel: 'TIERED',
        price: 0,
        configuration: {
          tiers: [
            { minQuantity: 0, price: 50, pricingType: 'FLAT' },
            { minQuantity: 101, price: 40, pricingType: 'FLAT' },
            { minQuantity: 501, price: 30, pricingType: 'FLAT' },
          ],
        },
      }

      expect(calculator.calculateAddonCost(addon, basePrice, 100)).toBe(50)
      expect(calculator.calculateAddonCost(addon, basePrice, 250)).toBe(40)
      expect(calculator.calculateAddonCost(addon, basePrice, 600)).toBe(30)
    })

    it('should handle empty tiers configuration', () => {
      const addon: Addon = {
        id: 'addon_no_tiers',
        name: 'No Tiers Addon',
        pricingModel: 'TIERED',
        price: 0,
        configuration: {
          tiers: [],
        },
      }

      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(0)
    })
  })

  describe('calculateAddonCost - CUSTOM Pricing', () => {
    it('should calculate folding addon cost', () => {
      const addon: Addon = {
        id: 'addon_folding',
        name: 'Folding',
        pricingModel: 'CUSTOM',
        price: 0,
        configuration: {
          type: 'folding',
          basePrice: 10,
          perUnitCost: 0.01,
        },
      }

      // $10 setup + 500 × $0.01 = $15
      const result = calculator.calculateAddonCost(addon, basePrice, 500)

      expect(result).toBe(15)
    })

    it('should return 0 for special custom types handled separately', () => {
      const variableData: Addon = {
        id: 'addon_variable_data',
        name: 'Variable Data',
        pricingModel: 'CUSTOM',
        price: 0,
        configuration: { type: 'variable_data' },
      }

      const perforation: Addon = {
        id: 'addon_perforation',
        name: 'Perforation',
        pricingModel: 'CUSTOM',
        price: 0,
        configuration: { type: 'perforation' },
      }

      const banding: Addon = {
        id: 'addon_banding',
        name: 'Banding',
        pricingModel: 'CUSTOM',
        price: 0,
        configuration: { type: 'banding' },
      }

      expect(calculator.calculateAddonCost(variableData, basePrice, quantity)).toBe(0)
      expect(calculator.calculateAddonCost(perforation, basePrice, quantity)).toBe(0)
      expect(calculator.calculateAddonCost(banding, basePrice, quantity)).toBe(0)
    })

    it('should use default price for unknown custom types', () => {
      const addon: Addon = {
        id: 'addon_unknown',
        name: 'Unknown Custom',
        pricingModel: 'CUSTOM',
        price: 25,
        configuration: {
          type: 'unknown_type',
        },
      }

      const result = calculator.calculateAddonCost(addon, basePrice, quantity)

      expect(result).toBe(25)
    })
  })

  describe('calculateTotalAddonsCost', () => {
    it('should calculate total cost for multiple addons', () => {
      const addons: Addon[] = [
        { id: 'addon1', name: 'Addon 1', pricingModel: 'FLAT', price: 10 },
        { id: 'addon2', name: 'Addon 2', pricingModel: 'PERCENTAGE', price: 0.15 }, // 15% of 100 = 15
        { id: 'addon3', name: 'Addon 3', pricingModel: 'PER_UNIT', price: 0.02 }, // 500 × 0.02 = 10
      ]

      const result = calculator.calculateTotalAddonsCost(addons, 100, 500)

      // 10 + 15 + 10 = 35
      expect(result).toBe(35)
    })

    it('should return 0 for empty addons array', () => {
      const result = calculator.calculateTotalAddonsCost([], basePrice, quantity)

      expect(result).toBe(0)
    })
  })

  describe('calculateWithBreakdown', () => {
    it('should provide detailed breakdown with formulas', () => {
      const addons: Addon[] = [
        { id: 'addon1', name: 'Setup Fee', pricingModel: 'FLAT', price: 20 },
        { id: 'addon2', name: 'Rush Fee', pricingModel: 'PERCENTAGE', price: 0.2 },
      ]

      const result = calculator.calculateWithBreakdown(addons, 100, 500)

      expect(result.total).toBe(40) // 20 + (100 × 0.2)
      expect(result.breakdown).toHaveLength(2)

      expect(result.breakdown[0].addonId).toBe('addon1')
      expect(result.breakdown[0].cost).toBe(20)
      expect(result.breakdown[0].formula).toContain('Flat fee')

      expect(result.breakdown[1].addonId).toBe('addon2')
      expect(result.breakdown[1].cost).toBe(20)
      expect(result.breakdown[1].formula).toContain('20%')
    })
  })

  describe('calculateVariableDataCost', () => {
    it('should calculate variable data cost when enabled', () => {
      const config: VariableDataConfig = {
        enabled: true,
        locationsCount: '5',
        locations: 'Name, Address, City, State, Zip',
      }

      // $60 setup + 500 × $0.02 = $70
      const result = calculator.calculateVariableDataCost(500, config)

      expect(result).toBe(70)
    })

    it('should return 0 when disabled', () => {
      const config: VariableDataConfig = {
        enabled: false,
        locationsCount: '5',
        locations: 'Name, Address, City, State, Zip',
      }

      const result = calculator.calculateVariableDataCost(500, config)

      expect(result).toBe(0)
    })

    it('should scale with quantity', () => {
      const config: VariableDataConfig = {
        enabled: true,
        locationsCount: '3',
        locations: 'Name, Address, City',
      }

      // 100 units: $60 + 100 × $0.02 = $62
      const small = calculator.calculateVariableDataCost(100, config)
      expect(small).toBe(62)

      // 1000 units: $60 + 1000 × $0.02 = $80
      const large = calculator.calculateVariableDataCost(1000, config)
      expect(large).toBe(80)

      // 5000 units: $60 + 5000 × $0.02 = $160
      const bulk = calculator.calculateVariableDataCost(5000, config)
      expect(bulk).toBe(160)
    })
  })

  describe('calculatePerforationCost', () => {
    it('should calculate perforation cost when enabled', () => {
      const config: PerforationConfig = {
        enabled: true,
        verticalCount: '1',
        verticalPosition: 'center',
        horizontalCount: '0',
        horizontalPosition: '',
      }

      // $20 setup + 500 × $0.01 = $25
      const result = calculator.calculatePerforationCost(500, config)

      expect(result).toBe(25)
    })

    it('should return 0 when disabled', () => {
      const config: PerforationConfig = {
        enabled: false,
        verticalCount: '1',
        verticalPosition: 'center',
        horizontalCount: '0',
        horizontalPosition: '',
      }

      const result = calculator.calculatePerforationCost(500, config)

      expect(result).toBe(0)
    })

    it('should scale with quantity', () => {
      const config: PerforationConfig = {
        enabled: true,
        verticalCount: '2',
        verticalPosition: 'center',
        horizontalCount: '1',
        horizontalPosition: 'top',
      }

      expect(calculator.calculatePerforationCost(100, config)).toBe(21) // 20 + 1
      expect(calculator.calculatePerforationCost(1000, config)).toBe(30) // 20 + 10
      expect(calculator.calculatePerforationCost(5000, config)).toBe(70) // 20 + 50
    })
  })

  describe('calculateBandingCost', () => {
    it('should calculate banding cost based on bundles', () => {
      const config: BandingConfig = {
        enabled: true,
        bandingType: 'paper',
        itemsPerBundle: 100,
      }

      // 500 units ÷ 100 = 5 bundles × $0.75 = $3.75
      const result = calculator.calculateBandingCost(500, config)

      expect(result).toBe(3.75)
    })

    it('should round up to whole bundles', () => {
      const config: BandingConfig = {
        enabled: true,
        bandingType: 'paper',
        itemsPerBundle: 100,
      }

      // 550 units ÷ 100 = 5.5 → ceil to 6 bundles × $0.75 = $4.50
      const result = calculator.calculateBandingCost(550, config)

      expect(result).toBe(4.5)
    })

    it('should return 0 when disabled', () => {
      const config: BandingConfig = {
        enabled: false,
        bandingType: 'paper',
        itemsPerBundle: 100,
      }

      const result = calculator.calculateBandingCost(500, config)

      expect(result).toBe(0)
    })

    it('should return 0 when itemsPerBundle is 0', () => {
      const config: BandingConfig = {
        enabled: true,
        bandingType: 'paper',
        itemsPerBundle: 0,
      }

      const result = calculator.calculateBandingCost(500, config)

      expect(result).toBe(0)
    })

    it('should handle different bundle sizes', () => {
      const config50: BandingConfig = {
        enabled: true,
        bandingType: 'paper',
        itemsPerBundle: 50,
      }

      const config250: BandingConfig = {
        enabled: true,
        bandingType: 'shrink_wrap',
        itemsPerBundle: 250,
      }

      // 500 ÷ 50 = 10 bundles × $0.75 = $7.50
      expect(calculator.calculateBandingCost(500, config50)).toBe(7.5)

      // 500 ÷ 250 = 2 bundles × $0.75 = $1.50
      expect(calculator.calculateBandingCost(500, config250)).toBe(1.5)
    })
  })

  describe('calculateCornerRoundingCost', () => {
    it('should calculate corner rounding cost when enabled', () => {
      const config: CornerRoundingConfig = {
        enabled: true,
        cornerType: '1/8_inch',
      }

      // $20 setup + 500 × $0.01 = $25
      const result = calculator.calculateCornerRoundingCost(500, config)

      expect(result).toBe(25)
    })

    it('should return 0 when disabled', () => {
      const config: CornerRoundingConfig = {
        enabled: false,
        cornerType: '1/8_inch',
      }

      const result = calculator.calculateCornerRoundingCost(500, config)

      expect(result).toBe(0)
    })

    it('should scale with quantity', () => {
      const config: CornerRoundingConfig = {
        enabled: true,
        cornerType: '1/4_inch',
      }

      expect(calculator.calculateCornerRoundingCost(100, config)).toBe(21) // 20 + 1
      expect(calculator.calculateCornerRoundingCost(1000, config)).toBe(30) // 20 + 10
      expect(calculator.calculateCornerRoundingCost(5000, config)).toBe(70) // 20 + 50
    })
  })

  describe('calculateDesignCost', () => {
    it('should calculate side-based design cost', () => {
      const designOption: DesignOption = {
        id: 'design_standard',
        name: 'Standard Design',
        requiresSideSelection: true,
        sideOptions: {
          oneSide: { label: 'One Side', price: 50 },
          twoSides: { label: 'Two Sides', price: 90 },
        },
      }

      const oneSide = calculator.calculateDesignCost(designOption, 'oneSide')
      const twoSides = calculator.calculateDesignCost(designOption, 'twoSides')

      expect(oneSide).toBe(50)
      expect(twoSides).toBe(90)
    })

    it('should calculate flat design cost', () => {
      const designOption: DesignOption = {
        id: 'design_minor_changes',
        name: 'Minor Changes',
        requiresSideSelection: false,
        basePrice: 25,
      }

      const result = calculator.calculateDesignCost(designOption)

      expect(result).toBe(25)
    })

    it('should return 0 for free design options', () => {
      const designOption: DesignOption = {
        id: 'design_upload_own',
        name: 'Upload Your Own',
        requiresSideSelection: false,
        basePrice: 0,
      }

      const result = calculator.calculateDesignCost(designOption)

      expect(result).toBe(0)
    })

    it('should return 0 when side-based pricing requires side but none provided', () => {
      const designOption: DesignOption = {
        id: 'design_standard',
        name: 'Standard Design',
        requiresSideSelection: true,
        sideOptions: {
          oneSide: { label: 'One Side', price: 50 },
          twoSides: { label: 'Two Sides', price: 90 },
        },
      }

      const result = calculator.calculateDesignCost(designOption)

      expect(result).toBe(0)
    })
  })

  describe('Integration Tests - Real-World Scenarios', () => {
    it('should calculate complete addon package for business cards', () => {
      const addons: Addon[] = [
        { id: 'addon_round_corners', name: 'Round Corners', pricingModel: 'FLAT', price: 15 },
        { id: 'addon_spot_uv', name: 'Spot UV', pricingModel: 'PERCENTAGE', price: 0.2 },
      ]

      const result = calculator.calculateWithBreakdown(addons, 50, 500)

      // Round Corners: $15
      // Spot UV: $50 × 0.2 = $10
      // Total: $25
      expect(result.total).toBe(25)
      expect(result.breakdown).toHaveLength(2)
    })

    it('should calculate bulk flyer order with multiple addons', () => {
      const variableDataConfig: VariableDataConfig = {
        enabled: true,
        locationsCount: '10',
        locations: 'Multiple addresses',
      }

      const bandingConfig: BandingConfig = {
        enabled: true,
        bandingType: 'shrink_wrap',
        itemsPerBundle: 250,
      }

      const quantity = 2500

      const variableDataCost = calculator.calculateVariableDataCost(quantity, variableDataConfig)
      const bandingCost = calculator.calculateBandingCost(quantity, bandingConfig)

      // Variable Data: $60 + 2500 × $0.02 = $110
      expect(variableDataCost).toBe(110)

      // Banding: 2500 ÷ 250 = 10 bundles × $0.75 = $7.50
      expect(bandingCost).toBe(7.5)

      // Total special addons: $117.50
      const totalSpecialAddons = variableDataCost + bandingCost
      expect(totalSpecialAddons).toBe(117.5)
    })

    it('should handle all addon types in single order', () => {
      const regularAddons: Addon[] = [
        { id: 'addon_rush', name: 'Rush Processing', pricingModel: 'PERCENTAGE', price: 0.3 },
      ]

      const variableData: VariableDataConfig = { enabled: true, locationsCount: '5', locations: 'Name, Address' }
      const perforation: PerforationConfig = { enabled: true, verticalCount: '1', verticalPosition: 'center', horizontalCount: '0', horizontalPosition: '' }
      const banding: BandingConfig = { enabled: true, bandingType: 'paper', itemsPerBundle: 100 }
      const cornerRounding: CornerRoundingConfig = { enabled: true, cornerType: '1/8_inch' }
      const design: DesignOption = { id: 'design_standard', name: 'Standard Design', requiresSideSelection: true, sideOptions: { oneSide: { label: 'One Side', price: 50 }, twoSides: { label: 'Two Sides', price: 90 } } }

      const quantity = 500
      const baseProductPrice = 100

      const regularCost = calculator.calculateTotalAddonsCost(regularAddons, baseProductPrice, quantity)
      const variableDataCost = calculator.calculateVariableDataCost(quantity, variableData)
      const perforationCost = calculator.calculatePerforationCost(quantity, perforation)
      const bandingCost = calculator.calculateBandingCost(quantity, banding)
      const cornerRoundingCost = calculator.calculateCornerRoundingCost(quantity, cornerRounding)
      const designCost = calculator.calculateDesignCost(design, 'oneSide')

      const total = regularCost + variableDataCost + perforationCost + bandingCost + cornerRoundingCost + designCost

      // Rush: $100 × 0.3 = $30
      // Variable Data: $60 + 500 × $0.02 = $70
      // Perforation: $20 + 500 × $0.01 = $25
      // Banding: 5 bundles × $0.75 = $3.75
      // Corner Rounding: $20 + 500 × $0.01 = $25
      // Design: $50
      // Total: $203.75
      expect(total).toBe(203.75)
    })
  })
})
