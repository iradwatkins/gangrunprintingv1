// Redis Session Store for Lucia Auth
// Implements Redis-based session management for improved performance

import type Redis from 'ioredis'
import { type Adapter, type DatabaseSession, type DatabaseUser } from 'lucia'

export class RedisSessionAdapter implements Adapter {
  private redis: Redis
  private sessionPrefix = 'session:'
  private userSessionPrefix = 'user_sessions:'
  private sessionTTL = 60 * 60 * 24 * 90 // 90 days in seconds

  constructor(redis: Redis) {
    this.redis = redis
  }

  async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const sessionKey = `${this.sessionPrefix}${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (!sessionData) {
      return [null, null]
    }

    const session = JSON.parse(sessionData)

    // Get user data
    const userKey = `user:${session.userId}`
    const userData = await this.redis.get(userKey)

    if (!userData) {
      // Session exists but user doesn't, invalid state
      await this.deleteSession(sessionId)
      return [null, null]
    }

    const user = JSON.parse(userData)

    return [session, user]
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const userSessionKey = `${this.userSessionPrefix}${userId}`
    const sessionIds = await this.redis.smembers(userSessionKey)

    if (sessionIds.length === 0) {
      return []
    }

    // Get all sessions in a pipeline for efficiency
    const pipeline = this.redis.pipeline()
    sessionIds.forEach((id) => {
      pipeline.get(`${this.sessionPrefix}${id}`)
    })

    const results = await pipeline.exec()
    const sessions: DatabaseSession[] = []

    if (results) {
      results.forEach(([err, data]) => {
        if (!err && data) {
          sessions.push(JSON.parse(data as string))
        }
      })
    }

    return sessions
  }

  async setSession(session: DatabaseSession): Promise<void> {
    const sessionKey = `${this.sessionPrefix}${session.id}`
    const userSessionKey = `${this.userSessionPrefix}${session.userId}`

    // Use pipeline for atomic operations
    const pipeline = this.redis.pipeline()

    // Store session with TTL
    pipeline.setex(sessionKey, this.sessionTTL, JSON.stringify(session))

    // Add session ID to user's session set
    pipeline.sadd(userSessionKey, session.id)
    pipeline.expire(userSessionKey, this.sessionTTL)

    await pipeline.exec()
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    const sessionKey = `${this.sessionPrefix}${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (!sessionData) {
      return
    }

    const session = JSON.parse(sessionData)
    session.expiresAt = expiresAt

    // Update with new TTL
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    await this.redis.setex(sessionKey, ttl, JSON.stringify(session))
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `${this.sessionPrefix}${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (!sessionData) {
      return
    }

    const session = JSON.parse(sessionData)
    const userSessionKey = `${this.userSessionPrefix}${session.userId}`

    // Remove session and update user's session set
    const pipeline = this.redis.pipeline()
    pipeline.del(sessionKey)
    pipeline.srem(userSessionKey, sessionId)
    await pipeline.exec()
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const userSessionKey = `${this.userSessionPrefix}${userId}`
    const sessionIds = await this.redis.smembers(userSessionKey)

    if (sessionIds.length === 0) {
      return
    }

    // Delete all sessions and the set in a pipeline
    const pipeline = this.redis.pipeline()

    sessionIds.forEach((id) => {
      pipeline.del(`${this.sessionPrefix}${id}`)
    })

    pipeline.del(userSessionKey)
    await pipeline.exec()
  }

  // Helper method to store user data in Redis
  async setUser(user: DatabaseUser): Promise<void> {
    const userKey = `user:${user.id}`
    await this.redis.setex(userKey, this.sessionTTL, JSON.stringify(user))
  }

  // Helper method to clear expired sessions (can be run as a cron job)
  async clearExpiredSessions(): Promise<number> {
    const pattern = `${this.sessionPrefix}*`
    const keys = await this.redis.keys(pattern)
    let cleared = 0

    for (const key of keys) {
      const sessionData = await this.redis.get(key)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (new Date(session.expiresAt) < new Date()) {
          const sessionId = key.replace(this.sessionPrefix, '')
          await this.deleteSession(sessionId)
          cleared++
        }
      }
    }

    return cleared
  }
}
