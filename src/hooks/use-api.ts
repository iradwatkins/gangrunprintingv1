import { useState, useEffect, useCallback } from 'react'
import { cachedFetch } from '@/lib/api-cache'

interface UseApiOptions {
  enabled?: boolean
  ttl?: number
  skipCache?: boolean
  retry?: number
  retryDelay?: number
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    enabled = true,
    ttl,
    skipCache = false,
    retry = 3,
    retryDelay = 1000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!url || !enabled) {
      return
    }

    setLoading(true)
    setError(null)

    let lastError: Error | null = null
    let attempt = 0

    while (attempt < retry) {
      try {
        const result = await cachedFetch<T>(url, { ttl, skipCache })
        setData(result)
        setError(null)
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error')

        // Enhanced error logging for debugging
        console.error(`useApi fetch attempt ${attempt + 1}/${retry} failed for ${url}:`, {
          error: lastError.message,
          attempt: attempt + 1,
          url,
          options: { ttl, skipCache, retry, retryDelay }
        })

        attempt++

        if (attempt < retry) {
          console.log(`Retrying ${url} in ${retryDelay * attempt}ms...`)
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
      }
    }

    // All retries failed - provide detailed error message
    const errorMessage = lastError?.message || 'Failed to fetch data'
    const detailedError = `Failed to fetch ${url} after ${retry} attempts: ${errorMessage}`

    console.error('useApi: All retries exhausted:', {
      url,
      attempts: retry,
      finalError: errorMessage,
      options: { ttl, skipCache, retry, retryDelay }
    })

    setError(detailedError)
    setData(null)
  }, [url, enabled, ttl, skipCache, retry, retryDelay])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    // Use a local variable to track if the component is mounted
    let isMounted = true

    const performFetch = async () => {
      if (!isMounted) return

      setLoading(true)
      try {
        await fetchData()
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    performFetch()

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false
    }
  }, [fetchData])

  // Manual refetch function
  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await fetchData()
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  // Optimistic update function
  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    mutate
  }
}

// Hook for multiple API calls with deduplication
export function useApiBundle<T extends Record<string, any>>(
  urls: Record<keyof T, string | null>,
  options: UseApiOptions = {}
): {
  data: Partial<T>
  loading: boolean
  errors: Record<keyof T, string | null>
  refetch: () => Promise<void>
  refetchSingle: (key: keyof T) => Promise<void>
} {
  const [data, setData] = useState<Partial<T>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>)

  const fetchAll = useCallback(async () => {
    // Don't fetch if explicitly disabled
    if (options.enabled === false) {
      setLoading(false)
      return
    }

    setLoading(true)

    const validUrls = Object.entries(urls).filter(([, url]) => url)

    if (validUrls.length === 0) {
      setLoading(false)
      return
    }

    // Add timeout wrapper for each fetch
    const fetchWithTimeout = async (key: string, url: string) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout for ${key} (${url})`)), 10000)
      )

      const fetchPromise = cachedFetch(url as string, {
        ttl: options.ttl,
        skipCache: options.skipCache
      })

      try {
        const result = await Promise.race([fetchPromise, timeoutPromise])
        console.log(`useApiBundle: Successfully fetched ${key} from ${url}`)
        return { key, result, error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Enhanced error logging for debugging
        console.error(`useApiBundle: Error fetching ${key} from ${url}:`, {
          key,
          url,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        })

        return {
          key,
          result: null,
          error: `${key}: ${errorMessage}`
        }
      }
    }

    // Fetch all URLs in parallel with timeout
    const results = await Promise.allSettled(
      validUrls.map(([key, url]) => fetchWithTimeout(key, url))
    )

    const newData: Partial<T> = {}
    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { key, result: data, error } = result.value
        if (error) {
          newErrors[key as keyof T] = error
        } else {
          newData[key as keyof T] = data
          newErrors[key as keyof T] = null
        }
      } else {
        const key = validUrls[index][0] as keyof T
        const errorMessage = result.reason?.message || 'Unknown error'
        console.error(`useApiBundle: ${key} promise rejected:`, errorMessage)
        newErrors[key] = errorMessage
      }
    })

    setData(newData)
    setErrors(newErrors)
    setLoading(false)
  }, [urls, options.enabled, options.ttl, options.skipCache])

  const refetchSingle = useCallback(async (key: keyof T) => {
    const url = urls[key]
    if (!url) return

    try {
      const result = await cachedFetch(url, {
        ttl: options.ttl,
        skipCache: true // Force refresh for single refetch
      })

      setData(prev => ({ ...prev, [key]: result }))
      setErrors(prev => ({ ...prev, [key]: null }))
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [key]: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [urls, options.ttl])

  useEffect(() => {
    if (options.enabled !== false) {
      fetchAll()
    }
  }, [fetchAll, options.enabled])

  return {
    data,
    loading,
    errors,
    refetch: fetchAll,
    refetchSingle
  }
}