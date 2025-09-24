import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink, lucia } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  console.log(`Magic link verification request: ${requestId} for email: ${email}`)
  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify?error=missing_params', request.url))
  }

  try {
    const { user, session } = await verifyMagicLink(token, email)

    console.log(`Magic link verified successfully for user: ${user.id}`)

    // Create the redirect response
    const redirectUrl = new URL('/account/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Manually set the session cookie to ensure it's properly included in the redirect
    const sessionCookie = lucia.createSessionCookie(session.id)
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    console.log(`Session cookie set for redirect: ${sessionCookie.name}`)

    // Add a small delay to ensure database operations are committed
    // This prevents race conditions where the redirect happens before session is fully committed
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log(`Magic link verification completed successfully`)

    return response
  } catch (error) {
    let errorCode = 'unknown'
    if (error && typeof error === 'object' && 'code' in error) {
      errorCode = (error as any).code
    }

    return NextResponse.redirect(new URL(`/auth/verify?error=${errorCode}`, request.url))
  }
}
