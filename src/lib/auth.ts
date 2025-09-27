import { cookies } from 'next/headers'
import { Lucia, TimeSpan } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { generateRandomString } from 'oslo/crypto'

import { MAGIC_LINK_EXPIRY, SERVICE_ENDPOINTS, STRING_GENERATION, SESSION_CONFIG } from '@/config/constants'
import { authLogger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import resend from '@/lib/resend'

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(90, 'd'), // 90 days session lifetime
  getSessionAttributes: () => ({}),
  sessionCookie: {
    name: 'auth_session', // Explicitly set consistent cookie name
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true, // Ensure cookie is not accessible via JavaScript
      // Set proper domain for production to work across subdomains
      domain: process.env.NODE_ENV === 'production' ? '.gangrunprinting.com' : undefined,
      path: '/',
      // Add max age for better browser compatibility
      maxAge: 60 * 60 * 24 * 90, // 90 days in seconds
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
      emailVerified: attributes.emailVerified,
    }
  },
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

export class MagicLinkError extends Error {
  public readonly code: string
  public readonly userMessage: string

  constructor(code: string, message: string, userMessage: string) {
    super(message)
    this.code = code
    this.userMessage = userMessage
    this.name = 'MagicLinkError'
  }
}

interface DatabaseUserAttributes {
  email: string
  name: string
  role: string
  emailVerified: boolean
}

export const validateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    // Enhanced cookie debugging
    const cookieJar = await cookies()
    const allCookies = cookieJar.getAll()
    const sessionCookieName = lucia.sessionCookieName
    const sessionId = cookieJar.get(sessionCookieName)?.value ?? null

    authLogger.debug(`[${requestId}] Session validation started`, {
      requestId,
      sessionCookieName,
      hasSessionId: !!sessionId,
      sessionIdLength: sessionId?.length,
      totalCookies: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      timestamp: new Date().toISOString(),
    })

    if (!sessionId) {
      authLogger.warn(`[${requestId}] No session ID found in cookies`, {
        requestId,
        expectedCookieName: sessionCookieName,
        availableCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        userAgent: process.env.NODE_ENV === 'development' ? 'dev-mode' : 'production',
      })
      return {
        user: null,
        session: null,
      }
    }

    authLogger.debug(`[${requestId}] Validating session ID`, {
      requestId,
      sessionId: sessionId.substring(0, 8) + '...',
      sessionIdFull: sessionId,
    })

    const result = await lucia.validateSession(sessionId)
    const validationTime = Date.now() - startTime

    authLogger.debug(`[${requestId}] Session validation result`, {
      requestId,
      hasSession: !!result.session,
      hasUser: !!result.user,
      sessionFresh: result.session?.fresh,
      sessionExpiry: result.session?.expiresAt?.toISOString(),
      validationTimeMs: validationTime,
    })

    try {
      if (result.session) {
        // ALWAYS extend session for active users to prevent unexpected logouts
        // This aggressive extension ensures users stay logged in during active use
        const timeUntilExpiry = result.session.expiresAt.getTime() - Date.now()
        const hoursUntilExpiry = Math.round(timeUntilExpiry / (1000 * 60 * 60))
        const daysUntilExpiry = Math.round(timeUntilExpiry / (1000 * 60 * 60 * 24))

        // Always extend session if user is active (visiting any page)
        // This prevents the "logged out" issue
        authLogger.info(`[${requestId}] Extending session ${result.session.id}`, {
          requestId,
          sessionId: result.session.id,
          daysUntilExpiry,
          hoursUntilExpiry,
          wasFresh: result.session.fresh,
          userId: result.user?.id,
          userEmail: (result.user as any)?.email,
        })

        const sessionCookie = lucia.createSessionCookie(result.session.id)

        // Ensure cookie attributes match the main configuration
        const enhancedAttributes = {
          ...sessionCookie.attributes,
          maxAge: 60 * 60 * 24 * 90, // 90 days
          domain: process.env.NODE_ENV === 'production' ? '.gangrunprinting.com' : undefined,
        }

        cookieJar.set(sessionCookie.name, sessionCookie.value, enhancedAttributes)

        authLogger.debug(`[${requestId}] Session cookie set with extended lifetime`, {
          requestId,
          cookieName: sessionCookie.name,
          cookieAttributes: enhancedAttributes,
          hasValue: !!sessionCookie.value,
          maxAge: enhancedAttributes.maxAge,
        })
      } else {
        authLogger.warn(`[${requestId}] Invalid session, clearing cookie`, {
          requestId,
          originalSessionId: sessionId.substring(0, 8) + '...',
        })
        const sessionCookie = lucia.createBlankSessionCookie()
        cookieJar.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
    } catch (cookieError) {
      authLogger.error(`[${requestId}] Failed to set session cookie:`, {
        requestId,
        error: cookieError,
        errorMessage: cookieError instanceof Error ? cookieError.message : String(cookieError),
      })
    }

    const totalTime = Date.now() - startTime
    authLogger.debug(`[${requestId}] Session validation completed`, {
      requestId,
      totalTimeMs: totalTime,
      success: !!(result.session && result.user),
      finalResult: { hasUser: !!result.user, hasSession: !!result.session },
    })

    return result as any
  } catch (error) {
    const totalTime = Date.now() - startTime
    authLogger.error(`[${requestId}] Session validation error:`, {
      requestId,
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      totalTimeMs: totalTime,
    })
    return {
      user: null,
      session: null,
    }
  }
}

// Magic Link Authentication Functions
export async function generateMagicLink(email: string): Promise<string> {
  const token = generateRandomString(STRING_GENERATION.TOKEN_LENGTH, STRING_GENERATION.TOKEN_CHARS)
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY)

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: expiresAt,
    },
  })

  return token
}

export async function sendMagicLink(email: string, name?: string): Promise<void> {
  const token = await generateMagicLink(email)
  // Use API route for verification to properly handle cookies
  const baseUrl = SERVICE_ENDPOINTS.APP_BASE_URL
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}&email=${email}`

  // Import sendEmail from resend module
  const { sendEmail } = await import('./resend')

  try {
    await sendEmail({
      to: email,
      subject: 'Sign in to GangRun Printing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Sign in to GangRun Printing</h1>
          <p style="color: #666; font-size: 16px; margin-bottom: 10px;">Hello${name ? ` ${name}` : ''},</p>
          <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Click the button below to sign in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: 500;">Sign In to Your Account</a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">Or copy and paste this link into your browser:</p>
          <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 10px 0;">${magicLink}</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 14px;"><strong>Security Notice:</strong> This link will expire in 15 minutes for your security.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this sign-in link, you can safely ignore this email.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">GangRun Printing - Professional Printing Services</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">© ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Sign in to GangRun Printing\n\nHello${name ? ` ${name}` : ''},\n\nClick the link below to sign in to your account:\n${magicLink}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\nGangRun Printing`,
    })

    authLogger.info('Magic link email sent successfully', { email })
  } catch (error) {
    authLogger.error('Failed to send magic link email:', error)
    // For development, log the link if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev fallback - Magic link:', magicLink)
    }
    throw new Error('Failed to send magic link email. Please try again.')
  }
}

export async function verifyMagicLink(token: string, email: string) {
  // Debug logging disabled for production - uncomment for debugging

  // Input validation
  if (!token || typeof token !== 'string' || token.length !== 32) {
    throw new MagicLinkError(
      'INVALID_TOKEN_FORMAT',
      'Magic link token has invalid format',
      'This magic link appears to be corrupted. Please request a new one.'
    )
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new MagicLinkError(
      'INVALID_EMAIL_FORMAT',
      'Email has invalid format',
      'This magic link appears to be corrupted. Please request a new one.'
    )
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })


  if (!verificationToken) {
    throw new MagicLinkError(
      'TOKEN_NOT_FOUND',
      'Magic link token not found in database',
      'This magic link is invalid or has already been used. Please request a new one.'
    )
  }

  if (verificationToken.expires < new Date()) {
    throw new MagicLinkError(
      'TOKEN_EXPIRED',
      'Magic link token has expired',
      'This magic link has expired. Please request a new one.'
    )
  }

  // Delete the used token with error handling
  try {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })
  } catch (deleteError) {
    authLogger.error('Warning: Failed to delete verification token:', deleteError)
    // Don't throw here - user should still be able to authenticate even if cleanup fails
  }

  // Find or create user with error handling
  let user
  try {
    user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Special handling for admin email
      const role = email === 'iradwatkins@gmail.com' ? 'ADMIN' : 'CUSTOMER'

      user = await prisma.user.create({
        data: {
          id: generateRandomString(STRING_GENERATION.TOKEN_LENGTH, STRING_GENERATION.TOKEN_CHARS),
          email,
          name: email.split('@')[0], // Default name from email
          role,
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
    } else {
      // Mark email as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      })
    }
  } catch (userError) {
    authLogger.error('Database error during user lookup/creation:', userError)
    throw new MagicLinkError(
      'USER_CREATION_FAILED',
      'Failed to create or update user account',
      'There was a problem with your account. Please try again or contact support.'
    )
  }

  // Create session with error handling
  let session
  try {
    session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    // Log session creation without sensitive data
    sessionUtils.logSessionActivity(session.id, 'session_created', {
      method: 'magic_link',
    })

    authLogger.info('Session created successfully')
  } catch (sessionError) {
    authLogger.error('Failed to create session:', sessionError)
    throw new MagicLinkError(
      'SESSION_CREATION_FAILED',
      'Failed to create user session',
      'Authentication succeeded but failed to create session. Please try signing in again.'
    )
  }

  return { user, session }
}

export async function signOut() {
  const { user, session } = await validateRequest()

  if (!session) {
    return {
      error: 'Unauthorized',
    }
  }

  // Log session invalidation without sensitive data
  sessionUtils.logSessionActivity(session.id, 'session_signed_out', {})

  authLogger.info('User signed out')

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}

export type User = {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
}

export type Session = {
  id: string
  userId: string
  expiresAt: Date
}

// Session debugging and monitoring utilities
export const sessionUtils = {
  /**
   * Get detailed session information for debugging
   */
  async getSessionInfo(sessionId: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              emailVerified: true,
            },
          },
        },
      })

      if (!session) {
        return null
      }

      const now = new Date()
      const timeUntilExpiry = session.expiresAt.getTime() - now.getTime()

      return {
        ...session,
        isExpired: session.expiresAt <= now,
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        hoursUntilExpiry: Math.max(0, Math.round(timeUntilExpiry / (1000 * 60 * 60))),
        daysUntilExpiry: Math.max(0, Math.round(timeUntilExpiry / (1000 * 60 * 60 * 24))),
      }
    } catch (error) {
      authLogger.error('Error getting session info:', error)
      return null
    }
  },

  /**
   * Log session activity for debugging
   */
  logSessionActivity(sessionId: string, activity: string, details?: Record<string, any>) {
    authLogger.debug(`Session activity: ${activity}`, {
      sessionId,
      activity,
      timestamp: new Date().toISOString(),
      ...details,
    })
  },

  /**
   * Clean up expired sessions from database
   */
  async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      authLogger.info('Cleaned up expired sessions', {
        deletedCount: result.count,
        timestamp: new Date().toISOString(),
      })

      return result.count
    } catch (error) {
      authLogger.error('Error cleaning up expired sessions:', error)
      return 0
    }
  },

  /**
   * Get session statistics
   */
  async getSessionStats() {
    try {
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const [total, active, expiringSoon] = await Promise.all([
        prisma.session.count(),
        prisma.session.count({
          where: {
            expiresAt: {
              gt: now,
            },
          },
        }),
        prisma.session.count({
          where: {
            expiresAt: {
              gt: now,
              lt: sevenDaysFromNow,
            },
          },
        }),
      ])

      return {
        total,
        active,
        expired: total - active,
        expiringSoon,
        timestamp: now.toISOString(),
      }
    } catch (error) {
      authLogger.error('Error getting session stats:', error)
      return null
    }
  },
}
