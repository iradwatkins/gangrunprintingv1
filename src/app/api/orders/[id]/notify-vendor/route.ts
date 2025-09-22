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

    // Get the order with vendor information
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        vendor: true,
        user: true,
        OrderItem: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.vendor) {
      return NextResponse.json({ error: 'No vendor assigned to this order' }, { status: 400 })
    }

    // Build order details for notification
    const orderDetails = {
      orderNumber: order.referenceNumber || order.orderNumber,
      orderDate: order.createdAt,
      customerName: order.user?.name || 'Guest',
      customerEmail: order.email,
      items: order.OrderItem.map((item) => ({
        productName: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        price: item.price / 100,
        total: (item.price * item.quantity) / 100,
        configuration: item.configuration,
      })),
      subtotal: order.subtotal / 100,
      shipping: order.shipping / 100,
      tax: order.tax / 100,
      total: order.total / 100,
      shippingAddress: order.shippingAddress,
      notes: order.adminNotes,
    }

    // If vendor has n8n webhook, send notification
    if (order.vendor.n8nWebhookUrl) {
      try {
        const webhookResponse = await fetch(order.vendor.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_notification',
            vendorId: order.vendor.id,
            vendorName: order.vendor.name,
            order: orderDetails,
          }),
        })

        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`)
        }
      } catch (webhookError) {
        return NextResponse.json({ error: 'Failed to send webhook notification' }, { status: 500 })
      }
    }

    // If vendor has order email, prepare to send email notification
    if (order.vendor.orderEmail) {
      // Here you would integrate with your email service (SendGrid/Resend)
      // For now, we'll just log that an email would be sent
      // In production, you would uncomment and configure:
      /*
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'orders@gangrunprinting.com',
        to: order.vendor.orderEmail,
        subject: `New Order Assignment: ${order.referenceNumber}`,
        html: generateVendorOrderEmail(order.vendor, orderDetails)
      })
      */
    }

    // Record the notification in the database
    await prisma.notification.create({
      data: {
        orderId: order.id,
        type: 'VENDOR_NOTIFIED',
        sent: true,
        sentAt: new Date(),
      },
    })

    // Update order notes
    await prisma.order.update({
      where: { id: id },
      data: {
        adminNotes: `${order.adminNotes ? order.adminNotes + '\n' : ''}Vendor notified at ${new Date().toLocaleString()}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor notification sent successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to notify vendor' }, { status: 500 })
  }
}
