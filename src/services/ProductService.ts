import { PrismaClient } from '@prisma/client'
import { cache } from 'react'

// Service layer for product-related business operations
export class ProductService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Get product with complete configuration data
  async getProductWithConfiguration(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
        },
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: {
                      include: {
                        paperStockCoatings: {
                          include: { coating: true },
                        },
                        paperStockSides: {
                          include: { sidesOption: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        productQuantityGroups: {
          include: { quantityGroup: true },
        },
        productSizeGroups: {
          include: { sizeGroup: true },
        },
        productTurnaroundTimeSets: {
          include: {
            turnaroundTimeSet: {
              include: {
                turnaroundTimeItems: {
                  include: { turnaroundTime: true },
                },
              },
            },
          },
        },
        productAddonSets: {
          include: {
            addonSet: {
              include: {
                addonItems: {
                  include: { addon: true },
                },
              },
            },
          },
        },
      },
    })
  }

  // Get simplified configuration data for product
  async getProductConfiguration(productId: string) {
    const product = await this.getProductWithConfiguration(productId)
    if (!product) return null

    // Transform to simplified configuration format
    return {
      quantities: this.transformQuantities(product.productQuantityGroups),
      sizes: this.transformSizes(product.productSizeGroups),
      paperStocks: this.transformPaperStocks(product.productPaperStockSets),
      turnaroundTimes: this.transformTurnaroundTimes(product.productTurnaroundTimeSets),
      addons: this.transformAddons(product.productAddonSets),
      defaults: this.getDefaults(product),
    }
  }

  // Business logic for price calculation
  calculatePrice(config: any, product: any): number {
    // Centralized pricing logic that can be tested and reused
    let totalPrice = product.basePrice || 0

    // Add paper costs
    if (config.paper && config.size && config.quantity) {
      const paperCost = this.calculatePaperCost(config)
      totalPrice += paperCost
    }

    // Add addon costs
    if (config.selectedAddons?.length > 0) {
      const addonCost = this.calculateAddonCosts(config)
      totalPrice += addonCost
    }

    // Apply turnaround multipliers
    if (config.turnaround) {
      totalPrice = this.applyTurnaroundMultiplier(totalPrice, config.turnaround)
    }

    // Add setup fee
    totalPrice += product.setupFee || 0

    return Math.max(0, totalPrice)
  }

  // Private transformation methods
  private transformQuantities(quantityGroups: any[]) {
    const group = quantityGroups[0]?.quantityGroup
    if (!group) return []

    try {
      const values = JSON.parse(group.values)
      return values.map((value: any, index: number) => ({
        id: `qty_${index}`,
        value: typeof value === 'object' ? value.value : value,
        label: typeof value === 'object' ? value.label : `${value}`,
        isCustom: typeof value === 'object' ? value.isCustom : false,
        customMin: typeof value === 'object' ? value.customMin : undefined,
        customMax: typeof value === 'object' ? value.customMax : undefined,
      }))
    } catch {
      return []
    }
  }

  private transformSizes(sizeGroups: any[]) {
    const group = sizeGroups[0]?.sizeGroup
    if (!group) return []

    try {
      const values = JSON.parse(group.values)
      return values.map((value: any, index: number) => ({
        id: `size_${index}`,
        name: value.name || `Size ${index + 1}`,
        displayName: value.displayName || value.name || `Size ${index + 1}`,
        width: value.width || null,
        height: value.height || null,
        squareInches: value.squareInches || (value.width && value.height ? value.width * value.height : null),
        priceMultiplier: value.priceMultiplier || 1,
        isDefault: value.isDefault || index === 0,
        isCustom: value.isCustom || false,
        customMinWidth: value.customMinWidth || null,
        customMaxWidth: value.customMaxWidth || null,
        customMinHeight: value.customMinHeight || null,
        customMaxHeight: value.customMaxHeight || null,
      }))
    } catch {
      return []
    }
  }

  private transformPaperStocks(paperStockSets: any[]) {
    const items = paperStockSets[0]?.paperStockSet?.paperStockItems || []
    return items.map((item: any) => ({
      id: item.paperStock.id,
      name: item.paperStock.name,
      description: item.paperStock.description,
      pricePerUnit: item.paperStock.pricePerSqInch || 0,
      coatings: item.paperStock.paperStockCoatings.map((coating: any) => ({
        id: coating.coating.id,
        name: coating.coating.name,
        priceMultiplier: coating.priceMultiplier || 1,
        isDefault: coating.isDefault || false,
      })),
      sides: item.paperStock.paperStockSides.map((side: any) => ({
        id: side.sidesOption.id,
        name: side.sidesOption.name,
        priceMultiplier: side.priceMultiplier || 1,
        isDefault: side.isDefault || false,
      })),
    }))
  }

  private transformTurnaroundTimes(turnaroundSets: any[]) {
    const items = turnaroundSets[0]?.turnaroundTimeSet?.turnaroundTimeItems || []
    return items.map((item: any) => ({
      id: item.turnaroundTime.id,
      name: item.turnaroundTime.name,
      displayName: item.turnaroundTime.displayName || item.turnaroundTime.name,
      description: item.turnaroundTime.description,
      daysMin: item.turnaroundTime.daysMin,
      daysMax: item.turnaroundTime.daysMax,
      pricingModel: item.turnaroundTime.pricingModel || 'FLAT',
      basePrice: item.turnaroundTime.basePrice || 0,
      priceMultiplier: item.turnaroundTime.priceMultiplier || 1,
      requiresNoCoating: item.turnaroundTime.requiresNoCoating || false,
      restrictedCoatings: item.turnaroundTime.restrictedCoatings || [],
      isDefault: item.isDefault || false,
    }))
  }

  private transformAddons(addonSets: any[]) {
    const items = addonSets[0]?.addonSet?.addonItems || []
    return items.map((item: any) => ({
      id: item.addon.id,
      name: item.addon.name,
      description: item.addon.description,
      pricingModel: item.addon.pricingModel || 'FIXED_FEE',
      price: item.addon.price || 0,
      priceDisplay: item.addon.priceDisplay || `$${item.addon.price}`,
      isDefault: item.isDefault || false,
      additionalTurnaroundDays: item.addon.additionalTurnaroundDays || 0,
      configuration: item.addon.configuration,
    }))
  }

  private getDefaults(product: any) {
    return {
      quantity: product.productQuantityGroups[0]?.quantityGroup?.defaultValue || '',
      size: product.productSizeGroups[0]?.sizeGroup?.defaultValue || '',
      paper: product.productPaperStockSets[0]?.paperStockSet?.paperStockItems?.[0]?.paperStock?.id || '',
      coating: '',
      sides: '',
      turnaround: product.productTurnaroundTimeSets[0]?.turnaroundTimeSet?.turnaroundTimeItems?.[0]?.turnaroundTime?.id || '',
      addons: [],
    }
  }

  private calculatePaperCost(config: any): number {
    // Implement paper cost calculation logic
    return 0
  }

  private calculateAddonCosts(config: any): number {
    // Implement addon cost calculation logic
    return 0
  }

  private applyTurnaroundMultiplier(price: number, turnaroundId: string): number {
    // Implement turnaround multiplier logic
    return price
  }
}

// Create cached instance for performance
export const createProductService = cache((prisma: PrismaClient) => {
  return new ProductService(prisma)
})