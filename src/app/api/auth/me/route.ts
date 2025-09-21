import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const requestSource = request.headers.get('X-Request-Source') || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'
    const referer = request.headers.get('Referer') || 'unknown'

    console.log(`[${requestId}] === AUTH/ME REQUEST START ===`)
    console.log(`[${requestId}] Source: ${requestSource}`)
    console.log(`[${requestId}] User-Agent: ${userAgent}`)
    console.log(`[${requestId}] Referer: ${referer}`)
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`)

    // Get all cookies for debugging
    const cookieHeader = request.headers.get('Cookie') || ''
    const cookies = cookieHeader.split(';').map(c => c.trim()).filter(c => c.length > 0)

    console.log(`[${requestId}] Request cookies:`, {
      total: cookies.length,
      names: cookies.map(c => c.split('=')[0]),
      hasAuthSession: cookies.some(c => c.startsWith('auth_session=')),
      cookieHeader: cookieHeader.substring(0, 200) + (cookieHeader.length > 200 ? '...' : ''),
    })

    const { user, session } = await validateRequest()

    const responseTime = Date.now() - startTime

    console.log(`[${requestId}] Validation result:`, {
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      sessionId: session?.id,
      sessionExpiry: session?.expiresAt?.toISOString(),
      responseTimeMs: responseTime,
    })

    if (!user || !session) {
      console.log(`[${requestId}] === AUTH/ME RETURNING UNAUTHENTICATED ===`)
      console.log(`[${requestId}] Reason: ${!user ? 'No user' : 'No session'}`)

      return NextResponse.json(
        {
          user: null,
          session: null,
          debug: {
            requestId,
            timestamp: new Date().toISOString(),
            reason: !user ? 'no_user' : 'no_session',
            source: requestSource,
          }
        },
        {
          status: 200,
          headers: {
            'X-Request-ID': requestId,
            'X-Response-Time': responseTime.toString(),
            'X-Auth-Status': 'unauthenticated',
          },
        }
      )
    }

    console.log(`[${requestId}] === AUTH/ME RETURNING AUTHENTICATED USER ===`)
    console.log(`[${requestId}] User: ${user.email} (${user.role})`)
    console.log(`[${requestId}] Session expires: ${session.expiresAt.toISOString()}`)

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
        debug: {
          requestId,
          timestamp: new Date().toISOString(),
          source: requestSource,
        }
      },
      {
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': responseTime.toString(),
          'X-Auth-Status': 'authenticated',
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
        debug: errorDetails,
      },
      {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': responseTime.toString(),
          'X-Auth-Status': 'error',
        },
      }
    )
  }
}
