import { type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger, logBusinessEvent, logError, logPerformance } from '@/lib/logger-safe'
import {
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type OrderSearchFilters,
  type PaginationOptions,
  type PaginatedResult,
  type ServiceContext,
  type ServiceResult,
} from '@/types/service'
import {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  BusinessLogicError,
  normalizeError,
} from '@/exceptions/AppError'

export class OrderService {
  private readonly context: ServiceContext

  constructor(context: ServiceContext) {
    this.context = context
  }

  /**
   * Create a new order with transaction handling
   */
  async createOrder(input: CreateOrderInput): Promise<ServiceResult<any>> {
    const startTime = Date.now()

    try {
      // Validate input
      await this.validateCreateOrderInput(input)

      const result = await prisma.$transaction(async (tx) => {
        // Generate order number
        const orderNumber = this.generateOrderNumber()

        // Calculate totals
        const { subtotal, tax, shipping, total } = await this.calculateOrderTotals(input, tx)

        // Create the order
        const order = await tx.order.create({
          data: {
            orderNumber,
            email: input.email,
            userId: input.userId,
            subtotal,
            tax,
            shipping,
            total,
            status: 'PENDING_PAYMENT',
            shippingAddress: input.shippingAddress as any,
            billingAddress: input.billingAddress as any,
            shippingMethod: input.shippingMethod,
            adminNotes: input.adminNotes,
          },
        })

        // Create order items
        for (const itemInput of input.items) {
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: order.id,
              productSku: itemInput.productSku,
              productName: itemInput.productName,
              quantity: itemInput.quantity,
              price: itemInput.price,
              options: itemInput.options,
              paperStockId: itemInput.paperStockId,
            },
          })

          // Create add-ons if any
          if (itemInput.addOns && itemInput.addOns.length > 0) {
            for (const addOnInput of itemInput.addOns) {
              await tx.orderItemAddOn.create({
                data: {
                  orderItemId: orderItem.id,
                  addOnId: addOnInput.addOnId,
                  configuration: addOnInput.configuration as any,
                  calculatedPrice: addOnInput.calculatedPrice,
                },
              })
            }
          }
        }

        // Create status history entry
        await tx.statusHistory.create({
          data: {
            orderId: order.id,
            toStatus: 'PENDING_PAYMENT',
            fromStatus: 'PENDING_PAYMENT',
            changedBy: this.context.userId || 'system',
            notes: 'Order created',
          },
        })

        return order
      })

      logBusinessEvent('order_created', {
        orderId: result.id,
        orderNumber: result.orderNumber,
        userId: input.userId,
        total: result.total,
        itemCount: input.items.length,
        requestId: this.context.requestId,
      })

      logPerformance('create_order', Date.now() - startTime, {
        orderId: result.id,
        itemCount: input.items.length,
      })

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to create order')
      logError(normalizedError, {
        operation: 'create_order',
        input: { ...input, items: input.items.length },
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId: string, includeItems: boolean = true): Promise<ServiceResult<any>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          OrderItem: includeItems
            ? {
                include: {
                  OrderItemAddOn: {
                    include: {
                      AddOn: true,
                    },
                  },
                  PaperStock: true,
                },
              }
            : false,
          StatusHistory: {
            orderBy: { createdAt: 'desc' },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Vendor: true,
        },
      })

      if (!order) {
        throw new NotFoundError('Order', orderId)
      }

      return {
        success: true,
        data: order,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get order')
      logError(normalizedError, {
        operation: 'get_order_by_id',
        orderId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Update order status with proper state transitions
   */
  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput
  ): Promise<ServiceResult<any>> {
    try {
      // Validate status transition
      const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, orderNumber: true },
      })

      if (!currentOrder) {
        throw new NotFoundError('Order', orderId)
      }

      if (!this.isValidStatusTransition(currentOrder.status, input.status)) {
        throw new BusinessLogicError(
          `Invalid status transition from ${currentOrder.status} to ${input.status}`,
          { currentStatus: currentOrder.status, newStatus: input.status }
        )
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update order with broker-specific timestamp fields
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: input.status as any,
            adminNotes: input.adminNotes,
            trackingNumber: input.trackingNumber,
            carrier: input.carrier as any,
            ...(input.status === 'CONFIRMATION' && { paidAt: new Date() }),
            ...(input.status === 'SHIPPED' && { updatedAt: new Date() }),
            ...(input.status === 'PICKED_UP' && { pickedUpAt: new Date() }),
            ...(input.status === 'DELIVERED' && { deliveredAt: new Date() }),
          },
        })

        // Create status history entry
        await tx.statusHistory.create({
          data: {
            orderId,
            toStatus: input.status as any,
            fromStatus: currentOrder.status as any,
            changedBy: this.context.userId || 'system',
            notes: input.adminNotes || `Status changed to ${input.status}`,
          },
        })

        return updatedOrder
      })

      logBusinessEvent('order_status_updated', {
        orderId,
        orderNumber: currentOrder.orderNumber,
        oldStatus: currentOrder.status,
        newStatus: input.status,
        changedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to update order status')
      logError(normalizedError, {
        operation: 'update_order_status',
        orderId,
        input,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Search orders with filtering and pagination
   */
  async searchOrders(
    filters: OrderSearchFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ServiceResult<PaginatedResult<any>>> {
    try {
      const where: Prisma.OrderWhereInput = this.buildOrderWhereClause(filters)
      const orderBy = this.buildOrderByClause(pagination)

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            OrderItem: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                price: true,
              },
            },
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy,
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.order.count({ where }),
      ])

      const totalPages = Math.ceil(total / pagination.limit)

      const result: PaginatedResult<any> = {
        data: orders,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to search orders')
      logError(normalizedError, {
        operation: 'search_orders',
        filters,
        pagination,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Cancel an order (soft delete with status change)
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ServiceResult<any>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, orderNumber: true },
      })

      if (!order) {
        throw new NotFoundError('Order', orderId)
      }

      // Check if order can be cancelled
      const cancellableStatuses = ['PENDING_PAYMENT', 'PAID', 'CONFIRMATION']
      if (!cancellableStatuses.includes(order.status)) {
        throw new BusinessLogicError(`Order cannot be cancelled from status: ${order.status}`, {
          currentStatus: order.status,
        })
      }

      const result = await prisma.$transaction(async (tx) => {
        const cancelledOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            adminNotes: reason || 'Order cancelled',
          },
        })

        await tx.statusHistory.create({
          data: {
            orderId,
            toStatus: 'CANCELLED',
            fromStatus: order.status as any,
            changedBy: this.context.userId || 'system',
            notes: reason || 'Order cancelled',
          },
        })

        return cancelledOrder
      })

      logBusinessEvent('order_cancelled', {
        orderId,
        orderNumber: order.orderNumber,
        reason,
        cancelledBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to cancel order')
      logError(normalizedError, {
        operation: 'cancel_order',
        orderId,
        reason,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  // Private helper methods

  private async validateCreateOrderInput(input: CreateOrderInput): Promise<void> {
    if (!input.userId || !input.email) {
      throw new ValidationError('User ID and email are required')
    }

    if (!input.items || input.items.length === 0) {
      throw new ValidationError('At least one order item is required')
    }

    if (!input.shippingAddress) {
      throw new ValidationError('Shipping address is required')
    }

    // Validate each item
    for (const item of input.items) {
      if (!item.productSku || !item.productName || item.quantity <= 0 || item.price < 0) {
        throw new ValidationError('Invalid order item data')
      }
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `ORD-${timestamp}-${random}`
  }

  private async calculateOrderTotals(
    input: CreateOrderInput,
    tx: Prisma.TransactionClient
  ): Promise<{ subtotal: number; tax: number; shipping: number; total: number }> {
    // Calculate subtotal from items
    const subtotal = input.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const addOnTotal =
        item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.calculatedPrice, 0) || 0
      return sum + itemTotal + addOnTotal
    }, 0)

    // Calculate tax (8.25% for Texas)
    const taxRate = 0.0825
    const tax = subtotal * taxRate

    // Calculate shipping (simplified - in real app would integrate with shipping API)
    const shipping = this.calculateShipping(input)

    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }

  private calculateShipping(input: CreateOrderInput): number {
    // Simplified shipping calculation
    // In production, this would integrate with actual shipping APIs
    const baseShipping = 9.99
    const itemCount = input.items.reduce((sum, item) => sum + item.quantity, 0)

    // Add $2 per additional item after first 5
    const additionalShipping = Math.max(0, itemCount - 5) * 2

    return baseShipping + additionalShipping
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Printing Company Order Status Transitions
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ['CONFIRMATION', 'PAYMENT_DECLINED', 'CANCELLED'],
      PAYMENT_DECLINED: ['PENDING_PAYMENT', 'CANCELLED'],
      CONFIRMATION: ['PRODUCTION', 'ON_HOLD', 'CANCELLED', 'REFUNDED'],
      ON_HOLD: ['CONFIRMATION', 'PRODUCTION', 'CANCELLED'],
      PRODUCTION: ['SHIPPED', 'READY_FOR_PICKUP', 'ON_HOLD', 'REPRINT'],
      SHIPPED: ['ON_THE_WAY', 'DELIVERED', 'REPRINT'],
      READY_FOR_PICKUP: ['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'],
      ON_THE_WAY: ['DELIVERED', 'PICKED_UP'],
      PICKED_UP: ['DELIVERED'],
      DELIVERED: ['REPRINT'], // Can request reprint after delivery
      REPRINT: ['PRODUCTION'], // Reprint goes back to production
      CANCELLED: ['REFUNDED'], // Can refund cancelled orders
      REFUNDED: [], // Terminal state
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  private buildOrderWhereClause(filters: OrderSearchFilters): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {}

    if (filters.status) {
      where.status = filters.status as any
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.from,
        lte: filters.dateRange.to,
      }
    }

    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
      where.total = {}
      if (filters.minTotal !== undefined) {
        where.total.gte = filters.minTotal
      }
      if (filters.maxTotal !== undefined) {
        where.total.lte = filters.maxTotal
      }
    }

    if (filters.vendor) {
      where.vendorId = filters.vendor
    }

    return where
  }

  private buildOrderByClause(pagination: PaginationOptions): Prisma.OrderOrderByWithRelationInput {
    const sortBy = pagination.sortBy || 'createdAt'
    const sortOrder = pagination.sortOrder || 'desc'

    return {
      [sortBy]: sortOrder,
    }
  }
}

export default OrderService
