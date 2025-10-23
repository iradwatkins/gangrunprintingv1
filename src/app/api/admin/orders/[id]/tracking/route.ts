import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'
import { withApiHandler, ApiError, createSuccessResponse } from '@/lib/api/error-handler'
import { ShipmentTrackingEmailService } from '@/lib/email/shipment-tracking-email-service'
import { logger } from '@/lib/logger-safe'

const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  carrier: z.string().optional(),
})

export const PATCH = withApiHandler(
  async (request: NextRequest, context, params: { id: string }) => {
    const { user } = await validateRequest()
    const { id: orderId } = params

    if (!user) {
      throw ApiError.authentication()
    }

    // Only admins can update tracking information
    if (user.role !== 'ADMIN') {
      throw ApiError.authorization('Only administrators can update tracking information')
    }

    // Parse and validate request body
    const body = await request.json()
    const data = updateTrackingSchema.parse(body)

    // Validate tracking number format
    const validation = ShipmentTrackingEmailService.validateTrackingNumber(data.trackingNumber)
    if (!validation.isValid) {
      throw ApiError.validation(validation.error || 'Invalid tracking number format')
    }

    // Get the current order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: {
          select: { name: true },
        },
      },
    })

    if (!order) {
      throw ApiError.notFound('Order')
    }

    // Detect carrier if not provided
    const carrier = data.carrier || validation.carrier || 'OTHER'

    logger.info('Updating tracking information', {
      orderId,
      orderNumber: order.orderNumber,
      trackingNumber: data.trackingNumber,
      carrier,
      currentStatus: order.status,
      adminId: user.id,
      requestId: context.requestId,
    })

    try {
      // Start transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Update order with tracking information and status
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            trackingNumber: data.trackingNumber,
            carrier,
            status: 'SHIPPED', // Automatically set to shipped when tracking is added
            updatedAt: new Date(),
          },
          include: {
            User: {
              select: { name: true },
            },
          },
        })

        return updatedOrder
      })

      // Send shipment notification email (async, don't block response)
      if (result.email && result.shippingAddress) {
        ShipmentTrackingEmailService.sendShipmentNotification(
          {
            id: result.id,
            orderNumber: result.orderNumber,
            email: result.email,
            total: result.total,
            trackingNumber: result.trackingNumber,
            carrier: result.carrier,
            shippingAddress: result.shippingAddress,
            User: result.User,
          },
          {
            trackingNumber: data.trackingNumber,
            carrier,
          }
        ).catch((emailError) => {
          logger.error('Failed to send shipment notification email', {
            orderId,
            error: emailError instanceof Error ? emailError.message : String(emailError),
            requestId: context.requestId,
          })
        })
      }

      logger.info('Tracking information updated successfully', {
        orderId,
        orderNumber: result.orderNumber,
        trackingNumber: data.trackingNumber,
        carrier,
        newStatus: result.status,
        adminId: user.id,
        requestId: context.requestId,
      })

      return createSuccessResponse(
        {
          id: result.id,
          trackingNumber: result.trackingNumber,
          carrier: result.carrier,
          status: result.status,
          carrierDisplayName: ShipmentTrackingEmailService.getCarrierDisplayName(carrier),
          message: 'Tracking information updated and customer notified',
        },
        200,
        'Tracking information updated successfully'
      )
    } catch (error) {
      logger.error('Failed to update tracking information', {
        orderId,
        trackingNumber: data.trackingNumber,
        error: error instanceof Error ? error.message : String(error),
        requestId: context.requestId,
      })

      throw ApiError.internal('Failed to update tracking information. Please try again.')
    }
  },
  {
    validateSchema: updateTrackingSchema,
    rateLimit: {
      keyPrefix: 'update_tracking',
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    },
  }
)
