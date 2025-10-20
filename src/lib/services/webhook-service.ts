import { prisma } from '@/lib/prisma'

/**
 * Webhook Service
 *
 * Handles triggering N8N webhooks for marketing automation
 */

interface WebhookPayload {
  event: string
  data: any
}

export class WebhookService {
  /**
   * Trigger N8N webhooks for a specific event
   *
   * @param event Event name (e.g., "order.created", "order.delivered")
   * @param data Event data to send to webhook
   */
  static async triggerWebhooks(event: string, data: any): Promise<void> {
    try {
      // Fetch active webhooks for this event
      const webhooks = await prisma.n8NWebhook.findMany({
        where: {
          trigger: event,
          isActive: true,
        },
      })

      if (webhooks.length === 0) {
        return // No webhooks configured for this event
      }

      // Trigger each webhook in parallel
      const webhookPromises = webhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString(),
            }),
          })

          const status = response.status
          const responseData = await response.json().catch(() => ({}))

          // Log webhook execution
          await prisma.n8NWebhookLog.create({
            data: {
              id: `${webhook.id}_${Date.now()}`,
              webhookId: webhook.id,
              payload: { event, data },
              response: responseData,
              status,
            },
          })

          // Update webhook stats
          await prisma.n8NWebhook.update({
            where: { id: webhook.id },
            data: {
              lastTriggered: new Date(),
              triggerCount: { increment: 1 },
            },
          })

          if (!response.ok) {
            console.error(`[Webhook] ${webhook.name} failed:`, status, responseData)
          }
        } catch (error) {
          console.error(`[Webhook] ${webhook.name} error:`, error)

          // Log failed webhook
          await prisma.n8NWebhookLog.create({
            data: {
              id: `${webhook.id}_${Date.now()}`,
              webhookId: webhook.id,
              payload: { event, data },
              response: { error: String(error) },
              status: 500,
            },
          })
        }
      })

      await Promise.allSettled(webhookPromises)
    } catch (error) {
      console.error('[Webhook Service] Error triggering webhooks:', error)
      // Don't throw - webhook failures shouldn't break main flow
    }
  }

  /**
   * Trigger "order.created" event
   * Called after successful payment/order creation
   */
  static async triggerOrderCreated(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`[Webhook] Order ${orderId} not found`)
      return
    }

    await this.triggerWebhooks('order.created', order)
  }

  /**
   * Trigger "order.delivered" event
   * Called when order status changes to DELIVERED
   */
  static async triggerOrderDelivered(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`[Webhook] Order ${orderId} not found`)
      return
    }

    await this.triggerWebhooks('order.delivered', order)
  }

  /**
   * Trigger "order.status_changed" event
   * Called whenever order status changes
   */
  static async triggerOrderStatusChanged(
    orderId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`[Webhook] Order ${orderId} not found`)
      return
    }

    await this.triggerWebhooks('order.status_changed', {
      ...order,
      oldStatus,
      newStatus,
    })

    // Also trigger specific status events
    if (newStatus === 'DELIVERED') {
      await this.triggerOrderDelivered(orderId)
    }
  }
}

export default WebhookService
