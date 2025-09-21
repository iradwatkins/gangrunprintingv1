import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle large file uploads for specific API routes
  if (request.nextUrl.pathname.startsWith('/api/products/upload-image') ||
      request.nextUrl.pathname.startsWith('/api/upload')) {
    // Clone the request headers
    const requestHeaders = new Headers(request.headers)

    // Set a higher body size limit hint for these routes
    requestHeaders.set('x-body-size-limit', '20mb')

    // Return the response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}