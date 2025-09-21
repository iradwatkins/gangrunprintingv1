import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { POST as sendMagicLinkHandler } from '@/app/api/auth/send-magic-link/route'
import { POST as verifyHandler } from '@/app/api/auth/verify/route'
import { GET as meHandler } from '@/app/api/auth/me/route'
import { createTestUser, cleanupDatabase } from '../utils/db-helpers'

// Mock external dependencies
vi.mock('@/lib/resend', () => ({
  default: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  },
}))

describe('Auth API Routes', () => {
  beforeEach(async () => {
    await cleanupDatabase()
  })

  describe('POST /api/auth/send-magic-link', () => {
    it('should send magic link for valid email', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      const request = new NextRequest('http://localhost:3002/api/auth/send-magic-link', {
        method: 'POST',
        body: JSON.stringify({ email: testUser.email }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await sendMagicLinkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Magic link sent')
    })

    it('should handle missing email', async () => {
      const request = new NextRequest('http://localhost:3002/api/auth/send-magic-link', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await sendMagicLinkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Email is required')
    })

    it('should handle invalid email format', async () => {
      const request = new NextRequest('http://localhost:3002/api/auth/send-magic-link', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await sendMagicLinkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid email format')
    })

    it('should rate limit multiple requests', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      const request = new NextRequest('http://localhost:3002/api/auth/send-magic-link', {
        method: 'POST',
        body: JSON.stringify({ email: testUser.email }),
        headers: { 'Content-Type': 'application/json' },
      })

      // Send multiple requests quickly
      await sendMagicLinkHandler(request)
      await sendMagicLinkHandler(request)
      await sendMagicLinkHandler(request)

      const response = await sendMagicLinkHandler(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('rate limit')
    })
  })

  describe('POST /api/auth/verify', () => {
    it('should verify valid magic link token', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        emailVerified: false,
      })

      // Create a magic link token
      const { prisma } = await import('../utils/db-helpers')
      const token = await prisma.magicLinkToken.create({
        data: {
          token: 'valid-test-token',
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      })

      const request = new NextRequest('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: token.token }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await verifyHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.id).toBe(testUser.id)
    })

    it('should reject expired token', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      const { prisma } = await import('../utils/db-helpers')
      const token = await prisma.magicLinkToken.create({
        data: {
          token: 'expired-test-token',
          userId: testUser.id,
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      })

      const request = new NextRequest('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: token.token }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await verifyHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('expired')
    })

    it('should reject invalid token', async () => {
      const request = new NextRequest('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await verifyHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid or expired token')
    })

    it('should only allow token to be used once', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
      })

      const { prisma } = await import('../utils/db-helpers')
      const token = await prisma.magicLinkToken.create({
        data: {
          token: 'one-time-token',
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      })

      const request = new NextRequest('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: token.token }),
        headers: { 'Content-Type': 'application/json' },
      })

      // First use - should succeed
      const firstResponse = await verifyHandler(request)
      expect(firstResponse.status).toBe(200)

      // Second use - should fail
      const secondResponse = await verifyHandler(request)
      const data = await secondResponse.json()

      expect(secondResponse.status).toBe(400)
      expect(data.error).toContain('Invalid or expired token')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data for authenticated user', async () => {
      const testUser = await createTestUser()
      const session = await import('@/lib/auth').then(({ lucia }) =>
        lucia.createSession(testUser.id, {})
      )

      const request = new NextRequest('http://localhost:3002/api/auth/me', {
        headers: {
          Cookie: `auth_session=${session.id}`,
        },
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe(testUser.id)
      expect(data.user.email).toBe(testUser.email)
    })

    it('should return 401 for unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3002/api/auth/me')

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should return 401 for invalid session', async () => {
      const request = new NextRequest('http://localhost:3002/api/auth/me', {
        headers: {
          Cookie: `auth_session=invalid-session-id`,
        },
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })
  })
})
