import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink, lucia } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  console.log(`[${requestId}] === MAGIC LINK VERIFICATION START ===`)
  console.log(`[${requestId}] Token: ${token?.substring(0, 8)}...`)
  console.log(`[${requestId}] Email: ${email}`)
  console.log(`[${requestId}] Request URL: ${request.url}`)

  if (!token || !email) {
    console.log(`[${requestId}] Missing parameters - token: ${!!token}, email: ${!!email}`)
    return NextResponse.redirect(new URL('/auth/verify?error=missing_params', request.url))
  }

  try {
    console.log(`[${requestId}] Starting magic link verification...`)
    const { user, session } = await verifyMagicLink(token, email)

    console.log(`[${requestId}] Magic link verification successful:`, {
      userId: user.id,
      userEmail: user.email,
      sessionId: session.id,
      sessionExpiry: session.expiresAt.toISOString(),
    })

    // Create the redirect response
    const redirectUrl = new URL('/account/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Manually set the session cookie to ensure it's properly included in the redirect
    const sessionCookie = lucia.createSessionCookie(session.id)
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    console.log(`[${requestId}] Session cookie set in redirect response:`, {
      cookieName: sessionCookie.name,
      hasValue: !!sessionCookie.value,
      attributes: sessionCookie.attributes,
      redirectTo: redirectUrl.toString(),
    })

    // Add a small delay to ensure database operations are committed
    // This prevents race conditions where the redirect happens before session is fully committed
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log(`[${requestId}] === MAGIC LINK VERIFICATION SUCCESS - REDIRECTING ===`)
    console.log(`[${requestId}] Redirecting to: ${redirectUrl.toString()}`)

    return response
  } catch (error) {
    console.error(`[${requestId}] === MAGIC LINK VERIFICATION FAILED ===`)
    console.error(`[${requestId}] Error:`, error)

    let errorCode = 'unknown'
    if (error && typeof error === 'object' && 'code' in error) {
      errorCode = (error as any).code
    }

    console.log(`[${requestId}] Redirecting to error page with code: ${errorCode}`)
    return NextResponse.redirect(new URL(`/auth/verify?error=${errorCode}`, request.url))
  }
}
