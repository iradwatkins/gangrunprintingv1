import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { getCurrentTenant } from '@/lib/tenants/resolver'

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale

  // Get tenant context to determine supported locales
  const tenantContext = await getCurrentTenant()
  const supportedLocales = tenantContext?.tenant?.locales || ['en', 'es']

  if (!locale || !supportedLocales.includes(locale)) {
    locale = tenantContext?.tenant?.defaultLocale || 'en'
  }

  return {
    locale,
    messages: await getMessages(locale, tenantContext?.tenant?.id),
    timeZone: tenantContext?.tenant?.timezone || 'America/Chicago',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      },
    },
  }
})

async function getMessages(locale: string, tenantId?: string) {
  try {
    // Load global messages
    const globalMessages = (await import(`../../../messages/${locale}.json`)).default

    // If no tenant, return global messages
    if (!tenantId) {
      return globalMessages
    }

    // Load tenant-specific translations from database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const translations = await prisma.translation.findMany({
        where: {
          OR: [
            { tenantId: null }, // Global translations
            { tenantId: tenantId }, // Tenant-specific translations
          ],
          locale: locale,
          isApproved: true,
        },
        orderBy: [
          { tenantId: 'desc' }, // Tenant-specific first (overrides global)
          { key: 'asc' },
        ],
      })

      // Convert database translations to nested object structure
      const dbMessages = translations.reduce((acc, translation) => {
        const keys = `${translation.namespace}.${translation.key}`.split('.')
        let current = acc

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {}
          }
          current = current[keys[i]]
        }

        current[keys[keys.length - 1]] = translation.value
        return acc
      }, {} as any)

      // Merge global messages with database translations (db overrides global)
      return { ...globalMessages, ...dbMessages }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error)

    // Fallback to English if available
    if (locale !== 'en') {
      try {
        return (await import(`../../../messages/en.json`)).default
      } catch (fallbackError) {
        console.error('Error loading fallback messages:', fallbackError)
        return {}
      }
    }

    return {}
  }
}
