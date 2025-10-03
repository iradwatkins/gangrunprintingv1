/**
 * Send Invoice with Payment Link (Admin Only)
 *
 * Generates an invoice and sends it to customer with Square payment link
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { OrderItem: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate payment link (use Square payment links API)
    // For now, we'll use a direct checkout URL
    const paymentUrl = `${process.env.NEXTAUTH_URL}/checkout/pay/${order.orderNumber}`

    // Create invoice email
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 32px; background: #1a1a1a; color: white;">
          <h1 style="margin: 0;">INVOICE</h1>
          <p style="margin: 8px 0 0;">GangRun Printing</p>
        </div>

        <div style="padding: 24px; background: #f9fafb; margin-top: 24px;">
          <h2 style="margin: 0 0 8px;">Invoice #${order.orderNumber}</h2>
          <p style="margin: 0; color: #737373;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e5e5;">
              <th style="text-align: left; padding: 12px 0;">Item</th>
              <th style="text-align: right; padding: 12px 0;">Qty</th>
              <th style="text-align: right; padding: 12px 0;">Price</th>
              <th style="text-align: right; padding: 12px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.OrderItem.map(
              (item: any) => `
              <tr style="border-bottom: 1px solid #e5e5e5;">
                <td style="padding: 12px 0;">${item.productName}</td>
                <td style="text-align: right; padding: 12px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 12px 0;">$${(item.price / 100).toFixed(2)}</td>
                <td style="text-align: right; padding: 12px 0;">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
              </tr>
            `
            ).join('')}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e5e5;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>$${(order.subtotal / 100).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Tax:</span>
            <span>$${(order.tax / 100).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Shipping:</span>
            <span>$${(order.shipping / 100).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
            <span>Total Due:</span>
            <span style="color: #16a34a;">$${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${paymentUrl}" style="display: inline-block; background: #0070f3; color: white; padding: 16px 48px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
            Pay Now
          </a>
        </div>

        <div style="margin-top: 32px; padding: 20px; background: #eff6ff; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Questions? Contact us at<br/>
            <strong>support@gangrunprinting.com</strong> or <strong>1-800-PRINTING</strong>
          </p>
        </div>

        <div style="margin-top: 32px; text-align: center; font-size: 12px; color: #737373;">
          <p>© ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
        </div>
      </body>
      </html>
    `

    // Send invoice email
    await sendEmail({
      to: order.email,
      subject: `Invoice #${order.orderNumber} - GangRun Printing`,
      html: invoiceHtml,
      text: `Invoice #${order.orderNumber}\nTotal: $${(order.total / 100).toFixed(2)}\n\nPay now: ${paymentUrl}`,
    })

    // Log that invoice was sent
    await prisma.statusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: order.status,
        notes: `Invoice sent by ${user.email}`,
        changedBy: user.email || 'Admin',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${order.email}`,
      paymentUrl,
    })
  } catch (error) {
    console.error('[Send Invoice] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
