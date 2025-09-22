'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const SESSION_CHECK_INTERVAL = 30 * 60 * 1000 // Check every 30 minutes
const SESSION_REFRESH_THRESHOLD = 7 * 24 * 60 * 60 * 1000 // Refresh if less than 7 days left
const USER_ACTIVITY_TIMEOUT = 5 * 60 * 1000 // Consider user active if any activity in last 5 minutes

export function SessionKeeper() {
  const pathname = usePathname()
  const lastActivityRef = useRef<number>(Date.now())
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Update activity on route changes
    updateActivity()

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [pathname])

  // Session refresh logic
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      try {
        // Check if user has been active recently
        const timeSinceLastActivity = Date.now() - lastActivityRef.current
        if (timeSinceLastActivity > USER_ACTIVITY_TIMEOUT) {
          console.log('User inactive, skipping session refresh')
          return
        }

        // Check current session status
        const statusResponse = await fetch('/api/auth/session/refresh', {
          method: 'GET',
          credentials: 'include',
        })

        if (!statusResponse.ok) {
          console.error('Failed to check session status')
          return
        }

        const statusData = await statusResponse.json()

        if (!statusData.authenticated) {
          console.log('User not authenticated')
          return
        }

        // Always refresh session for active users to prevent unexpected logouts
        // This aggressive refresh ensures users stay logged in
        const { timeUntilExpiry } = statusData.session

        // Refresh if session has less than 30 days left (more aggressive than before)
        const shouldRefresh = timeUntilExpiry < (30 * 24 * 60 * 60 * 1000)

        if (shouldRefresh) {
          console.log(`Refreshing session (${Math.round(timeUntilExpiry / (1000 * 60 * 60 * 24))} days left)`)

          const refreshResponse = await fetch('/api/auth/session/refresh', {
            method: 'POST',
            credentials: 'include',
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            console.log('Session refreshed successfully', refreshData)
          } else {
            console.error('Failed to refresh session')
          }
        } else {
          console.log(`Session still fresh (${Math.round(timeUntilExpiry / (1000 * 60 * 60 * 24))} days left)`)
        }
      } catch (error) {
        console.error('Error during session check/refresh:', error)
      }
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkAndRefreshSession, 10000) // 10 seconds after mount

    // Regular interval checks
    refreshIntervalRef.current = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL)

    return () => {
      clearTimeout(initialTimeout)
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}