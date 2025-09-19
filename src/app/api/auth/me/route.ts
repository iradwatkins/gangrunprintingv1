import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()

    if (!user || !session) {
      return NextResponse.json({ user: null, session: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error checking authentication:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
