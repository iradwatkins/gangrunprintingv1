import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// PUT /api/admin/quick-links/[id] - Update quick link
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
    const {
      label,
      linkType,
      linkValue,
      sortOrder,
      isActive,
      iconUrl,
      badgeText,
      badgeColor,
    } = body

    const quickLink = await prisma.quickLink.update({
      where: { id: params.id },
      data: {
        label,
        linkType,
        linkValue,
        sortOrder,
        isActive,
        iconUrl,
        badgeText,
        badgeColor,
      },
    })

    return NextResponse.json(quickLink)
  } catch (error) {
    console.error('Error updating quick link:', error)
    return NextResponse.json({ error: 'Failed to update quick link' }, { status: 500 })
  }
}

// DELETE /api/admin/quick-links/[id] - Delete quick link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.quickLink.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quick link:', error)
    return NextResponse.json({ error: 'Failed to delete quick link' }, { status: 500 })
  }
}
