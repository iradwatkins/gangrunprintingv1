// @ts-expect-error - web-push types not available
import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Initialize web-push with VAPID details
// These should be in environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:support@gangrunprinting.com',
}

// Configure web-push (only at runtime, not build time)
const configureWebPush = () => {
  if (vapidKeys.publicKey && vapidKeys.privateKey && typeof window === 'undefined') {
    try {
      webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey)
    } catch (error) {}
  }
}

// Notification types for different order events
export const NotificationTypes = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PROCESSING: 'order_processing',
  ORDER_PRINTING: 'order_printing',
  ORDER_READY: 'order_ready',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  DESIGN_APPROVED: 'design_approved',
  DESIGN_REVISION: 'design_revision',
  PAYMENT_RECEIVED: 'payment_received',
  SPECIAL_OFFER: 'special_offer',
} as const

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes]

// Notification templates
export const getNotificationContent = (
  type: NotificationType,
  data: Record<string, unknown>
): { title: string; body: string; icon?: string; actions?: Record<string, unknown>[] } => {
  switch (type) {
    case NotificationTypes.ORDER_CONFIRMED:
      return {
        title: '✅ Order Confirmed!',
        body: `Your order #${data.orderId} has been confirmed and will begin processing soon.`,
        actions: [
          { action: 'view-order', title: 'View Order' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      }

    case NotificationTypes.ORDER_PROCESSING:
      return {
        title: '⚙️ Order Processing',
        body: `Your order #${data.orderId} is now being processed by our team.`,
        actions: [{ action: 'view-order', title: 'Track Order' }],
      }

    case NotificationTypes.ORDER_PRINTING:
      return {
        title: '🖨️ Printing Started',
        body: `Your order #${data.orderId} is now being printed!`,
        actions: [{ action: 'view-order', title: 'View Details' }],
      }

    case NotificationTypes.ORDER_READY:
      return {
        title: '📦 Order Ready!',
        body: `Your order #${data.orderId} is ready for ${data.deliveryMethod === 'pickup' ? 'pickup' : 'shipping'}.`,
        actions: [{ action: 'view-order', title: 'View Order' }],
      }

    case NotificationTypes.ORDER_SHIPPED:
      return {
        title: '🚚 Order Shipped!',
        body: `Your order #${data.orderId} has been shipped. Tracking: ${data.trackingNumber || 'Available soon'}`,
        actions: [{ action: 'view-order', title: 'Track Package' }],
      }

    case NotificationTypes.ORDER_DELIVERED:
      return {
        title: '📬 Order Delivered!',
        body: `Your order #${data.orderId} has been delivered. Thank you for your business!`,
        actions: [{ action: 'view-order', title: 'View Order' }],
      }

    case NotificationTypes.ORDER_CANCELLED:
      return {
        title: '❌ Order Cancelled',
        body: `Your order #${data.orderId} has been cancelled. ${data.reason || ''}`,
        actions: [{ action: 'view-order', title: 'View Details' }],
      }

    case NotificationTypes.DESIGN_APPROVED:
      return {
        title: '🎨 Design Approved!',
        body: `Your design for order #${data.orderId} has been approved and will proceed to printing.`,
        actions: [{ action: 'view-order', title: 'View Order' }],
      }

    case NotificationTypes.DESIGN_REVISION:
      return {
        title: '✏️ Design Revision Needed',
        body: `Your design for order #${data.orderId} needs revision. Please check the comments.`,
        actions: [{ action: 'view-order', title: 'View Comments' }],
      }

    case NotificationTypes.PAYMENT_RECEIVED:
      return {
        title: '💳 Payment Received',
        body: `Payment for order #${data.orderId} has been received. Amount: $${data.amount}`,
        actions: [{ action: 'view-order', title: 'View Receipt' }],
      }

    case NotificationTypes.SPECIAL_OFFER:
      return {
        title: '🎉 Special Offer!',
        body: (data.message as string | undefined) || 'Check out our latest deals and save on your next order!',
        actions: [{ action: 'view-offers', title: 'View Offers' }],
      }

    default:
      return {
        title: 'GangRun Printing',
        body: 'You have a new update',
        actions: [],
      }
  }
}

// Send notification to a specific user
export async function sendNotificationToUser(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>
) {
  try {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        active: true,
      },
    })

    if (subscriptions.length === 0) {
      return
    }

    const notification = getNotificationContent(type, data)
    const payload = JSON.stringify({
      ...notification,
      type,
      orderId: data.orderId,
      url: data.url || `/track?orderId=${data.orderId}`,
      timestamp: Date.now(),
    })

    // Configure web push before sending
    configureWebPush()

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(JSON.parse(subscription.subscription as string), payload)
          return { success: true, id: subscription.id }
        } catch (error) {
          // Handle expired subscriptions
          if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { active: false },
            })
          }
          throw error
        }
      })
    )

    // Log results
    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    // Store notification in database for history
    const { randomBytes } = await import('crypto')
    await prisma.pushNotification.create({
      data: {
        id: `pnot_${randomBytes(16).toString('hex')}`,
        userId,
        type,
        title: notification.title,
        body: notification.body,
        data: JSON.stringify(data),
        sentAt: new Date(),
      },
    })

    return { successful, failed }
  } catch (error) {
    throw error
  }
}

// Send notification to multiple users
export async function sendNotificationToUsers(
  userIds: string[],
  type: NotificationType,
  data: Record<string, unknown>
) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendNotificationToUser(userId, type, data))
  )

  return results
}

// Send notification to all users (for announcements)
export async function sendNotificationToAll(type: NotificationType, data: Record<string, unknown>) {
  const activeSubscriptions = await prisma.pushSubscription.findMany({
    where: { active: true },
    select: { userId: true },
    distinct: ['userId'],
  })

  const userIds = activeSubscriptions.map((s) => s.userId).filter(Boolean) as string[]

  return sendNotificationToUsers(userIds, type, data)
}

// Generate VAPID keys (run once during setup)
export function generateVAPIDKeys(): unknown {
  const keys = webpush.generateVAPIDKeys()

  return keys
}
