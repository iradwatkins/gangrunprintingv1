/**
 * Order Status Manager - Status CRUD API
 *
 * GET    /api/admin/order-statuses - List all statuses with metadata
 * POST   /api/admin/order-statuses - Create new custom status
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating/updating status
const createStatusSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/i, 'Slug must be alphanumeric with underscores'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  badgeColor: z.string().min(1, 'Badge color is required'),
  isPaid: z.boolean().default(false),
  includeInReports: z.boolean().default(true),
  allowDownloads: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  emailTemplateId: z.string().optional().nullable(),
  sendEmailOnEnter: z.boolean().default(false),
})

/**
 * GET /api/admin/order-statuses
 *
 * List all order statuses with usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all statuses with order counts
    const statuses = await prisma.customOrderStatus.findMany({
      include: {
        EmailTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            TransitionsFrom: true,
            TransitionsTo: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Get order counts for each status
    const orderCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    })

    const orderCountsMap = orderCounts.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    // Combine data
    const statusesWithMetadata = statuses.map((status) => ({
      ...status,
      orderCount: orderCountsMap[status.slug] || 0,
      transitionCount: status._count.TransitionsFrom + status._count.TransitionsTo,
      canDelete: !status.isCore && (orderCountsMap[status.slug] || 0) === 0,
    }))

    return NextResponse.json({
      statuses: statusesWithMetadata,
      total: statuses.length,
      coreCount: statuses.filter((s) => s.isCore).length,
      customCount: statuses.filter((s) => !s.isCore).length,
    })
  } catch (error) {
    console.error('[Order Statuses API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order statuses' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/order-statuses
 *
 * Create a new custom order status
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createStatusSchema.parse(body)

    // Check if slug already exists
    const existingStatus = await prisma.customOrderStatus.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingStatus) {
      return NextResponse.json(
        { error: 'A status with this slug already exists' },
        { status: 400 }
      )
    }

    // Create new status
    const newStatus = await prisma.customOrderStatus.create({
      data: {
        ...validatedData,
        isCore: false, // Custom statuses are never core
        isActive: true,
      },
      include: {
        EmailTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Custom status "${newStatus.name}" created successfully`,
    }, { status: 201 })
  } catch (error) {
    console.error('[Order Statuses API] POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order status' },
      { status: 500 }
    )
  }
}
