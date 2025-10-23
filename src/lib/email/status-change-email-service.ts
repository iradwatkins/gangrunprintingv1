/**
 * Status Change Email Service
 *
 * Handles automated email sending when orders transition to statuses
 * with sendEmailOnEnter enabled (Order Status Manager integration)
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { getOrderStatusUpdateEmail } from '@/lib/email-templates'

interface OrderData {
  id: string
  orderNumber: string
  email: string
  status: string
  total: number
  trackingNumber?: string | null
  User?: {
    name?: string | null
  }
}

export class StatusChangeEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com'
  private static readonly FROM_NAME = 'GangRun Printing'

  /**
   * Trigger email if status has sendEmailOnEnter enabled
   *
   * This is the main entry point called by OrderService when status changes
   */
  static async sendStatusChangeEmail(
    orderId: string,
    toStatusSlug: string,
    options?: {
      notes?: string
      changedBy?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<boolean> {
    try {
      // 1. Check if target status requires email
      const targetStatus = await prisma.customOrderStatus.findUnique({
        where: { slug: toStatusSlug },
        include: {
          EmailTemplate: true,
        },
      })

      if (!targetStatus) {
        return false
      }

      if (!targetStatus.sendEmailOnEnter) {
        return false
      }

      // 2. Fetch order data
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          User: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!order) {
        console.error(`[StatusChangeEmail] Order not found: ${orderId}`)
        return false
      }

      // 3. Send email
      if (targetStatus.emailTemplateId && targetStatus.EmailTemplate) {
        // Use custom template from database
        await this.sendCustomTemplateEmail(order, targetStatus, options?.notes)
      } else {
        // Use default generic status update email
        await this.sendDefaultStatusEmail(order, targetStatus)
      }

      return true
    } catch (error) {
      console.error('[StatusChangeEmail] Failed to send email:', error)
      // Don't throw - email failure shouldn't block status updates
      return false
    }
  }

  /**
   * Send email using custom database template
   */
  private static async sendCustomTemplateEmail(
    order: any,
    status: any,
    notes?: string
  ): Promise<void> {
    try {
      const template = status.EmailTemplate

      // Parse template content (JSON with html/text fields)
      const templateContent = template.content as {
        html?: string
        text?: string
      }

      // Replace variables in template
      const variables = {
        orderNumber: order.orderNumber,
        customerName: order.User?.name || 'Valued Customer',
        statusName: status.name,
        statusSlug: status.slug,
        trackingNumber: order.trackingNumber || '',
        trackingUrl: order.trackingNumber
          ? `https://gangrunprinting.com/track?order=${order.orderNumber}`
          : '',
        orderUrl: `https://gangrunprinting.com/orders/${order.id}`,
        notes: notes || '',
        total: `$${(order.total / 100).toFixed(2)}`,
      }

      const html = this.replaceVariables(templateContent.html || '', variables)
      const text = this.replaceVariables(
        templateContent.text || this.generatePlainText(order, status),
        variables
      )

      // Parse subject with variables
      const subject = this.replaceVariables(template.subject, variables)

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject,
        html,
        text,
      })
    } catch (error) {
      console.error('[StatusChangeEmail] Failed to send custom template:', error)
      // Fallback to default email
      await this.sendDefaultStatusEmail(order, status)
    }
  }

  /**
   * Send default status update email (no custom template)
   */
  private static async sendDefaultStatusEmail(order: any, status: any): Promise<void> {
    const emailContent = getOrderStatusUpdateEmail({
      orderNumber: order.orderNumber,
      customerName: order.User?.name || 'Valued Customer',
      status: status.name,
      trackingNumber: order.trackingNumber,
    })

    await sendEmail({
      to: order.email,
      from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
  }

  /**
   * Replace template variables with actual values
   */
  private static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template

    // Support both {{variable}} and {variable} syntax
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }

    return result
  }

  /**
   * Generate plain text fallback
   */
  private static generatePlainText(order: any, status: any): string {
    return `
GangRun Printing - Order Status Update

Hi ${order.User?.name || 'Valued Customer'},

Your order status has been updated.

Order Number: ${order.orderNumber}
New Status: ${status.name}
${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}

Track your order: https://gangrunprinting.com/track?order=${order.orderNumber}

If you have any questions, please contact us.

Best regards,
GangRun Printing Team
    `.trim()
  }

  /**
   * Preview email template with sample data (for testing/admin preview)
   */
  static async previewTemplate(
    templateId: string,
    sampleOrderId?: string
  ): Promise<{ subject: string; html: string; text: string }> {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new Error('Template not found')
    }

    // Use sample order or create mock data
    const order = sampleOrderId
      ? await prisma.order.findUnique({
          where: { id: sampleOrderId },
          include: { User: true },
        })
      : null

    const variables = {
      orderNumber: order?.orderNumber || 'ORD-SAMPLE-123',
      customerName: order?.User?.name || 'John Doe',
      statusName: 'Sample Status',
      statusSlug: 'SAMPLE_STATUS',
      trackingNumber: order?.trackingNumber || 'TRACK-123456',
      trackingUrl: 'https://gangrunprinting.com/track?order=ORD-SAMPLE-123',
      orderUrl: 'https://gangrunprinting.com/orders/sample-id',
      notes: 'Sample status change notes',
      total: order ? `$${(order.total / 100).toFixed(2)}` : '$99.99',
    }

    const templateContent = template.content as { html?: string; text?: string }

    return {
      subject: this.replaceVariables(template.subject, variables),
      html: this.replaceVariables(templateContent.html || '', variables),
      text: this.replaceVariables(templateContent.text || 'Plain text version of email', variables),
    }
  }
}

export default StatusChangeEmailService
