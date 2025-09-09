import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendNotificationToUser, NotificationTypes } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send test notification
    const result = await sendNotificationToUser(
      session.user.id,
      NotificationTypes.SPECIAL_OFFER,
      {
        message: 'This is a test notification! If you see this, notifications are working correctly.',
        url: '/'
      }
    )

    return NextResponse.json({ 
      success: true,
      message: 'Test notification sent',
      result
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}