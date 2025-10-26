/**
 * Rate Limiter
 *
 * Simple in-memory rate limiting for API endpoints
 * For production with multiple servers, consider Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockExpiry?: number
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (
        entry.resetTime < now &&
        (!entry.blocked || (entry.blockExpiry && entry.blockExpiry < now))
      ) {
        rateLimitStore.delete(key)
      }
    }
  },
  10 * 60 * 1000
)

interface RateLimitConfig {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  blockDurationMs?: number // How long to block after exceeding limit (optional)
  keyPrefix?: string // Prefix for the rate limit key
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked?: boolean
  blockExpiry?: number
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // Check if currently blocked
  if (entry?.blocked && entry.blockExpiry && entry.blockExpiry > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockExpiry,
      blocked: true,
      blockExpiry: entry.blockExpiry,
    }
  }

  // Initialize or reset if window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment request count
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    // Block if blockDurationMs specified
    if (config.blockDurationMs) {
      entry.blocked = true
      entry.blockExpiry = now + config.blockDurationMs
      rateLimitStore.set(key, entry)

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry,
        blocked: true,
        blockExpiry: entry.blockExpiry,
      }
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // File upload - strict limit to prevent abuse
  FILE_UPLOAD: {
    maxRequests: 10, // 10 uploads
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 5 * 60 * 1000, // block for 5 minutes if exceeded
    keyPrefix: 'upload',
  },

  // File approval - moderate limit
  FILE_APPROVAL: {
    maxRequests: 30, // 30 approvals
    windowMs: 60 * 1000, // per minute
    keyPrefix: 'approval',
  },

  // File list/view - generous limit
  FILE_VIEW: {
    maxRequests: 100, // 100 views
    windowMs: 60 * 1000, // per minute
    keyPrefix: 'view',
  },

  // Message posting - moderate limit
  MESSAGE_POST: {
    maxRequests: 20, // 20 messages
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 2 * 60 * 1000, // block for 2 minutes if exceeded
    keyPrefix: 'message',
  },

  // File association - strict limit
  FILE_ASSOCIATION: {
    maxRequests: 5, // 5 associations
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 5 * 60 * 1000, // block for 5 minutes if exceeded
    keyPrefix: 'associate',
  },
} as const

/**
 * Get rate limit identifier from request
 * Uses IP address, user ID, or session ID
 */
export function getRateLimitIdentifier(
  ipAddress?: string,
  userId?: string,
  sessionId?: string
): string {
  // Prefer user ID for authenticated users
  if (userId) return `user:${userId}`

  // Fall back to session ID
  if (sessionId) return `session:${sessionId}`

  // Fall back to IP address
  if (ipAddress) return `ip:${ipAddress}`

  // Fallback identifier
  return 'anonymous'
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string | undefined {
  // Check common proxy headers
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return undefined
}

/**
 * Format rate limit error message
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (result.blocked) {
    const minutesUntilReset = Math.ceil((result.blockExpiry! - Date.now()) / (60 * 1000))
    return `Too many requests. You have been temporarily blocked. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`
  }

  const secondsUntilReset = Math.ceil((result.resetTime - Date.now()) / 1000)
  return `Rate limit exceeded. Please try again in ${secondsUntilReset} second${secondsUntilReset !== 1 ? 's' : ''}.`
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(headers: Headers, result: RateLimitResult): void {
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  if (!result.allowed) {
    headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
  }
}

/**
 * Clear rate limit for identifier (admin override)
 */
export function clearRateLimit(identifier: string, keyPrefix?: string): void {
  const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier
  rateLimitStore.delete(key)
}

/**
 * Get rate limit status for identifier
 */
export function getRateLimitStatus(identifier: string, keyPrefix?: string): RateLimitEntry | null {
  const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier
  return rateLimitStore.get(key) || null
}

/**
 * Reset all rate limits (use with caution)
 */
export function resetAllRateLimits(): void {
  rateLimitStore.clear()
}
