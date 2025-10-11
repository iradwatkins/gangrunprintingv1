/**
 * Order type definitions for Gang Run Printing
 */

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  configuration?: Record<string, unknown>
  addons?: Array<{
    id: string
    name: string
    price: number
  }>
}

export interface OrderCustomer {
  name: string
  email: string
  phone?: string
  company?: string
}

export interface OrderAddress {
  type: 'billing' | 'shipping'
  street1: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export interface OrderShipping {
  provider: string
  method: string
  trackingNumber?: string
  cost: number
  estimatedDelivery?: Date | string
}

export interface OrderPayment {
  method: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  amount: number
  processedAt?: Date | string
}

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'in_production'
  | 'quality_check'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customerId?: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discount?: number
  total: number
  billingAddress: OrderAddress
  shippingAddress: OrderAddress
  shipping?: OrderShipping
  payment?: OrderPayment
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: Date | string
  updatedAt: Date | string
  completedAt?: Date | string
}

export interface CreateOrderInput {
  customer: Omit<OrderCustomer, 'id'>
  items: Array<{
    productId: string
    quantity: number
    configuration?: Record<string, unknown>
    addons?: string[]
  }>
  billingAddress: Omit<OrderAddress, 'type'>
  shippingAddress: Omit<OrderAddress, 'type'>
  shippingMethod: {
    provider: string
    method: string
  }
  paymentMethod?: string
  notes?: string
}

export interface UpdateOrderInput {
  status?: OrderStatus
  shipping?: Partial<OrderShipping>
  payment?: Partial<OrderPayment>
  notes?: string
}
