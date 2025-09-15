import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { OfflineIndicator } from '@/components/pwa/offline-indicator'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { ComprehensivePerformanceMonitor } from '@/components/performance-monitor'
import { ErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'GangRun Printing - Professional Print Services',
  description: 'High-quality printing services for all your business and personal needs',
  icons: {
    icon: '/favicon-100x100.png',
    apple: '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${inter.variable} font-sans`}>
        <GoogleAnalytics />
        <OfflineIndicator />
        <ComprehensivePerformanceMonitor />
        <ErrorBoundary name="RootLayout">
          <Providers>{children}</Providers>
          <InstallPrompt />
        </ErrorBoundary>
      </body>
    </html>
  )
}