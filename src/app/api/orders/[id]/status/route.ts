/**
 * Order Status Update API
 *
 * Allows admins to update order status with validation
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { OrderService } from '@/lib/services/order-service'
import { prisma } from '@/lib/prisma'
import { type OrderStatus } from '@prisma/client'

interface StatusUpdateRequest {
  toStatus: OrderStatus
  notes?: string
  metadata?: Record<string, unknown>
}

/**
 * PATCH /api/orders/[id]/status
 *
 * Update order status with validation
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await validateRequest()

    // Only admins can update status
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body: StatusUpdateRequest = await request.json()
    const { toStatus, notes, metadata } = body

    if (!toStatus) {
      return NextResponse.json({ error: 'toStatus is required' }, { status: 400 })
    }

    // Get current order
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update status via service
    await OrderService.updateStatus({
      orderId: id,
      fromStatus: order.status,
      toStatus,
      notes,
      changedBy: user.email || 'Admin',
      metadata,
    })

    // Return updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        StatusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('[Status Update] Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Status update failed'

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}

/**
 * GET /api/orders/[id]/status
 *
 * Get order status history
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        paidAt: true,
        StatusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      currentStatus: order.status,
      history: order.StatusHistory,
      validNextStates: getValidNextStates(order.status),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

/**
 * Get valid next states for current status
 */
function getValidNextStates(currentStatus: OrderStatus): OrderStatus[] {
  const validTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDING_PAYMENT: ['CONFIRMATION', 'PAYMENT_DECLINED', 'CANCELLED'] as OrderStatus[],
    PAYMENT_DECLINED: ['PENDING_PAYMENT', 'CANCELLED'] as OrderStatus[],
    CONFIRMATION: ['PRODUCTION', 'ON_HOLD', 'CANCELLED'] as OrderStatus[],
    ON_HOLD: ['CONFIRMATION', 'PRODUCTION', 'CANCELLED'] as OrderStatus[],
    PRODUCTION: [
      'SHIPPED',
      'READY_FOR_PICKUP',
      'ON_THE_WAY',
      'ON_HOLD',
      'REPRINT',
    ] as OrderStatus[],
    SHIPPED: ['DELIVERED', 'REPRINT'] as OrderStatus[],
    READY_FOR_PICKUP: ['PICKED_UP', 'REPRINT'] as OrderStatus[],
    ON_THE_WAY: ['PICKED_UP', 'REPRINT'] as OrderStatus[],
    PICKED_UP: ['REPRINT'] as OrderStatus[],
    DELIVERED: ['REPRINT'] as OrderStatus[],
    REPRINT: ['PRODUCTION'] as OrderStatus[],
    CANCELLED: [] as OrderStatus[],
    REFUNDED: [] as OrderStatus[],
  }

  return validTransitions[currentStatus] || []
}
