/**
 * Order Status Manager - Individual Status Operations
 *
 * GET    /api/admin/order-statuses/[id] - Get single status with details
 * PATCH  /api/admin/order-statuses/[id] - Update status
 * DELETE /api/admin/order-statuses/[id] - Delete status (with order reassignment)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStatusSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional().nullable(),
  icon: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  badgeColor: z.string().min(1).optional(),
  isPaid: z.boolean().optional(),
  includeInReports: z.boolean().optional(),
  allowDownloads: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  emailTemplateId: z.string().optional().nullable(),
  sendEmailOnEnter: z.boolean().optional(),
})

/**
 * GET /api/admin/order-statuses/[id]
 *
 * Get single status with full details including transitions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const status = await prisma.customOrderStatus.findUnique({
      where: { id },
      include: {
        EmailTemplate: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        TransitionsFrom: {
          include: {
            ToStatus: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
        },
        TransitionsTo: {
          include: {
            FromStatus: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
        },
      },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    // Get order count
    const orderCount = await prisma.order.count({
      where: { status: status.slug },
    })

    return NextResponse.json({
      ...status,
      orderCount,
      canDelete: !status.isCore && orderCount === 0,
    })
  } catch (error) {
    console.error('[Order Status API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/order-statuses/[id]
 *
 * Update an existing order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    // Check if status exists
    const existingStatus = await prisma.customOrderStatus.findUnique({
      where: { id },
    })

    if (!existingStatus) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    // Prevent editing core status properties
    if (existingStatus.isCore) {
      // Only allow certain fields to be updated for core statuses
      const allowedFields = ['description', 'emailTemplateId', 'sendEmailOnEnter', 'sortOrder']
      const hasDisallowedFields = Object.keys(validatedData).some(
        (key) => !allowedFields.includes(key)
      )

      if (hasDisallowedFields) {
        return NextResponse.json(
          { error: 'Cannot modify core properties of system statuses' },
          { status: 400 }
        )
      }
    }

    // Update status
    const updatedStatus = await prisma.customOrderStatus.update({
      where: { id },
      data: validatedData,
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
      status: updatedStatus,
      message: `Status "${updatedStatus.name}" updated successfully`,
    })
  } catch (error) {
    console.error('[Order Status API] PATCH error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/order-statuses/[id]
 *
 * Delete a custom status (requires reassigning orders if any exist)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const reassignToSlug = searchParams.get('reassignTo')

    // Check if status exists
    const status = await prisma.customOrderStatus.findUnique({
      where: { id },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    // Cannot delete core statuses
    if (status.isCore) {
      return NextResponse.json(
        { error: 'Cannot delete system core statuses' },
        { status: 400 }
      )
    }

    // Check if status has orders
    const orderCount = await prisma.order.count({
      where: { status: status.slug },
    })

    if (orderCount > 0) {
      if (!reassignToSlug) {
        return NextResponse.json(
          {
            error: 'Status has active orders',
            orderCount,
            message: 'Please specify a reassignTo status slug to reassign existing orders',
          },
          { status: 400 }
        )
      }

      // Verify reassign target exists
      const reassignStatus = await prisma.customOrderStatus.findUnique({
        where: { slug: reassignToSlug },
      })

      if (!reassignStatus) {
        return NextResponse.json(
          { error: 'Reassignment target status not found' },
          { status: 400 }
        )
      }

      // Reassign orders
      await prisma.order.updateMany({
        where: { status: status.slug },
        data: { status: reassignToSlug },
      })

      // Create status history entries
      const orders = await prisma.order.findMany({
        where: { status: reassignToSlug },
        select: { id: true },
      })

      await prisma.statusHistory.createMany({
        data: orders.map((order) => ({
          orderId: order.id,
          fromStatus: status.slug,
          toStatus: reassignToSlug,
          notes: `Automatic reassignment due to status "${status.name}" deletion`,
          changedBy: user.email || 'System',
        })),
      })
    }

    // Delete status transitions
    await prisma.statusTransition.deleteMany({
      where: {
        OR: [{ fromStatusId: id }, { toStatusId: id }],
      },
    })

    // Delete status
    await prisma.customOrderStatus.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Status "${status.name}" deleted successfully`,
      ordersReassigned: orderCount,
    })
  } catch (error) {
    console.error('[Order Status API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 })
  }
}
