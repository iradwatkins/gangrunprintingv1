import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // CRITICAL FIX: Handle large file uploads to prevent ERR_CONNECTION_CLOSED
  if (request.nextUrl.pathname.startsWith('/api/products/upload-image') ||
      request.nextUrl.pathname.startsWith('/api/upload') ||
      request.nextUrl.pathname.startsWith('/api/products/customer-images')) {

    // Clone the request headers
    const requestHeaders = new Headers(request.headers)

    // FIX 1: Set proper connection headers to prevent closure
    requestHeaders.set('Connection', 'keep-alive')
    requestHeaders.set('Keep-Alive', 'timeout=60')

    // FIX 2: Set higher body size limit for file uploads
    requestHeaders.set('x-body-size-limit', '20mb')

    // FIX 3: Disable request buffering for large uploads
    requestHeaders.set('x-middleware-next', '1')

    // FIX 4: Set content type if not already set
    if (!requestHeaders.has('content-type') ||
        requestHeaders.get('content-type')?.includes('multipart/form-data')) {
      // Allow multipart/form-data to pass through
      requestHeaders.set('x-upload-route', 'true')
    }

    // Return response with all fixes applied
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Set response headers to keep connection alive
    response.headers.set('Connection', 'keep-alive')
    response.headers.set('Keep-Alive', 'timeout=60')

    return response
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