import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotificationToUser, NotificationTypes } from '@/lib/notifications'

// This endpoint can be called by a cron job service
// or Vercel Cron Jobs if deployed on Vercel
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Process pending notifications
    await processPendingNotifications()

    return NextResponse.json({
      success: true,
      message: 'Notifications processed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 })
  }
}

// Process pending notifications function
async function processPendingNotifications() {
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

// For Vercel Cron Jobs
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
