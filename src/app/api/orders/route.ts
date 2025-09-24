import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()

    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')

    if (orderNumber) {
      // Search by order number
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
          files: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Check authorization
      if (
        !session?.user ||
        (order.email !== session.user.email && (session.user as any).role !== 'ADMIN')
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return NextResponse.json(order)
    }

    if (email) {
      // Search by email
      const orders = await prisma.order.findMany({
        where: { email },
        include: {
          items: true,
          statusHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(orders)
    }

    // Admin: Get all orders
    if ((session?.user as any)?.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: true,
          statusHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return NextResponse.json(orders)
    }

    // User: Get their orders
    if (session?.user?.email) {
      const orders = await prisma.order.findMany({
        where: { email: session.user.email },
        include: {
          items: true,
          statusHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(orders)
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const body = await request.json()

    const { email, phone, items, files, subtotal, tax, shipping, total, shippingAddress } = body

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `GRP-${String(orderCount + 1).padStart(5, '0')}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email,
        phone,
        userId: user?.id,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        status: 'PENDING_PAYMENT',
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            price: item.price,
            options: item.options,
          })),
        },
        files: files
          ? {
              create: files.map((file: Record<string, unknown>) => ({
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                metadata: file.metadata,
              })),
            }
          : undefined,
        statusHistory: {
          create: {
            toStatus: 'PENDING_PAYMENT',
            notes: 'Order created',
            changedBy: session?.user?.email || 'System',
          },
        },
        notifications: {
          create: {
            type: 'ORDER_CONFIRMED',
            sent: false,
          },
        },
      },
      include: {
        items: true,
        files: true,
        statusHistory: true,
      },
    })

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/orders/confirm-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.email,
        }),
      })
    } catch (emailError) {
      // Don't fail the order creation if email fails
    }

    // Create payment session for order
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/checkout/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          customerEmail: order.email,
        }),
      })
    } catch (paymentError) {
      // Payment can be retried later
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
