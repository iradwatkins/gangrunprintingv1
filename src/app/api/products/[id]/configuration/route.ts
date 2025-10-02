import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma-singleton'
import { transformSizeGroup } from '@/lib/utils/size-transformer'
import {
  transformAddonSets,
  transformLegacyAddons,
  findDefaultAddons,
} from '@/lib/utils/addon-transformer'

// Helper function to calculate price display (from addon-transformer)
function calculatePriceDisplay(addon: any): { price: number; priceDisplay: string } {
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

  // Fallback based on pricing model
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

// Helper function to transform quantity values
function transformQuantityValues(quantityGroup: any) {
  if (!quantityGroup?.values) return []

  const values = quantityGroup.values.split(',').map((v: string) => v.trim())
  const quantities = values.map((value: string, index: number) => {
    // Check if this is the Custom option
    if (value.toLowerCase() === 'custom') {
      return {
        id: `qty_custom`,
        value: null, // Custom has no preset value
        label: 'Custom',
        isCustom: true,
        customMin: quantityGroup.customMin || 55000,
        customMax: quantityGroup.customMax || 100000,
      }
    }

    // Regular quantity option
    const numValue = parseInt(value)
    return {
      id: `qty_${index}`,
      value: numValue,
      label: value,
      isCustom: false,
    }
  })

  return quantities
}

// Dynamic configuration - will be replaced with real data
const SIMPLE_CONFIG = {
  quantities: [], // Will be populated dynamically
  sizes: [
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
  ],
  paperStocks: [
    {
      id: 'paper_1',
      name: '14pt C2S Poster Stock',
      description: 'Heavy coated stock with semi-gloss finish',
      pricePerUnit: 0.05,
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
      coatings: [
        { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 1.0, isDefault: true },
        { id: 'coating_4', name: 'No Coating', priceMultiplier: 0.9, isDefault: false },
      ],
      sides: [
        { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
        { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
      ],
    },
  ],
  addons: [
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
  ],
  turnaroundTimes: [
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
  ],
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

// GET /api/products/[id]/configuration - Optimized with service layer
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch product configuration from database
    // Try to fetch quantities from database using product's linked quantity groups
    let quantities = SIMPLE_CONFIG.quantities // Default fallback

    try {
      // Fetch the product's linked quantity groups
      const productQuantityGroup = await prisma.productQuantityGroup.findFirst({
        where: {
          productId: productId,
        },
        include: {
          QuantityGroup: true,
        },
      })

      if (productQuantityGroup?.QuantityGroup) {
        console.log('[Config API] Found quantity group:', productQuantityGroup.QuantityGroup.name)
        quantities = transformQuantityValues(productQuantityGroup.QuantityGroup)
        console.log('[Config API] Transformed quantities:', quantities.length)
      } else {
        console.log('[Config API] No quantity group found for product:', productId)
      }
    } catch (dbError) {
      console.error('[Config API] Error fetching quantities:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch sizes from database using product's linked size groups
    let sizes = SIMPLE_CONFIG.sizes // Default fallback

    try {
      // Fetch the product's linked size groups
      const productSizeGroup = await prisma.productSizeGroup.findFirst({
        where: {
          productId: productId,
        },
        include: {
          SizeGroup: true,
        },
      })

      if (productSizeGroup?.SizeGroup) {
        sizes = transformSizeGroup(productSizeGroup.SizeGroup)
      }
    } catch (dbError) {
      console.error('[Config API] Error fetching sizes:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch paper stocks from product's linked paper stock sets
    let paperStocks = SIMPLE_CONFIG.paperStocks // Default fallback

    try {
      // Fetch the product's linked paper stock sets
      const productPaperStockSets = await prisma.productPaperStockSet.findMany({
        where: {
          productId: productId,
        },
        include: {
          PaperStockSet: {
            include: {
              PaperStockSetItem: {
                include: {
                  PaperStock: {
                    include: {
                      paperStockCoatings: {
                        include: {
                          CoatingOption: true,
                        },
                      },
                      paperStockSides: {
                        include: {
                          SidesOption: true,
                        },
                      },
                    },
                  },
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
      })

      if (productPaperStockSets.length > 0 && productPaperStockSets[0].PaperStockSet) {
        const paperStockSet = productPaperStockSets[0].PaperStockSet
        paperStocks = paperStockSet.PaperStockSetItem.map((item: any, index: number) => ({
          id: `paper_${index}`,
          name: item.PaperStock.name,
          description: item.PaperStock.description || '',
          pricePerUnit: item.PaperStock.pricePerSqInch || 0.05,
          coatings: item.PaperStock.paperStockCoatings.map((psc: any) => ({
            id: `coating_${psc.CoatingOption.id}`,
            name: psc.CoatingOption.name,
            priceMultiplier: 1.0,
            isDefault: psc.isDefault || false,
          })),
          sides: item.PaperStock.paperStockSides.map((pss: any) => ({
            id: `sides_${pss.SidesOption.id}`,
            name: pss.SidesOption.name,
            priceMultiplier: pss.priceMultiplier || 1.0,
            isDefault: pss.isEnabled || false,
          })),
        }))
        console.log('[Config API] Loaded real paper stocks:', paperStocks.length)
      }
    } catch (dbError) {
      console.error('[Config API] Error fetching paper stocks:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch turnaround times from product's linked turnaround time sets
    let turnaroundTimes = SIMPLE_CONFIG.turnaroundTimes // Default fallback

    try {
      // Fetch the product's linked turnaround time sets
      const productTurnaroundSets = await prisma.productTurnaroundTimeSet.findMany({
        where: {
          productId: productId,
        },
        include: {
          TurnaroundTimeSet: {
            include: {
              TurnaroundTimeSetItem: {
                include: {
                  TurnaroundTime: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
      })

      if (productTurnaroundSets.length > 0 && productTurnaroundSets[0].TurnaroundTimeSet) {
        const turnaroundSet = productTurnaroundSets[0].TurnaroundTimeSet
        turnaroundTimes = turnaroundSet.TurnaroundTimeSetItem.map((item: any, index: number) => ({
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
        console.log('[Config API] Loaded real turnaround times:', turnaroundTimes.length)
      }
    } catch (dbError) {
      console.error('[Config API] Error fetching turnaround times:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch add-ons from addon sets for this product (simplified like sizes)
    let addons = SIMPLE_CONFIG.addons // Default fallback

    try {
      // Get addon sets for this product - simplified like sizes
      const productAddOnSets = await prisma.productAddOnSet.findMany({
        where: {
          productId,
        },
        include: {
          AddOnSet: {
            include: {
              addOnSetItems: {
                include: {
                  AddOn: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      })

      if (productAddOnSets.length > 0) {
        // Transform using the new standardized approach like sizes
        addons = transformAddonSets(productAddOnSets)
      } else {
        // Transform legacy fallback to standardized format
        addons = transformLegacyAddons(SIMPLE_CONFIG.addons)
      }
    } catch (dbError) {
      // Transform legacy fallback to standardized format
      addons = transformLegacyAddons(SIMPLE_CONFIG.addons)
    }

    // Build addonsGrouped for positioning (restore the unique AddOn Set feature)
    let addonsGrouped = {
      aboveDropdown: [],
      inDropdown: [],
      belowDropdown: [],
    }

    try {
      // Get addon sets for this product for positioning
      const productAddOnSetsForGrouping = await prisma.productAddOnSet.findMany({
        where: {
          productId,
        },
        include: {
          AddOnSet: {
            include: {
              addOnSetItems: {
                include: {
                  AddOn: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      })

      if (productAddOnSetsForGrouping.length > 0) {
        const aboveDropdown: any[] = []
        const inDropdown: any[] = []
        const belowDropdown: any[] = []

        // Process each addon set
        for (const productAddOnSet of productAddOnSetsForGrouping) {
          for (const setItem of productAddOnSet.AddOnSet.addOnSetItems) {
            const addon = setItem.AddOn
            const { price, priceDisplay } = calculatePriceDisplay(addon)

            // Format addon data for positioning (keeping legacy format for UI compatibility)
            const formattedAddon = {
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

            // Add to appropriate groups based on displayPosition
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

        addonsGrouped = {
          aboveDropdown,
          inDropdown,
          belowDropdown,
        }
      }
    } catch (groupingError) {
      }

    // Build the configuration object with dynamic quantities, sizes, paper stocks, turnaround times, and addons
    const fallbackConfig = {
      ...SIMPLE_CONFIG,
      quantities,
      sizes,
      paperStocks,
      turnaroundTimes,
      addons,
      addonsGrouped,
    }

    // Update the defaults for quantities, sizes, addons and turnaround times
    const updatedDefaults = { ...SIMPLE_CONFIG.defaults }

    if (quantities.length > 0) {
      // Default to 5000 or the first available quantity
      const defaultQuantity = quantities.find((q) => q.value === 5000) || quantities[0]
      updatedDefaults.quantity = defaultQuantity.id
    }

    if (sizes.length > 0) {
      // Find default size or use first one
      const defaultSize = sizes.find((s) => s.isDefault) || sizes[0]
      updatedDefaults.size = defaultSize.id
    }

    if (addons.length > 0) {
      // Find default addons (multiple selection unlike sizes)
      updatedDefaults.addons = findDefaultAddons(addons)
    }

    if (turnaroundTimes.length > 0) {
      const defaultTurnaround = turnaroundTimes.find((t) => t.isDefault) || turnaroundTimes[0]
      updatedDefaults.turnaround = defaultTurnaround.id
    }

    fallbackConfig.defaults = updatedDefaults

    // Return simplified configuration like sizes and paper stocks
    return NextResponse.json(fallbackConfig, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-API-Version': 'v3-simplified',
        'X-Product-Id': productId,
      },
    })
  } catch (error) {
    // Even on error, return the static config
    return NextResponse.json(SIMPLE_CONFIG, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1-fallback',
      },
    })
  }
}
