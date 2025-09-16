import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/lib/i18n/routing'
import { getStaticTenantContext } from '@/lib/tenants/static-resolver'
import { ThemeProvider } from '@/components/white-label/theme-provider'
import { TenantProvider } from '@/components/tenants/tenant-provider'
import '../globals.css'
import { Providers } from '../providers'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { OfflineIndicator } from '@/components/pwa/offline-indicator'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { ComprehensivePerformanceMonitor } from '@/components/performance-monitor'
import { ErrorBoundary } from '@/components/error-boundary'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tenantContext = await getStaticTenantContext(locale);
  const t = await getMessages();

  const title = tenantContext?.tenant?.branding?.logoText ||
                (t as any)?.metadata?.title ||
                'GangRun Printing - Professional Print Services';

  const description = (t as any)?.metadata?.description ||
                     'High-quality printing services for all your business and personal needs';

  return {
    title,
    description,
    icons: {
      icon: tenantContext?.tenant?.branding?.faviconUrl || '/favicon-100x100.png',
      apple: tenantContext?.tenant?.branding?.logoUrl || '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
    },
    alternates: {
      languages: {
        'en': `/en`,
        'es': `/es`,
        'x-default': `/${routing.defaultLocale}`
      }
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale,
      images: [
        {
          url: tenantContext?.tenant?.branding?.logoUrl || '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    }
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get tenant context and messages (using static resolver for SSG)
  const tenantContext = await getStaticTenantContext(locale);
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <body className={`${inter.variable} font-sans`}>
        <GoogleAnalytics />
        <OfflineIndicator />
        <ComprehensivePerformanceMonitor />
        <ErrorBoundary name="LocaleLayout">
          <NextIntlClientProvider messages={messages}>
            <TenantProvider initialTenant={tenantContext}>
              <ThemeProvider tenant={tenantContext?.tenant || null}>
                <Providers>
                  {children}
                </Providers>
              </ThemeProvider>
            </TenantProvider>
          </NextIntlClientProvider>
          <InstallPrompt />
        </ErrorBoundary>
      </body>
    </html>
  )
}