import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// PUT /api/admin/featured-products/[id] - Update featured product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sortOrder,
      isActive,
      customTitle,
      customDescription,
      customImageUrl,
      showBadge,
      badgeText,
      badgeColor,
    } = body

    const featuredProduct = await prisma.featuredProductSelection.update({
      where: { id: params.id },
      data: {
        sortOrder,
        isActive,
        customTitle,
        customDescription,
        customImageUrl,
        showBadge,
        badgeText,
        badgeColor,
      },
      include: {
        Product: {
          include: {
            ProductImage: true,
          },
        },
      },
    })

    return NextResponse.json(featuredProduct)
  } catch (error) {
    console.error('Error updating featured product:', error)
    return NextResponse.json({ error: 'Failed to update featured product' }, { status: 500 })
  }
}

// DELETE /api/admin/featured-products/[id] - Delete featured product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.featuredProductSelection.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting featured product:', error)
    return NextResponse.json({ error: 'Failed to delete featured product' }, { status: 500 })
  }
}
