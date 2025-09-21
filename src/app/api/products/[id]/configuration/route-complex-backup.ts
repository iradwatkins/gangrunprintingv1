import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFallbackConfig } from '@/lib/config-fallback'

// Cache configuration data for 30 minutes (increased from 5)
const configCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Track consecutive failures for circuit breaker pattern
const failureCount = new Map<string, number>()
const FAILURE_THRESHOLD = 3
const CIRCUIT_RESET_TIME = 60000 // 1 minute
const lastFailureTime = new Map<string, number>()

// Simple retry with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 100
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retry attempts reached')
}

// GET /api/products/[id]/configuration - Get all configuration options for a product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const dbConnected = false

  try {
    const productId = params.id

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Check cache first - this is critical for reducing database load
    const cached = configCache.get(productId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Config API] Cache hit for ${productId}`)
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      })
    }

    // Circuit breaker pattern - if too many failures, return fallback immediately
    const failures = failureCount.get(productId) || 0
    const lastFailure = lastFailureTime.get(productId) || 0
    const timeSinceLastFailure = Date.now() - lastFailure

    if (failures >= FAILURE_THRESHOLD && timeSinceLastFailure < CIRCUIT_RESET_TIME) {
      console.log(`[Config API] Circuit breaker active for ${productId}`)
      const fallbackConfig = getFallbackConfig(productId)

      // Cache the fallback for a short time
      configCache.set(productId, {
        data: fallbackConfig,
        timestamp: Date.now(),
      })

      return NextResponse.json(fallbackConfig, {
        status: 200,
        headers: {
          'X-Cache': 'CIRCUIT-BREAKER',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      })
    }

    // Reset failure count if enough time has passed
    if (timeSinceLastFailure > CIRCUIT_RESET_TIME) {
      failureCount.delete(productId)
      lastFailureTime.delete(productId)
    }

    // Use optimized queries with selective loading
    // First, check if product exists and is active with retry
    const productExists = await retryOperation(
      async () => {
        return await prisma.product.findFirst({
          where: {
            id: productId,
            isActive: true,
          },
          select: {
            id: true,
          },
        })
      },
      2,
      50
    ) // Fewer retries for initial check

    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch configuration data using parallel queries for better performance with retry
    const [productData, paperStockData, quantityData, sizeData] = await retryOperation(
      async () => {
        return await Promise.all([
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
              PaperStockSet: {
                select: {
                  PaperStockSetItem: {
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
      },
      3,
      100
    ) // 3 attempts with 100ms base delay

    // Get paper stock IDs for coating and sides data
    const paperStockIds = paperStockData
      .flatMap((psd) => psd.paperStockSet?.paperStockItems || [])
      .map((item) => item.paperStock.id)
      .filter(Boolean)

    // Fetch coatings and sides separately to avoid deep nesting with retry
    const [coatingsData, sidesData] = await retryOperation(
      async () => {
        return await Promise.all([
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
      },
      3,
      100
    ) // 3 attempts with 100ms base delay

    // Reorganize data into the expected format
    const product = {
      ...productData,
      productPaperStockSets: paperStockData.map((psd) => ({
        PaperStockSet: {
          PaperStockSetItem:
            psd.paperStockSet?.paperStockItems.map((item) => ({
              ...item,
              paperStock: {
                ...item.paperStock,
                paperStockCoatings: coatingsData.filter(
                  (c) => c.paperStockId === item.paperStock.id
                ),
                paperStockSides: sidesData.filter((s) => s.paperStockId === item.paperStock.id),
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
        .map((v) => v.trim())
        .filter((v) => v && v !== 'custom')
        .map((v) => parseInt(v))
        .filter((v) => !isNaN(v))

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
        .map((v) => v.trim())
        .filter((v) => v && v !== 'custom')

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

      paperStockSet.paperStockItems.forEach((item) => {
        paperStocks.push({
          id: item.paperStock.id,
          name: item.paperStock.name,
          weight: item.paperStock.weight,
          pricePerSqInch: item.paperStock.pricePerSqInch,
          tooltipText: item.paperStock.tooltipText || undefined,
          paperStockCoatings: item.paperStock.paperStockCoatings.map((psc) => ({
            coatingId: psc.coatingId,
            isDefault: psc.isDefault,
            coating: {
              id: psc.coating.id,
              name: psc.coating.name,
            },
          })),
          paperStockSides: item.paperStock.paperStockSides.map((pss) => ({
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
      paper:
        paperStocks.find(
          (p) =>
            product.productPaperStockSets[0]?.paperStockSet?.paperStockItems.find(
              (item) => item.paperStock.id === p.id
            )?.isDefault
        )?.id ||
        paperStocks[0]?.id ||
        '',
      coating: '',
      sides: '',
    }

    // Set default coating and sides based on default paper
    if (defaults.paper) {
      const defaultPaper = paperStocks.find((p) => p.id === defaults.paper)
      if (defaultPaper) {
        const defaultCoating = defaultPaper.paperStockCoatings.find((c) => c.isDefault)
        defaults.coating =
          defaultCoating?.coatingId || defaultPaper.paperStockCoatings[0]?.coatingId || ''

        const firstEnabledSide = defaultPaper.paperStockSides.find((s) => s.isEnabled)
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
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-DB-Connected': 'true',
      },
    })
  } catch (error) {
    console.error('Error fetching product configuration:', error)

    // Track failures for circuit breaker
    const currentFailures = failureCount.get(params.id) || 0
    failureCount.set(params.id, currentFailures + 1)
    lastFailureTime.set(params.id, Date.now())

    // Check for specific Prisma errors
    if (error instanceof Error) {
      // Connection pool exhaustion or timeout errors
      if (
        error.message.includes('P2024') ||
        error.message.includes('connect ETIMEDOUT') ||
        error.message.includes('Connection pool timeout') ||
        error.message.includes('P2028')
      ) {
        console.error('Database connection pool issue:', error.message)

        // Return fallback immediately for database connection issues
        const fallbackConfig = getFallbackConfig(params.id)
        configCache.set(params.id, {
          data: fallbackConfig,
          timestamp: Date.now(),
        })

        return NextResponse.json(fallbackConfig, {
          status: 200,
          headers: {
            'X-Cache': 'DB-ERROR-FALLBACK',
            'X-Error': 'Database temporarily unavailable, using fallback',
            'X-Response-Time': `${Date.now() - startTime}ms`,
          },
        })
      }

      if (error.message.includes('P2002')) {
        return NextResponse.json({ error: 'Database constraint violation' }, { status: 400 })
      }
      if (error.message.includes('P2025')) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 })
      }

      // Log the full error in production for debugging
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        productId: params.id,
        timestamp: new Date().toISOString(),
      })
    }

    // Return cached data if available during errors
    const fallbackCache = configCache.get(params.id)
    if (fallbackCache) {
      console.log('[Config API] Returning stale cache due to error')
      return NextResponse.json(fallbackCache.data, {
        status: 200,
        headers: {
          'X-Cache': 'STALE',
          'X-Error': 'Database error, returning cached data',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      })
    }

    // Use static fallback configuration as last resort
    console.log('[Config API] Using static fallback configuration')
    const fallbackConfig = getFallbackConfig(params.id)

    // Cache the fallback for a short time to prevent repeated failures
    configCache.set(params.id, {
      data: fallbackConfig,
      timestamp: Date.now(),
    })

    return NextResponse.json(fallbackConfig, {
      status: 200,
      headers: {
        'X-Cache': 'FALLBACK',
        'X-Error': 'Using fallback configuration',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  }
}
