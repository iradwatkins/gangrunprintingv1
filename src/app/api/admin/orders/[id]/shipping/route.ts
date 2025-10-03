/**
 * Update Shipping Information (Admin Only)
 *
 * Add tracking number and mark order as shipped
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { OrderService } from '@/lib/services/order-service'
import { prisma } from '@/lib/prisma'
import { Carrier } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { trackingNumber, carrier, estimatedDelivery } = await request.json()

    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { error: 'Tracking number and carrier are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { User: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update shipping via OrderService
    await OrderService.updateShipping({
      orderId: order.id,
      trackingNumber,
      carrier: carrier as Carrier,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Shipping information updated'
    })
  } catch (error) {
    console.error('[Shipping Update] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Shipping update failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
