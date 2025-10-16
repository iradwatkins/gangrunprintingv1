'use client'

import { useEffect, useState } from 'react'
import ClientMonitor, { monitor } from '@/lib/monitoring/client-monitor'

export default function MonitoringProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize monitoring
    const monitorInstance = ClientMonitor.getInstance()

    // Check for user ID from localStorage or cookie (will be set after login)
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    if (userId) {
      monitor.setUserId(userId)
    }

    // Log page views
    monitor.action('page-view', {
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
    })

    // Track navigation changes
    const handleNavigation = () => {
      monitor.action('navigation', {
        path: window.location.pathname,
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', handleNavigation)

    // Track form submissions
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      monitor.action('form-submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
      })
    }

    document.addEventListener('submit', handleFormSubmit)

    // Track clicks on important buttons
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button')
        const text = button?.textContent?.trim()
        const id = button?.id

        // Log important actions
        if (text?.toLowerCase().includes('login') ||
            text?.toLowerCase().includes('sign') ||
            text?.toLowerCase().includes('cart') ||
            text?.toLowerCase().includes('checkout') ||
            text?.toLowerCase().includes('pay')) {
          monitor.action('button-click', {
            text,
            id,
            className: button?.className,
          })
        }
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a')
        const href = link?.getAttribute('href')

        if (href) {
          monitor.action('link-click', {
            href,
            text: link?.textContent?.trim(),
          })
        }
      }
    }

    document.addEventListener('click', handleClick)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleNavigation)
      document.removeEventListener('submit', handleFormSubmit)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return <>{children}</>
}