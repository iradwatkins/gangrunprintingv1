import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, lucia } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authLogger } from '@/lib/logger'

/**
 * GET /api/admin/sessions
 *
 * Admin endpoint to view all active sessions.
 * Provides session monitoring and debugging capabilities.
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user, session: currentSession } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      authLogger.warn('Non-admin attempted to access sessions endpoint', {
        userId: user?.id,
        userRole: user?.role,
      })
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get pagination parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200) // Max 200 sessions
    const skip = (page - 1) * limit

    // Get total count and sessions with pagination
    const [totalCount, sessions] = await Promise.all([
      prisma.session.count(),
      prisma.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
        orderBy: {
          expiresAt: 'desc',
        },
        skip,
        take: limit,
      })
    ])

    const now = new Date()

    // Process sessions to add computed fields
    const processedSessions = sessions.map(session => {
      const timeUntilExpiry = session.expiresAt.getTime() - now.getTime()
      const isExpired = session.expiresAt <= now
      const isExpiringSoon = timeUntilExpiry < (7 * 24 * 60 * 60 * 1000) // 7 days
      const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24))

      return {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt.toISOString(),
        isExpired,
        isExpiringSoon,
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        isCurrentSession: session.id === currentSession?.id,
        user: session.user,
      }
    })

    // Calculate statistics (for current page only)
    const stats = {
      pageTotal: sessions.length,
      totalCount,
      active: processedSessions.filter(s => !s.isExpired).length,
      expired: processedSessions.filter(s => s.isExpired).length,
      expiringSoon: processedSessions.filter(s => s.isExpiringSoon && !s.isExpired).length,
      byUser: processedSessions.reduce((acc, session) => {
        const email = session.user.email
        if (!acc[email]) {
          acc[email] = { active: 0, expired: 0, total: 0 }
        }
        acc[email].total++
        if (session.isExpired) {
          acc[email].expired++
        } else {
          acc[email].active++
        }
        return acc
      }, {} as Record<string, { active: number; expired: number; total: number }>),
    }

    authLogger.debug(`Admin ${user.email} viewed sessions`, {
      adminId: user.id,
      totalSessions: totalCount,
      activeSessions: stats.active,
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      sessions: processedSessions,
      stats,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      timestamp: now.toISOString(),
    })
  } catch (error) {
    authLogger.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/sessions
 *
 * Admin endpoint to clean up expired sessions.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'cleanup-expired') {
      // Delete expired sessions
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      authLogger.info(`Admin ${user.email} cleaned up expired sessions`, {
        adminId: user.id,
        deletedSessions: result.count,
      })

      return NextResponse.json({
        success: true,
        deletedSessions: result.count,
        message: `Deleted ${result.count} expired sessions`,
      })
    }

    const sessionId = url.searchParams.get('sessionId')
    if (action === 'revoke' && sessionId) {
      // Revoke specific session
      await lucia.invalidateSession(sessionId)

      authLogger.info(`Admin ${user.email} revoked session`, {
        adminId: user.id,
        revokedSessionId: sessionId,
      })

      return NextResponse.json({
        success: true,
        message: `Session ${sessionId} has been revoked`,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error) {
    authLogger.error('Error in session management:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
