import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/admin/menus/[id] - Get single menu with all items and sections
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menu = await prisma.menu.findUnique({
      where: { id: params.id },
      include: {
        items: {
          where: { parentId: null }, // Only get root level items
          orderBy: { sortOrder: 'asc' },
          include: {
            Children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

// PUT /api/admin/menus/[id] - Update menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, isActive } = body

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: {
        name,
        type,
        description,
        isActive,
      },
      include: {
        items: true,
        sections: true,
      },
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 })
  }
}

// DELETE /api/admin/menus/[id] - Delete menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.menu.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 })
  }
}
