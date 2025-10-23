/**
 * Order Status Manager - Status Transitions API
 *
 * GET    /api/admin/order-statuses/[id]/transitions - Get all transitions for a status
 * POST   /api/admin/order-statuses/[id]/transitions - Add new transition
 * DELETE /api/admin/order-statuses/[id]/transitions - Remove transition
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addTransitionSchema = z.object({
  toStatusId: z.string().min(1, 'Target status is required'),
  requiresPayment: z.boolean().default(false),
  requiresAdmin: z.boolean().default(false),
})

/**
 * GET /api/admin/order-statuses/[id]/transitions
 *
 * Get all valid transitions from this status
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify status exists
    const status = await prisma.customOrderStatus.findUnique({
      where: { id },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    // Get transitions
    const transitions = await prisma.statusTransition.findMany({
      where: { fromStatusId: id },
      include: {
        ToStatus: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            badgeColor: true,
          },
        },
      },
      orderBy: {
        ToStatus: {
          sortOrder: 'asc',
        },
      },
    })

    // Get all available statuses for potential transitions
    const allStatuses = await prisma.customOrderStatus.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        badgeColor: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    const existingTransitionIds = new Set(transitions.map((t) => t.toStatusId))
    const availableStatuses = allStatuses.filter(
      (s) => s.id !== id && !existingTransitionIds.has(s.id)
    )

    return NextResponse.json({
      currentStatus: status,
      transitions,
      availableStatuses,
      total: transitions.length,
    })
  } catch (error) {
    console.error('[Transitions API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch transitions' }, { status: 500 })
  }
}

/**
 * POST /api/admin/order-statuses/[id]/transitions
 *
 * Add a new valid transition from this status
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = addTransitionSchema.parse(body)

    // Verify both statuses exist
    const [fromStatus, toStatus] = await Promise.all([
      prisma.customOrderStatus.findUnique({ where: { id } }),
      prisma.customOrderStatus.findUnique({ where: { id: validatedData.toStatusId } }),
    ])

    if (!fromStatus) {
      return NextResponse.json({ error: 'Source status not found' }, { status: 404 })
    }

    if (!toStatus) {
      return NextResponse.json({ error: 'Target status not found' }, { status: 404 })
    }

    // Prevent self-transition
    if (fromStatus.id === toStatus.id) {
      return NextResponse.json(
        { error: 'Cannot create transition to the same status' },
        { status: 400 }
      )
    }

    // Check if transition already exists
    const existingTransition = await prisma.statusTransition.findUnique({
      where: {
        fromStatusId_toStatusId: {
          fromStatusId: id,
          toStatusId: validatedData.toStatusId,
        },
      },
    })

    if (existingTransition) {
      return NextResponse.json({ error: 'This transition already exists' }, { status: 400 })
    }

    // Create transition
    const transition = await prisma.statusTransition.create({
      data: {
        fromStatusId: id,
        toStatusId: validatedData.toStatusId,
        requiresPayment: validatedData.requiresPayment,
        requiresAdmin: validatedData.requiresAdmin,
      },
      include: {
        FromStatus: {
          select: { id: true, name: true, slug: true },
        },
        ToStatus: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        transition,
        message: `Transition from "${fromStatus.name}" to "${toStatus.name}" created`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Transitions API] POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create transition' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/order-statuses/[id]/transitions
 *
 * Remove a transition (requires toStatusId in query params)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const toStatusId = searchParams.get('toStatusId')

    if (!toStatusId) {
      return NextResponse.json({ error: 'toStatusId query parameter is required' }, { status: 400 })
    }

    // Find and delete transition
    const transition = await prisma.statusTransition.findUnique({
      where: {
        fromStatusId_toStatusId: {
          fromStatusId: id,
          toStatusId,
        },
      },
      include: {
        FromStatus: { select: { name: true } },
        ToStatus: { select: { name: true } },
      },
    })

    if (!transition) {
      return NextResponse.json({ error: 'Transition not found' }, { status: 404 })
    }

    await prisma.statusTransition.delete({
      where: {
        fromStatusId_toStatusId: {
          fromStatusId: id,
          toStatusId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Transition from "${transition.FromStatus.name}" to "${transition.ToStatus.name}" removed`,
    })
  } catch (error) {
    console.error('[Transitions API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete transition' }, { status: 500 })
  }
}
