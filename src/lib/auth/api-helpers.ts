import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, type User, type Session } from '@/lib/auth'

export class AuthenticationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

interface AuthResult {
  user: User
  session: Session
}

interface OptionalAuthResult {
  user: User | null
  session: Session | null
}

/**
 * Requires a valid authenticated user
 * Throws AuthenticationError if no user is found
 */
export async function requireAuth(): Promise<AuthResult> {
  const { user, session } = await validateRequest()

  if (!user || !session) {
    throw new AuthenticationError('Authentication required')
  }

  return { user, session }
}

/**
 * Requires an authenticated admin user
 * Throws AuthenticationError if no user or AuthorizationError if not admin
 */
export async function requireAdminAuth(): Promise<AuthResult> {
  const { user, session } = await requireAuth()

  if (user.role !== 'ADMIN') {
    throw new AuthorizationError('Admin access required')
  }

  return { user, session }
}

/**
 * Optional authentication - returns null if no user
 * Does not throw errors
 */
export async function optionalAuth(): Promise<OptionalAuthResult> {
  const { user, session } = await validateRequest()
  return { user, session }
}

/**
 * Standard error response handler for auth errors
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }

  // Log unexpected errors
  console.error('Unexpected auth error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T extends any[], R>(
  handler: (user: User, session: Session, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      const { user, session } = await requireAuth()
      return await handler(user, session, ...args)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}

/**
 * Wrapper for API routes that require admin authentication
 */
export function withAdminAuth<T extends any[], R>(
  handler: (user: User, session: Session, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      const { user, session } = await requireAdminAuth()
      return await handler(user, session, ...args)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}