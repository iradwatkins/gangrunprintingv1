import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/products(.*)',
  '/about',
  '/contact',
  '/help-center',
  '/privacy-policy',
  '/terms-of-service',
  '/api/health',
  '/api/products(.*)',
  '/api/webhooks(.*)',
  '/track(.*)',
  '/sw.js',
  '/manifest.json',
  '/offline.html',
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) return;
  
  // Protect all other routes
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};