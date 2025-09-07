import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Verify Square webhook signature
function verifyWebhookSignature(
  body: string,
  signature: string,
  signatureKey: string,
  requestUrl: string
): boolean {
  const hmac = crypto.createHmac('sha256', signatureKey)
  hmac.update(requestUrl + body)
  const hash = hmac.digest('base64')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('x-square-hmacsha256-signature')
    const requestUrl = request.url
    
    // Verify webhook signature
    if (process.env.SQUARE_WEBHOOK_SIGNATURE) {
      if (!signature || !verifyWebhookSignature(
        body,
        signature,
        process.env.SQUARE_WEBHOOK_SIGNATURE,
        requestUrl
      )) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    
    const event = JSON.parse(body)
    console.log('Square webhook event:', event.type)
    
    // Handle different event types
    switch (event.type) {
      case 'payment.created':
        await handlePaymentCreated(event.data)
        break
        
      case 'payment.updated':
        await handlePaymentUpdated(event.data)
        break
        
      case 'order.created':
        await handleOrderCreated(event.data)
        break
        
      case 'order.updated':
        await handleOrderUpdated(event.data)
        break
        
      case 'order.fulfillment.updated':
        await handleFulfillmentUpdated(event.data)
        break
        
      case 'refund.created':
        await handleRefundCreated(event.data)
        break
        
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCreated(data: any) {
  const { object: payment } = data
  
  // Find order by Square order ID
  const order = await prisma.order.findFirst({
    where: { 
      squareOrderId: payment.order_id 
    }
  })
  
  if (order) {
    // Update order status to PAID
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          squarePaymentId: payment.id,
          paidAt: new Date(payment.created_at)
        }
      })
      
      // Add status history
      await tx.statusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'PAID',
          changedBy: 'Square Webhook'
        }
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          orderId: order.id,
          type: 'PAYMENT_RECEIVED',
          sent: false
        }
      })
    })
    
    console.log(`Order ${order.orderNumber} marked as paid`)
  }
}

async function handlePaymentUpdated(data: any) {
  const { object: payment } = data
  
  // Find order and update payment status
  const order = await prisma.order.findFirst({
    where: { 
      squarePaymentId: payment.id 
    }
  })
  
  if (order) {
    const newStatus = payment.status === 'COMPLETED' ? 'PAID' : 
                     payment.status === 'FAILED' ? 'PAYMENT_FAILED' : 
                     order.status
    
    if (newStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus as any }
      })
    }
  }
}

async function handleOrderCreated(data: any) {
  const { object: squareOrder } = data
  
  // Check if order already exists
  const existingOrder = await prisma.order.findFirst({
    where: { squareOrderId: squareOrder.id }
  })
  
  if (!existingOrder) {
    // Create new order from Square order
    const order = await prisma.order.create({
      data: {
        orderNumber: `SQ-${squareOrder.reference_id || squareOrder.id.slice(-8)}`,
        email: squareOrder.customer?.email_address || 'unknown@example.com',
        status: 'PENDING_PAYMENT',
        subtotal: squareOrder.total_money?.amount || 0,
        tax: squareOrder.total_tax_money?.amount || 0,
        shipping: squareOrder.total_service_charge_money?.amount || 0,
        total: squareOrder.total_money?.amount || 0,
        squareOrderId: squareOrder.id,
        shippingAddress: {}
      }
    })
    
    console.log(`Order ${order.orderNumber} created from Square`)
  }
}

async function handleOrderUpdated(data: any) {
  const { object: squareOrder } = data
  
  const order = await prisma.order.findFirst({
    where: { squareOrderId: squareOrder.id }
  })
  
  if (order) {
    // Update order with latest Square data
    await prisma.order.update({
      where: { id: order.id },
      data: {
        updatedAt: new Date()
      }
    })
  }
}

async function handleFulfillmentUpdated(data: any) {
  const { object: fulfillment } = data
  
  const order = await prisma.order.findFirst({
    where: { squareOrderId: fulfillment.order_id }
  })
  
  if (order) {
    let newStatus = order.status
    
    switch (fulfillment.state) {
      case 'PROPOSED':
        newStatus = 'PROCESSING'
        break
      case 'PREPARED':
        newStatus = 'READY_FOR_PICKUP'
        break
      case 'COMPLETED':
        newStatus = 'DELIVERED'
        break
      case 'CANCELED':
        newStatus = 'CANCELLED'
        break
    }
    
    if (newStatus !== order.status) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus as any }
        })
        
        await tx.statusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: newStatus as any,
            changedBy: 'Square Webhook'
          }
        })
      })
    }
  }
}

async function handleRefundCreated(data: any) {
  const { object: refund } = data
  
  const order = await prisma.order.findFirst({
    where: { squarePaymentId: refund.payment_id }
  })
  
  if (order) {
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { 
          status: 'REFUNDED',
          refundAmount: refund.amount_money?.amount || 0,
          refundedAt: new Date(refund.created_at)
        }
      })
      
      // Add status history
      await tx.statusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'REFUNDED',
          changedBy: 'Square Webhook',
          notes: `Refund amount: $${(refund.amount_money?.amount || 0) / 100}`
        }
      })
      
      // Create notification
      await tx.notification.create({
        data: {
          orderId: order.id,
          type: 'ORDER_REFUNDED' as any,
          sent: false
        }
      })
    })
    
    console.log(`Order ${order.orderNumber} refunded: $${(refund.amount_money?.amount || 0) / 100}`)
  }
}