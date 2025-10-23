import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler, ApiError, createSuccessResponse } from '@/lib/api/error-handler'
import { logger } from '@/lib/logger-safe'

const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'PRINTING',
    'QUALITY_CHECK',
    'PACKAGING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
})

export const PATCH = withApiHandler(
  async (request: NextRequest, context, params: { id: string }) => {
    const { user } = await validateRequest()
    const { id: orderId } = params

    if (!user) {
      throw ApiError.authentication()
    }

    // Only admins can update order status
    if (user.role !== 'ADMIN') {
      throw ApiError.authorization('Only administrators can update order status')
    }

    // Parse and validate request body
    const body = await request.json()
    const data = updateStatusSchema.parse(body)

    // Get the current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        orderNumber: true,
        email: true,
        User: {
          select: { name: true },
        },
      },
    })

    if (!order) {
      throw ApiError.notFound('Order')
    }

    logger.info('Updating order status', {
      orderId,
      currentStatus: order.status,
      newStatus: data.status,
      adminId: user.id,
      requestId: context.requestId,
    })

    try {
      // Update the order status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: data.status,
          updatedAt: new Date(),
          // Set paid date if transitioning to PAID status
          ...(data.status === 'PAID' &&
            !order.status.includes('PAID') && {
              paidAt: new Date(),
            }),
        },
      })

      logger.info('Order status updated successfully', {
        orderId,
        oldStatus: order.status,
        newStatus: data.status,
        adminId: user.id,
        requestId: context.requestId,
      })

      return createSuccessResponse(
        {
          id: updatedOrder.id,
          status: updatedOrder.status,
          message: `Order status updated to ${data.status}`,
        },
        200,
        'Order status updated successfully'
      )
    } catch (error) {
      logger.error('Failed to update order status', {
        orderId,
        status: data.status,
        error: error instanceof Error ? error.message : String(error),
        requestId: context.requestId,
      })

      throw ApiError.internal('Failed to update order status. Please try again.')
    }
  },
  {
    validateSchema: updateStatusSchema,
    rateLimit: {
      keyPrefix: 'update_order_status',
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    },
  }
)
