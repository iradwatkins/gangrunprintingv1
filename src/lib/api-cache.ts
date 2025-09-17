type CacheEntry = {
  data: any
  timestamp: number
  expiresAt: number
}

type PendingRequest = {
  promise: Promise<any>
  timestamp: number
}

class ApiCache {
  private cache = new Map<string, CacheEntry>()
  private pendingRequests = new Map<string, PendingRequest>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly PENDING_REQUEST_TIMEOUT = 30 * 1000 // 30 seconds

  constructor() {
    // Clean up expired cache entries every minute
    setInterval(() => this.cleanupExpired(), 60 * 1000)
  }

  private cleanupExpired() {
    const now = Date.now()

    // Clean up expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
      }
    }

    // Clean up stale pending requests
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.PENDING_REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key)
      }
    }
  }

  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET'
    const body = options?.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  async get<T>(url: string, options?: RequestInit, ttl: number = this.DEFAULT_TTL): Promise<T> {
    const key = this.generateKey(url, options)
    const now = Date.now()

    // Check if we have a valid cached entry
    const cached = this.cache.get(key)
    if (cached && cached.expiresAt > now) {
      return cached.data
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key)
    if (pending && now - pending.timestamp < this.PENDING_REQUEST_TIMEOUT) {
      return pending.promise
    }

    // Make the actual request
    const promise = this.fetchData<T>(url, options)

    // Store as pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: now
    })

    try {
      const data = await promise

      // Cache the successful result
      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl
      })

      return data
    } catch (error) {
      // Don't cache errors, but remove from pending
      this.pendingRequests.delete(key)
      throw error
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(key)
    }
  }

  private async fetchData<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format')
    }

    return response.json()
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear()
      this.pendingRequests.clear()
      return
    }

    // Clear entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }

    for (const key of this.pendingRequests.keys()) {
      if (key.includes(pattern)) {
        this.pendingRequests.delete(key)
      }
    }
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        age: Date.now() - entry.timestamp
      }))
    }
  }
}

// Global cache instance
export const apiCache = new ApiCache()

// Utility function for easy API calls with caching
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & {
    ttl?: number
    skipCache?: boolean
  }
): Promise<T> {
  const { ttl, skipCache, ...fetchOptions } = options || {}

  if (skipCache) {
    const response = await fetch(url, fetchOptions)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  return apiCache.get<T>(url, fetchOptions, ttl)
}