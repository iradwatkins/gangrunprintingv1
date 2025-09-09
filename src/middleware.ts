import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_EMAIL = 'iradwatkins@gmail.com'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    // Debug logging
    console.log('Admin route access attempt:', {
      pathname,
      tokenExists: !!token,
      tokenEmail: token?.email,
      expectedEmail: ADMIN_EMAIL
    })

    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is the admin (only iradwatkins@gmail.com)
    if (token.email !== ADMIN_EMAIL) {
      console.log('Access denied - not admin email:', token.email)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    const token = await getToken({ req: request })

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