import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/product-categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT /api/product-categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, session } = await validateRequest()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `A category with this ${field} already exists` },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/product-categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, session } = await validateRequest()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if category has products
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category._count.Product > 0) {
      // Soft delete - just deactivate
      const updatedCategory = await prisma.productCategory.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: 'Category deactivated (has products)',
        category: updatedCategory,
      })
    }

    // Hard delete if no products
    await prisma.productCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
