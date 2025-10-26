import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  // Using 'always' because app structure uses [locale] in all paths
  // All URLs require explicit locale: /en/products, /es/products
  // This ensures stable routing and works with the current app architecture
  localePrefix: 'always',
})
