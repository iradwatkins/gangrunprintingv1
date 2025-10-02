/**
 * PricingCache.ts
 * High-performance caching system for pricing calculations
 * Optimizes performance while maintaining accurate dependency calculations
 */

import { ModuleType } from '../types/StandardModuleTypes'
import type { ModulePricingContribution, ModulePricingContext } from '../types/StandardModuleTypes'

// =============================================================================
// CACHE KEY GENERATION
// =============================================================================

/**
 * Generate unique cache key for pricing calculation
 * Key includes all factors that affect pricing
 */
export function generatePricingCacheKey(
  contributions: Map<ModuleType, ModulePricingContribution>
): string {
  const keyParts: string[] = []

  // Sort modules for consistent key generation
  const sortedModules = Array.from(contributions.keys()).sort()

  for (const moduleType of sortedModules) {
    const contribution = contributions.get(moduleType)
    if (!contribution || !contribution.isValid) continue

    const moduleKey = [
      moduleType,
      contribution.basePrice || 0,
      contribution.multiplier || 1,
      contribution.addonCost || 0,
      contribution.perUnitCost || 0,
      contribution.percentageCost || 0
    ].join(':')

    keyParts.push(moduleKey)
  }

  return keyParts.join('|')
}

/**
 * Generate cache key for module context
 */
export function generateModuleContextKey(
  moduleType: ModuleType,
  pricingContext: ModulePricingContext
): string {
  switch (moduleType) {
    case ModuleType.ADDONS:
      return `${moduleType}:${pricingContext.quantity}:${pricingContext.basePrice}`
    case ModuleType.TURNAROUND:
      return `${moduleType}:${pricingContext.quantity}:${pricingContext.basePrice}:${pricingContext.productPrice}`
    default:
      return `${moduleType}:independent`
  }
}

// =============================================================================
// PRICING CACHE MANAGER
// =============================================================================

export interface CachedPricingResult {
  context: ModulePricingContext
  timestamp: number
  hitCount: number
}

export interface CachedModuleContext {
  context: Partial<ModulePricingContext>
  timestamp: number
  hitCount: number
}

export interface PricingCacheStats {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  totalCachedResults: number
  averageCalculationTime: number
  cacheSize: number
}

/**
 * High-performance pricing cache with automatic cleanup
 */
export class PricingCacheManager {
  private pricingCache = new Map<string, CachedPricingResult>()
  private contextCache = new Map<string, CachedModuleContext>()

  // Performance tracking
  private stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    calculationTimes: [] as number[]
  }

  // Cache configuration
  private readonly maxCacheSize: number
  private readonly maxAge: number // milliseconds
  private readonly cleanupInterval: number

  constructor(options: {
    maxCacheSize?: number
    maxAge?: number
    cleanupInterval?: number
  } = {}) {
    this.maxCacheSize = options.maxCacheSize || 1000
    this.maxAge = options.maxAge || 5 * 60 * 1000 // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60 * 1000 // 1 minute

    // Start automatic cleanup
    this.startCleanupTimer()
  }

  /**
   * Get cached pricing result or return null if not found/expired
   */
  getPricingResult(cacheKey: string): ModulePricingContext | null {
    this.stats.totalRequests++

    const cached = this.pricingCache.get(cacheKey)
    if (!cached) {
      this.stats.cacheMisses++
      return null
    }

    // Check if expired
    const age = Date.now() - cached.timestamp
    if (age > this.maxAge) {
      this.pricingCache.delete(cacheKey)
      this.stats.cacheMisses++
      return null
    }

    // Cache hit
    cached.hitCount++
    this.stats.cacheHits++
    return cached.context
  }

  /**
   * Cache pricing result
   */
  setPricingResult(cacheKey: string, context: ModulePricingContext): void {
    // Check cache size limit
    if (this.pricingCache.size >= this.maxCacheSize) {
      this.evictLeastUsed()
    }

    this.pricingCache.set(cacheKey, {
      context: { ...context }, // Deep copy to prevent mutations
      timestamp: Date.now(),
      hitCount: 0
    })
  }

  /**
   * Get cached module context
   */
  getModuleContext(cacheKey: string): Partial<ModulePricingContext> | null {
    const cached = this.contextCache.get(cacheKey)
    if (!cached) return null

    // Check if expired
    const age = Date.now() - cached.timestamp
    if (age > this.maxAge) {
      this.contextCache.delete(cacheKey)
      return null
    }

    cached.hitCount++
    return cached.context
  }

  /**
   * Cache module context
   */
  setModuleContext(cacheKey: string, context: Partial<ModulePricingContext>): void {
    if (this.contextCache.size >= this.maxCacheSize) {
      this.evictContextLeastUsed()
    }

    this.contextCache.set(cacheKey, {
      context: { ...context },
      timestamp: Date.now(),
      hitCount: 0
    })
  }

  /**
   * Record calculation performance
   */
  recordCalculationTime(timeMs: number): void {
    this.stats.calculationTimes.push(timeMs)

    // Keep only recent measurements
    if (this.stats.calculationTimes.length > 1000) {
      this.stats.calculationTimes.shift()
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PricingCacheStats {
    const avgTime = this.stats.calculationTimes.length > 0
      ? this.stats.calculationTimes.reduce((a, b) => a + b, 0) / this.stats.calculationTimes.length
      : 0

    return {
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      hitRate: this.stats.totalRequests > 0
        ? (this.stats.cacheHits / this.stats.totalRequests) * 100
        : 0,
      totalCachedResults: this.pricingCache.size,
      averageCalculationTime: avgTime,
      cacheSize: this.pricingCache.size + this.contextCache.size
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.pricingCache.clear()
    this.contextCache.clear()
  }

  /**
   * Clear cache for specific module type
   */
  clearModuleCache(moduleType: ModuleType): void {
    // Clear pricing cache entries that include this module
    for (const [key, value] of this.pricingCache.entries()) {
      if (key.includes(moduleType)) {
        this.pricingCache.delete(key)
      }
    }

    // Clear context cache entries for this module
    for (const [key, value] of this.contextCache.entries()) {
      if (key.startsWith(moduleType)) {
        this.contextCache.delete(key)
      }
    }
  }

  /**
   * Invalidate cache when module contribution changes
   */
  invalidateModule(moduleType: ModuleType): void {
    this.clearModuleCache(moduleType)

    // Also clear dependent modules
    if (moduleType === ModuleType.QUANTITY || moduleType === ModuleType.PAPER_STOCK || moduleType === ModuleType.SIZE) {
      // Base price changed - invalidate everything
      this.clearCache()
    } else if (moduleType === ModuleType.ADDONS) {
      // Product price changed - invalidate turnaround
      this.clearModuleCache(ModuleType.TURNAROUND)
    }
  }

  /**
   * Evict least recently used pricing entries
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastHitCount = Infinity
    let oldestTime = Infinity

    for (const [key, cached] of this.pricingCache.entries()) {
      if (cached.hitCount < leastHitCount ||
          (cached.hitCount === leastHitCount && cached.timestamp < oldestTime)) {
        leastUsedKey = key
        leastHitCount = cached.hitCount
        oldestTime = cached.timestamp
      }
    }

    if (leastUsedKey) {
      this.pricingCache.delete(leastUsedKey)
    }
  }

  /**
   * Evict least recently used context entries
   */
  private evictContextLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastHitCount = Infinity
    let oldestTime = Infinity

    for (const [key, cached] of this.contextCache.entries()) {
      if (cached.hitCount < leastHitCount ||
          (cached.hitCount === leastHitCount && cached.timestamp < oldestTime)) {
        leastUsedKey = key
        leastHitCount = cached.hitCount
        oldestTime = cached.timestamp
      }
    }

    if (leastUsedKey) {
      this.contextCache.delete(leastUsedKey)
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()

    // Clean pricing cache
    for (const [key, cached] of this.pricingCache.entries()) {
      if (now - cached.timestamp > this.maxAge) {
        this.pricingCache.delete(key)
      }
    }

    // Clean context cache
    for (const [key, cached] of this.contextCache.entries()) {
      if (now - cached.timestamp > this.maxAge) {
        this.contextCache.delete(key)
      }
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Stop automatic cleanup (for cleanup/testing)
   */
  destroy(): void {
    this.clearCache()
  }
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; timeMs: number }> {
  const startTime = performance.now()
  const result = await fn()
  const endTime = performance.now()

  return {
    result,
    timeMs: endTime - startTime
  }
}

/**
 * Debounce function for expensive calculations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }) as T
}

/**
 * Throttle function for frequent calculations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}