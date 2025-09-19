import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache configuration data for 5 minutes
const configCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// GET /api/products/[id]/configuration - Get all configuration options for a product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = configCache.get(productId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      })
    }

    // Use optimized queries with selective loading
    // First, check if product exists and is active
    const productExists = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch configuration data using parallel queries for better performance
    const [productData, paperStockData, quantityData, sizeData] = await Promise.all([
      // Basic product data
      prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          basePrice: true,
        },
      }),

      // Paper stock data with reduced nesting
      prisma.productPaperStockSet.findMany({
        where: { productId },
        select: {
          paperStockSet: {
            select: {
              paperStockItems: {
                select: {
                  isDefault: true,
                  sortOrder: true,
                  paperStock: {
                    select: {
                      id: true,
                      name: true,
                      weight: true,
                      pricePerSqInch: true,
                      tooltipText: true,
                    },
                  },
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      }),

      // Quantity groups
      prisma.productQuantityGroup.findMany({
        where: { productId },
        select: {
          quantityGroup: {
            select: {
              id: true,
              name: true,
              values: true,
            },
          },
        },
      }),

      // Size groups
      prisma.productSizeGroup.findMany({
        where: { productId },
        select: {
          sizeGroup: {
            select: {
              id: true,
              name: true,
              values: true,
            },
          },
        },
      }),
    ])

    // Get paper stock IDs for coating and sides data
    const paperStockIds = paperStockData
      .flatMap(psd => psd.paperStockSet?.paperStockItems || [])
      .map(item => item.paperStock.id)
      .filter(Boolean)

    // Fetch coatings and sides separately to avoid deep nesting
    const [coatingsData, sidesData] = await Promise.all([
      prisma.paperStockCoating.findMany({
        where: { paperStockId: { in: paperStockIds } },
        select: {
          paperStockId: true,
          coatingId: true,
          isDefault: true,
          coating: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.paperStockSides.findMany({
        where: { paperStockId: { in: paperStockIds } },
        select: {
          paperStockId: true,
          sidesOptionId: true,
          priceMultiplier: true,
          isEnabled: true,
          sidesOption: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    // Reorganize data into the expected format
    const product = {
      ...productData,
      productPaperStockSets: paperStockData.map(psd => ({
        paperStockSet: {
          paperStockItems: psd.paperStockSet?.paperStockItems.map(item => ({
            ...item,
            paperStock: {
              ...item.paperStock,
              paperStockCoatings: coatingsData.filter(c => c.paperStockId === item.paperStock.id),
              paperStockSides: sidesData.filter(s => s.paperStockId === item.paperStock.id),
            },
          })) || [],
        },
      })),
      productQuantityGroups: quantityData,
      productSizeGroups: sizeData,
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Process quantities from quantity groups
    const quantities: Array<{
      id: string
      displayValue: number
      calculationValue: number
    }> = []

    if (product.productQuantityGroups.length > 0) {
      const quantityGroup = product.productQuantityGroups[0].quantityGroup
      const quantityValues = quantityGroup.values
        .split(',')
        .map(v => v.trim())
        .filter(v => v && v !== 'custom')
        .map(v => parseInt(v))
        .filter(v => !isNaN(v))

      quantityValues.forEach((value, index) => {
        quantities.push({
          id: `qty_${index}`,
          displayValue: value,
          calculationValue: value, // Can be modified based on business logic
        })
      })
    }

    // Process sizes from size groups
    const sizes: Array<{
      id: string
      name: string
      displayName: string
      width: number
      height: number
      preCalculatedValue: number
    }> = []

    if (product.productSizeGroups.length > 0) {
      const sizeGroup = product.productSizeGroups[0].sizeGroup
      const sizeValues = sizeGroup.values
        .split(',')
        .map(v => v.trim())
        .filter(v => v && v !== 'custom')

      sizeValues.forEach((sizeValue, index) => {
        // Parse size format like "4x6" or "5x5"
        const sizeParts = sizeValue.toLowerCase().split('x')
        const width = parseFloat(sizeParts[0]) || 0
        const height = parseFloat(sizeParts[1]) || width // Square if only one dimension

        sizes.push({
          id: `size_${index}`,
          name: sizeValue,
          displayName: `${width}″ × ${height}″`,
          width,
          height,
          preCalculatedValue: width * height,
        })
      })
    }

    // Process paper stocks from paper stock sets
    const paperStocks: Array<{
      id: string
      name: string
      weight: number
      pricePerSqInch: number
      tooltipText?: string
      paperStockCoatings: Array<{
        coatingId: string
        isDefault: boolean
        coating: {
          id: string
          name: string
        }
      }>
      paperStockSides: Array<{
        sidesOptionId: string
        priceMultiplier: number
        isEnabled: boolean
        sidesOption: {
          id: string
          name: string
        }
      }>
    }> = []

    if (product.productPaperStockSets.length > 0) {
      const paperStockSet = product.productPaperStockSets[0].paperStockSet

      paperStockSet.paperStockItems.forEach(item => {
        paperStocks.push({
          id: item.paperStock.id,
          name: item.paperStock.name,
          weight: item.paperStock.weight,
          pricePerSqInch: item.paperStock.pricePerSqInch,
          tooltipText: item.paperStock.tooltipText || undefined,
          paperStockCoatings: item.paperStock.paperStockCoatings.map(psc => ({
            coatingId: psc.coatingId,
            isDefault: psc.isDefault,
            coating: {
              id: psc.coating.id,
              name: psc.coating.name,
            },
          })),
          paperStockSides: item.paperStock.paperStockSides.map(pss => ({
            sidesOptionId: pss.sidesOptionId,
            priceMultiplier: pss.priceMultiplier,
            isEnabled: pss.isEnabled,
            sidesOption: {
              id: pss.sidesOption.id,
              name: pss.sidesOption.name,
            },
          })),
        })
      })
    }

    // Determine default values
    const defaults = {
      quantity: quantities[0]?.id || '',
      size: sizes[0]?.id || '',
      paper: paperStocks.find(p =>
        product.productPaperStockSets[0]?.paperStockSet?.paperStockItems
          .find(item => item.paperStock.id === p.id)?.isDefault
      )?.id || paperStocks[0]?.id || '',
      coating: '',
      sides: '',
    }

    // Set default coating and sides based on default paper
    if (defaults.paper) {
      const defaultPaper = paperStocks.find(p => p.id === defaults.paper)
      if (defaultPaper) {
        const defaultCoating = defaultPaper.paperStockCoatings.find(c => c.isDefault)
        defaults.coating = defaultCoating?.coatingId || defaultPaper.paperStockCoatings[0]?.coatingId || ''

        const firstEnabledSide = defaultPaper.paperStockSides.find(s => s.isEnabled)
        defaults.sides = firstEnabledSide?.sidesOptionId || ''
      }
    }

    // Build response
    const configurationData = {
      quantities,
      sizes,
      paperStocks,
      defaults,
    }

    // Cache the result
    configCache.set(productId, {
      data: configurationData,
      timestamp: Date.now(),
    })

    // Clean old cache entries periodically
    if (configCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of configCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          configCache.delete(key)
        }
      }
    }

    return NextResponse.json(configurationData, {
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (error) {
    console.error('Error fetching product configuration:', error)

    // Check for specific Prisma errors
    if (error instanceof Error) {
      // Connection pool exhaustion or timeout errors
      if (error.message.includes('P2024') ||
          error.message.includes('connect ETIMEDOUT') ||
          error.message.includes('Connection pool timeout')) {
        console.error('Database connection pool issue:', error.message)
        return NextResponse.json(
          { error: 'Database connection issue. Please try again.' },
          { status: 503 }
        )
      }

      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'Database constraint violation' },
          { status: 400 }
        )
      }
      if (error.message.includes('P2025')) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        )
      }

      // Log the full error in production for debugging
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        productId: params.id,
        timestamp: new Date().toISOString()
      })
    }

    // Return cached data if available during errors
    const fallbackCache = configCache.get(params.id)
    if (fallbackCache) {
      console.log('Returning stale cache due to error')
      return NextResponse.json(fallbackCache.data, {
        status: 200,
        headers: {
          'X-Cache': 'STALE',
          'X-Error': 'Database error, returning cached data'
        }
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch product configuration. Please try again.' },
      { status: 500 }
    )
  }
}