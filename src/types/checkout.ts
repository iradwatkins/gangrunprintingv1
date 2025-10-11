/**
 * Shared type definitions for checkout and order-related functionality
 * @module types/checkout
 *
 * NOTE: For validated types with runtime checking, import from:
 * @see @/lib/validations/checkout for Zod schemas and validated types
 */

import type {
  CustomerInfo,
  Address,
  ProductOptions,
  CartItem,
  ShippingRate,
  UploadedImage,
  CheckoutData,
  PayPalOrderDetails,
} from '@/lib/validations/checkout'

// Re-export validated types for backward compatibility
export type {
  CustomerInfo,
  Address,
  ProductOptions,
  CartItem,
  ShippingRate,
  UploadedImage,
  CheckoutData,
  PayPalOrderDetails,
}

/**
 * Individual order item details
 * @deprecated Use CartItem from @/lib/validations/checkout instead
 */
export interface OrderItem {
  productName: string
  quantity: number
  price: number
  options?: ProductOptions
  fileUrl?: string
  fileName?: string
}

/**
 * Complete order information for confirmation pages
 */
export interface OrderInfo {
  orderNumber: string
  orderId?: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  items: OrderItem[]
  uploadedImages?: UploadedImage[]
  customerInfo?: {
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  status?: string
  createdAt?: string
  paidAt?: string
}

/**
 * Shipping rate selection details
 */
export interface ShippingRate {
  carrier: string
  serviceName: string
  rateAmount: number
  estimatedDays?: number
  transitDays?: number
  isAirportDelivery?: boolean
}
