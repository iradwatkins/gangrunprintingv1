import { cache } from 'react'
import { cookies } from 'next/headers'
import { Lucia } from 'lucia'
import { generateRandomString } from 'oslo/crypto'

import { MAGIC_LINK_EXPIRY, SERVICE_ENDPOINTS, STRING_GENERATION } from '@/config/constants'
import { authLogger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import resend from '@/lib/resend'
import { CustomPrismaAdapter } from '@/lib/lucia-prisma-adapter'

// Use custom adapter to handle Prisma case sensitivity
const adapter = new CustomPrismaAdapter(prisma)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
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

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null
    if (!sessionId) {
      return {
        user: null,
        session: null,
      }
    }

    const result = await lucia.validateSession(sessionId)

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
    } catch (error) {
      authLogger.debug('Failed to set session cookie', error)
    }

    return result
  }
)

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
          email,
          name: email.split('@')[0], // Default name from email
          role,
          emailVerified: true,
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

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    // console.log('Session created successfully:', session.id);
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
  const { session } = await validateRequest()

  if (!session) {
    return {
      error: 'Unauthorized',
    }
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
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
