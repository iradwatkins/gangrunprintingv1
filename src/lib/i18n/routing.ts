import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  // CRITICAL FIX (2025-10-30): Changed from 'as-needed' to 'always'
  // Reason: File structure uses [locale] folder, requiring locale prefix in all URLs
  // English: /en/products, /en/admin/dashboard, /en/contact
  // Spanish: /es/products, /es/admin/dashboard, /es/contact
  localePrefix: 'always',
})
