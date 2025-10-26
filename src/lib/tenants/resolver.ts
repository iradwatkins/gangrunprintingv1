import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { cache } from 'react'

// Global cache for tenant resolution
const tenantCache = new Map<string, any>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface TenantInfo {
  id: string
  name: string
  slug: string
  domain: string | null
  subdomain: string
  isActive: boolean
  plan: string
  settings: Record<string, unknown>
  branding: Record<string, unknown>
  locales: string[]
  defaultLocale: string
  timezone: string
  currency: string
}

export interface TenantContext {
  tenant: TenantInfo | null
  locale: string
  isSubdomain: boolean
  isCustomDomain: boolean
  baseDomain: string
}

// Cached tenant resolver
export const getTenantInfo = cache(async (identifier: string): Promise<TenantInfo | null> => {
  const cacheKey = `tenant:${identifier}`
  const cached = tenantCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const prisma = new PrismaClient()

  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ domain: identifier }, { subdomain: identifier }, { slug: identifier }],
        isActive: true,
      },
      include: {
        TenantBrand: {
          where: { isDefault: true },
          take: 1,
        },
      },
    })

    if (tenant) {
      const tenantInfo: TenantInfo = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        isActive: tenant.isActive,
        plan: tenant.plan,
        settings: tenant.settings as Record<string, unknown>,
        branding: tenant.TenantBrand[0] || null,
        locales: tenant.locales,
        defaultLocale: tenant.defaultLocale,
        timezone: tenant.timezone,
        currency: tenant.currency,
      }

      tenantCache.set(cacheKey, {
        data: tenantInfo,
        timestamp: Date.now(),
      })

      return tenantInfo
    }

    return null
  } catch (error) {
    return null
  } finally {
    await prisma.$disconnect()
  }
})

// Extract subdomain from hostname
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  hostname = hostname.split(':')[0]

  // Base domains to check against
  const baseDomains = ['gangrunprinting.com', 'localhost', 'vercel.app']

  for (const baseDomain of baseDomains) {
    if (hostname === baseDomain) {
      return null // No subdomain
    }

    if (hostname.endsWith(`.${baseDomain}`)) {
      const subdomain = hostname.replace(`.${baseDomain}`, '')
      return subdomain === 'www' ? null : subdomain
    }
  }

  // For custom domains, check if it's a known domain
  return null
}

// Check if domain is a custom domain
export function isCustomDomain(hostname: string): boolean {
  const baseDomains = ['gangrunprinting.com', 'localhost', 'vercel.app']

  // Remove port if present
  hostname = hostname.split(':')[0]

  return !baseDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

// Resolve tenant context from request
export async function resolveTenantContext(hostname: string): Promise<TenantContext> {
  const isCustom = isCustomDomain(hostname)
  const subdomain = isCustom ? null : extractSubdomain(hostname)

  let tenant: TenantInfo | null = null

  if (isCustom) {
    // Try to find tenant by custom domain
    tenant = await getTenantInfo(hostname)
  } else if (subdomain) {
    // Try to find tenant by subdomain
    tenant = await getTenantInfo(subdomain)
  }

  // Determine base domain
  let baseDomain = 'gangrunprinting.com'
  if (hostname.includes('localhost')) {
    baseDomain = 'localhost:3002'
  } else if (hostname.includes('vercel.app')) {
    baseDomain = hostname.split('.').slice(-2).join('.')
  }

  return {
    tenant,
    locale: tenant?.defaultLocale || 'en',
    isSubdomain: !!subdomain,
    isCustomDomain: isCustom,
    baseDomain,
  }
}

// Get current tenant context in server components
export async function getCurrentTenant(): Promise<TenantContext | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host')

    if (!host) return null

    return await resolveTenantContext(host)
  } catch (error) {
    return null
  }
}

// Clear tenant cache (useful for development)
export function clearTenantCache(): void {
  tenantCache.clear()
}

// Get tenant by ID (for admin operations)
export async function getTenantById(id: string): Promise<TenantInfo | null> {
  const prisma = new PrismaClient()

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        TenantBrand: {
          where: { isDefault: true },
          take: 1,
        },
      },
    })

    if (!tenant) return null

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      subdomain: tenant.subdomain,
      isActive: tenant.isActive,
      plan: tenant.plan,
      settings: tenant.settings as Record<string, unknown>,
      branding: tenant.TenantBrand[0] || null,
      locales: tenant.locales,
      defaultLocale: tenant.defaultLocale,
      timezone: tenant.timezone,
      currency: tenant.currency,
    }
  } finally {
    await prisma.$disconnect()
  }
}
