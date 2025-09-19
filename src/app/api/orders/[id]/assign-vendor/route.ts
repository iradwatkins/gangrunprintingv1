import { validateRequest } from '@/lib/auth'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user } = await validateRequest()

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId, notes } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 })
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is in a valid state for vendor assignment
    const validStatuses = ['PAID', 'PROCESSING', 'PRINTING', 'QUALITY_CHECK', 'PACKAGING']
    if (!validStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'Order is not in a valid state for vendor assignment' },
        { status: 400 }
      )
    }

    // Verify vendor exists and is active
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    })

    if (!vendor || !vendor.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive vendor' }, { status: 400 })
    }

    // Update the order with vendor assignment
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        vendorId,
        adminNotes: notes
          ? `${order.adminNotes ? order.adminNotes + '\n' : ''}Vendor assigned to ${vendor.name}${notes ? ': ' + notes : ''}`
          : order.adminNotes,
      },
      include: {
        vendor: true,
      },
    })

    // Create status history entry
    await prisma.statusHistory.create({
      data: {
        orderId: id,
        fromStatus: order.status,
        toStatus: order.status,
        notes: `Vendor assigned: ${vendor.name}`,
        changedBy: userId,
      },
    })

    // If vendor has n8n webhook, trigger it
    if (vendor.n8nWebhookUrl) {
      try {
        await fetch(vendor.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_assigned',
            orderId: order.id,
            orderNumber: order.orderNumber,
            vendorId: vendor.id,
            vendorName: vendor.name,
            orderTotal: order.total / 100,
            notes: notes || '',
          }),
        })
      } catch (webhookError) {
        console.error('Failed to trigger vendor webhook:', webhookError)
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error assigning vendor:', error)
    return NextResponse.json({ error: 'Failed to assign vendor' }, { status: 500 })
  }
}
