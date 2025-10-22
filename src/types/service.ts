// Common types for service layer

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: ValidationErrorDetail[]
}

export interface ValidationErrorDetail {
  field: string
  message: string
  code?: string
}

export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FilterOptions {
  [key: string]: any
}

export interface ServiceContext {
  requestId?: string
  userId?: string
  userRole?: string
  timestamp: Date
}

// Order-specific types
export interface CreateOrderInput {
  userId: string
  email: string
  items: OrderItemInput[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  shippingMethod?: string
  totals?: {
    subtotal: number
    tax: number
    shipping: number
    total: number
  }
  metadata?: Record<string, any>
  adminNotes?: string
  funnelId?: string
  funnelStepId?: string
}

export interface OrderItemInput {
  productSku: string
  productName: string
  quantity: number
  price: number
  options?: Record<string, any>
  addOns?: OrderItemAddOnInput[]
  paperStockId?: string
}

export interface OrderItemAddOnInput {
  addOnId: string
  configuration: Record<string, any>
  calculatedPrice: number
}

export interface ShippingAddress {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface UpdateOrderStatusInput {
  status: string
  adminNotes?: string
  trackingNumber?: string
  carrier?: string
  notifyCustomer?: boolean
}

export interface OrderSearchFilters extends FilterOptions {
  status?: string
  userId?: string
  dateRange?: {
    from: Date
    to: Date
  }
  minTotal?: number
  maxTotal?: number
  vendor?: string
}

// User-specific types
export interface CreateUserInput {
  email: string
  name: string
  role?: string
  emailVerified?: boolean
  metadata?: Record<string, any>
}

export interface UpdateUserInput {
  name?: string
  role?: string
  emailVerified?: boolean
  metadata?: Record<string, any>
}

export interface UserSearchFilters extends FilterOptions {
  role?: string
  emailVerified?: boolean
  createdAfter?: Date
  createdBefore?: Date
}

// Vendor-specific types
export interface CreateVendorInput {
  name: string
  contactEmail: string
  orderEmail?: string
  phone?: string
  website?: string
  address?: Record<string, any>
  supportedCarriers: string[]
  turnaroundDays: number
  minimumOrderAmount?: number
  shippingCostFormula?: string
  n8nWebhookUrl?: string
  apiCredentials?: Record<string, any>
  notes?: string
}

export interface UpdateVendorInput {
  name?: string
  contactEmail?: string
  orderEmail?: string
  phone?: string
  website?: string
  address?: Record<string, any>
  supportedCarriers?: string[]
  isActive?: boolean
  turnaroundDays?: number
  minimumOrderAmount?: number
  shippingCostFormula?: string
  n8nWebhookUrl?: string
  apiCredentials?: Record<string, any>
  notes?: string
}

export interface VendorSearchFilters extends FilterOptions {
  isActive?: boolean
  supportedCarrier?: string
  minTurnaroundDays?: number
  maxTurnaroundDays?: number
}

export default ServiceResult
