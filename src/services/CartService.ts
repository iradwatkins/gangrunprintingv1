import { type PrismaClient } from '@prisma/client'
import type { CartItem } from '@/lib/cart-types'

export interface OrderSummary {
  subtotal: number
  tax: number
  shipping: number
  total: number
  items: CartItem[]
}

// Service layer for cart and order operations
export class CartService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Validate cart item before adding
  validateCartItem(item: CartItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!item.productId) errors.push('Product ID is required')
    if (!item.quantity || item.quantity <= 0) errors.push('Valid quantity is required')
    if (!item.price || item.price <= 0) errors.push('Valid price is required')
    if (!item.options.paperStock) errors.push('Paper stock selection is required')
    if (!item.options.size) errors.push('Size selection is required')
    if (!item.fileName) errors.push('Design file is required')

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Calculate order summary with taxes and shipping
  calculateOrderSummary(items: CartItem[], shippingAddress?: any): OrderSummary {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Business logic for tax calculation (simplified)
    const taxRate = this.getTaxRate(shippingAddress)
    const tax = subtotal * taxRate

    // Business logic for shipping calculation
    const shipping = this.calculateShipping(items, shippingAddress)

    const total = subtotal + tax + shipping

    return {
      subtotal,
      tax,
      shipping,
      total,
      items,
    }
  }

  // Create order from cart items
  async createOrder(items: CartItem[], customerInfo: any, shippingAddress: any) {
    const orderSummary = this.calculateOrderSummary(items, shippingAddress)

    // Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId: customerInfo.id,
        status: 'PENDING',
        subtotal: orderSummary.subtotal,
        tax: orderSummary.tax,
        shipping: orderSummary.shipping,
        total: orderSummary.total,
        shippingAddress: JSON.stringify(shippingAddress),
        OrderItem: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            configuration: JSON.stringify(item.options),
            customerFileUrl: item.fileUrl,
            customerFileName: item.fileName,
          })) as any,
        },
      } as any,
      include: {
        OrderItem: true,
      },
    })

    return order
  }

  // Get order by ID with full details
  async getOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: true,
        OrderItem: true,
      },
    })
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(notes && { adminNotes: notes }),
        updatedAt: new Date(),
      },
    })
  }

  // Get customer orders
  async getCustomerOrders(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId: customerId },
        include: {
          OrderItem: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: { userId: customerId },
      }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Private helper methods
  private getTaxRate(shippingAddress?: any): number {
    // Simplified tax calculation - in reality, this would use a tax service
    // based on shipping address
    if (shippingAddress?.state === 'TX') return 0.08 // 8% for Texas
    if (shippingAddress?.state === 'CA') return 0.095 // 9.5% for California
    return 0.06 // Default 6%
  }

  private calculateShipping(items: CartItem[], shippingAddress?: any): number {
    // Simplified shipping calculation
    const totalWeight = items.reduce((weight, item) => weight + item.quantity * 0.1, 0) // Assume 0.1 lb per item
    const baseShipping = 5.99
    const weightShipping = totalWeight * 0.5

    // Express shipping for rush orders
    const hasRushOrder = items.some(
      (item) => (item.turnaround as any).includes('rush') || (item.turnaround as any).includes('1 day')
    )

    return baseShipping + weightShipping + (hasRushOrder ? 15.0 : 0)
  }

  // Generate unique SKU for cart item
  generateSKU(item: CartItem): string {
    const productCode = item.productSlug.substring(0, 8).toUpperCase()
    const paperCode = (item.options.paperStockId ?? 'NONE').substring(0, 4).toUpperCase()
    const sizeCode = (item.options.size ?? 'STD').substring(0, 4).toUpperCase()
    const quantityCode = item.quantity.toString().padStart(4, '0')

    return `${productCode}-${paperCode}-${sizeCode}-${quantityCode}`
  }

  // Validate product availability and pricing
  async validateItemPricing(item: CartItem): Promise<{ isValid: boolean; currentPrice?: number }> {
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      select: { basePrice: true, isActive: true },
    })

    if (!product || !product.isActive) {
      return { isValid: false }
    }

    // In a real implementation, you'd recalculate the price based on current configuration
    // and compare it with the cart item price
    const currentPrice = product.basePrice // Simplified - should use ProductService.calculatePrice

    return {
      isValid: true,
      currentPrice,
    }
  }
}
