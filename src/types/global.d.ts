// Global Type Definitions for GangRun Printing

import type {
  Order,
  User,
  Product,
  PaperStock,
  AddOn,
  OrderItem,
  Notification as PrismaNotification,
} from '@prisma/client'

// Import CartItem and related types from the canonical source
import type { CartItem, CartState, CartContextType, TurnaroundTimeOption } from '@/lib/cart-types'

declare global {
  // Re-export CartItem to global scope (from canonical source)
  // NOTE: CartItem is now imported from @/lib/cart-types.ts - DO NOT redefine here
  type GlobalCartItem = CartItem
  type GlobalTurnaroundTimeOption = TurnaroundTimeOption

  // Legacy CartAddon for backward compatibility (deprecated - use CartItem.options.addOns)
  interface CartAddon {
    addOnId: string
    addOnName: string
    configuration: Record<string, any>
    price: number
    quantity?: number
  }

  interface Cart {
    items: CartItem[]
    subtotal: number
    tax: number
    shipping: number
    total: number
    shippingAddress?: Address
    billingAddress?: Address
  }

  // Product Types
  interface ProductDimensions {
    width: number
    height: number
    unit: 'inch' | 'cm' | 'mm'
  }

  interface ProductConfiguration {
    size?: string | ProductDimensions
    quantity: number
    paperStock?: string
    coating?: string
    sides?: string
    turnaroundTime?: string
    addons?: CartAddon[]
  }

  // File Upload Types
  interface UploadedImage {
    url: string
    key: string
    size: number
    type: string
    width?: number
    height?: number
    filename?: string
  }

  interface UploadedFile {
    id: string
    filename: string
    fileUrl: string
    fileSize: number
    mimeType: string
    uploadedAt: Date
    metadata?: Record<string, any>
  }

  // Address Types
  interface Address {
    name?: string
    company?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string
    email?: string
  }

  // Order Types
  interface OrderSummary extends Order {
    items: OrderItem[]
    customer?: User
    statusHistory?: StatusHistory[]
  }

  interface StatusHistory {
    id: string
    orderId: string
    fromStatus?: string
    toStatus: string
    notes?: string
    changedBy?: string
    createdAt: Date
  }

  // Notification Types
  interface Notification extends PrismaNotification {
    scheduledFor?: Date
    retryCount?: number
  }

  // API Response Types
  interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }

  interface PaginatedResponse<T = any> {
    data: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
  }

  // Search & Filter Types
  interface SearchFilters {
    query?: string
    status?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    dateFrom?: Date
    dateTo?: Date
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }

  interface PaginationParams {
    page?: number
    limit?: number
    offset?: number
  }

  // Payment Types
  interface PaymentMethod {
    id: string
    type: 'card' | 'ach' | 'paypal' | 'manual'
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
    isDefault?: boolean
  }

  interface PaymentIntent {
    id: string
    amount: number
    currency: string
    status: string
    clientSecret?: string
    paymentMethodId?: string
  }

  // Marketing Types
  interface CampaignMetrics {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
    revenue?: number
    orders?: number
  }

  interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: any // JSON content
    category: string
    isPublic: boolean
  }

  // Admin Types
  interface AdminDashboardStats {
    totalOrders: number
    totalRevenue: number
    newCustomers: number
    pendingOrders: number
    todayOrders: number
    todayRevenue: number
    recentOrders: OrderSummary[]
  }

  interface PrintQueueItem {
    id: string
    orderId: string
    orderNumber: string
    productName: string
    quantity: number
    status: string
    priority: number
    assignedTo?: string
    startedAt?: Date
    completedAt?: Date
  }

  // Settings Types
  interface SiteSettings {
    general: GeneralSettings
    payment: PaymentSettings
    shipping: ShippingSettings
    printing: PrintingSettings
    notifications: NotificationSettings
    integrations: IntegrationSettings
  }

  interface GeneralSettings {
    siteName: string
    siteUrl: string
    contactEmail: string
    contactPhone: string
    timezone: string
    currency: string
  }

  interface PaymentSettings {
    stripeEnabled: boolean
    squareEnabled: boolean
    taxRate: number
    acceptedCards: string[]
  }

  interface ShippingSettings {
    defaultCarrier: string
    freeShippingThreshold?: number
    handlingFee: number
    enablePickup: boolean
  }

  interface PrintingSettings {
    defaultTurnaroundDays: number
    rushEnabled: boolean
    rushFee: number
    gangRunEnabled: boolean
  }

  interface NotificationSettings {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    orderUpdates: boolean
    marketingEmails: boolean
  }

  interface IntegrationSettings {
    n8nEnabled: boolean
    n8nWebhookUrl?: string
    ollamaEnabled: boolean
    ollamaUrl?: string
  }

  // White Label Types
  interface TenantBranding {
    logoUrl?: string
    logoText?: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    customCss?: string
  }

  interface TenantConfig {
    id: string
    name: string
    domain?: string
    subdomain: string
    branding: TenantBranding
    features: string[]
    plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'
  }

  // Type Guards
  function isCartItem(item: any): item is CartItem
  function isAddress(address: any): address is Address
  function isUploadedImage(file: any): file is UploadedImage

  // Utility Types
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }

  type Nullable<T> = T | null | undefined

  type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
    ...args: any
  ) => Promise<infer R>
    ? R
    : never

  // Google Analytics gtag
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

// Export empty object to make this a module
export {}
