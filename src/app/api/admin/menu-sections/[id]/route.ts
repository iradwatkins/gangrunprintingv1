import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// PUT /api/admin/menu-sections/[id] - Update menu section
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, column, sortOrder, showTitle, isActive, iconUrl } = body

    const section = await prisma.menuSection.update({
      where: { id: params.id },
      data: {
        title,
        description,
        column,
        sortOrder,
        showTitle,
        isActive,
        iconUrl,
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating menu section:', error)
    return NextResponse.json({ error: 'Failed to update menu section' }, { status: 500 })
  }
}

// DELETE /api/admin/menu-sections/[id] - Delete menu section
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.menuSection.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu section:', error)
    return NextResponse.json({ error: 'Failed to delete menu section' }, { status: 500 })
  }
}
