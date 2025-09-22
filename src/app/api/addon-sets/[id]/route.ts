import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// GET /api/addon-sets/[id] - Get a specific addon set
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Addon set ID is required' }, { status: 400 })
    }

    const addOnSet = await prisma.addOnSet.findUnique({
      where: { id },
      include: {
        addOnSetItems: {
          include: {
            AddOn: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        productAddOnSets: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            addOnSetItems: true,
            productAddOnSets: true,
          },
        },
      },
    })

    if (!addOnSet) {
      return NextResponse.json({ error: 'Addon set not found' }, { status: 404 })
    }

    return NextResponse.json(addOnSet)
  } catch (error) {
    console.error('Error fetching addon set:', error)
    return NextResponse.json({ error: 'Failed to fetch addon set' }, { status: 500 })
  }
}

// PUT /api/addon-sets/[id] - Update a specific addon set
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, isActive, addOnItems } = body

    if (!id) {
      return NextResponse.json({ error: 'Addon set ID is required' }, { status: 400 })
    }

    // Start a transaction to update addon set and items
    const result = await prisma.$transaction(async (tx) => {
      // Update the addon set
      const updatedAddOnSet = await tx.addOnSet.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        },
      })

      // If addOnItems provided, update the items
      if (addOnItems) {
        // Delete existing items
        await tx.addOnSetItem.deleteMany({
          where: { addOnSetId: id },
        })

        // Create new items
        if (addOnItems.length > 0) {
          await tx.addOnSetItem.createMany({
            data: addOnItems.map((item: any, index: number) => ({
              id: uuidv4(),
              addOnSetId: id,
              addOnId: item.addOnId,
              displayPosition: item.displayPosition || 'IN_DROPDOWN',
              isDefault: item.isDefault || false,
              sortOrder: item.sortOrder ?? index,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          })
        }
      }

      // Return the complete updated addon set
      return await tx.addOnSet.findUnique({
        where: { id },
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
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating addon set:', error)
    return NextResponse.json({ error: 'Failed to update addon set' }, { status: 500 })
  }
}

// DELETE /api/addon-sets/[id] - Delete a specific addon set
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Addon set ID is required' }, { status: 400 })
    }

    // Check if addon set is in use by products
    const productCount = await prisma.productAddOnSet.count({
      where: { addOnSetId: id },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete addon set. It is currently used by ${productCount} product(s).` },
        { status: 400 }
      )
    }

    // Delete the addon set (cascade will handle items)
    await prisma.addOnSet.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting addon set:', error)
    return NextResponse.json({ error: 'Failed to delete addon set' }, { status: 500 })
  }
}
