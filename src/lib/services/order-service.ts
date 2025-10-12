/**
 * OrderService - Printing Company Order Management
 *
 * This service handles all order processing logic for GangRun Printing.
 * We present as a real printing company to customers while coordinating with
 * vendor print shops for production behind the scenes.
 */

import { prisma } from '@/lib/prisma'
import { type OrderStatus, type Carrier } from '@prisma/client'
import { N8NIntegration } from '@/lib/n8n/integration'
import { OrderEmailService } from '@/lib/email/order-email-service'

export interface StatusTransition {
  orderId: string
  fromStatus: OrderStatus
  toStatus: OrderStatus
  notes?: string
  changedBy?: string
  metadata?: Record<string, unknown>
}

export interface VendorAssignment {
  orderId: string
  vendorId: string
  productionDeadline: Date
  notes?: string
}

export interface ShippingUpdate {
  orderId: string
  trackingNumber: string
  carrier: Carrier
  shippingServiceCode?: string
  shippingLabelUrl?: string
  estimatedDelivery?: Date
}

export interface PickupUpdate {
  orderId: string
  pickedUpAt: Date
  pickedUpBy: string
  notes?: string
}

/**
 * ORDER STATUS WORKFLOW (Printing Company)
 *
 * Customer sees standard printing company statuses:
 * 1. PENDING_PAYMENT → Customer checkout, awaiting payment
 * 2. CONFIRMATION → Payment received, files under review
 * 3. PRODUCTION → Order is being printed (vendor handles physical production)
 * 4. SHIPPED / READY_FOR_PICKUP / ON_THE_WAY → Final delivery method
 * 5. DELIVERED / PICKED_UP → Order complete
 *
 * Special states: ON_HOLD, REPRINT, PAYMENT_DECLINED, CANCELLED, REFUNDED
 *
 * Note: Customers see seamless printing company experience. Vendor coordination
 * happens behind the scenes without customer knowledge.
 */

export class OrderService {
  /**
   * Process successful payment from Square webhook
   */
  static async processPayment(
    orderId: string,
    squarePaymentId: string,
    amount: number
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true, User: true },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error(`Cannot process payment for order in status: ${order.status}`)
    }

    // Update order with payment info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMATION',
        paidAt: new Date(),
        squarePaymentId,
        StatusHistory: {
          create: {
            fromStatus: 'PENDING_PAYMENT',
            toStatus: 'CONFIRMATION',
            notes: 'Payment received via Square',
            changedBy: 'System',
          },
        },
      },
    })

    // Update landing page metrics if order came from a landing page
    if (order.sourceLandingPageId) {
      try {
        await prisma.cityLandingPage.update({
          where: { id: order.sourceLandingPageId },
          data: {
            orders: { increment: 1 },
            revenue: { increment: order.total }
          }
        })

        // Recalculate conversion rate
        const landingPage = await prisma.cityLandingPage.findUnique({
          where: { id: order.sourceLandingPageId },
          select: { organicViews: true, orders: true }
        })

        if (landingPage && landingPage.organicViews > 0) {
          const conversionRate = (landingPage.orders / landingPage.organicViews) * 100
          await prisma.cityLandingPage.update({
            where: { id: order.sourceLandingPageId },
            data: { conversionRate }
          })
        }

        console.log(`[OrderService] Landing page metrics updated for order ${order.orderNumber}`)
      } catch (metricsError) {
        // Don't fail payment processing if metrics update fails
        console.error('[OrderService] Failed to update landing page metrics:', metricsError)
      }
    }

    // Send confirmation email
    await this.sendOrderConfirmationEmail(order)

    // Trigger N8N webhook for order confirmed
    await N8NIntegration.triggerWebhook('order_confirmed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      customerEmail: order.email,
      paidAt: new Date().toISOString(),
      items: order.OrderItem,
    })

    console.log(`[OrderService] Payment processed for order ${order.orderNumber}`)
  }

  /**
   * Update order status with validation
   */
  static async updateStatus(transition: StatusTransition): Promise<void> {
    const { orderId, fromStatus, toStatus, notes, changedBy, metadata } = transition

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { Vendor: true, User: true },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Validate transition
    if (order.status !== fromStatus) {
      throw new Error(`Status mismatch: Expected ${fromStatus}, got ${order.status}`)
    }

    if (!this.isValidTransition(fromStatus, toStatus)) {
      throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`)
    }

    // Update order
    const updateData: Record<string, unknown> = {
      status: toStatus,
      StatusHistory: {
        create: {
          fromStatus,
          toStatus,
          notes: notes || `Status changed to ${toStatus}`,
          changedBy: changedBy || 'System',
        },
      },
    }

    // Set timestamps based on status
    switch (toStatus) {
      case 'PRODUCTION':
        updateData.vendorNotifiedAt = new Date()
        break
      case 'DELIVERED':
        updateData.deliveredAt = new Date()
        break
      case 'PICKED_UP':
        updateData.pickedUpAt = new Date()
        break
    }

    // Apply metadata if provided
    if (metadata) {
      Object.assign(updateData, metadata)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    // Send status-specific notifications
    await this.handleStatusChange(order, toStatus, notes)

    // Trigger N8N webhook
    await N8NIntegration.triggerWebhook('order_status_changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: fromStatus,
      newStatus: toStatus,
      changedBy: changedBy || 'System',
      timestamp: new Date().toISOString(),
    })

    console.log(`[OrderService] Status updated: ${order.orderNumber} ${fromStatus} → ${toStatus}`)
  }

  /**
   * Assign vendor to order (moves to PRODUCTION)
   */
  static async assignVendor(assignment: VendorAssignment): Promise<void> {
    const { orderId, vendorId, productionDeadline, notes } = assignment

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { Vendor: true, OrderItem: true },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'CONFIRMATION' && order.status !== 'ON_HOLD') {
      throw new Error(`Cannot assign vendor to order in status: ${order.status}`)
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    })

    if (!vendor || !vendor.isActive) {
      throw new Error('Vendor not found or inactive')
    }

    // Update order with vendor and move to PRODUCTION
    await prisma.order.update({
      where: { id: orderId },
      data: {
        vendorId,
        productionDeadline,
        status: 'PRODUCTION',
        vendorNotifiedAt: new Date(),
        internalNotes: notes || `Assigned to ${vendor.name}`,
        StatusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'PRODUCTION',
            notes: `Vendor assigned: ${vendor.name}`,
            changedBy: 'Admin',
          },
        },
      },
    })

    // Notify vendor via N8N webhook
    await N8NIntegration.triggerWebhook('vendor_assignment', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.contactEmail,
      productionDeadline: productionDeadline.toISOString(),
      orderData: {
        items: order.OrderItem,
        total: order.total,
        customerEmail: order.email,
      },
    })

    console.log(`[OrderService] Vendor assigned: ${order.orderNumber} → ${vendor.name}`)
  }

  /**
   * Update shipping info and mark as SHIPPED
   */
  static async updateShipping(update: ShippingUpdate): Promise<void> {
    const {
      orderId,
      trackingNumber,
      carrier,
      shippingServiceCode,
      shippingLabelUrl,
      estimatedDelivery,
    } = update

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { User: true },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'PRODUCTION') {
      throw new Error(`Cannot ship order in status: ${order.status}`)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        carrier,
        shippingServiceCode,
        shippingLabelUrl,
        estimatedDelivery,
        StatusHistory: {
          create: {
            fromStatus: 'PRODUCTION',
            toStatus: 'SHIPPED',
            notes: `Shipped via ${carrier}`,
            changedBy: 'System',
          },
        },
      },
    })

    // Send shipping notification email
    await this.sendShippingNotification(order, trackingNumber, carrier, estimatedDelivery)

    // Trigger N8N webhook
    await N8NIntegration.triggerWebhook('order_shipped', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
      carrier,
      estimatedDelivery: estimatedDelivery?.toISOString(),
      customerEmail: order.email,
      shippingAddress: order.shippingAddress,
    })

    console.log(
      `[OrderService] Order shipped: ${order.orderNumber} via ${carrier} (${trackingNumber})`
    )
  }

  /**
   * Mark order as picked up
   */
  static async markPickedUp(update: PickupUpdate): Promise<void> {
    const { orderId, pickedUpAt, pickedUpBy, notes } = update

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'READY_FOR_PICKUP' && order.status !== 'ON_THE_WAY') {
      throw new Error(`Cannot mark as picked up from status: ${order.status}`)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PICKED_UP',
        pickedUpAt,
        pickedUpBy,
        StatusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'PICKED_UP',
            notes: notes || `Picked up by ${pickedUpBy}`,
            changedBy: 'Admin',
          },
        },
      },
    })

    // Send pickup confirmation
    await this.sendPickupConfirmation(order)

    // Trigger N8N webhook
    await N8NIntegration.triggerWebhook('order_picked_up', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      pickedUpAt: pickedUpAt.toISOString(),
      pickedUpBy,
      customerEmail: order.email,
    })

    console.log(`[OrderService] Order picked up: ${order.orderNumber} by ${pickedUpBy}`)
  }

  /**
   * Put order on hold
   */
  static async putOnHold(orderId: string, reason: string, adminNotes?: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Can only hold orders before they ship
    const allowedStatuses: OrderStatus[] = ['CONFIRMATION', 'PRODUCTION']
    if (!allowedStatuses.includes(order.status)) {
      throw new Error(`Cannot hold order in status: ${order.status}`)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ON_HOLD',
        holdReason: reason,
        internalNotes: adminNotes,
        StatusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'ON_HOLD',
            notes: `Order held: ${reason}`,
            changedBy: 'Admin',
          },
        },
      },
    })

    // Send on-hold notification
    await this.sendOnHoldNotification(order, reason)

    console.log(`[OrderService] Order on hold: ${order.orderNumber} - ${reason}`)
  }

  /**
   * Resume order from hold
   */
  static async resumeFromHold(orderId: string, resumeStatus: OrderStatus): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'ON_HOLD') {
      throw new Error('Order is not on hold')
    }

    const validResume: OrderStatus[] = ['CONFIRMATION', 'PRODUCTION']
    if (!validResume.includes(resumeStatus)) {
      throw new Error(`Invalid resume status: ${resumeStatus}`)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: resumeStatus,
        holdReason: null,
        StatusHistory: {
          create: {
            fromStatus: 'ON_HOLD',
            toStatus: resumeStatus,
            notes: 'Order resumed',
            changedBy: 'Admin',
          },
        },
      },
    })

    console.log(`[OrderService] Order resumed: ${order.orderNumber} → ${resumeStatus}`)
  }

  /**
   * Validate if status transition is allowed
   */
  private static isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: ['CONFIRMATION', 'PAYMENT_DECLINED', 'CANCELLED'],
      PAYMENT_DECLINED: ['PENDING_PAYMENT', 'CANCELLED'],
      CONFIRMATION: ['PRODUCTION', 'ON_HOLD', 'CANCELLED'],
      ON_HOLD: ['CONFIRMATION', 'PRODUCTION', 'CANCELLED'],
      PRODUCTION: ['SHIPPED', 'READY_FOR_PICKUP', 'ON_THE_WAY', 'ON_HOLD', 'REPRINT'],
      SHIPPED: ['DELIVERED', 'REPRINT'],
      READY_FOR_PICKUP: ['PICKED_UP', 'REPRINT'],
      ON_THE_WAY: ['PICKED_UP', 'REPRINT'],
      PICKED_UP: ['REPRINT'],
      DELIVERED: ['REPRINT'],
      REPRINT: ['PRODUCTION'],
      CANCELLED: [],
      REFUNDED: [],
    }

    return validTransitions[from]?.includes(to) || false
  }

  /**
   * Handle status-specific actions (emails, notifications, etc.)
   */
  private static async handleStatusChange(
    order: any,
    newStatus: OrderStatus,
    notes?: string
  ): Promise<void> {
    switch (newStatus) {
      case 'PRODUCTION':
        // Email sent when vendor is assigned
        break
      case 'SHIPPED':
        // Email sent in updateShipping()
        break
      case 'DELIVERED':
        await this.sendDeliveryConfirmation(order)
        break
      case 'PICKED_UP':
        // Email sent in markPickedUp()
        break
      case 'ON_HOLD':
        // Email sent in putOnHold()
        break
      case 'READY_FOR_PICKUP':
        await this.sendReadyForPickupNotification(order)
        break
      case 'ON_THE_WAY':
        await this.sendOnTheWayNotification(order)
        break
      case 'REPRINT':
        await this.sendReprintNotification(order, notes)
        break
    }
  }

  // ===== EMAIL NOTIFICATIONS =====
  // Integrated with OrderEmailService for all email sending

  private static async sendOrderConfirmationEmail(order: any): Promise<void> {
    try {
      await OrderEmailService.sendOrderConfirmation(order)
    } catch (error) {
      console.error(`[OrderService] Failed to send confirmation email:`, error)
      // Don't throw - email failure shouldn't block order processing
    }
  }

  private static async sendShippingNotification(
    order: any,
    trackingNumber: string,
    carrier: Carrier,
    estimatedDelivery?: Date
  ): Promise<void> {
    try {
      await OrderEmailService.sendShippingNotification(
        order,
        trackingNumber,
        carrier,
        estimatedDelivery?.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      )
    } catch (error) {
      console.error(`[OrderService] Failed to send shipping notification:`, error)
    }
  }

  private static async sendPickupConfirmation(order: any): Promise<void> {
    try {
      const pickupLocation = order.pickupLocation || 'GangRun Printing - Main Office'
      await OrderEmailService.sendReadyForPickup(order, pickupLocation, order.pickupInstructions)
    } catch (error) {
      console.error(`[OrderService] Failed to send pickup confirmation:`, error)
    }
  }

  private static async sendOnHoldNotification(order: any, reason: string): Promise<void> {
    try {
      const actionRequired = 'Please review and respond to the issue described above.'
      await OrderEmailService.sendOnHoldNotification(order, reason, actionRequired)
    } catch (error) {
      console.error(`[OrderService] Failed to send on-hold notification:`, error)
    }
  }

  private static async sendReadyForPickupNotification(order: any): Promise<void> {
    try {
      const pickupLocation = order.pickupLocation || 'GangRun Printing - Main Office'
      await OrderEmailService.sendReadyForPickup(order, pickupLocation, order.pickupInstructions)
    } catch (error) {
      console.error(`[OrderService] Failed to send ready-for-pickup notification:`, error)
    }
  }

  private static async sendOnTheWayNotification(order: any): Promise<void> {
    try {
      // For airport cargo - send shipping notification with carrier info
      await OrderEmailService.sendShippingNotification(
        order,
        order.trackingNumber || 'Delivery in progress',
        order.carrier || 'Local Delivery',
        order.estimatedDelivery?.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      )
    } catch (error) {
      console.error(`[OrderService] Failed to send on-the-way notification:`, error)
    }
  }

  private static async sendReprintNotification(order: any, reason?: string): Promise<void> {
    try {
      const actionRequired = reason || 'Your order is being reprinted to ensure quality.'
      await OrderEmailService.sendOnHoldNotification(order, 'Reprint in Progress', actionRequired)
    } catch (error) {
      console.error(`[OrderService] Failed to send reprint notification:`, error)
    }
  }

  private static async sendDeliveryConfirmation(order: any): Promise<void> {
    try {
      // Use shipping notification template for delivery confirmation
      await OrderEmailService.sendShippingNotification(
        order,
        order.trackingNumber || 'Delivered',
        order.carrier || 'Delivered',
        new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      )
    } catch (error) {
      console.error(`[OrderService] Failed to send delivery confirmation:`, error)
    }
  }
}
