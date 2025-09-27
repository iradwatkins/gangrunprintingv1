import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { headers } from 'next/headers'

export interface RateLimitOptions {
  interval: number // Time window in seconds
  uniqueTokenPerInterval: number // Max requests per interval
  prefix?: string // Key prefix for different endpoints
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limiting using Redis sliding window algorithm
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { interval, uniqueTokenPerInterval, prefix = 'rate-limit' } = options

  const key = `${prefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - interval * 1000

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`)

    // Count requests in window
    pipeline.zcard(key)

    // Set expiry
    pipeline.expire(key, interval)

    const results = await pipeline.exec()
    const count = results?.[2]?.[1] as number || 0

    const remaining = Math.max(0, uniqueTokenPerInterval - count)
    const success = count <= uniqueTokenPerInterval

    return {
      success,
      limit: uniqueTokenPerInterval,
      remaining,
      reset: now + interval * 1000
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit: uniqueTokenPerInterval,
      remaining: uniqueTokenPerInterval,
      reset: now + interval * 1000
    }
  }
}

/**
 * Get client identifier for rate limiting
 */
export async function getClientIdentifier(request: NextRequest): Promise<string> {
  const headersList = await headers()

  // Try to get real IP from various headers
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const cfConnectingIp = headersList.get('cf-connecting-ip')

  // Priority: CF > X-Real-IP > X-Forwarded-For > Request IP
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwardedFor) {
    // Take the first IP from the comma-separated list
    return forwardedFor.split(',')[0].trim()
  }

  // Fallback to a generic identifier
  return 'anonymous'
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const identifier = await getClientIdentifier(request)
  const result = await rateLimit(identifier, options)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again after ${new Date(result.reset).toISOString()}`,
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
        }
      }
    )
  }

  return null // Continue with request
}

// Preset configurations for different endpoint types
export const RateLimitPresets = {
  // Strict rate limit for auth endpoints
  auth: {
    interval: 60, // 1 minute
    uniqueTokenPerInterval: 5 // 5 requests per minute
  },

  // Moderate rate limit for API endpoints
  api: {
    interval: 60, // 1 minute
    uniqueTokenPerInterval: 30 // 30 requests per minute
  },

  // Lenient rate limit for public endpoints
  public: {
    interval: 60, // 1 minute
    uniqueTokenPerInterval: 60 // 60 requests per minute
  },

  // Very strict for sensitive operations
  sensitive: {
    interval: 300, // 5 minutes
    uniqueTokenPerInterval: 3 // 3 requests per 5 minutes
  }
}