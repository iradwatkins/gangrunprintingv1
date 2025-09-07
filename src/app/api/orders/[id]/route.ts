import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await auth()
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: true,
        files: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        notifications: true
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check authorization
    if (!session?.user || (order.userId !== session.user.id && (session.user as any).role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await auth()
    
    // Only admins can update orders
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { status, trackingNumber, carrier, adminNotes } = body
    
    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id }
    })
    
    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Update order with transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: params.id },
        data: {
          status: status || undefined,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          adminNotes: adminNotes || undefined
        }
      })
      
      // Add status history entry if status changed
      if (status && status !== currentOrder.status) {
        await tx.statusHistory.create({
          data: {
            orderId: params.id,
            fromStatus: currentOrder.status,
            toStatus: status,
            changedBy: session.user?.email || 'Admin'
          }
        })
        
        // Create notification based on status
        let notificationType = null
        switch (status) {
          case 'PAID':
            notificationType = 'PAYMENT_RECEIVED'
            break
          case 'PROCESSING':
          case 'PRINTING':
            notificationType = 'ORDER_PROCESSING'
            break
          case 'SHIPPED':
            notificationType = 'ORDER_SHIPPED'
            break
          case 'DELIVERED':
            notificationType = 'ORDER_DELIVERED'
            break
        }
        
        if (notificationType) {
          await tx.notification.create({
            data: {
              orderId: params.id,
              type: notificationType as any,
              sent: false
            }
          })
        }
      }
      
      return order
    })
    
    // Get updated order with all relations
    const fullOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        files: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        notifications: true
      }
    })
    
    return NextResponse.json(fullOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await auth()
    
    // Only admins can delete orders
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await prisma.order.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}