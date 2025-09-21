import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/addon-sets/[id]/clone - Clone an addon set
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!id) {
      return NextResponse.json({ error: 'Addon set ID is required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: 'New name is required' }, { status: 400 })
    }

    // Get the original addon set with items
    const originalAddOnSet = await prisma.addOnSet.findUnique({
      where: { id },
      include: {
        AddOnSetItem: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!originalAddOnSet) {
      return NextResponse.json({ error: 'Addon set not found' }, { status: 404 })
    }

    // Create the cloned addon set
    const clonedAddOnSet = await prisma.$transaction(async (tx) => {
      // Create the new addon set
      const newAddOnSet = await tx.addOnSet.create({
        data: {
          name,
          description: originalAddOnSet.description
            ? `${originalAddOnSet.description} (Copy)`
            : null,
          sortOrder: originalAddOnSet.sortOrder,
          isActive: true,
        },
      })

      // Clone all items
      if (originalAddOnSet.addOnSetItems.length > 0) {
        await tx.addOnSetItem.createMany({
          data: originalAddOnSet.addOnSetItems.map((item) => ({
            addOnSetId: newAddOnSet.id,
            addOnId: item.addOnId,
            displayPosition: item.displayPosition,
            isDefault: item.isDefault,
            sortOrder: item.sortOrder,
          })),
        })
      }

      // Return the complete cloned addon set
      return await tx.addOnSet.findUnique({
        where: { id: newAddOnSet.id },
        include: {
          AddOnSetItem: {
            include: {
              AddOn: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      })
    })

    return NextResponse.json(clonedAddOnSet, { status: 201 })
  } catch (error) {
    console.error('Error cloning addon set:', error)
    return NextResponse.json({ error: 'Failed to clone addon set' }, { status: 500 })
  }
}
