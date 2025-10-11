import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(): Promise<unknown> {
  try {
    const paperStocks = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        PaperStockCoating: {
          include: {
            CoatingOption: true,
          },
        },
        PaperStockSides: {
          include: {
            SidesOption: true,
          },
        },
        PaperStockSetItem: true,
      },
    })

    // Get all coating and sides options for comparison
    const allCoatings = await prisma.coatingOption.findMany()
    const allSides = await prisma.sidesOption.findMany()

    // Transform to match the frontend structure
    const transformed = paperStocks.map((stock) => {
      // Map coatings
      const stockCoatingIds = stock.PaperStockCoating.map((sc) => sc.coatingId)
      const coatings = allCoatings.map((coating) => ({
        id: coating.id,
        label: coating.name,
        enabled: stockCoatingIds.includes(coating.id),
      }))

      // Map sides options
      const stockSidesMap = new Map(stock.PaperStockSides.map((ss) => [ss.sidesOptionId, ss]))
      const sidesOptions = allSides.map((side) => {
        const stockSide = stockSidesMap.get(side.id)
        return {
          id: side.id,
          label: side.name,
          enabled: stockSide?.isEnabled || false,
          multiplier: stockSide ? Number(stockSide.priceMultiplier) : 1.0,
        }
      })

      // Find defaults
      const defaultCoating =
        stock.PaperStockCoating.find((c) => c.isDefault)?.coatingId ||
        coatings.find((c) => c.enabled)?.id ||
        allCoatings[0]?.id ||
        ''

      const defaultSides = sidesOptions.find((s) => s.enabled)?.id || allSides[0]?.id || ''

      return {
        id: stock.id,
        name: stock.name,
        weight: stock.weight,
        pricePerSqInch: stock.pricePerSqInch,
        tooltipText: stock.tooltipText,
        isActive: stock.isActive,
        paperStockCoatings: stock.PaperStockCoating.map((pc) => ({
          ...pc,
          coating: pc.CoatingOption, // Transform PascalCase to camelCase for frontend
        })),
        paperStockSides: stock.PaperStockSides.map((ps) => ({
          ...ps,
          sidesOption: ps.SidesOption, // Transform PascalCase to camelCase for frontend
        })),
        productsCount: stock.PaperStockSetItem.length,
      }
    })

    return NextResponse.json(transformed)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch paper stocks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { name, weight, pricePerSqInch, tooltipText, isActive, coatings, sidesOptions } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create the paper stock with relationships
    const paperStock = await prisma.paperStock.create({
      data: {
        id: randomUUID(),
        name,
        weight: weight || 0,
        pricePerSqInch: pricePerSqInch || 0,
        tooltipText: tooltipText || null,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
        // Add coating relationships
        PaperStockCoating: {
          create:
            coatings?.map((c: Record<string, unknown>) => ({
              coatingId: c.id,
              isDefault: c.isDefault || false,
            })) || [],
        },
        // Add sides relationships
        PaperStockSides: {
          create:
            sidesOptions?.map((s: Record<string, unknown>) => ({
              sidesOptionId: s.id,
              priceMultiplier: s.multiplier || 1.0,
              isEnabled: true,
              isDefault: s.isDefault || false,
            })) || [],
        },
      },
      include: {
        PaperStockCoating: {
          include: { CoatingOption: true },
        },
        PaperStockSides: {
          include: { SidesOption: true },
        },
      },
    })

    return NextResponse.json(paperStock, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A paper stock with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create paper stock' }, { status: 500 })
  }
}
