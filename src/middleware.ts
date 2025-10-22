import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { addBreadcrumb } from '@/lib/sentry'

// All i18n functionality temporarily disabled
// import createMiddleware from 'next-intl/middleware';
// import { routing } from '@/lib/i18n/routing';
// Tenant resolution disabled in middleware due to Edge Runtime Prisma issue
// import { resolveTenantContext } from '@/lib/tenants/resolver';

// Request correlation ID for distributed tracing
function generateCorrelationId(): string {
  // Generate random UUID without external dependency
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Internationalization middleware completely disabled

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  // const hostname = request.headers.get('host') || ''; // Reserved for future tenant resolution
  const correlationId = generateCorrelationId()

  // CRITICAL FIX: Handle large file uploads to prevent ERR_CONNECTION_CLOSED
  if (
    pathname.startsWith('/api/products/upload-image') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/products/customer-images')
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

  // Add correlation ID to headers for tracking
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-correlation-id', correlationId)
  requestHeaders.set('x-request-timestamp', Date.now().toString())

  // Add session activity tracking for authenticated requests
  const sessionCookie = request.cookies.get('auth_session')?.value // Lucia's default session cookie name
  if (sessionCookie) {
    requestHeaders.set('x-has-session', 'true')
    requestHeaders.set('x-session-activity-time', Date.now().toString())
  }

  // Temporarily disable tenant resolution in middleware to fix Edge Runtime Prisma issue
  // TODO: Move tenant resolution to API routes or use edge-compatible database client
  const tenantContext = {
    tenant: null,
    locale: 'en',
    isSubdomain: false,
    isCustomDomain: false,
    baseDomain: 'gangrunprinting.com',
  }

  // Add default tenant context to headers
  requestHeaders.set('x-tenant-locale', tenantContext.locale)
  requestHeaders.set('x-tenant-timezone', 'America/Chicago')
  requestHeaders.set('x-tenant-currency', 'USD')

  // Track API route if it's an API call
  const isApiRoute = pathname.startsWith('/api')
  if (isApiRoute) {
    const method = request.method
    addBreadcrumb(`API Request: ${method} ${pathname}`, 'http', {
      correlationId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.ip,
    })
  }

  // Check if tenant exists but is inactive
  if (tenantContext.tenant && !tenantContext.tenant.isActive) {
    return new NextResponse('Tenant suspended', { status: 503 })
  }

  // Handle legacy route redirects first
  if (pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  if (pathname === '/sign-up') {
    return NextResponse.redirect(new URL('/auth/signup', request.url))
  }

  // Skip middleware for static files and Next.js internals
  if (pathname.includes('_next') || pathname.includes('.') || pathname.startsWith('/api/')) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Add monitoring and security headers
    addResponseHeaders(response, correlationId)
    return response
  }

  // Internationalization middleware completely removed

  // Public routes that don't require authentication
  const _publicRoutes = [
    '/',
    '/auth',
    '/products',
    '/about',
    '/contact',
    '/help-center',
    '/privacy-policy',
    '/terms-of-service',
    '/track',
    '/sw.js',
    '/manifest.json',
    '/offline.html',
  ]

  // Check if route is public (considering locale prefixes)
  // const isPublicRoute = publicRoutes.some(route => {
  //   const cleanPath = pathname.replace(/^\/[a-z]{2}\//, '/'); // Remove locale prefix
  //   return cleanPath === route || cleanPath.startsWith(route + "/");
  // }); // Reserved for future auth implementation

  // For now, allow all routes until auth pages are created
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add tenant and monitoring headers
  if (tenantContext.tenant) {
    response.headers.set('x-tenant-id', tenantContext.tenant.id)
    response.headers.set('x-tenant-slug', tenantContext.tenant.slug)
  }

  // Add session activity headers for client-side monitoring
  if (sessionCookie) {
    response.headers.set('x-session-present', 'true')
    response.headers.set('x-last-activity', Date.now().toString())
  }

  addResponseHeaders(response, correlationId)

  return response
}

// Helper function to add response headers
function addResponseHeaders(response: NextResponse, correlationId: string) {
  // Add monitoring headers
  response.headers.set('x-correlation-id', correlationId)
  response.headers.set('x-powered-by', 'GangRun Printing')

  // Security headers
  // Remove X-Frame-Options: DENY to allow Square payment iframes
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('referrer-policy', 'origin-when-cross-origin')

  // CSP for production - Updated to support Square, Cash App, and PayPal payment processors
  // CRITICAL: Square requires CloudFront for fonts, kit.cash.app for Cash App Pay
  // CRITICAL: Amplitude analytics (api.lab.amplitude.com) and Sentry monitoring required for Square SDK
  // CRITICAL: Cardinal Commerce (*.cardinalcommerce.com) required for Square 3D Secure verification
  // CRITICAL: Ahrefs analytics (analytics.ahrefs.com) for SEO tracking
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'content-security-policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://web.squarecdn.com https://*.squarecdn.com https://kit.cash.app https://www.paypal.com https://*.paypal.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com https://analytics.ahrefs.com; " +
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://region1.analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://connect.squareupsandbox.com https://*.square.com https://*.squareup.com https://*.squareupsandbox.com https://www.paypal.com https://*.paypal.com https://api.lab.amplitude.com https://*.ingest.sentry.io https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com https://analytics.ahrefs.com; " +
        "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://gangrunprinting.com https://*.gangrunprinting.com https://lh3.googleusercontent.com https://fonts.gstatic.com https://*.gstatic.com https://web.squarecdn.com https://*.squarecdn.com https://www.paypalobjects.com https://*.paypalobjects.com https://api.cash.app https://*.cash.app https://franklin-assets.s3.amazonaws.com https://*.s3.amazonaws.com; " +
        "style-src 'self' 'unsafe-inline' https://*.squarecdn.com https://kit.cash.app; " +
        "font-src 'self' data: https://*.squarecdn.com https://d1g145x70srn7h.cloudfront.net; " +
        "object-src 'none'; base-uri 'self'; form-action 'self' https://www.paypal.com https://*.arcot.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; frame-ancestors 'none'; " +
        'frame-src https://web.squarecdn.com https://*.squarecdn.com https://www.paypal.com https://*.paypal.com https://kit.cash.app https://*.arcot.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com; ' +
        'upgrade-insecure-requests;'
    )
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
