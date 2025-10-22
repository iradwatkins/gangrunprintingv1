/**
 * Order Email Service
 *
 * Handles sending all order-related emails using React Email + Resend
 */

import { render } from '@react-email/render'
import { sendEmail } from '@/lib/resend'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { OrderInProductionEmail } from './templates/order-in-production'

interface OrderEmailData {
  id: string
  orderNumber: string
  email: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  shippingAddress: any
  OrderItem: any[]
  User?: {
    name?: string | null
  }
}

export class OrderEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com'
  private static readonly FROM_NAME = 'GangRun Printing'

  /**
   * Send order confirmation email (after payment)
   */
  static async sendOrderConfirmation(order: OrderEmailData): Promise<void> {
    try {
      const trackingUrl = `${process.env.NEXTAUTH_URL}/orders/${order.id}/track`

      const emailHtml = render(
        OrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || undefined,
          items: order.OrderItem.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            options: item.options as Record<string, string>,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          shippingAddress: order.shippingAddress,
          estimatedDelivery: this.calculateEstimatedDelivery(),
          trackingUrl,
        })
      )

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Order Confirmed - ${order.orderNumber} 🎉`,
        html: emailHtml,
        text: this.generatePlainText(order, 'CONFIRMATION'),
      })

    } catch (error) {
      console.error('[Email] Failed to send order confirmation:', error)
      throw error
    }
  }

  /**
   * Send order in production email (when vendor assigned)
   */
  static async sendOrderInProduction(
    order: OrderEmailData,
    estimatedCompletion: string,
    shippingMethod: string
  ): Promise<void> {
    try {
      const trackingUrl = `${process.env.NEXTAUTH_URL}/orders/${order.id}/track`

      const emailHtml = render(
        OrderInProductionEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || undefined,
          estimatedCompletion,
          shippingMethod,
          trackingUrl,
        })
      )

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Your Order is Printing! - ${order.orderNumber} 🖨️`,
        html: emailHtml,
        text: `Your order ${order.orderNumber} is now in production. Estimated completion: ${estimatedCompletion}`,
      })

    } catch (error) {
      console.error('[Email] Failed to send production email:', error)
      throw error
    }
  }

  /**
   * Send shipping notification
   */
  static async sendShippingNotification(
    order: OrderEmailData,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: string
  ): Promise<void> {
    try {
      const trackingUrl = this.getCarrierTrackingUrl(carrier, trackingNumber)

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Order Shipped</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f0fdf4; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; margin: 0 0 16px;">📦 Your Order Has Shipped!</h1>
            <p style="font-size: 18px; color: #525252;">Order #${order.orderNumber}</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p style="margin: 0 0 12px;"><strong>Carrier:</strong> ${carrier}</p>
            ${estimatedDelivery ? `<p style="margin: 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" style="background: #0070f3; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Package</a>
          </div>

          <p style="color: #737373; font-size: 14px; text-align: center;">
            Questions? Reply to this email or call 1-800-PRINTING
          </p>
        </body>
        </html>
      `

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Your Order Has Shipped! 📦 - ${order.orderNumber}`,
        html: emailHtml,
        text: `Your order ${order.orderNumber} has shipped via ${carrier}. Tracking: ${trackingNumber}. Track at: ${trackingUrl}`,
      })

    } catch (error) {
      console.error('[Email] Failed to send shipping notification:', error)
      throw error
    }
  }

  /**
   * Send ready for pickup notification
   */
  static async sendReadyForPickup(
    order: OrderEmailData,
    pickupLocation: string,
    pickupInstructions?: string
  ): Promise<void> {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Ready for Pickup</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #eff6ff; padding: 24px; border-radius: 8px; text-align: center;">
            <h1 style="font-size: 28px; margin: 0 0 16px;">📍 Ready for Pickup!</h1>
            <p style="font-size: 18px; color: #525252;">Order #${order.orderNumber}</p>
          </div>

          <div style="margin: 24px 0;">
            <p style="font-size: 16px;">Your order is ready for pickup at:</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <p style="font-size: 16px; font-weight: bold; margin: 0;">${pickupLocation}</p>
              ${pickupInstructions ? `<p style="margin: 12px 0 0;">${pickupInstructions}</p>` : ''}
            </div>
          </div>

          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-weight: bold;">Please bring:</p>
            <ul style="margin: 8px 0;">
              <li>This confirmation email</li>
              <li>Photo ID</li>
              <li>Order number: ${order.orderNumber}</li>
            </ul>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Ready for Pickup! 📍 - ${order.orderNumber}`,
        html: emailHtml,
        text: `Your order ${order.orderNumber} is ready for pickup at ${pickupLocation}`,
      })

    } catch (error) {
      console.error('[Email] Failed to send pickup notification:', error)
      throw error
    }
  }

  /**
   * Send on hold notification
   */
  static async sendOnHoldNotification(
    order: OrderEmailData,
    reason: string,
    actionRequired: string
  ): Promise<void> {
    try {
      const uploadUrl = `${process.env.NEXTAUTH_URL}/orders/${order.id}/upload`

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Action Needed</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fef3c7; padding: 24px; border-radius: 8px; text-align: center; border: 2px solid #fbbf24;">
            <h1 style="font-size: 28px; margin: 0 0 16px;">⚠️ Action Needed</h1>
            <p style="font-size: 18px; color: #525252;">Order #${order.orderNumber}</p>
          </div>

          <div style="margin: 24px 0;">
            <p style="font-size: 16px;"><strong>Your order is on hold:</strong></p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 12px 0;">
              <p style="margin: 0; font-size: 16px;">${reason}</p>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="font-weight: bold; margin: 0 0 12px;">What you need to do:</p>
            <p style="margin: 0;">${actionRequired}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${uploadUrl}" style="background: #0070f3; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Upload Files</a>
          </div>

          <p style="color: #737373; font-size: 14px; text-align: center;">
            Questions? Reply to this email or call 1-800-PRINTING
          </p>
        </body>
        </html>
      `

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Action Needed: Order On Hold - ${order.orderNumber} ⚠️`,
        html: emailHtml,
        text: `Your order ${order.orderNumber} is on hold. Reason: ${reason}. Action required: ${actionRequired}`,
      })

    } catch (error) {
      console.error('[Email] Failed to send on-hold notification:', error)
      throw error
    }
  }

  /**
   * Helper: Calculate estimated delivery date
   */
  private static calculateEstimatedDelivery(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7) // 7 business days default
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Helper: Get carrier tracking URL
   */
  private static getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
    const carriers: Record<string, string> = {
      FEDEX: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      SOUTHWEST_CARGO: `https://www.swacargo.com/tracking`,
    }

    return carriers[carrier] || `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`
  }

  /**
   * Helper: Generate plain text version
   */
  private static generatePlainText(order: OrderEmailData, status: string): string {
    return `
GangRun Printing - Order ${status}

Order Number: ${order.orderNumber}
Total: $${(order.total / 100).toFixed(2)}

Thank you for your order! Track your order at:
${process.env.NEXTAUTH_URL}/orders/${order.id}/track

Questions? Email support@gangrunprinting.com or call 1-800-PRINTING
    `.trim()
  }
}

export default OrderEmailService
