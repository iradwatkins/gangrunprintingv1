import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { sendNotificationToUser, NotificationTypes } from '@/lib/notifications'

// Process pending notifications function
export async function processPendingNotifications() {
  try {
    // Get all pending notifications (not sent yet)
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        sent: false,
      },
      include: {
        Order: {
          include: {
            User: true,
          },
        },
      },
      take: 50, // Process in batches to avoid timeout
    })

    // Process each notification
    const results = await Promise.allSettled(
      pendingNotifications.map(async (notification) => {
        try {
          if (!notification.Order || !notification.Order.userId) {
            // Mark as sent to avoid retrying invalid notifications
            await prisma.notification.update({
              where: { id: notification.id },
              data: { sent: true },
            })
            return { id: notification.id, status: 'skipped', reason: 'No valid user' }
          }

          // Determine notification type based on notification type field
          const notificationType = notification.type as keyof typeof NotificationTypes
          const validType = NotificationTypes[notificationType] || NotificationTypes.ORDER_CONFIRMED

          // Send the notification
          await sendNotificationToUser(
            notification.Order.userId,
            validType,
            {
              orderId: notification.orderId,
              orderNumber: notification.Order.referenceNumber,
              email: notification.Order.email,
              status: notification.Order.status,
            }
          )

          // Mark as sent
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              sent: true,
              sentAt: new Date(),
            },
          })

          return { id: notification.id, status: 'sent' }
        } catch (error) {
          console.error(`Failed to send notification ${notification.id}:`, error)

          // Mark notification with error for tracking
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              error: error instanceof Error ? error.message : String(error),
            },
          })

          return { id: notification.id, status: 'failed', error }
        }
      })
    )

    // Count results
    const sent = results.filter(r => r.status === 'fulfilled' && r.value?.status === 'sent').length
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.status === 'failed')).length
    const skipped = results.filter(r => r.status === 'fulfilled' && r.value?.status === 'skipped').length

    return {
      processed: pendingNotifications.length,
      sent,
      failed,
      skipped,
    }
  } catch (error) {
    console.error('Error processing pending notifications:', error)
    throw error
  }
}

// Send test email function
export async function sendTestEmail(email: string) {
  try {
    const result = await sendEmail({
      to: email,
      subject: 'Test Email from GangRun Printing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from GangRun Printing.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Best regards,<br>GangRun Printing Team</p>
        </div>
      `,
      text: `Test Email from GangRun Printing\n\nThis is a test email. If you received this, your email configuration is working correctly!\n\nTimestamp: ${new Date().toISOString()}\n\nBest regards,\nGangRun Printing Team`,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send test email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}