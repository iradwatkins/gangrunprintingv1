import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Admin email - must match auth.ts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Get secret with fallback
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  
  if (!secret) {
    console.error('[MIDDLEWARE] No secret found, allowing all requests')
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    try {
      const token = await getToken({ req: request, secret }) as any

      if (!token) {
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Simple admin check based on email
      const isAdmin = token.email === ADMIN_EMAIL || token.isAdmin === true || token.role === 'ADMIN'
      
      if (!isAdmin) {
        // Redirect non-admin users to their account dashboard
        return NextResponse.redirect(new URL('/account/dashboard', request.url))
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Error checking admin auth:', error)
      // On error, redirect to login
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    try {
      const token = await getToken({ req: request, secret })

      if (!token) {
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Error checking account auth:', error)
      // On error, redirect to login
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