import { sendEmail } from '@/lib/resend'
import { OrderShippedEmail } from './templates/order-shipped'
import { render } from '@react-email/render'
import { logger } from '@/lib/logger-safe'

interface OrderData {
  id: string
  orderNumber: string
  email: string
  total: number
  trackingNumber?: string | null
  carrier?: string | null
  shippingAddress: any
  User?: {
    name?: string | null
  }
}

interface TrackingUpdateData {
  trackingNumber: string
  carrier?: string
  estimatedDelivery?: string
}

export class ShipmentTrackingEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com'
  private static readonly FROM_NAME = 'GangRun Printing'

  /**
   * Detect carrier from tracking number format
   */
  private static detectCarrier(trackingNumber: string): string {
    const cleanNumber = trackingNumber.replace(/\s/g, '').toUpperCase()

    // FedEx patterns
    if (/^\d{12}$/.test(cleanNumber) || /^\d{14}$/.test(cleanNumber)) {
      return 'FEDEX'
    }

    // UPS patterns
    if (/^1Z[0-9A-Z]{16}$/.test(cleanNumber)) {
      return 'UPS'
    }

    // USPS patterns
    if (
      /^(94|93|92|94|95)[0-9]{20}$/.test(cleanNumber) ||
      /^[0-9]{20}$/.test(cleanNumber) ||
      /^[0-9]{13}$/.test(cleanNumber)
    ) {
      return 'USPS'
    }

    // Southwest Cargo patterns (custom)
    if (/^SW[0-9A-Z]{8,12}$/.test(cleanNumber)) {
      return 'SOUTHWEST_CARGO'
    }

    return 'OTHER'
  }

  /**
   * Generate tracking URL based on carrier
   */
  static generateTrackingUrl(trackingNumber: string, carrier: string): string {
    const encodedTracking = encodeURIComponent(trackingNumber)

    switch (carrier.toUpperCase()) {
      case 'FEDEX':
        return `https://www.fedex.com/fedextrack/?cntry_code=us&tracknumbers=${encodedTracking}`
      case 'UPS':
        return `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${encodedTracking}`
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodedTracking}`
      case 'SOUTHWEST_CARGO':
        return `https://www.swacargo.com/swacargo_com_ui/tracking-details?trackingId=526-${encodedTracking}`
      default:
        return `https://www.google.com/search?q=${encodedTracking}+tracking`
    }
  }

  /**
   * Estimate delivery date based on carrier
   */
  private static estimateDelivery(carrier: string): string {
    const now = new Date()
    const businessDays = this.getBusinessDaysForCarrier(carrier)

    // Add business days (skip weekends)
    const deliveryDate = new Date(now)
    let daysAdded = 0

    while (daysAdded < businessDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1)
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysAdded++
      }
    }

    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Get typical business days for each carrier
   */
  private static getBusinessDaysForCarrier(carrier: string): number {
    switch (carrier.toUpperCase()) {
      case 'FEDEX':
        return 2 // FedEx Ground typically 1-3 business days
      case 'UPS':
        return 3 // UPS Ground typically 1-5 business days
      case 'USPS':
        return 3 // USPS Priority typically 1-3 business days
      case 'SOUTHWEST_CARGO':
        return 1 // Airport pickup next business day
      default:
        return 5 // Generic carrier estimate
    }
  }

  /**
   * Send shipment notification email to customer
   */
  static async sendShipmentNotification(
    order: OrderData,
    trackingData: TrackingUpdateData
  ): Promise<boolean> {
    try {
      if (!order.email || !trackingData.trackingNumber) {
        logger.warn('Missing required data for shipment notification', {
          orderId: order.id,
          hasEmail: !!order.email,
          hasTracking: !!trackingData.trackingNumber,
        })
        return false
      }

      // Auto-detect carrier if not provided
      const carrier = trackingData.carrier || this.detectCarrier(trackingData.trackingNumber)

      // Generate tracking URL
      const trackingUrl = this.generateTrackingUrl(trackingData.trackingNumber, carrier)

      // Estimate delivery if not provided
      const estimatedDelivery = trackingData.estimatedDelivery || this.estimateDelivery(carrier)

      // Validate shipping address
      if (!order.shippingAddress) {
        logger.warn('Missing shipping address for shipment notification', {
          orderId: order.id,
          orderNumber: order.orderNumber,
        })
        return false
      }

      // Generate email content
      const emailHtml = await render(
        OrderShippedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || undefined,
          trackingNumber: trackingData.trackingNumber,
          carrier,
          estimatedDelivery,
          shippingAddress: order.shippingAddress,
          trackingUrl,
        })
      )

      // Send email
      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `📦 Your Order Has Shipped - ${order.orderNumber}`,
        html: emailHtml,
      })

      logger.info('Shipment notification email sent successfully', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingNumber: trackingData.trackingNumber,
        carrier,
        customerEmail: order.email,
      })

      return true
    } catch (error) {
      logger.error('Failed to send shipment notification email', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }

  /**
   * Validate tracking number format
   */
  static validateTrackingNumber(trackingNumber: string): {
    isValid: boolean
    carrier?: string
    error?: string
  } {
    if (!trackingNumber || trackingNumber.trim().length === 0) {
      return { isValid: false, error: 'Tracking number is required' }
    }

    const cleanNumber = trackingNumber.replace(/\s/g, '').toUpperCase()

    if (cleanNumber.length < 8 || cleanNumber.length > 35) {
      return { isValid: false, error: 'Tracking number must be 8-35 characters' }
    }

    // Detect carrier
    const carrier = this.detectCarrier(cleanNumber)

    return {
      isValid: true,
      carrier,
    }
  }

  /**
   * Get carrier display name
   */
  static getCarrierDisplayName(carrier: string): string {
    const carrierNames: Record<string, string> = {
      FEDEX: 'FedEx',
      UPS: 'UPS',
      USPS: 'USPS',
      SOUTHWEST_CARGO: 'Southwest Cargo',
      OTHER: 'Other Carrier',
    }

    return carrierNames[carrier.toUpperCase()] || carrier
  }

  /**
   * Get all supported carriers
   */
  static getSupportedCarriers(): Array<{ code: string; name: string; example: string }> {
    return [
      { code: 'FEDEX', name: 'FedEx', example: '123456789012' },
      { code: 'UPS', name: 'UPS', example: '1Z123456789012345678' },
      { code: 'USPS', name: 'USPS', example: '9400123456789012345678' },
      { code: 'SOUTHWEST_CARGO', name: 'Southwest Cargo', example: 'SW12345678' },
      { code: 'OTHER', name: 'Other Carrier', example: 'Custom tracking number' },
    ]
  }
}
