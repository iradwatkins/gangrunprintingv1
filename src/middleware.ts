import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Use AUTH_SECRET first, fallback to NEXTAUTH_SECRET for compatibility
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  
  // Log for debugging (remove in production)
  if (!secret && process.env.NODE_ENV === 'development') {
    console.error('Warning: No AUTH_SECRET or NEXTAUTH_SECRET found')
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret }) as any

    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has ADMIN role from database
    if (token.role !== 'ADMIN') {
      // Redirect non-admin users to their account dashboard
      return NextResponse.redirect(new URL('/account/dashboard', request.url))
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    const token = await getToken({ req: request, secret })

    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ]
}