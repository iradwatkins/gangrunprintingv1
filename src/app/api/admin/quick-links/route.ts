import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/admin/quick-links - List all quick links
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quickLinks = await prisma.quickLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(quickLinks)
  } catch (error) {
    console.error('Error fetching quick links:', error)
    return NextResponse.json({ error: 'Failed to fetch quick links' }, { status: 500 })
  }
}

// POST /api/admin/quick-links - Create new quick link
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { label, linkType, linkValue, sortOrder, isActive, iconUrl, badgeText, badgeColor } = body

    const quickLink = await prisma.quickLink.create({
      data: {
        label,
        linkType,
        linkValue,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        iconUrl,
        badgeText,
        badgeColor,
      },
    })

    return NextResponse.json(quickLink, { status: 201 })
  } catch (error) {
    console.error('Error creating quick link:', error)
    return NextResponse.json({ error: 'Failed to create quick link' }, { status: 500 })
  }
}

// PUT /api/admin/quick-links/bulk-update - Bulk update sort orders
export async function PUT(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updates } = body // Array of { id, sortOrder }

    // Use transaction for bulk updates
    const results = await prisma.$transaction(
      updates.map((update: any) =>
        prisma.quickLink.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Error bulk updating quick links:', error)
    return NextResponse.json({ error: 'Failed to update quick links' }, { status: 500 })
  }
}
