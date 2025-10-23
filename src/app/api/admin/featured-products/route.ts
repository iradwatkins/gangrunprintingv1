import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/admin/featured-products - List all featured products
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const featuredProducts = await prisma.featuredProductSelection.findMany({
      include: {
        Product: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
  }
}

// POST /api/admin/featured-products - Create new featured product
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      sortOrder,
      isActive,
      customTitle,
      customDescription,
      customImageUrl,
      showBadge,
      badgeText,
      badgeColor,
    } = body

    const featuredProduct = await prisma.featuredProductSelection.create({
      data: {
        productId,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        customTitle,
        customDescription,
        customImageUrl,
        showBadge: showBadge ?? false,
        badgeText,
        badgeColor,
      },
      include: {
        Product: {
          include: {
            images: true,
          },
        },
      },
    })

    return NextResponse.json(featuredProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating featured product:', error)
    return NextResponse.json({ error: 'Failed to create featured product' }, { status: 500 })
  }
}

// PUT /api/admin/featured-products/bulk-update - Bulk update sort orders
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
        prisma.featuredProductSelection.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Error bulk updating featured products:', error)
    return NextResponse.json({ error: 'Failed to update featured products' }, { status: 500 })
  }
}
