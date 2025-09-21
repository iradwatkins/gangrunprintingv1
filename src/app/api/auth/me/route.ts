import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    console.log(`[${requestId}] GET /api/auth/me - Authentication check started`)

    const requestSource = request.headers.get('X-Request-Source') || 'unknown'
    console.log(`[${requestId}] Request source: ${requestSource}`)

    const { user, session } = await validateRequest()

    const responseTime = Date.now() - startTime

    if (!user || !session) {
      console.log(`[${requestId}] No user/session found in ${responseTime}ms`)
      return NextResponse.json(
        { user: null, session: null },
        {
          status: 200,
          headers: {
            'X-Request-ID': requestId,
            'X-Response-Time': responseTime.toString(),
          },
        }
      )
    }

    console.log(`[${requestId}] User authenticated: ${user.email} (${user.role}) in ${responseTime}ms`)

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': responseTime.toString(),
        },
      }
    )
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    const errorDetails = {
      requestId,
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      responseTime,
      timestamp: new Date().toISOString(),
    }

    console.error(`[${requestId}] === AUTH/ME API ERROR ===`)
    console.error(`[${requestId}] Error details:`, errorDetails)

    return NextResponse.json(
      {
        error: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
