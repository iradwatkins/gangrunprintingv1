import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for reordering items
const reorderSchema = z.object({
  items: z.array(
    z.object({
      paperStockId: z.string(),
      sortOrder: z.number().int().min(0),
    })
  ),
})

// PUT - Reorder paper stocks within a set
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = reorderSchema.parse(body)

    // Check if set exists
    const group = await prisma.paperStockSet.findUnique({
      where: { id: params.id },
    })

    if (!group) {
      return NextResponse.json({ error: 'Paper stock set not found' }, { status: 404 })
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      validatedData.items.map((item) =>
        prisma.paperStockSetItem.update({
          where: {
            paperStockSetId_paperStockId: {
              paperStockSetId: params.id,
              paperStockId: item.paperStockId,
            },
          },
          data: {
            sortOrder: item.sortOrder,
          },
        })
      )
    )

    // Return the updated set
    const updatedGroup = await prisma.paperStockSet.findUnique({
      where: { id: params.id },
      include: {
        PaperStockSetItem: {
          include: {
            PaperStock: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to reorder paper stock set items' }, { status: 500 })
  }
}
