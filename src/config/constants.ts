/**
 * Application-wide constants
 * Centralized location for all hardcoded values and magic numbers
 */

// Application Information
export const APP_NAME = 'GangRun Printing' as const
export const APP_DOMAIN = 'gangrunprinting.com' as const
export const APP_EMAIL = 'info@gangrunprinting.com' as const
export const APP_PHONE = '1-877-GANGRUN' as const

// API Configuration
export const API_TIMEOUT = 30000 // 30 seconds
export const API_RETRY_ATTEMPTS = 3
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Authentication
export const SESSION_COOKIE_NAME = 'gangrun_session' as const
export const MAGIC_LINK_EXPIRY = 15 * 60 * 1000 // 15 minutes
export const ADMIN_EMAIL = 'iradwatkins@gmail.com' as const
export const TOKEN_LENGTH = 32

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'] as const

// Pricing
export const SETUP_FEE_THRESHOLD = 100
export const BULK_DISCOUNT_THRESHOLD = 1000
export const EXPRESS_SHIPPING_COST = 25.00
export const STANDARD_SHIPPING_COST = 10.00
export const TAX_RATE = 0.0875 // 8.75%

// Production
export const DEFAULT_PRODUCTION_TIME = 5 // business days
export const EXPRESS_PRODUCTION_TIME = 2 // business days

// UI
export const TOAST_DURATION = 5000 // 5 seconds
export const DEBOUNCE_DELAY = 300 // milliseconds
export const SKELETON_ITEMS_COUNT = 6
export const ITEMS_PER_ROW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
} as const

// Cache
export const CACHE_TTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
} as const

// Status Values
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  IN_PRODUCTION: 'IN_PRODUCTION',
  READY: 'READY',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
} as const

// Business Hours
export const BUSINESS_HOURS = {
  weekday: {
    open: '08:00',
    close: '18:00',
  },
  saturday: {
    open: '09:00',
    close: '14:00',
  },
  sunday: null, // Closed
  timezone: 'America/Chicago',
} as const

// Shipping Methods
export const SHIPPING_METHODS = {
  standard: {
    id: 'standard',
    name: 'Standard Shipping',
    cost: STANDARD_SHIPPING_COST,
    days: '5-7 business days',
  },
  express: {
    id: 'express',
    name: 'Express Shipping',
    cost: EXPRESS_SHIPPING_COST,
    days: '2-3 business days',
  },
  pickup: {
    id: 'pickup',
    name: 'Local Pickup',
    cost: 0,
    days: 'Same day',
  },
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  DELETED: 'Deleted successfully',
  UPLOADED: 'File uploaded successfully',
  ORDER_PLACED: 'Order placed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'gangrun_cart',
  USER_PREFERENCES: 'gangrun_preferences',
  RECENT_PRODUCTS: 'gangrun_recent',
  DRAFT_ORDER: 'gangrun_draft',
} as const

// Default Values
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'America/Chicago',
  COUNTRY: 'US',
} as const