import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const paperStocks = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: {
          include: {
            coating: true
          }
        },
        paperStockSides: {
          include: {
            sidesOption: true
          }
        },
        productPaperStocks: true
      }
    })

    // Get all coating and sides options for comparison
    const allCoatings = await prisma.coatingOption.findMany()
    const allSides = await prisma.sidesOption.findMany()

    // Transform to match the frontend structure
    const transformed = paperStocks.map(stock => {
      // Map coatings
      const stockCoatingIds = stock.paperStockCoatings.map(sc => sc.coatingId)
      const coatings = allCoatings.map(coating => ({
        id: coating.id,
        label: coating.name,
        enabled: stockCoatingIds.includes(coating.id)
      }))

      // Map sides options
      const stockSidesMap = new Map(
        stock.paperStockSides.map(ss => [ss.sidesOptionId, ss])
      )
      const sidesOptions = allSides.map(side => {
        const stockSide = stockSidesMap.get(side.id)
        return {
          id: side.id,
          label: side.name,
          enabled: stockSide?.isEnabled || false,
          multiplier: stockSide ? Number(stockSide.priceMultiplier) : 1.0
        }
      })

      // Find defaults
      const defaultCoating = stock.paperStockCoatings.find(c => c.isDefault)?.coatingId || 
                             coatings.find(c => c.enabled)?.id || 
                             allCoatings[0]?.id || ''
      
      const defaultSides = allSides.find(s => s.isDefault)?.id || 
                          sidesOptions.find(s => s.enabled)?.id || 
                          allSides[0]?.id || ''

      return {
        id: stock.id,
        name: stock.name,
        basePrice: stock.costPerSheet * 0.00001, // Convert to micro-pricing
        shippingWeight: stock.thickness || 0.5,
        isActive: stock.isActive,
        coatings,
        sidesOptions,
        defaultCoating,
        defaultSides,
        productsCount: stock.productPaperStocks.length
      }
    })

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching paper stocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper stocks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      basePrice, 
      shippingWeight, 
      isActive,
      coatings,
      sidesOptions,
      defaultCoating,
      defaultSides
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create the paper stock with relationships
    const paperStock = await prisma.paperStock.create({
      data: {
        name,
        category: 'Custom',
        weight: `${Math.round(shippingWeight * 100)}lb`,
        finish: 'Custom',
        coating: 'Custom',
        sides: 'Custom',
        costPerSheet: basePrice / 0.00001,
        priceMultiplier: 1.0,
        thickness: shippingWeight,
        isActive: isActive !== undefined ? isActive : true,
        sheetsInStock: 0,
        reorderPoint: 1000,
        reorderQuantity: 5000,
        // Add coating relationships
        paperStockCoatings: {
          create: coatings
            .filter((c: any) => c.enabled)
            .map((c: any) => ({
              coatingId: c.id,
              isDefault: c.id === defaultCoating
            }))
        },
        // Add sides relationships
        paperStockSides: {
          create: sidesOptions
            .filter((s: any) => s.enabled)
            .map((s: any) => ({
              sidesOptionId: s.id,
              priceMultiplier: s.multiplier || 1.0,
              isEnabled: true
            }))
        }
      },
      include: {
        paperStockCoatings: {
          include: { coating: true }
        },
        paperStockSides: {
          include: { sidesOption: true }
        }
      }
    })

    return NextResponse.json(paperStock, { status: 201 })
  } catch (error: any) {
    console.error('Error creating paper stock:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A paper stock with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create paper stock' },
      { status: 500 }
    )
  }
}