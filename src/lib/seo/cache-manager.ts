/**
 * SEO Cache Manager
 *
 * Implements smart caching strategy for SEO data to reduce API calls
 * and stay within free tier limits.
 *
 * Caching Strategy:
 * - Google Search Console: 7-day retention (localStorage)
 * - Google Analytics 4: Session retention (sessionStorage)
 * - PageSpeed Insights: 24-hour retention (localStorage)
 * - Rate limiting: Max 100 API calls per day per service
 */

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

/**
 * Rate limit tracking
 */
interface RateLimitEntry {
  count: number
  resetAt: number // Unix timestamp
}

/**
 * SEO Cache Manager class
 */
export class SEOCacheManager {
  private readonly GSC_CACHE_PREFIX = 'seo_gsc_'
  private readonly GA4_CACHE_PREFIX = 'seo_ga4_'
  private readonly PAGESPEED_CACHE_PREFIX = 'seo_pagespeed_'
  private readonly RATE_LIMIT_PREFIX = 'seo_ratelimit_'

  /**
   * Default TTL values (in milliseconds)
   */
  private readonly DEFAULT_TTL = {
    gsc: 7 * 24 * 60 * 60 * 1000, // 7 days
    ga4: 4 * 60 * 60 * 1000, // 4 hours (session storage)
    pagespeed: 24 * 60 * 60 * 1000, // 24 hours
  }

  /**
   * Rate limits (requests per day)
   */
  private readonly RATE_LIMITS = {
    gsc: 100,
    ga4: 500,
    pagespeed: 100,
  }

  /**
   * Get cached data if valid
   *
   * @param key - Cache key
   * @param maxAge - Maximum age in milliseconds (optional, uses default TTL)
   * @returns Cached data or null if expired/missing
   */
  getCached<T>(key: string, maxAge?: number): T | null {
    try {
      // Try localStorage first
      let cached = this.getFromStorage('local', key)

      // Fallback to sessionStorage
      if (!cached) {
        cached = this.getFromStorage('session', key)
      }

      if (!cached) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(cached)
      const now = Date.now()
      const age = now - entry.timestamp
      const ttl = maxAge || entry.ttl

      // Check if expired
      if (age > ttl) {
        this.invalidate(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error('Cache retrieval error:', error)
      return null
    }
  }

  /**
   * Set cached data with TTL
   *
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   * @param storage - Storage type ('local' or 'session', default: 'local')
   */
  setCached<T>(key: string, data: T, ttl?: number, storage: 'local' | 'session' = 'local'): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.getDefaultTTL(key),
      }

      const serialized = JSON.stringify(entry)
      this.setToStorage(storage, key, serialized)
    } catch (error) {
      console.error('Cache storage error:', error)
    }
  }

  /**
   * Invalidate (delete) cached entry
   *
   * @param key - Cache key
   */
  invalidate(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  /**
   * Clear all SEO caches
   */
  clearAll(): void {
    try {
      if (typeof window === 'undefined') return

      // Clear all SEO-related keys
      const prefixes = [
        this.GSC_CACHE_PREFIX,
        this.GA4_CACHE_PREFIX,
        this.PAGESPEED_CACHE_PREFIX,
        this.RATE_LIMIT_PREFIX,
      ]

      // Clear from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && prefixes.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key)
        }
      }

      // Clear from sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && prefixes.some(prefix => key.startsWith(prefix))) {
          sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Check if rate limit allows making an API call
   *
   * @param service - Service name ('gsc', 'ga4', 'pagespeed')
   * @returns True if call is allowed, false if rate limit exceeded
   */
  canMakeRequest(service: 'gsc' | 'ga4' | 'pagespeed'): boolean {
    try {
      const key = `${this.RATE_LIMIT_PREFIX}${service}`
      const cached = this.getFromStorage('local', key)

      if (!cached) {
        return true
      }

      const entry: RateLimitEntry = JSON.parse(cached)
      const now = Date.now()

      // Check if reset time has passed
      if (now > entry.resetAt) {
        this.invalidate(key)
        return true
      }

      // Check if under limit
      return entry.count < this.RATE_LIMITS[service]
    } catch (error) {
      console.error('Rate limit check error:', error)
      return true // Allow on error
    }
  }

  /**
   * Increment rate limit counter
   *
   * @param service - Service name ('gsc', 'ga4', 'pagespeed')
   */
  incrementRateLimit(service: 'gsc' | 'ga4' | 'pagespeed'): void {
    try {
      const key = `${this.RATE_LIMIT_PREFIX}${service}`
      const cached = this.getFromStorage('local', key)
      const now = Date.now()
      const resetAt = this.getNextMidnight()

      let entry: RateLimitEntry

      if (cached) {
        entry = JSON.parse(cached)

        // Reset if past reset time
        if (now > entry.resetAt) {
          entry = { count: 1, resetAt }
        } else {
          entry.count += 1
        }
      } else {
        entry = { count: 1, resetAt }
      }

      this.setToStorage('local', key, JSON.stringify(entry))
    } catch (error) {
      console.error('Rate limit increment error:', error)
    }
  }

  /**
   * Get rate limit status for a service
   *
   * @param service - Service name ('gsc', 'ga4', 'pagespeed')
   * @returns Object with current count, limit, and remaining
   */
  getRateLimitStatus(service: 'gsc' | 'ga4' | 'pagespeed'): {
    count: number
    limit: number
    remaining: number
    resetAt: Date | null
  } {
    try {
      const key = `${this.RATE_LIMIT_PREFIX}${service}`
      const cached = this.getFromStorage('local', key)

      if (!cached) {
        return {
          count: 0,
          limit: this.RATE_LIMITS[service],
          remaining: this.RATE_LIMITS[service],
          resetAt: new Date(this.getNextMidnight()),
        }
      }

      const entry: RateLimitEntry = JSON.parse(cached)
      const limit = this.RATE_LIMITS[service]

      return {
        count: entry.count,
        limit,
        remaining: Math.max(0, limit - entry.count),
        resetAt: new Date(entry.resetAt),
      }
    } catch (error) {
      console.error('Rate limit status error:', error)
      return {
        count: 0,
        limit: this.RATE_LIMITS[service],
        remaining: this.RATE_LIMITS[service],
        resetAt: null,
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    gscCached: number
    ga4Cached: number
    pagespeedCached: number
    totalSize: number
  } {
    try {
      if (typeof window === 'undefined') {
        return { gscCached: 0, ga4Cached: 0, pagespeedCached: 0, totalSize: 0 }
      }

      let gscCached = 0
      let ga4Cached = 0
      let pagespeedCached = 0
      let totalSize = 0

      // Count localStorage entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue

        const value = localStorage.getItem(key)
        if (!value) continue

        totalSize += value.length

        if (key.startsWith(this.GSC_CACHE_PREFIX)) gscCached++
        if (key.startsWith(this.GA4_CACHE_PREFIX)) ga4Cached++
        if (key.startsWith(this.PAGESPEED_CACHE_PREFIX)) pagespeedCached++
      }

      // Count sessionStorage entries
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (!key) continue

        const value = sessionStorage.getItem(key)
        if (!value) continue

        totalSize += value.length

        if (key.startsWith(this.GA4_CACHE_PREFIX)) ga4Cached++
      }

      return { gscCached, ga4Cached, pagespeedCached, totalSize }
    } catch (error) {
      console.error('Cache stats error:', error)
      return { gscCached: 0, ga4Cached: 0, pagespeedCached: 0, totalSize: 0 }
    }
  }

  /**
   * Helper: Get from storage (browser-safe)
   */
  private getFromStorage(type: 'local' | 'session', key: string): string | null {
    if (typeof window === 'undefined') return null

    try {
      return type === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key)
    } catch (error) {
      return null
    }
  }

  /**
   * Helper: Set to storage (browser-safe)
   */
  private setToStorage(type: 'local' | 'session', key: string, value: string): void {
    if (typeof window === 'undefined') return

    try {
      if (type === 'local') {
        localStorage.setItem(key, value)
      } else {
        sessionStorage.setItem(key, value)
      }
    } catch (error) {
      console.error('Storage write error:', error)
    }
  }

  /**
   * Helper: Get default TTL for a cache key
   */
  private getDefaultTTL(key: string): number {
    if (key.startsWith(this.GSC_CACHE_PREFIX)) return this.DEFAULT_TTL.gsc
    if (key.startsWith(this.GA4_CACHE_PREFIX)) return this.DEFAULT_TTL.ga4
    if (key.startsWith(this.PAGESPEED_CACHE_PREFIX)) return this.DEFAULT_TTL.pagespeed
    return 60 * 60 * 1000 // Default: 1 hour
  }

  /**
   * Helper: Get next midnight timestamp (for daily rate limit reset)
   */
  private getNextMidnight(): number {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.getTime()
  }
}

// Export singleton instance
export const seoCache = new SEOCacheManager()
