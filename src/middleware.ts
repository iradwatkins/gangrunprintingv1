import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { trackApiRoute, addBreadcrumb } from '@/lib/sentry';
import { v4 as uuidv4 } from 'uuid';
// All i18n functionality temporarily disabled
// import createMiddleware from 'next-intl/middleware';
// import { routing } from '@/lib/i18n/routing';
import { resolveTenantContext } from '@/lib/tenants/resolver';

// Request correlation ID for distributed tracing
function generateCorrelationId(): string {
  return uuidv4();
}

// Internationalization middleware completely disabled

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';
  const correlationId = generateCorrelationId();

  // Add correlation ID to headers for tracking
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  requestHeaders.set('x-request-timestamp', Date.now().toString());

  // Resolve tenant context
  const tenantContext = await resolveTenantContext(hostname);

  // Add tenant context to headers
  if (tenantContext.tenant) {
    requestHeaders.set('x-tenant-id', tenantContext.tenant.id);
    requestHeaders.set('x-tenant-slug', tenantContext.tenant.slug);
    requestHeaders.set('x-tenant-locale', tenantContext.locale);
    requestHeaders.set('x-tenant-timezone', tenantContext.tenant.timezone);
    requestHeaders.set('x-tenant-currency', tenantContext.tenant.currency);
  }

  // Track API route if it's an API call
  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    const method = request.method;
    addBreadcrumb(
      `API Request: ${method} ${pathname}`,
      'http',
      {
        correlationId,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.ip,
      }
    );
  }

  // Check if tenant exists but is inactive
  if (tenantContext.tenant && !tenantContext.tenant.isActive) {
    return new NextResponse('Tenant suspended', { status: 503 });
  }

  // Handle legacy route redirects first
  if (pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  // Skip middleware for static files and Next.js internals
  if (pathname.includes("_next") || pathname.includes(".") || pathname.startsWith('/api/')) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add monitoring and security headers
    addResponseHeaders(response, correlationId);
    return response;
  }

  // Internationalization middleware completely removed

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/products",
    "/about",
    "/contact",
    "/help-center",
    "/privacy-policy",
    "/terms-of-service",
    "/track",
    "/sw.js",
    "/manifest.json",
    "/offline.html"
  ];

  // Check if route is public (considering locale prefixes)
  const isPublicRoute = publicRoutes.some(route => {
    const cleanPath = pathname.replace(/^\/[a-z]{2}\//, '/'); // Remove locale prefix
    return cleanPath === route || cleanPath.startsWith(route + "/");
  });

  // For now, allow all routes until auth pages are created
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add tenant and monitoring headers
  if (tenantContext.tenant) {
    response.headers.set('x-tenant-id', tenantContext.tenant.id);
    response.headers.set('x-tenant-slug', tenantContext.tenant.slug);
  }
  addResponseHeaders(response, correlationId);

  return response;
}

// Helper function to add response headers
function addResponseHeaders(response: NextResponse, correlationId: string) {
  // Add monitoring headers
  response.headers.set('x-correlation-id', correlationId);
  response.headers.set('x-powered-by', 'GangRun Printing');

  // Security headers
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'origin-when-cross-origin');

  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'content-security-policy',
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://sentry.io;"
    );
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};