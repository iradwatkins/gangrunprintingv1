import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// POST /api/admin/menu-items - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      menuId,
      sectionId,
      parentId,
      label,
      linkType,
      linkValue,
      iconUrl,
      imageUrl,
      sortOrder,
      isActive,
      openInNewTab,
      customClass,
    } = body

    const menuItem = await prisma.menuItem.create({
      data: {
        menuId,
        sectionId,
        parentId,
        label,
        linkType,
        linkValue,
        iconUrl,
        imageUrl,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        openInNewTab: openInNewTab ?? false,
        customClass,
      },
      include: {
        Children: true,
      },
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

// PUT /api/admin/menu-items/bulk-update - Bulk update sort orders (for drag-and-drop)
export async function PUT(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updates } = body // Array of { id, sortOrder, parentId?, sectionId? }

    // Use transaction for bulk updates
    const results = await prisma.$transaction(
      updates.map((update: any) =>
        prisma.menuItem.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
            parentId: update.parentId,
            sectionId: update.sectionId,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Error bulk updating menu items:', error)
    return NextResponse.json({ error: 'Failed to update menu items' }, { status: 500 })
  }
}
