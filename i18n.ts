// Minimal i18n configuration for build compatibility
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en']

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: {
      // Minimal English messages
      admin: {
        whiteLabelTitle: 'White Label Settings',
        translationsTitle: 'Translation Management',
      },
    },
  }
})
