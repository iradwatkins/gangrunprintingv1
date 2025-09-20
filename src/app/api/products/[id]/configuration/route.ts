import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { transformSizeGroup } from '@/lib/utils/size-transformer'

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

// GET /api/products/[id]/configuration - Fetch turnaround times from database
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Try to fetch quantities from database
    let quantities = SIMPLE_CONFIG.quantities // Default fallback

    try {
      // Fetch the Basic Gangrun Price quantity group
      console.log('[Config API] Fetching Basic Gangrun Price quantity group...')
      const quantityData = await prisma.quantityGroup.findFirst({
        where: {
          name: 'Basic Gangrun Price',
          isActive: true,
        },
      })

      if (quantityData) {
        console.log('[Config API] Found quantity data:', quantityData.name, 'with values:', quantityData.values)
        quantities = transformQuantityValues(quantityData)
        console.log('[Config API] Transformed quantities count:', quantities.length)
      } else {
        console.log('[Config API] No Basic Gangrun Price quantity group found')
      }
    } catch (dbError) {
      console.error('[Config API] Database error fetching quantities:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch sizes from database
    let sizes = SIMPLE_CONFIG.sizes // Default fallback

    try {
      // Fetch Business Card Sizes or any available size group
      console.log('[Config API] Fetching size groups...')
      const sizeData = await prisma.sizeGroup.findFirst({
        where: {
          OR: [
            { name: 'Business Card Sizes' },
            { isActive: true }
          ]
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })

      if (sizeData) {
        console.log('[Config API] Found size data:', sizeData.name, 'with values:', sizeData.values)
        sizes = transformSizeGroup(sizeData)
        console.log('[Config API] Transformed sizes count:', sizes.length)
      } else {
        console.log('[Config API] No size groups found')
      }
    } catch (dbError) {
      console.error('[Config API] Database error fetching sizes:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch add-ons from addon sets for this product
    let addons = SIMPLE_CONFIG.addons // Default fallback
    let addonsGrouped = {
      aboveDropdown: [],
      inDropdown: [],
      belowDropdown: []
    }

    try {
      console.log('[Config API] Fetching add-ons from addon sets...')

      // Get addon sets for this product
      const productAddOnSets = await prisma.productAddOnSet.findMany({
        where: {
          productId,
        },
        include: {
          addOnSet: {
            include: {
              addOnSetItems: {
                include: {
                  addOn: true,
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
        console.log('[Config API] Found', productAddOnSets.length, 'addon sets for product')

        const allAddons: any[] = []
        const aboveDropdown: any[] = []
        const inDropdown: any[] = []
        const belowDropdown: any[] = []

        // Process each addon set
        for (const productAddOnSet of productAddOnSets) {
          for (const setItem of productAddOnSet.addOnSet.addOnSetItems) {
            const addon = setItem.addOn

            // Format addon data
            const formattedAddon = {
              id: addon.id,
              name: addon.name,
              description: addon.description || '',
              pricingModel: addon.pricingModel,
              configuration: addon.configuration || {},
              isDefault: setItem.isDefault,
              additionalTurnaroundDays: addon.additionalTurnaroundDays || 0,
              displayPosition: setItem.displayPosition,
            }

            // Handle pricing display
            let priceDisplay = ''
            let price = 0

            const config = addon.configuration as any
            if (config) {
              if (config.displayPrice) {
                priceDisplay = config.displayPrice
              } else if (config.price !== undefined) {
                price = config.price
                priceDisplay = `$${config.price}`
              } else if (config.basePrice !== undefined) {
                price = config.basePrice
                priceDisplay = `$${config.basePrice}`
              } else if (config.percentage !== undefined) {
                price = config.percentage
                priceDisplay = `${config.percentage}%`
              } else if (config.pricePerUnit !== undefined) {
                price = config.pricePerUnit
                priceDisplay = `$${config.pricePerUnit}/pc`
              }
            }

            formattedAddon.price = price
            formattedAddon.priceDisplay = priceDisplay

            // Add to appropriate groups
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

            allAddons.push(formattedAddon)
          }
        }

        addons = allAddons
        addonsGrouped = {
          aboveDropdown,
          inDropdown,
          belowDropdown
        }

        console.log('[Config API] Grouped addons:', {
          above: aboveDropdown.length,
          in: inDropdown.length,
          below: belowDropdown.length
        })

      } else {
        console.log('[Config API] No addon sets found for product, using fallback')
      }
    } catch (dbError) {
      console.error('[Config API] Database error fetching addon sets:', dbError)
      // Continue with hardcoded fallback
    }

    // Try to fetch turnaround times from database
    let turnaroundTimes = SIMPLE_CONFIG.turnaroundTimes // Default fallback

    try {
      // Fetch the default turnaround time set for this product
      const productTurnaroundTimeSet = await prisma.productTurnaroundTimeSet.findFirst({
        where: {
          productId,
          isDefault: true,
        },
        include: {
          turnaroundTimeSet: {
            include: {
              turnaroundTimeItems: {
                include: {
                  turnaroundTime: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
      })

      // If no default set, try to get any assigned set
      const assignedSet =
        productTurnaroundTimeSet ||
        (await prisma.productTurnaroundTimeSet.findFirst({
          where: { productId },
          include: {
            turnaroundTimeSet: {
              include: {
                turnaroundTimeItems: {
                  include: {
                    turnaroundTime: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        }))

      if (assignedSet?.turnaroundTimeSet?.turnaroundTimeItems) {
        // Map the database turnaround times to the API format
        turnaroundTimes = assignedSet.turnaroundTimeSet.turnaroundTimeItems.map((item, index) => {
          const tt = item.turnaroundTime
          return {
            id: `turnaround_${index + 1}`,
            name: tt.name,
            displayName: tt.displayName,
            description: tt.description || '',
            daysMin: tt.daysMin,
            daysMax: tt.daysMax || tt.daysMin,
            pricingModel: tt.pricingModel,
            basePrice: tt.basePrice,
            priceMultiplier: tt.priceMultiplier,
            requiresNoCoating: tt.requiresNoCoating,
            restrictedCoatings: tt.restrictedCoatings || [],
            isDefault: item.isDefault || index === 0, // First one is default if none specified
          }
        })

        console.log(
          `[Config API] Loaded ${turnaroundTimes.length} turnaround times from set "${assignedSet.turnaroundTimeSet.name}" for product: ${productId}`
        )
      } else {
        console.log(
          `[Config API] No turnaround time set assigned, using default hardcoded values for product: ${productId}`
        )
      }
    } catch (dbError) {
      console.error('[Config API] Database error fetching turnaround times:', dbError)
      // Continue with hardcoded fallback
    }

    // Build the configuration object with dynamic quantities, sizes, addons and turnaround times
    const config = {
      ...SIMPLE_CONFIG,
      quantities,
      sizes,
      addons,
      addonsGrouped,
      turnaroundTimes,
    }

    // Update the defaults for quantities, sizes and turnaround times
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

    if (turnaroundTimes.length > 0) {
      const defaultTurnaround = turnaroundTimes.find((t) => t.isDefault) || turnaroundTimes[0]
      updatedDefaults.turnaround = defaultTurnaround.id
    }

    config.defaults = updatedDefaults

    // Fetch AddOn Sets for this product
    let addonsGrouped = null
    try {
      console.log('[Config API] Fetching AddOn Sets for product:', productId)

      const productAddOnSets = await prisma.productAddOnSet.findMany({
        where: {
          productId: productId,
        },
        include: {
          addOnSet: {
            include: {
              addOnSetItems: {
                include: {
                  addOn: true,
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
        // Use the first (default) addon set
        const defaultAddOnSet = productAddOnSets[0].addOnSet

        // Group addons by display position
        const aboveDropdown: any[] = []
        const inDropdown: any[] = []
        const belowDropdown: any[] = []

        defaultAddOnSet.addOnSetItems.forEach((item) => {
          const addon = {
            id: item.addOn.id,
            name: item.addOn.name,
            description: item.addOn.description,
            pricingModel: item.addOn.pricingModel,
            price: item.addOn.price ? parseFloat(item.addOn.price.toString()) : undefined,
            priceDisplay: item.addOn.priceDisplay,
            configuration: item.addOn.configuration,
            isDefault: item.isDefault,
            additionalTurnaroundDays: item.addOn.additionalTurnaroundDays,
          }

          switch (item.displayPosition) {
            case 'ABOVE_DROPDOWN':
              aboveDropdown.push(addon)
              break
            case 'BELOW_DROPDOWN':
              belowDropdown.push(addon)
              break
            case 'IN_DROPDOWN':
            default:
              inDropdown.push(addon)
              break
          }
        })

        addonsGrouped = {
          aboveDropdown,
          inDropdown,
          belowDropdown,
        }

        console.log('[Config API] AddOn Sets found:', {
          setName: defaultAddOnSet.name,
          totalItems: defaultAddOnSet.addOnSetItems.length,
          aboveDropdown: aboveDropdown.length,
          inDropdown: inDropdown.length,
          belowDropdown: belowDropdown.length,
        })
      } else {
        console.log('[Config API] No AddOn Sets found for product:', productId)
      }
    } catch (addOnError) {
      console.error('[Config API] Error fetching AddOn Sets:', addOnError)
    }

    // Add addonsGrouped to the response
    const responseData = {
      ...config,
      addonsGrouped,
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-API-Version': 'v2-dynamic',
        'X-Product-Id': productId,
      },
    })
  } catch (error) {
    console.error('[Config API] Error:', error)

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
