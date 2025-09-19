import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  localePrefix: {
    mode: 'as-needed',
  },

  // Domain-based routing (for multi-tenant)
  domains: [
    {
      domain: 'gangrunprinting.com',
      defaultLocale: 'en',
    },
    // Additional domains will be added dynamically
  ],

  // Pathnames for different locales
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      es: '/acerca-de',
    },
    '/products': {
      en: '/products',
      es: '/productos',
    },
    '/contact': {
      en: '/contact',
      es: '/contacto',
    },
    '/admin': '/admin',
    '/auth/signin': {
      en: '/auth/signin',
      es: '/auth/iniciar-sesion',
    },
    '/auth/signup': {
      en: '/auth/signup',
      es: '/auth/registrarse',
    },
  },
})
