import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle legacy route redirects first
  if (pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/verify",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/auth/signout",
    "/api/auth/verify",
    "/api/auth/me",
    "/products",
    "/about",
    "/contact",
    "/help-center",
    "/privacy-policy",
    "/terms-of-service",
    "/api/health",
    "/api/products",
    "/api/webhooks",
    "/track",
    "/sw.js",
    "/manifest.json",
    "/offline.html"
  ];

  // Admin only routes
  const adminRoutes = [
    "/admin",
    "/api/admin"
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Skip middleware for public routes and static files
  if (isPublicRoute || pathname.includes("_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // For now, allow all routes until auth pages are created
  // This will be updated once auth pages are ready
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};