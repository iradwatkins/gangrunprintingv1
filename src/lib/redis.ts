import { Redis } from 'ioredis'

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
})

// Error handling
redis.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('Redis Client Connected')
})

// Cache utilities
export const cache = {
  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  },

  // Set cached value with TTL (in seconds)
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      return false
    }
  },

  // Delete cached value
  async del(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key)
      return result > 0
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
      return false
    }
  },

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length === 0) return 0
      const result = await redis.del(...keys)
      return result
    } catch (error) {
      console.error(`Cache clear pattern error for ${pattern}:`, error)
      return 0
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  },

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error)
      return -1
    }
  },

  // Increment counter
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await redis.incr(key)
      if (ttl && result === 1) {
        await redis.expire(key, ttl)
      }
      return result
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error)
      return 0
    }
  },

  // Decrement counter
  async decr(key: string): Promise<number> {
    try {
      return await redis.decr(key)
    } catch (error) {
      console.error(`Cache decr error for key ${key}:`, error)
      return 0
    }
  },

  // Add to set
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await redis.sadd(key, ...members)
    } catch (error) {
      console.error(`Cache sadd error for key ${key}:`, error)
      return 0
    }
  },

  // Get set members
  async smembers(key: string): Promise<string[]> {
    try {
      return await redis.smembers(key)
    } catch (error) {
      console.error(`Cache smembers error for key ${key}:`, error)
      return []
    }
  },

  // Remove from set
  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await redis.srem(key, ...members)
    } catch (error) {
      console.error(`Cache srem error for key ${key}:`, error)
      return 0
    }
  },
}

// Cache key generators
export const cacheKeys = {
  // Product cache keys
  product: (id: string) => `product:${id}`,
  productList: (category?: string) => category ? `products:category:${category}` : 'products:all',
  productSearch: (query: string) => `products:search:${query}`,

  // Order cache keys
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string) => `orders:user:${userId}`,

  // Quote cache keys
  quote: (id: string) => `quote:${id}`,
  userQuotes: (userId: string) => `quotes:user:${userId}`,

  // User cache keys
  user: (id: string) => `user:${id}`,
  userSession: (sessionId: string) => `session:${sessionId}`,

  // Cart cache keys
  cart: (userId: string) => `cart:${userId}`,

  // Rate limiting keys
  rateLimit: (identifier: string, action: string) => `rate:${action}:${identifier}`,

  // Analytics cache keys
  analytics: (metric: string, date: string) => `analytics:${metric}:${date}`,

  // Configuration cache keys
  config: (key: string) => `config:${key}`,
}

// Cache decorators for common patterns
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 3600
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)

    // Try to get from cache
    const cached = await cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = await fn(...args)
    await cache.set(key, result, ttl)

    return result
  }) as T
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  window: number // in seconds
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = cacheKeys.rateLimit(identifier, action)
  const count = await cache.incr(key, window)
  const ttl = await cache.ttl(key)

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + (ttl * 1000),
  }
}

// Session management
export const sessionStore = {
  async get(sessionId: string): Promise<any> {
    return cache.get(cacheKeys.userSession(sessionId))
  },

  async set(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    return cache.set(cacheKeys.userSession(sessionId), data, ttl)
  },

  async destroy(sessionId: string): Promise<boolean> {
    return cache.del(cacheKeys.userSession(sessionId))
  },

  async touch(sessionId: string, ttl: number = 86400): Promise<boolean> {
    const key = cacheKeys.userSession(sessionId)
    const data = await cache.get(key)
    if (data) {
      return cache.set(key, data, ttl)
    }
    return false
  },
}

// Pub/Sub for real-time features
export const pubsub = {
  publish: async (channel: string, message: any) => {
    try {
      const serialized = JSON.stringify(message)
      await redis.publish(channel, serialized)
      return true
    } catch (error) {
      console.error(`PubSub publish error:`, error)
      return false
    }
  },

  subscribe: (channel: string, callback: (message: any) => void) => {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    })

    subscriber.subscribe(channel)
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message)
          callback(parsed)
        } catch (error) {
          console.error(`PubSub message parse error:`, error)
        }
      }
    })

    return () => {
      subscriber.unsubscribe(channel)
      subscriber.disconnect()
    }
  },
}

export default redis