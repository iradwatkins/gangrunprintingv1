import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll use a mock subscription since we don't have user subscriptions stored yet
    // In a real app, you'd fetch the user's push subscription from the database
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'test-key',
        auth: 'test-auth',
      },
    }

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test notification! If you see this, notifications are working correctly.',
      icon: '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
      badge: '/favicon-100x100.png',
      data: {
        url: '/',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-view.png',
        },
      ],
    })

    console.log('Mock push notification prepared:', payload)

    return NextResponse.json({
      success: true,
      message: 'Test notification prepared (mock)',
      payload: JSON.parse(payload),
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 })
  }
}
