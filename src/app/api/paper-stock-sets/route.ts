import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating/updating a paper stock set
const paperStockSetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  paperStocks: z.array(z.object({
    id: z.string(),
    isDefault: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0)
  })).optional()
})

// GET - List all paper stock sets
export async function GET() {
  try {
    const groups = await prisma.paperStockSet.findMany({
      include: {
        paperStockItems: {
          include: {
            paperStock: {
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
                }
              }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching paper stock sets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper stock sets' },
      { status: 500 }
    )
  }
}

// POST - Create a new paper stock set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = paperStockSetSchema.parse(body)

    // Check if name already exists
    const existingGroup = await prisma.paperStockSet.findUnique({
      where: { name: validatedData.name }
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A paper stock set with this name already exists' },
        { status: 400 }
      )
    }

    // Ensure at least one paper stock is marked as default
    let paperStocksWithDefault = validatedData.paperStocks || []
    if (paperStocksWithDefault.length > 0) {
      const hasDefault = paperStocksWithDefault.some(stock => stock.isDefault)
      if (!hasDefault) {
        // If no default is set, make the first one default
        paperStocksWithDefault[0].isDefault = true
      }
    }

    // Create the paper stock set with items
    const group = await prisma.paperStockSet.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
        isActive: validatedData.isActive,
        paperStockItems: {
          create: paperStocksWithDefault.map((stock, index) => ({
            paperStockId: stock.id,
            isDefault: stock.isDefault,
            sortOrder: stock.sortOrder || index
          }))
        }
      },
      include: {
        paperStockItems: {
          include: {
            paperStock: {
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
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating paper stock set:', error)
    return NextResponse.json(
      { error: 'Failed to create paper stock set' },
      { status: 500 }
    )
  }
}