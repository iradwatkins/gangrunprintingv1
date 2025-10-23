import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// POST /api/admin/menu-sections - Create new menu section
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      menuId,
      title,
      description,
      column,
      sortOrder,
      showTitle,
      isActive,
      iconUrl,
    } = body

    const section = await prisma.menuSection.create({
      data: {
        menuId,
        title,
        description,
        column: column ?? 1,
        sortOrder: sortOrder ?? 0,
        showTitle: showTitle ?? true,
        isActive: isActive ?? true,
        iconUrl,
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Error creating menu section:', error)
    return NextResponse.json({ error: 'Failed to create menu section' }, { status: 500 })
  }
}

// PUT /api/admin/menu-sections/bulk-update - Bulk update section orders
export async function PUT(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updates } = body // Array of { id, sortOrder, column? }

    // Use transaction for bulk updates
    const results = await prisma.$transaction(
      updates.map((update: any) =>
        prisma.menuSection.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
            column: update.column,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Error bulk updating menu sections:', error)
    return NextResponse.json({ error: 'Failed to update menu sections' }, { status: 500 })
  }
}
