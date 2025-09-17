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
        attempt++

        if (attempt < retry) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
      }
    }

    // All retries failed
    setError(lastError?.message || 'Failed to fetch data')
    setData(null)
  }, [url, enabled, ttl, skipCache, retry, retryDelay])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (!loading) {
      fetchData().finally(() => setLoading(false))
    }
  }, [fetchData])

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData()
    setLoading(false)
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
    console.log('🚀 useApiBundle: Starting fetchAll with urls:', Object.keys(urls))
    setLoading(true)

    const validUrls = Object.entries(urls).filter(([, url]) => url && options.enabled !== false)
    console.log('✅ useApiBundle: Valid URLs:', validUrls.map(([key, url]) => `${key}: ${url}`))

    if (validUrls.length === 0) {
      console.log('⚠️ useApiBundle: No valid URLs found, stopping')
      setLoading(false)
      return
    }

    console.log('🔄 useApiBundle: Fetching all URLs in parallel...')

    // Add timeout wrapper for each fetch
    const fetchWithTimeout = async (key: string, url: string) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout for ${key}`)), 10000)
      )

      const fetchPromise = cachedFetch(url as string, {
        ttl: options.ttl,
        skipCache: options.skipCache
      })

      try {
        const result = await Promise.race([fetchPromise, timeoutPromise])
        console.log(`✅ useApiBundle: Successfully fetched ${key}`)
        return { key, result, error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ useApiBundle: Error fetching ${key}:`, errorMessage)
        return {
          key,
          result: null,
          error: errorMessage
        }
      }
    }

    // Fetch all URLs in parallel with timeout
    const results = await Promise.allSettled(
      validUrls.map(([key, url]) => fetchWithTimeout(key, url))
    )

    const newData: Partial<T> = {}
    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>

    console.log('🔍 useApiBundle: Processing results...')

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { key, result: data, error } = result.value
        if (error) {
          console.log(`❌ useApiBundle: ${key} failed with error:`, error)
          newErrors[key as keyof T] = error
        } else {
          console.log(`✅ useApiBundle: ${key} succeeded with data length:`, Array.isArray(data) ? data.length : 'N/A')
          newData[key as keyof T] = data
          newErrors[key as keyof T] = null
        }
      } else {
        const key = validUrls[index][0] as keyof T
        const errorMessage = result.reason?.message || 'Unknown error'
        console.log(`❌ useApiBundle: ${key} promise rejected:`, errorMessage)
        newErrors[key] = errorMessage
      }
    })

    const successCount = Object.values(newData).filter(Boolean).length
    const errorCount = Object.values(newErrors).filter(Boolean).length

    console.log(`🏁 useApiBundle: Completed! Success: ${successCount}, Errors: ${errorCount}`)
    console.log('📊 useApiBundle: Final data keys:', Object.keys(newData))
    console.log('📊 useApiBundle: Final errors:', newErrors)

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
    fetchAll()
  }, [fetchAll])

  return {
    data,
    loading,
    errors,
    refetch: fetchAll,
    refetchSingle
  }
}