import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  // Using 'as-needed' - SEO best practice (Google, Amazon, Wikipedia standard)
  // English (default): No prefix → /admin/dashboard, /products, /contact
  // Spanish: /es/ prefix → /es/admin/dashboard, /es/products, /es/contact
  localePrefix: 'as-needed',
})
