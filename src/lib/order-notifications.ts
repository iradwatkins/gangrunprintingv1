import { sendNotificationToUser, NotificationTypes } from './notifications'

// Map order status to notification type
export function getNotificationTypeForStatus(status: OrderStatus): string | null {
  switch (status) {
    case 'PENDING':
      return NotificationTypes.ORDER_CONFIRMED
    case 'CONFIRMATION':
      return NotificationTypes.ORDER_CONFIRMED
    case 'PRE_PRESS':
      return NotificationTypes.DESIGN_APPROVED
    case 'PRODUCTION':
      return NotificationTypes.ORDER_PRINTING
    case 'BINDERY':
      return NotificationTypes.ORDER_PROCESSING
    case 'READY':
      return NotificationTypes.ORDER_READY
    case 'SHIPPED':
      return NotificationTypes.ORDER_SHIPPED
    case 'DELIVERED':
      return NotificationTypes.ORDER_DELIVERED
    case 'CANCELLED':
      return NotificationTypes.ORDER_CANCELLED
    default:
      return null
  }
}

// Send notification when order status changes
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  status: OrderStatus,
  additionalData?: Record<string, unknown>
) {
  const notificationType = getNotificationTypeForStatus(status)

  if (!notificationType) {
    return
  }

  try {
    await sendNotificationToUser(userId, notificationType, {
      orderId,
      status,
      ...additionalData,
    })
  } catch (error) {
    // Don't throw - we don't want notification failures to break order processing
  }
}

// Send notification for payment received
export async function notifyPaymentReceived(userId: string, orderId: string, amount: number) {
  try {
    await sendNotificationToUser(userId, NotificationTypes.PAYMENT_RECEIVED, {
      orderId,
      amount: amount.toFixed(2),
    })
  } catch (error) {}
}

// Send notification for design revision needed
export async function notifyDesignRevision(userId: string, orderId: string, comments: string) {
  try {
    await sendNotificationToUser(userId, NotificationTypes.DESIGN_REVISION, {
      orderId,
      comments,
    })
  } catch (error) {}
}

// Send promotional notification
export async function notifySpecialOffer(userId: string, message: string, offerUrl?: string) {
  try {
    await sendNotificationToUser(userId, NotificationTypes.SPECIAL_OFFER, {
      message,
      url: offerUrl || '/products',
    })
  } catch (error) {}
}
