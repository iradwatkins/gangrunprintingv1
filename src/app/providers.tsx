'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { NotificationPermission } from '@/components/notification-permission'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <CartProvider>
            {children}
            <CartDrawer />
            <PWAInstallPrompt />
            <NotificationPermission />
          </CartProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  )
}