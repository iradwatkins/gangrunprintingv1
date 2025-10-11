/**
 * Checkout validation schemas using Zod
 * Provides runtime type safety for checkout flow
 */

import { z } from 'zod'

/**
 * Customer information schema
 */
export const customerInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20)
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
})

/**
 * Address schema (reusable for shipping and billing)
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State must be 2 characters').toUpperCase(),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .transform((val) => val.replace(/[^0-9]/g, '')),
  country: z.string().length(2).default('US'),
})

/**
 * Product options schema
 */
export const productOptionsSchema = z.object({
  size: z.string().optional(),
  paperStock: z.string().optional(),
  paperStockId: z.string().uuid().optional(),
  coating: z.string().optional(),
  sides: z.string().optional(),
  turnaround: z.string().optional(),
  turnaroundId: z.string().uuid().optional(),
}).catchall(z.string()) // Allow additional string properties

/**
 * Cart item dimensions schema
 */
export const dimensionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  unit: z.enum(['in', 'cm', 'mm']).default('in'),
})

/**
 * Cart item schema
 */
export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
  options: productOptionsSchema.optional(),
  dimensions: dimensionsSchema.optional(),
  paperStockWeight: z.number().positive().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().nonnegative().optional(),
})

/**
 * Shipping rate schema
 */
export const shippingRateSchema = z.object({
  carrier: z.string().min(1, 'Carrier is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  rateAmount: z.number().nonnegative('Rate must be non-negative'),
  estimatedDays: z.number().int().positive().optional(),
  transitDays: z.number().int().positive().optional(),
  isAirportDelivery: z.boolean().optional(),
})

/**
 * Uploaded image schema
 */
export const uploadedImageSchema = z.object({
  id: z.string(),
  url: z.string().url('Invalid image URL'),
  thumbnailUrl: z.string().url().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  uploadedAt: z.string().datetime(),
})

/**
 * Complete checkout data schema
 */
export const checkoutDataSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'At least one item is required'),
  uploadedImages: z.array(uploadedImageSchema).optional().default([]),
  customerInfo: customerInfoSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional().nullable(),
  shippingRate: shippingRateSchema.optional().nullable(),
  selectedAirportId: z.string().uuid().optional().nullable(),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  tax: z.number().nonnegative('Tax must be non-negative'),
  shipping: z.number().nonnegative('Shipping must be non-negative'),
  total: z.number().positive('Total must be positive'),
})

/**
 * Payment method schema
 */
export const paymentMethodSchema = z.enum([
  'test_cash',
  'square',
  'paypal',
  'card',
  'stripe',
])

/**
 * PayPal order details schema
 */
export const paypalOrderDetailsSchema = z.object({
  paymentID: z.string().min(1, 'Payment ID is required'),
  orderID: z.string().min(1, 'Order ID is required'),
  payerID: z.string().optional(),
  intent: z.string().optional(),
  status: z.string().optional(),
})

/**
 * Square payment result schema
 */
export const squarePaymentResultSchema = z.object({
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
})

/**
 * Order creation request schema
 */
export const createOrderRequestSchema = checkoutDataSchema.extend({
  paymentMethod: paymentMethodSchema.optional(),
  paymentId: z.string().optional(),
  paypalOrderId: z.string().optional(),
})

/**
 * Type exports for use in components
 */
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type Address = z.infer<typeof addressSchema>
export type ProductOptions = z.infer<typeof productOptionsSchema>
export type CartItem = z.infer<typeof cartItemSchema>
export type ShippingRate = z.infer<typeof shippingRateSchema>
export type UploadedImage = z.infer<typeof uploadedImageSchema>
export type CheckoutData = z.infer<typeof checkoutDataSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type PayPalOrderDetails = z.infer<typeof paypalOrderDetailsSchema>
export type SquarePaymentResult = z.infer<typeof squarePaymentResultSchema>
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

/**
 * Validation helper functions
 */
export const validateCustomerInfo = (data: unknown) => {
  return customerInfoSchema.safeParse(data)
}

export const validateAddress = (data: unknown) => {
  return addressSchema.safeParse(data)
}

export const validateCartItem = (data: unknown) => {
  return cartItemSchema.safeParse(data)
}

export const validateCheckoutData = (data: unknown) => {
  return checkoutDataSchema.safeParse(data)
}

export const validateCreateOrderRequest = (data: unknown) => {
  return createOrderRequestSchema.safeParse(data)
}
