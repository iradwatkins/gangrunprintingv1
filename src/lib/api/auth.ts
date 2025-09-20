import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

export interface AuthContext {
  user: any
  session: any
}

export interface AuthOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireRole?: string
}

/**
 * Utility to handle authentication and authorization in API routes
 */
export async function withAuth(
  handler: (
    request: NextRequest,
    context: { params: any },
    auth: AuthContext
  ) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async function (request: NextRequest, context: { params: any }) {
    try {
      const { user, session } = await validateRequest()

      // Check if authentication is required
      if (options.requireAuth && (!session || !user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check for admin requirement
      if (options.requireAdmin && (!session || !user || user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
      }

      // Check for specific role requirement
      if (options.requireRole && (!session || !user || user.role !== options.requireRole)) {
        return NextResponse.json(
          { error: `Unauthorized - ${options.requireRole} access required` },
          { status: 401 }
        )
      }

      return await handler(request, context, { user, session })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Check if user owns resource or is admin
 */
export function checkOwnershipOrAdmin(
  user: any,
  session: any,
  resourceUserId?: string,
  resourceEmail?: string
): boolean {
  if (!session?.user) return false

  // Admin can access anything
  if (session.user.role === 'ADMIN') return true

  // Check ownership by user ID
  if (resourceUserId && user?.id === resourceUserId) return true

  // Check ownership by email
  if (resourceEmail && session.user.email === resourceEmail) return true

  return false
}
