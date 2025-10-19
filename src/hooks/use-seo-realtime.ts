/**
 * Real-time SEO Updates Hook
 *
 * Provides real-time SEO data updates with automatic polling.
 * Refreshes every 15 minutes to keep dashboard data fresh.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * SEO data structure (generic)
 */
export interface SEOData {
  [key: string]: any
}

/**
 * Hook options
 */
export interface UseRealtimeOptions {
  enabled?: boolean // Enable/disable polling (default: true)
  interval?: number // Polling interval in milliseconds (default: 15 minutes)
  onError?: (error: Error) => void // Error callback
  onUpdate?: (data: SEOData) => void // Update callback
}

/**
 * Hook return type
 */
export interface UseRealtimeReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  lastUpdate: Date | null
  refresh: () => Promise<void>
  pause: () => void
  resume: () => void
  isPaused: boolean
}

/**
 * Real-time SEO updates hook
 *
 * @param fetcher - Async function to fetch data
 * @param options - Hook options
 * @returns Real-time data, loading state, and control functions
 */
export function useSEORealtime<T = SEOData>(
  fetcher: () => Promise<T>,
  options: UseRealtimeOptions = {}
): UseRealtimeReturn<T> {
  const {
    enabled = true,
    interval = 15 * 60 * 1000, // 15 minutes default
    onError,
    onUpdate,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef<boolean>(true)

  /**
   * Fetch data and update state
   */
  const fetchData = useCallback(async () => {
    if (!enabled || isPaused) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await fetcher()

      if (isMountedRef.current) {
        setData(result)
        setLastUpdate(new Date())
        setIsLoading(false)

        if (onUpdate) {
          onUpdate(result as any)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch SEO data')

      if (isMountedRef.current) {
        setError(error)
        setIsLoading(false)

        if (onError) {
          onError(error)
        }
      }
    }
  }, [enabled, isPaused, fetcher, onError, onUpdate])

  /**
   * Manually refresh data
   */
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  /**
   * Pause automatic updates
   */
  const pause = useCallback(() => {
    setIsPaused(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /**
   * Resume automatic updates
   */
  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  /**
   * Set up polling interval
   */
  useEffect(() => {
    if (!enabled || isPaused) {
      return
    }

    // Initial fetch
    fetchData()

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchData()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, isPaused, interval, fetchData])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh,
    pause,
    resume,
    isPaused,
  }
}

/**
 * Format time ago string
 *
 * @param date - Date to format
 * @returns Human-readable time ago string
 */
export function formatTimeAgo(date: Date | null): string {
  if (!date) {
    return 'Never'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins === 1) {
    return '1 minute ago'
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`
  } else if (diffMins < 120) {
    return '1 hour ago'
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)} hours ago`
  } else if (diffMins < 2880) {
    return '1 day ago'
  } else {
    return `${Math.floor(diffMins / 1440)} days ago`
  }
}
