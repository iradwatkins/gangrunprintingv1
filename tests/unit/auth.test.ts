import { describe, it, expect, beforeEach, vi } from 'vitest'
import { lucia, validateRequest, sendMagicLink } from '@/lib/auth'
import { createTestUser, cleanupDatabase } from '../utils/db-helpers'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
  }),
}))

// Mock resend
vi.mock('@/lib/resend', () => ({
  default: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  },
}))

describe('Authentication Utilities', () => {
  beforeEach(async () => {
    await cleanupDatabase()
  })

  describe('lucia configuration', () => {
    it('should be properly configured', () => {
      expect(lucia).toBeDefined()
      expect(lucia.sessionCookieName).toBe('auth-session')
    })

    it('should have correct session cookie attributes', () => {
      const config = lucia.sessionCookieAttributes
      expect(config.secure).toBe(process.env.NODE_ENV === 'production')
    })
  })

  describe('validateRequest', () => {
    it('should return null for invalid session', async () => {
      // Mock cookies to return null
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue(null),
        set: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
        getAll: vi.fn(),
      })

      const result = await validateRequest()
      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
    })

    it('should validate and return user for valid session', async () => {
      const testUser = await createTestUser()
      const session = await lucia.createSession(testUser.id, {})

      // Mock cookies to return the session
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: session.id }),
        set: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
        getAll: vi.fn(),
      })

      const result = await validateRequest()
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(testUser.id)
      expect(result.session).toBeDefined()
    })
  })

  describe('sendMagicLink', () => {
    it('should send magic link for valid email', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      const result = await sendMagicLink(testUser.email)
      expect(result.success).toBe(true)
      expect(result.message).toContain('Magic link sent')
    })

    it('should handle non-existent email', async () => {
      const result = await sendMagicLink('nonexistent@example.com')
      expect(result.success).toBe(true) // Security: always return true
      expect(result.message).toContain('Magic link sent')
    })

    it('should generate valid magic link token', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      await sendMagicLink(testUser.email)

      // Verify token was stored in database
      const { prisma } = await import('../utils/db-helpers')
      const tokens = await prisma.magicLinkToken.findMany({
        where: { userId: testUser.id },
      })

      expect(tokens).toHaveLength(1)
      expect(tokens[0].token).toBeDefined()
      expect(tokens[0].expiresAt > new Date()).toBe(true)
    })
  })
})
