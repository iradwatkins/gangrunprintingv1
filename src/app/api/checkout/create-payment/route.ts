import { type NextRequest, NextResponse } from 'next/server'
import { createSquareCheckout, createOrUpdateSquareCustomer } from '@/lib/square'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { type CartItem } from '@/lib/cart-types'

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const body = await request.json()

    const {
      cartItems,
      customerInfo,
      shippingAddress,
      billingAddress,
      shippingRate,
      selectedAirportId,
      subtotal,
      tax,
      shipping,
      total,
    } = body

    // Generate order number
    const orderNumber = `GRP-${Date.now().toString(36).toUpperCase()}`

    // Create or update Square customer
    const squareCustomer = await createOrUpdateSquareCustomer(
      customerInfo.email,
      `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerInfo.phone
    )

    // Create order in database with PENDING_PAYMENT status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        referenceNumber: orderNumber,
        userId: user?.id || null,
        email: customerInfo.email,
        phone: customerInfo.phone,
        subtotal,
        tax,
        shipping,
        total,
        shippingMethod: shippingRate ? `${shippingRate.carrier} - ${shippingRate.serviceName}` : null,
        shippingRate: shippingRate || null,
        selectedAirportId,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        status: 'PENDING_PAYMENT',
        squareCustomerId: squareCustomer.id,
        OrderItem: {
          create: cartItems.map((item: CartItem) => ({
            id: `${orderNumber}-${item.id}`,
            productName: item.productName,
            productSku: item.sku,
            quantity: item.quantity,
            price: item.price,
            options: {
              ...item.options,
              fileName: item.fileName,
              fileSize: item.fileSize,
            },
          })),
        },
      },
    })

    // Create Square checkout
    const lineItems = cartItems.map((item: CartItem) => ({
      name: `${item.productName} - ${item.options.size || 'Standard'}`,
      quantity: item.quantity.toString(),
      basePriceMoney: {
        amount: BigInt(Math.round(item.price * 100)), // Convert to cents
        currency: 'USD',
      },
    }))

    const checkout = await createSquareCheckout({
      amount: Math.round(total * 100), // Convert to cents
      orderNumber: order.orderNumber,
      email: customerInfo.email,
      items: lineItems,
    })

    // Update order with Square IDs
    await prisma.order.update({
      where: { id: order.id },
      data: {
        squareOrderId: checkout.orderId,
      },
    })

    // Send confirmation email (fire and forget - don't block checkout)
    fetch(`${process.env.NEXTAUTH_URL}/api/orders/confirm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
      }),
    }).catch((error) => {
      console.error('Failed to send confirmation email:', error)
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
