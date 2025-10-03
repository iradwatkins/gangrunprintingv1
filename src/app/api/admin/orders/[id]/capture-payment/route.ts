/**
 * Manual Payment Capture (Admin Only)
 *
 * For phone orders, in-person payments, or other manual payment methods
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { OrderService } from '@/lib/services/order-service'
import { prisma } from '@/lib/prisma'

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
    const { amount, method } = await request.json()

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Amount and method are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { OrderItem: true, User: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Order has already been paid' },
        { status: 400 }
      )
    }

    // Process payment via OrderService
    await OrderService.processPayment(
      order.id,
      `manual_${method}_${Date.now()}`,
      amount
    )

    // Update with payment method note
    await prisma.order.update({
      where: { id },
      data: {
        adminNotes: `Manual payment captured: ${method} - $${(amount / 100).toFixed(2)} by ${user.email}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment captured successfully'
    })
  } catch (error) {
    console.error('[Manual Payment] Error:', error)
    return NextResponse.json(
      { error: 'Payment capture failed' },
      { status: 500 }
    )
  }
}
