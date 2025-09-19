import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Fetch product with all related configuration data
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
      include: {
        // Paper Stock Sets and their items
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: {
                      include: {
                        paperStockCoatings: {
                          include: {
                            coating: true,
                          },
                        },
                        paperStockSides: {
                          include: {
                            sidesOption: true,
                          },
                        },
                      },
                    },
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        // Quantity Groups
        productQuantityGroups: {
          include: {
            quantityGroup: true,
          },
        },
        // Size Groups
        productSizeGroups: {
          include: {
            sizeGroup: true,
          },
        },
      },
    })

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

    return NextResponse.json(configurationData, { status: 200 })
  } catch (error) {
    console.error('Error fetching product configuration:', error)

    // Check for specific Prisma errors
    if (error instanceof Error) {
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
        productId: params.id
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch product configuration' },
      { status: 500 }
    )
  }
}