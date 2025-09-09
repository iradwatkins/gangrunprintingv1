import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const subscription = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Store subscription in database
    // If user is logged in, associate with user
    // Otherwise, store as anonymous subscription
    const data: any = {
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
        endpoint: subscription.endpoint
      },
      update: {
        subscription: JSON.stringify(subscription),
        active: true,
        updatedAt: new Date()
      },
      create: data
    })

    return NextResponse.json({ 
      success: true,
      message: 'Subscription stored successfully'
    })
  } catch (error) {
    console.error('Error storing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    )
  }
}