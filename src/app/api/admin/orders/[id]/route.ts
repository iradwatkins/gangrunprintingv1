import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { logBusinessEvent, logError } from '@/lib/logger-safe'

/**
 * PATCH /api/admin/orders/[id]
 * Update order details (status, email, shipping address, tracking, etc.)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin user
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, status: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Build update object
    const updateData: any = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.email !== undefined) updateData.email = body.email
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber
    if (body.carrier !== undefined) updateData.carrier = body.carrier
    if (body.shippingAddress !== undefined) updateData.shippingAddress = body.shippingAddress
    if (body.billingAddress !== undefined) updateData.billingAddress = body.billingAddress

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        User: true,
        OrderItem: {
          include: {
            OrderItemAddOn: {
              include: {
                AddOn: true,
              },
            },
          },
        },
      },
    })

    // Log business event
    logBusinessEvent('order_updated', {
      orderId: id,
      orderNumber: existingOrder.orderNumber,
      updatedBy: user.id,
      changes: Object.keys(updateData),
    })

    // Create status history entry if status changed
    if (body.status && body.status !== existingOrder.status) {
      await prisma.statusHistory.create({
        data: {
          id: `sh_${randomBytes(16).toString('hex')}`,
          orderId: id,
          toStatus: body.status,
          fromStatus: existingOrder.status as any,
          changedBy: user.id,
          notes: body.adminNotes || `Status changed from ${existingOrder.status} to ${body.status}`,
        },
      })

      logBusinessEvent('order_status_changed', {
        orderId: id,
        orderNumber: existingOrder.orderNumber,
        fromStatus: existingOrder.status,
        toStatus: body.status,
        changedBy: user.id,
      })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    logError(error as Error, {
      operation: 'update_order',
      orderId: (await context.params).id,
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order' },
      { status: 500 }
    )
  }
}
