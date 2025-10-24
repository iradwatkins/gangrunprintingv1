import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// PUT /api/admin/menu-items/[id] - Update menu item
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      label,
      linkType,
      linkValue,
      iconUrl,
      imageUrl,
      sortOrder,
      isActive,
      openInNewTab,
      customClass,
      sectionId,
      parentId,
    } = body

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        label,
        linkType,
        linkValue,
        iconUrl,
        imageUrl,
        sortOrder,
        isActive,
        openInNewTab,
        customClass,
        sectionId,
        parentId,
      },
      include: {
        Children: true,
      },
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

// DELETE /api/admin/menu-items/[id] - Delete menu item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
