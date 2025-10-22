import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // CATEGORY URL REDIRECTS: Redirect old category URLs to new structure
  if (request.nextUrl.pathname.startsWith('/products/flyers')) {
    return NextResponse.redirect(new URL('/category/flyers', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/products/business-cards')) {
    return NextResponse.redirect(new URL('/category/business-cards', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/products/brochures')) {
    return NextResponse.redirect(new URL('/category/brochures', request.url))
  }
  // Add more category redirects as needed...

  // CRITICAL FIX: Handle large file uploads to prevent ERR_CONNECTION_CLOSED
  if (
    request.nextUrl.pathname.startsWith('/api/products/upload-image') ||
    request.nextUrl.pathname.startsWith('/api/upload') ||
    request.nextUrl.pathname.startsWith('/api/products/customer-images')
  ) {
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
    if (
      !requestHeaders.has('content-type') ||
      requestHeaders.get('content-type')?.includes('multipart/form-data')
    ) {
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

  // Apply security headers to all responses
  const response = NextResponse.next()

  // TEST: Add verification header to confirm middleware is running
  response.headers.set('X-Middleware-Active', 'true')
  response.headers.set('X-Middleware-Version', '2025-10-10')

  // Set Content Security Policy for payment processors and analytics
  // CRITICAL: Square requires multiple CDN sources for full functionality + 3D Secure domains
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://analytics.ahrefs.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://web.squarecdn.com https://*.squarecdn.com https://kit.cash.app https://www.paypal.com https://*.paypal.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; " +
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://region1.analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://connect.squareupsandbox.com https://*.square.com https://*.squareup.com https://*.squareupsandbox.com https://www.paypal.com https://*.paypal.com https://api.lab.amplitude.com https://*.ingest.sentry.io https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; " +
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://gangrunprinting.com https://*.gangrunprinting.com https://lh3.googleusercontent.com https://fonts.gstatic.com https://*.gstatic.com https://web.squarecdn.com https://*.squarecdn.com https://www.paypalobjects.com https://*.paypalobjects.com; " +
      "style-src 'self' 'unsafe-inline' https://*.squarecdn.com https://kit.cash.app https://*.cash.app; " +
      "font-src 'self' data: https://*.squarecdn.com https://d1g145x70srn7h.cloudfront.net; " +
      "object-src 'none'; base-uri 'self'; " +
      "form-action 'self' https://www.paypal.com https://*.arcot.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; " +
      "frame-ancestors 'none'; " +
      'frame-src https://web.squarecdn.com https://*.squarecdn.com https://www.paypal.com https://*.paypal.com https://kit.cash.app https://*.arcot.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; ' +
      'upgrade-insecure-requests;'
  )

  return response
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
