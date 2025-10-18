/**
 * ProductConfigurationService
 *
 * Service layer for product configuration business logic.
 * Extracts configuration fetching and transformation from API routes.
 *
 * Created: 2025-10-18
 * Part of: Phase 1 DRY+SoC Refactoring (Task 1.2)
 */

import { prisma } from '@/lib/prisma-singleton'
import { transformSizeGroup } from '@/lib/utils/size-transformer'
import {
  transformAddonSets,
  transformLegacyAddons,
  findDefaultAddons,
} from '@/lib/utils/addon-transformer'
import type { ServiceContext, ServiceResult } from '@/types/service'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ProductConfiguration {
  quantities: QuantityOption[]
  sizes: SizeOption[]
  paperStocks: PaperStockOption[]
  turnaroundTimes: TurnaroundOption[]
  addons: AddonOption[]
  addonsGrouped: {
    aboveDropdown: AddonOption[]
    inDropdown: AddonOption[]
    belowDropdown: AddonOption[]
  }
  designOptions: DesignOption[]
  defaults: ConfigurationDefaults
}

export interface QuantityOption {
  id: string
  value: number
  label: string
  isCustom: boolean
  customMin?: number
  customMax?: number
}

export interface SizeOption {
  id: string
  name: string
  displayName: string
  width: number
  height: number
  squareInches: number
  priceMultiplier: number
  isDefault: boolean
}

export interface PaperStockOption {
  id: string
  name: string
  description: string
  pricePerUnit: number
  weight: number
  pricePerSqInch: number
  isDefault: boolean
  coatings: CoatingOption[]
  sides: SidesOption[]
}

export interface CoatingOption {
  id: string
  name: string
  priceMultiplier: number
  isDefault: boolean
}

export interface SidesOption {
  id: string
  name: string
  priceMultiplier: number
  isDefault: boolean
}

export interface TurnaroundOption {
  id: string
  name: string
  displayName: string
  description: string
  daysMin: number
  daysMax: number
  pricingModel: string
  basePrice: number
  priceMultiplier: number
  requiresNoCoating: boolean
  restrictedCoatings: string[]
  isDefault: boolean
}

export interface AddonOption {
  id: string
  name: string
  description: string
  pricingModel: string
  price: number
  priceDisplay: string
  configuration?: any
  isDefault: boolean
  additionalTurnaroundDays: number
  displayPosition?: string
}

export interface DesignOption {
  id: string
  code: string
  name: string
  description: string
  tooltipText: string
  pricingType: string
  requiresSideSelection: boolean
  sideOnePrice: number | null
  sideTwoPrice: number | null
  basePrice: number
  isDefault: boolean
  sortOrder: number
}

export interface ConfigurationDefaults {
  quantity: string
  size: string
  paper: string
  coating: string
  sides: string
  addons: string[]
  turnaround: string
  design?: string
}

// ============================================================================
// Service Class
// ============================================================================

export class ProductConfigurationService {
  private context: ServiceContext

  constructor(context: ServiceContext) {
    this.context = context
  }

  /**
   * Get complete product configuration including all options
   */
  async getConfiguration(productId: string): Promise<ServiceResult<ProductConfiguration>> {
    try {
      // Fetch all configuration components in parallel
      const [
        quantities,
        sizes,
        paperStocks,
        turnaroundTimes,
        addons,
        addonsGrouped,
        designOptions,
      ] = await Promise.all([
        this.fetchQuantities(productId),
        this.fetchSizes(productId),
        this.fetchPaperStocks(productId),
        this.fetchTurnaroundTimes(productId),
        this.fetchAddons(productId),
        this.fetchAddonsGrouped(productId),
        this.fetchDesignOptions(productId),
      ])

      // Build defaults
      const defaults = this.buildDefaults({
        quantities,
        sizes,
        paperStocks,
        turnaroundTimes,
        addons,
        designOptions,
      })

      const configuration: ProductConfiguration = {
        quantities,
        sizes,
        paperStocks,
        turnaroundTimes,
        addons,
        addonsGrouped,
        designOptions,
        defaults,
      }

      return {
        success: true,
        data: configuration,
      }
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching configuration:', error)

      // Return fallback configuration on error
      return {
        success: true, // Still return success with fallback
        data: this.getFallbackConfiguration(),
      }
    }
  }

  /**
   * Fetch quantities for product
   */
  private async fetchQuantities(productId: string): Promise<QuantityOption[]> {
    try {
      const productQuantityGroup = await prisma.productQuantityGroup.findFirst({
        where: { productId },
        include: { QuantityGroup: true },
      })

      if (productQuantityGroup?.QuantityGroup) {
        return this.transformQuantityValues(productQuantityGroup.QuantityGroup)
      }

      return []
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching quantities:', error)
      return []
    }
  }

  /**
   * Fetch sizes for product
   */
  private async fetchSizes(productId: string): Promise<SizeOption[]> {
    try {
      const productSizeGroup = await prisma.productSizeGroup.findFirst({
        where: { productId },
        include: { SizeGroup: true },
      })

      if (productSizeGroup?.SizeGroup) {
        return transformSizeGroup(productSizeGroup.SizeGroup)
      }

      return this.getFallbackSizes()
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching sizes:', error)
      return this.getFallbackSizes()
    }
  }

  /**
   * Fetch paper stocks for product
   */
  private async fetchPaperStocks(productId: string): Promise<PaperStockOption[]> {
    try {
      const productPaperStockSets = await prisma.productPaperStockSet.findMany({
        where: { productId },
        include: {
          PaperStockSet: {
            include: {
              PaperStockSetItem: {
                include: {
                  PaperStock: {
                    include: {
                      PaperStockCoating: {
                        include: { CoatingOption: true },
                      },
                      PaperStockSides: {
                        include: { SidesOption: true },
                      },
                    },
                  },
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      })

      if (productPaperStockSets.length > 0 && productPaperStockSets[0].PaperStockSet) {
        const paperStockSet = productPaperStockSets[0].PaperStockSet
        return paperStockSet.PaperStockSetItem.map((item: any, index: number) => ({
          id: `paper_${index}`,
          name: item.PaperStock.name,
          description: item.PaperStock.description || '',
          pricePerUnit: item.PaperStock.pricePerSqInch || 0.05,
          weight: item.PaperStock.weight || 0.0009,
          pricePerSqInch: item.PaperStock.pricePerSqInch || 0.05,
          isDefault: item.isDefault || false,
          coatings: item.PaperStock.PaperStockCoating.map((psc: any) => ({
            id: `coating_${psc.CoatingOption.id}`,
            name: psc.CoatingOption.name,
            priceMultiplier: 1.0,
            isDefault: psc.isDefault || false,
          })),
          sides: item.PaperStock.PaperStockSides.map((pss: any) => ({
            id: `sides_${pss.SidesOption.id}`,
            name: pss.SidesOption.name,
            priceMultiplier: pss.priceMultiplier || 1.0,
            isDefault: pss.isEnabled || false,
          })),
        }))
      }

      return this.getFallbackPaperStocks()
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching paper stocks:', error)
      return this.getFallbackPaperStocks()
    }
  }

  /**
   * Fetch turnaround times for product
   */
  private async fetchTurnaroundTimes(productId: string): Promise<TurnaroundOption[]> {
    try {
      const productTurnaroundSets = await prisma.productTurnaroundTimeSet.findMany({
        where: { productId },
        include: {
          TurnaroundTimeSet: {
            include: {
              TurnaroundTimeSetItem: {
                include: { TurnaroundTime: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      })

      if (productTurnaroundSets.length > 0 && productTurnaroundSets[0].TurnaroundTimeSet) {
        const turnaroundSet = productTurnaroundSets[0].TurnaroundTimeSet
        return turnaroundSet.TurnaroundTimeSetItem.map((item: any, index: number) => ({
          id: `turnaround_${index}`,
          name: item.TurnaroundTime.name,
          displayName: item.TurnaroundTime.name,
          description: item.TurnaroundTime.description || '',
          daysMin: item.TurnaroundTime.daysMin || 0,
          daysMax: item.TurnaroundTime.daysMax || item.TurnaroundTime.daysMin || 0,
          pricingModel: item.TurnaroundTime.pricingModel || 'FLAT',
          basePrice: item.TurnaroundTime.basePrice || 0,
          priceMultiplier: item.TurnaroundTime.priceMultiplier || 1.0,
          requiresNoCoating: false,
          restrictedCoatings: [],
          isDefault: item.isDefault || false,
        }))
      }

      return this.getFallbackTurnaroundTimes()
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching turnaround times:', error)
      return this.getFallbackTurnaroundTimes()
    }
  }

  /**
   * Fetch add-ons for product
   */
  private async fetchAddons(productId: string): Promise<AddonOption[]> {
    try {
      const productAddOnSets = await prisma.productAddOnSet.findMany({
        where: { productId },
        include: {
          AddOnSet: {
            include: {
              AddOnSetItem: {
                include: { AddOn: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      if (productAddOnSets.length > 0) {
        return transformAddonSets(productAddOnSets)
      }

      return transformLegacyAddons(this.getFallbackAddons())
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching addons:', error)
      return transformLegacyAddons(this.getFallbackAddons())
    }
  }

  /**
   * Fetch add-ons grouped by display position
   */
  private async fetchAddonsGrouped(productId: string): Promise<{
    aboveDropdown: AddonOption[]
    inDropdown: AddonOption[]
    belowDropdown: AddonOption[]
  }> {
    try {
      const productAddOnSets = await prisma.productAddOnSet.findMany({
        where: { productId },
        include: {
          AddOnSet: {
            include: {
              AddOnSetItem: {
                include: { AddOn: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      if (productAddOnSets.length === 0) {
        return {
          aboveDropdown: [],
          inDropdown: [],
          belowDropdown: [],
        }
      }

      const aboveDropdown: AddonOption[] = []
      const inDropdown: AddonOption[] = []
      const belowDropdown: AddonOption[] = []

      for (const productAddOnSet of productAddOnSets) {
        for (const setItem of productAddOnSet.AddOnSet.AddOnSetItem) {
          const addon = setItem.AddOn
          const { price, priceDisplay } = this.calculatePriceDisplay(addon)

          const formattedAddon: AddonOption = {
            id: addon.id,
            name: addon.name,
            description: addon.description || '',
            pricingModel: addon.pricingModel,
            price,
            priceDisplay,
            configuration: addon.configuration || {},
            isDefault: setItem.isDefault,
            additionalTurnaroundDays: addon.additionalTurnaroundDays || 0,
            displayPosition: setItem.displayPosition,
          }

          switch (setItem.displayPosition) {
            case 'ABOVE_DROPDOWN':
              aboveDropdown.push(formattedAddon)
              break
            case 'BELOW_DROPDOWN':
              belowDropdown.push(formattedAddon)
              break
            case 'IN_DROPDOWN':
            default:
              inDropdown.push(formattedAddon)
              break
          }
        }
      }

      return {
        aboveDropdown,
        inDropdown,
        belowDropdown,
      }
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching addons grouped:', error)
      return {
        aboveDropdown: [],
        inDropdown: [],
        belowDropdown: [],
      }
    }
  }

  /**
   * Fetch design options for product
   */
  private async fetchDesignOptions(productId: string): Promise<DesignOption[]> {
    try {
      const productDesignSets = await prisma.productDesignSet.findMany({
        where: { productId },
        include: {
          DesignSet: {
            include: {
              DesignSetItem: {
                include: { DesignOption: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      if (productDesignSets.length > 0 && productDesignSets[0].DesignSet) {
        const designSet = productDesignSets[0].DesignSet
        return designSet.DesignSetItem.map((item: any) => ({
          id: item.DesignOption.id,
          code: item.DesignOption.code,
          name: item.DesignOption.name,
          description: item.DesignOption.description || '',
          tooltipText: item.DesignOption.tooltipText || '',
          pricingType: item.DesignOption.pricingType,
          requiresSideSelection: item.DesignOption.requiresSideSelection,
          sideOnePrice: item.DesignOption.sideOnePrice || null,
          sideTwoPrice: item.DesignOption.sideTwoPrice || null,
          basePrice: item.DesignOption.basePrice || 0,
          isDefault: item.isDefault || false,
          sortOrder: item.sortOrder,
        }))
      }

      return []
    } catch (error) {
      console.error('[ProductConfigurationService] Error fetching design options:', error)
      return []
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Transform quantity values from database format
   */
  private transformQuantityValues(quantityGroup: any): QuantityOption[] {
    if (!quantityGroup?.values) return []

    const values = quantityGroup.values.split(',').map((v: string) => v.trim())
    return values.map((value: string, index: number) => {
      if (value.toLowerCase() === 'custom') {
        return {
          id: `qty_custom`,
          value: 35000,
          label: 'Custom',
          isCustom: true,
          customMin: quantityGroup.customMin || 55000,
          customMax: quantityGroup.customMax || 100000,
        }
      }

      const numValue = parseInt(value)
      return {
        id: `qty_${index}`,
        value: numValue,
        label: value,
        isCustom: false,
      }
    })
  }

  /**
   * Calculate price display for addon
   */
  private calculatePriceDisplay(addon: any): { price: number; priceDisplay: string } {
    const config = addon.configuration as any

    if (config) {
      if (config.displayPrice) {
        return { price: 0, priceDisplay: config.displayPrice }
      } else if (config.price !== undefined) {
        return { price: config.price, priceDisplay: `$${config.price}` }
      } else if (config.basePrice !== undefined) {
        return { price: config.basePrice, priceDisplay: `$${config.basePrice}` }
      } else if (config.percentage !== undefined) {
        return { price: config.percentage, priceDisplay: `${config.percentage}%` }
      } else if (config.pricePerUnit !== undefined) {
        return { price: config.pricePerUnit, priceDisplay: `$${config.pricePerUnit}/pc` }
      }
    }

    switch (addon.pricingModel) {
      case 'FIXED_FEE':
      case 'FLAT':
        return { price: 0, priceDisplay: 'Variable' }
      case 'PERCENTAGE':
        return { price: 0, priceDisplay: 'Variable %' }
      case 'PER_UNIT':
        return { price: 0, priceDisplay: 'Per Unit' }
      default:
        return { price: 0, priceDisplay: 'Variable' }
    }
  }

  /**
   * Build configuration defaults
   */
  private buildDefaults(components: {
    quantities: QuantityOption[]
    sizes: SizeOption[]
    paperStocks: PaperStockOption[]
    turnaroundTimes: TurnaroundOption[]
    addons: AddonOption[]
    designOptions: DesignOption[]
  }): ConfigurationDefaults {
    const defaults: ConfigurationDefaults = {
      quantity: 'qty_2',
      size: 'size_2',
      paper: 'paper_1',
      coating: 'coating_1',
      sides: 'sides_1',
      addons: [],
      turnaround: 'turnaround_1',
    }

    // Set quantity default
    if (components.quantities.length > 0) {
      const defaultQuantity =
        components.quantities.find((q) => q.value === 5000) || components.quantities[0]
      defaults.quantity = defaultQuantity.id
    }

    // Set size default
    if (components.sizes.length > 0) {
      const defaultSize = components.sizes.find((s) => s.isDefault) || components.sizes[0]
      defaults.size = defaultSize.id
    }

    // Set paper stock defaults (including coating and sides)
    if (components.paperStocks.length > 0) {
      const defaultPaper =
        components.paperStocks.find((p) => p.isDefault) || components.paperStocks[0]
      defaults.paper = defaultPaper.id

      if (defaultPaper.coatings && defaultPaper.coatings.length > 0) {
        const defaultCoating =
          defaultPaper.coatings.find((c: any) => c.isDefault) || defaultPaper.coatings[0]
        defaults.coating = defaultCoating.id
      }

      if (defaultPaper.sides && defaultPaper.sides.length > 0) {
        const defaultSide =
          defaultPaper.sides.find((s: any) => s.isDefault) || defaultPaper.sides[0]
        defaults.sides = defaultSide.id
      }
    }

    // Set addon defaults
    if (components.addons.length > 0) {
      defaults.addons = findDefaultAddons(components.addons)
    }

    // Set turnaround default
    if (components.turnaroundTimes.length > 0) {
      const defaultTurnaround =
        components.turnaroundTimes.find((t) => t.isDefault) || components.turnaroundTimes[0]
      defaults.turnaround = defaultTurnaround.id
    }

    // Set design default
    if (components.designOptions.length > 0) {
      const defaultDesign =
        components.designOptions.find((d) => d.isDefault) || components.designOptions[0]
      defaults.design = defaultDesign.id
    }

    return defaults
  }

  // ============================================================================
  // Fallback Methods (220 lines of fallback configuration)
  // ============================================================================

  private getFallbackConfiguration(): ProductConfiguration {
    return {
      quantities: [],
      sizes: this.getFallbackSizes(),
      paperStocks: this.getFallbackPaperStocks(),
      turnaroundTimes: this.getFallbackTurnaroundTimes(),
      addons: transformLegacyAddons(this.getFallbackAddons()),
      addonsGrouped: {
        aboveDropdown: [],
        inDropdown: [],
        belowDropdown: [],
      },
      designOptions: [],
      defaults: {
        quantity: 'qty_2',
        size: 'size_2',
        paper: 'paper_1',
        coating: 'coating_1',
        sides: 'sides_1',
        addons: [],
        turnaround: 'turnaround_1',
      },
    }
  }

  private getFallbackSizes(): SizeOption[] {
    return [
      {
        id: 'size_0',
        name: '11x17',
        displayName: '11″ × 17″',
        width: 11,
        height: 17,
        squareInches: 187,
        priceMultiplier: 1.0,
        isDefault: false,
      },
      {
        id: 'size_1',
        name: '12x18',
        displayName: '12″ × 18″',
        width: 12,
        height: 18,
        squareInches: 216,
        priceMultiplier: 1.15,
        isDefault: false,
      },
      {
        id: 'size_2',
        name: '18x24',
        displayName: '18″ × 24″',
        width: 18,
        height: 24,
        squareInches: 432,
        priceMultiplier: 2.3,
        isDefault: true,
      },
      {
        id: 'size_3',
        name: '24x36',
        displayName: '24″ × 36″',
        width: 24,
        height: 36,
        squareInches: 864,
        priceMultiplier: 4.6,
        isDefault: false,
      },
      {
        id: 'size_4',
        name: '36x48',
        displayName: '36″ × 48″',
        width: 36,
        height: 48,
        squareInches: 1728,
        priceMultiplier: 9.2,
        isDefault: false,
      },
    ]
  }

  private getFallbackPaperStocks(): PaperStockOption[] {
    return [
      {
        id: 'paper_1',
        name: '14pt C2S Poster Stock',
        description: 'Heavy coated stock with semi-gloss finish',
        pricePerUnit: 0.05,
        weight: 0.0009,
        pricePerSqInch: 0.05,
        isDefault: true,
        coatings: [
          { id: 'coating_1', name: 'High Gloss UV', priceMultiplier: 1.0, isDefault: true },
          { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 0.95, isDefault: false },
          { id: 'coating_3', name: 'Satin Finish', priceMultiplier: 1.05, isDefault: false },
        ],
        sides: [
          { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
          { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
        ],
      },
      {
        id: 'paper_2',
        name: '100lb Gloss Text',
        description: 'Premium glossy finish for vibrant colors',
        pricePerUnit: 0.04,
        weight: 0.0009,
        pricePerSqInch: 0.04,
        isDefault: false,
        coatings: [
          { id: 'coating_1', name: 'High Gloss UV', priceMultiplier: 1.0, isDefault: true },
          { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 0.95, isDefault: false },
        ],
        sides: [
          { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
          { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
        ],
      },
      {
        id: 'paper_3',
        name: '80lb Matte Text',
        description: 'Smooth matte finish, no glare',
        pricePerUnit: 0.03,
        weight: 0.0009,
        pricePerSqInch: 0.03,
        isDefault: false,
        coatings: [
          { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 1.0, isDefault: true },
          { id: 'coating_4', name: 'No Coating', priceMultiplier: 0.9, isDefault: false },
        ],
        sides: [
          { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
          { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
        ],
      },
    ]
  }

  private getFallbackTurnaroundTimes(): TurnaroundOption[] {
    return [
      {
        id: 'turnaround_1',
        name: 'Economy',
        displayName: 'Economy (2-4 Days)',
        description: 'Standard processing time',
        daysMin: 2,
        daysMax: 4,
        pricingModel: 'FLAT',
        basePrice: 0,
        priceMultiplier: 1.0,
        requiresNoCoating: false,
        restrictedCoatings: [],
        isDefault: true,
      },
      {
        id: 'turnaround_2',
        name: 'Fast',
        displayName: 'Fast (1-2 Days)',
        description: 'Expedited processing',
        daysMin: 1,
        daysMax: 2,
        pricingModel: 'PERCENTAGE',
        basePrice: 0,
        priceMultiplier: 1.25,
        requiresNoCoating: false,
        restrictedCoatings: [],
        isDefault: false,
      },
      {
        id: 'turnaround_3',
        name: 'Faster',
        displayName: 'Faster (Tomorrow)',
        description: 'Next day delivery',
        daysMin: 1,
        daysMax: 1,
        pricingModel: 'PERCENTAGE',
        basePrice: 0,
        priceMultiplier: 1.54,
        requiresNoCoating: false,
        restrictedCoatings: [],
        isDefault: false,
      },
      {
        id: 'turnaround_4',
        name: 'Fastest',
        displayName: 'Fastest WITH NO COATING (Today)',
        description: 'Same day processing without coating',
        daysMin: 0,
        daysMax: 0,
        pricingModel: 'PERCENTAGE',
        basePrice: 0,
        priceMultiplier: 4.98,
        requiresNoCoating: true,
        restrictedCoatings: ['coating_1', 'coating_3'],
        isDefault: false,
      },
    ]
  }

  private getFallbackAddons(): any[] {
    return [
      {
        id: 'addon_1',
        name: 'Rounded Corners',
        description: 'Round the corners of your prints for a professional finish',
        pricingModel: 'FIXED_FEE',
        price: 15.0,
        priceDisplay: '$15',
        isDefault: false,
        additionalTurnaroundDays: 1,
      },
      {
        id: 'addon_2',
        name: 'Spot UV Coating',
        description: 'High-gloss UV coating applied to specific areas for enhanced visual impact',
        pricingModel: 'FIXED_FEE',
        price: 25.0,
        priceDisplay: '$25',
        isDefault: false,
        additionalTurnaroundDays: 2,
      },
      {
        id: 'addon_3',
        name: 'Lamination',
        description: 'Protective coating that enhances durability and appearance',
        pricingModel: 'PERCENTAGE',
        price: 0.15,
        priceDisplay: '15%',
        isDefault: false,
        additionalTurnaroundDays: 1,
      },
      {
        id: 'addon_4',
        name: 'Die Cutting',
        description: 'Custom shape cutting for unique designs',
        pricingModel: 'FIXED_FEE',
        price: 35.0,
        priceDisplay: '$35',
        isDefault: false,
        additionalTurnaroundDays: 2,
      },
      {
        id: 'addon_5',
        name: 'Foil Stamping',
        description: 'Metallic foil accents for premium appearance',
        pricingModel: 'PERCENTAGE',
        price: 0.2,
        priceDisplay: '20%',
        isDefault: false,
        additionalTurnaroundDays: 3,
      },
    ]
  }
}
