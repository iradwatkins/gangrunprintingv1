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
  // Debug logging disabled for production - uncomment for debugging
  // console.log('=== MAGIC LINK GENERATION DEBUG ===');
  // console.log('Generating magic link for email:', email);

  const token = await generateMagicLink(email)
  // console.log('Generated token:', token);
  // console.log('Token length:', token.length);

  // Use API route for verification to properly handle cookies
  const baseUrl = SERVICE_ENDPOINTS.APP_BASE_URL
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}&email=${email}`

  // console.log('Generated magic link:', magicLink);
  // console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

  await resend().emails.send({
    from: 'GangRun Printing <noreply@gangrunprinting.com>',
    to: email,
    subject: 'Sign in to GangRun Printing',
    html: `
      <h1>Sign in to GangRun Printing</h1>
      <p>Hello${name ? ` ${name}` : ''},</p>
      <p>Click the link below to sign in to your account:</p>
      <p><a href="${magicLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

export async function verifyMagicLink(token: string, email: string) {
  // Debug logging disabled for production - uncomment for debugging
  // console.log('=== MAGIC LINK VERIFICATION DEBUG ===');
  // console.log('Received parameters:');
  // console.log('- Token:', token);
  // console.log('- Email:', email);
  // console.log('- Email length:', email?.length);
  // console.log('- Token length:', token?.length);
  // console.log('- Email encoded:', encodeURIComponent(email));

  // Input validation
  if (!token || typeof token !== 'string' || token.length !== 32) {
    // console.log('=== VALIDATION FAILED ===');
    // console.log('Invalid token format');
    throw new MagicLinkError(
      'INVALID_TOKEN_FORMAT',
      'Magic link token has invalid format',
      'This magic link appears to be corrupted. Please request a new one.'
    )
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    // console.log('=== VALIDATION FAILED ===');
    // console.log('Invalid email format');
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

  // console.log('Database query result:');
  // console.log('- Token found:', !!verificationToken);
  if (verificationToken) {
    // console.log('- Token expires:', verificationToken.expires);
    // console.log('- Current time:', new Date());
    // console.log('- Is expired:', verificationToken.expires < new Date());
    // console.log('- Token identifier:', verificationToken.identifier);
    // console.log('- Token value:', verificationToken.token);
  } else {
    // console.log('- No token found with identifier:', email, 'and token:', token);
  }

  if (!verificationToken) {
    // console.log('=== VERIFICATION FAILED ===');
    // console.log('Reason: Token not found');
    throw new MagicLinkError(
      'TOKEN_NOT_FOUND',
      'Magic link token not found in database',
      'This magic link is invalid or has already been used. Please request a new one.'
    )
  }

  if (verificationToken.expires < new Date()) {
    // console.log('=== VERIFICATION FAILED ===');
    // console.log('Reason: Token expired');
    throw new MagicLinkError(
      'TOKEN_EXPIRED',
      'Magic link token has expired',
      'This magic link has expired. Please request a new one.'
    )
  }

  // console.log('=== VERIFICATION SUCCESSFUL ===');

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
    // console.log('Token successfully deleted from database');
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
      // console.log('Creating new user for email:', email);

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

      // console.log('New user created with ID:', user.id);
    } else {
      // console.log('Existing user found, updating verification status');

      // Mark email as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      })

      // console.log('User verification status updated');
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

    // Log session creation for monitoring
    sessionUtils.logSessionActivity(session.id, 'session_created', {
      userId: user.id,
      userEmail: user.email,
      method: 'magic_link',
      expiresAt: session.expiresAt.toISOString(),
    })

    authLogger.info('Session created successfully', {
      sessionId: session.id,
      userId: user.id,
      userEmail: user.email,
      expiresAt: session.expiresAt.toISOString(),
    })
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

  // Log session invalidation for monitoring
  sessionUtils.logSessionActivity(session.id, 'session_signed_out', {
    userId: user?.id,
    userEmail: user?.email,
    sessionId: session.id,
  })

  authLogger.info('User signed out', {
    sessionId: session.id,
    userId: user?.id,
    userEmail: user?.email,
  })

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
