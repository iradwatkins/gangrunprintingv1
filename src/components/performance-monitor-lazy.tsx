'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Lazy load the performance monitor
const ComprehensivePerformanceMonitor = dynamic(
  () => import('@/components/performance-monitor').then(mod => ({
    default: mod.ComprehensivePerformanceMonitor
  })),
  {
    ssr: false,
    loading: () => null
  }
)

export function LazyPerformanceMonitor() {
  const pathname = usePathname()
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Skip performance monitoring on auth pages and admin login
    const isAuthPage = pathname.includes('/auth/') ||
                      pathname.includes('/signin') ||
                      pathname.includes('/signup') ||
                      pathname.includes('/login')

    // Only load performance monitor after initial render and not on auth pages
    if (!isAuthPage) {
      // Delay loading until after page is interactive
      const timer = setTimeout(() => {
        setShouldLoad(true)
      }, 2000) // Wait 2 seconds after page load

      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Only render in production if explicitly enabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR === 'true'

  if (!shouldLoad || !isEnabled) {
    return null
  }

  return <ComprehensivePerformanceMonitor />
}