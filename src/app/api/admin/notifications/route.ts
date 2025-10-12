import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/admin/notifications - Get recent notifications for admin
export async function GET(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()

    // Only admins can see notifications
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get recent orders as notifications
    // We'll consider orders from the last 7 days as "notifications"
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform orders into notification format
    const notifications = orders.map((order) => ({
      id: order.id,
      type: 'new_order',
      title: `New Order #${order.orderNumber}`,
      message: `Order from ${order.User?.name || order.User?.email || 'Customer'} - $${order.total.toFixed(2)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      read: false, // For now, all are unread. We can add a UserNotification table later
    }))

    // Count unread (for now, all recent orders are "unread")
    const unreadCount = notifications.length

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error('[GET /api/admin/notifications] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications/mark-read - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()

    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = await request.json()

    // For now, just return success
    // Later we can implement a UserNotification table to track read status
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/notifications/mark-read] Error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
