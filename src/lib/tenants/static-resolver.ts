import { cache } from 'react';
import type { TenantInfo, TenantContext } from './resolver';
import { prisma } from '@/lib/prisma';

// Default tenant configuration for static generation
const DEFAULT_TENANT: TenantInfo = {
  id: 'default',
  name: 'GangRun Printing',
  slug: 'gangrun',
  domain: 'gangrunprinting.com',
  subdomain: 'www',
  isActive: true,
  plan: 'professional',
  settings: {},
  branding: {
    logoUrl: '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
    logoText: 'GangRun Printing',
    faviconUrl: '/favicon-100x100.png',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  },
  locales: ['en', 'es'],
  defaultLocale: 'en',
  timezone: 'America/Chicago',
  currency: 'USD'
};

// Static tenant context for build time
const STATIC_TENANT_CONTEXT: TenantContext = {
  tenant: DEFAULT_TENANT,
  locale: 'en',
  isSubdomain: false,
  isCustomDomain: false,
  baseDomain: 'gangrunprinting.com'
};

/**
 * Get static tenant info for build-time generation
 * This doesn't use headers() so it's safe for static generation
 */
export const getStaticTenant = cache(async (slug?: string): Promise<TenantInfo> => {
  // During build, always return default tenant
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
    return DEFAULT_TENANT;
  }

  // If no slug provided, return default
  if (!slug) {
    return DEFAULT_TENANT;
  }

  // Try to fetch from database if available
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug,
        isActive: true
      },
      include: {
        brands: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    if (tenant) {
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        isActive: tenant.isActive,
        plan: tenant.plan,
        settings: tenant.settings,
        branding: tenant.brands[0] || null,
        locales: tenant.locales,
        defaultLocale: tenant.defaultLocale,
        timezone: tenant.timezone,
        currency: tenant.currency
      };
    }
  } catch (error) {
    console.error('Error fetching static tenant:', error);
  }

  return DEFAULT_TENANT;
});

/**
 * Get static tenant context for build-time generation
 * Returns a static context without using headers()
 */
export async function getStaticTenantContext(locale?: string): Promise<TenantContext> {
  // For static generation, return pre-configured context
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
    return {
      ...STATIC_TENANT_CONTEXT,
      locale: locale || STATIC_TENANT_CONTEXT.locale
    };
  }

  // For development or runtime, try to get tenant from environment
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gangrun';
  const tenant = await getStaticTenant(tenantSlug);

  return {
    tenant,
    locale: locale || tenant.defaultLocale,
    isSubdomain: false,
    isCustomDomain: false,
    baseDomain: process.env.NEXT_PUBLIC_DOMAIN || 'gangrunprinting.com'
  };
}

/**
 * Check if we're in a static generation context
 */
export function isStaticGeneration(): boolean {
  // During build, NEXT_RUNTIME is undefined
  // At runtime, it's either 'nodejs' or 'edge'
  return process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
}

/**
 * Get tenant context that works in both static and dynamic contexts
 * Uses static data during build, dynamic data at runtime
 */
export async function getUniversalTenantContext(
  locale?: string,
  useStatic: boolean = false
): Promise<TenantContext> {
  // Force static context if requested or during build
  if (useStatic || isStaticGeneration()) {
    return getStaticTenantContext(locale);
  }

  // Try to use dynamic context (with headers) at runtime
  try {
    // Only import getCurrentTenant when needed to avoid build issues
    const { getCurrentTenant } = await import('./resolver');
    const dynamicContext = await getCurrentTenant();

    if (dynamicContext) {
      return dynamicContext;
    }
  } catch (error) {
    console.log('Dynamic tenant resolution not available, using static context');
  }

  // Fallback to static context
  return getStaticTenantContext(locale);
}

export { DEFAULT_TENANT, STATIC_TENANT_CONTEXT };