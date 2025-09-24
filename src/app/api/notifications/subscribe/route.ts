import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const subscription = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Store subscription in database
    // If user is logged in, associate with user
    // Otherwise, store as anonymous subscription
    const data: Record<string, unknown> = {
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      active: true,
    }

    if (session?.user?.id) {
      data.userId = session.user.id
    }

    // Upsert subscription (update if exists, create if not)
    await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        subscription: JSON.stringify(subscription),
        active: true,
        updatedAt: new Date(),
      },
      create: data,
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription stored successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 })
  }
}
