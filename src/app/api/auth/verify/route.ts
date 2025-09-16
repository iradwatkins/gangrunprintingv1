import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  console.log('=== API ROUTE VERIFICATION ===')
  console.log('Token:', token)
  console.log('Email:', email)

  if (!token || !email) {
    return NextResponse.redirect(
      new URL('/auth/verify?error=missing_params', request.url)
    )
  }

  try {
    await verifyMagicLink(token, email)
    console.log('Verification successful, redirecting to account dashboard')
    return NextResponse.redirect(new URL('/account/dashboard', request.url))
  } catch (error) {
    console.error('Verification failed:', error)

    let errorCode = 'unknown'
    if (error && typeof error === 'object' && 'code' in error) {
      errorCode = (error as any).code
    }

    return NextResponse.redirect(
      new URL(`/auth/verify?error=${errorCode}`, request.url)
    )
  }
}