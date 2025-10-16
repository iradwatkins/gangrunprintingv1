/**
 * Order Status Manager - Bulk Status Update API
 *
 * POST /api/admin/orders/bulk-status-update
 *
 * Update status for multiple orders with validation and email triggers
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { StatusChangeEmailService } from '@/lib/email/status-change-email-service'

const bulkStatusUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, 'At least one order ID is required').max(100, 'Maximum 100 orders at once'),
  toStatus: z.string().min(1, 'Target status is required'),
  notes: z.string().optional(),
  sendEmail: z.boolean().default(false),
})

interface BulkUpdateResult {
  success: string[]
  failed: Array<{ orderId: string; error: string }>
  summary: {
    total: number
    succeeded: number
    failed: number
  }
}

/**
 * POST /api/admin/orders/bulk-status-update
 *
 * Update status for multiple orders with validation
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bulkStatusUpdateSchema.parse(body)

    // Verify target status exists
    const targetStatus = await prisma.customOrderStatus.findUnique({
      where: { slug: validatedData.toStatus },
      select: {
        id: true,
        slug: true,
        name: true,
        sendEmailOnEnter: true,
        emailTemplateId: true,
      },
    })

    if (!targetStatus) {
      return NextResponse.json(
        { error: `Status "${validatedData.toStatus}" not found` },
        { status: 404 }
      )
    }

    // Get all orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: validatedData.orderIds },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        email: true,
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No valid orders found with provided IDs' },
        { status: 404 }
      )
    }

    const result: BulkUpdateResult = {
      success: [],
      failed: [],
      summary: {
        total: validatedData.orderIds.length,
        succeeded: 0,
        failed: 0,
      },
    }

    // Get all valid transitions for validation
    const validTransitions = await prisma.statusTransition.findMany({
      where: {
        toStatusId: targetStatus.id,
      },
      include: {
        FromStatus: {
          select: { slug: true },
        },
      },
    })

    const validFromStatuses = new Set(validTransitions.map((t) => t.FromStatus.slug))

    // Process each order
    for (const order of orders) {
      try {
        // Check if transition is valid
        if (!validFromStatuses.has(order.status) && order.status !== targetStatus.slug) {
          result.failed.push({
            orderId: order.id,
            error: `Invalid transition from ${order.status} to ${targetStatus.slug}`,
          })
          continue
        }

        // Skip if already in target status
        if (order.status === targetStatus.slug) {
          result.failed.push({
            orderId: order.id,
            error: 'Order already in target status',
          })
          continue
        }

        // Update order status
        await prisma.order.update({
          where: { id: order.id },
          data: { status: targetStatus.slug },
        })

        // Create status history entry
        await prisma.statusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: targetStatus.slug,
            notes: validatedData.notes || `Bulk status update to ${targetStatus.name}`,
            changedBy: user.email || 'Admin',
          },
        })

        // ORDER STATUS MANAGER: Trigger email automation if enabled
        if (validatedData.sendEmail) {
          try {
            await StatusChangeEmailService.sendStatusChangeEmail(order.id, targetStatus.slug, {
              notes: validatedData.notes,
              changedBy: user.email || 'Admin',
            })
          } catch (emailError) {
            // Log but don't fail the entire bulk operation
            console.error(`[Bulk Update] Email failed for order ${order.id}:`, emailError)
          }
        }

        result.success.push(order.id)
        result.summary.succeeded++
      } catch (error) {
        console.error(`[Bulk Update] Failed to update order ${order.id}:`, error)
        result.failed.push({
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Update failed',
        })
        result.summary.failed++
      }
    }

    return NextResponse.json({
      success: result.summary.succeeded > 0,
      result,
      message: `Updated ${result.summary.succeeded} of ${result.summary.total} orders`,
    })
  } catch (error) {
    console.error('[Bulk Status Update API] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process bulk status update' },
      { status: 500 }
    )
  }
}
