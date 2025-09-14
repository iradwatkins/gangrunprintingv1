import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { OfflineIndicator } from '@/components/pwa/offline-indicator'
import GoogleAnalytics from '@/components/GoogleAnalytics'

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
        <Providers>{children}</Providers>
        <InstallPrompt />
      </body>
    </html>
  )
}