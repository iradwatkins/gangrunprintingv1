import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Generate hreflang metadata for SEO (Google bilingual indexing)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gangrunprinting.com'

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
        'x-default': `${baseUrl}/en` // English is primary market
      }
    }
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  // Await params to comply with Next.js 15 requirements
  const { locale } = await params

  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Get messages for next-intl with explicit locale
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
