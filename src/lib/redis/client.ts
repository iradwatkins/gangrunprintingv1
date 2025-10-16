// Redis Client Configuration
// Singleton Redis client for session management and caching

import Redis from 'ioredis'

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true
        }
        return false
      },
      lazyConnect: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      // Performance optimizations
      enableReadyCheck: true,
      keepAlive: 30000,
    })

    redisClient.on('error', (error) => {
      console.error('Redis Client Error:', error)
    })

    redisClient.on('connect', () => {
      // console.log('Redis Client Connected')
    })

    redisClient.on('ready', () => {
      // console.log('Redis Client Ready')
    })

    redisClient.on('reconnecting', () => {
      // console.log('Redis Client Reconnecting...')
    })
  }

  return redisClient
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}
