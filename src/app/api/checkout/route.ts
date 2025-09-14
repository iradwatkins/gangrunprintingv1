import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSquareCheckout, createOrUpdateSquareCustomer, createSquareOrder } from '@/lib/square'
import { sendEmail } from '@/lib/resend'
import { getOrderConfirmationEmail } from '@/lib/email-templates'
import { N8NWorkflows } from '@/lib/n8n'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GRP-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const data = await request.json()
    
    const {
      items,
      email,
      name,
      phone,
      shippingAddress,
      billingAddress,
      shippingMethod
    } = data

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = items.map((item: any) => ({
      productName: item.productName || item.name,
      productSku: item.sku || 'CUSTOM',
      quantity: item.quantity,
      price: item.price,
      options: item.options || {}
    }))

    for (const item of orderItems) {
      subtotal += item.price * item.quantity
    }

    // Calculate tax (8.25% for Texas)
    const taxRate = 0.0825
    const tax = Math.round(subtotal * taxRate)
    
    // Calculate shipping
    const shipping = shippingMethod === 'express' ? 2500 : 1000 // $25 or $10
    
    // Calculate total
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = generateOrderNumber()
    const referenceNumber = orderNumber // Use same for now

    // Create or update Square customer
    let squareCustomerId: string | undefined
    try {
      const customerResult = await createOrUpdateSquareCustomer(email, name, phone)
      squareCustomerId = customerResult.id
    } catch (error) {
      console.error('Failed to create Square customer:', error)
      // Continue without customer ID
    }

    // Create Square order
    let squareOrderId: string | undefined
    try {
      const squareLineItems = orderItems.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity.toString(),
        basePriceMoney: {
          amount: BigInt(Math.round(item.price)),
          currency: 'USD'
        }
      }))

      // Add shipping as a line item
      squareLineItems.push({
        name: shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping',
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(shipping),
          currency: 'USD'
        }
      })

      const squareOrderResult = await createSquareOrder({
        referenceId: orderNumber,
        customerId: squareCustomerId,
        lineItems: squareLineItems,
        taxes: [{
          name: 'Sales Tax',
          percentage: (taxRate * 100).toString()
        }]
      })
      
      squareOrderId = squareOrderResult.id
    } catch (error) {
      console.error('Failed to create Square order:', error)
      // Continue without Square order ID
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        referenceNumber,
        email,
        phone,
        userId: userId || null,
        subtotal,
        tax,
        shipping,
        total,
        shippingMethod,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        squareCustomerId,
        squareOrderId,
        status: 'PENDING_PAYMENT',
        OrderItem: {
          create: orderItems.map((item: any) => ({
            id: `${orderNumber}-${Math.random().toString(36).substring(7)}`,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            price: item.price,
            options: item.options
          }))
        },
        StatusHistory: {
          create: {
            id: `${orderNumber}-status-${Date.now()}`,
            toStatus: 'PENDING_PAYMENT',
            changedBy: email
          }
        }
      },
      include: {
        OrderItem: true
      }
    })

    // Trigger N8N workflow for order creation
    try {
      await N8NWorkflows.onOrderCreated(order.id)
      console.log(`N8N workflow triggered for order ${order.orderNumber}`)
    } catch (n8nError) {
      console.error('Failed to trigger N8N workflow:', n8nError)
      // Don't fail the order if N8N fails
    }

    // Send order confirmation email
    try {
      const emailData = getOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: name,
        email,
        items: order.OrderItem.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          options: item.options
        })),
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress
      })

      await sendEmail({
        to: email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })

      console.log(`Order confirmation email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    // Create Square payment link
    try {
      const checkoutResult = await createSquareCheckout({
        amount: total,
        orderNumber: order.orderNumber,
        email,
        items: squareLineItems
      })

      if (checkoutResult.url) {
        // Update order with payment link
        await prisma.order.update({
          where: { id: order.id },
          data: {
            squareOrderId: checkoutResult.orderId || squareOrderId
          }
        })

        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total
          },
          checkoutUrl: checkoutResult.url
        })
      }
    } catch (error) {
      console.error('Failed to create Square checkout:', error)
      // Return order without payment link
    }

    // If Square checkout failed, return order details for manual processing
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        email: order.email
      },
      message: 'Order created. Payment processing temporarily unavailable. We will contact you shortly.'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}