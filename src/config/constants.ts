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
export const API_RETRY_DELAY = 1000 // 1 second base delay for exponential backoff
export const API_REQUEST_TIMEOUT = 10000 // 10 seconds for individual requests

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
export const EXPRESS_SHIPPING_COST = 25.0
export const STANDARD_SHIPPING_COST = 10.0
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

// External Service URLs
export const EXTERNAL_URLS = {
  GOOGLE_ANALYTICS: 'https://www.google-analytics.com',
  GOOGLE_TAG_MANAGER: 'https://www.googletagmanager.com',
  GOOGLE_USERINFO_API: 'https://openidconnect.googleapis.com/v1/userinfo',
  GOOGLE_FONTS_API: 'https://fonts.googleapis.com/css2',
  SQUARE_CDN: 'https://web.squarecdn.com/v1/square.js',
  EXCHANGE_RATE_API: 'https://v6.exchangerate-api.com/v6',
  TWEAKCN_API: 'https://tweakcn.com/api/themes',
} as const

// Default Ports and Hosts
export const DEFAULT_PORTS = {
  REDIS: 6379,
  OLLAMA: 11434,
  N8N: 5678,
  APP: 3002,
} as const

// Service Endpoints (use environment variables when available)
export const SERVICE_ENDPOINTS = {
  OLLAMA: process.env.OLLAMA_URL || `http://localhost:${DEFAULT_PORTS.OLLAMA}`,
  N8N_WEBHOOK: process.env.N8N_WEBHOOK_URL || 'http://n8n.agistaffers.com/webhook',
  N8N_BASE: process.env.N8N_BASE_URL || 'http://n8n.agistaffers.com',
  MINIO_PUBLIC: process.env.MINIO_PUBLIC_ENDPOINT || 'https://gangrunprinting.com/minio',
  APP_BASE_URL:
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://gangrunprinting.com',
} as const

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_LIMIT: 10,
  POOL_TIMEOUT: 15,
  CONNECT_TIMEOUT: 10,
  STATEMENT_TIMEOUT: 20000,
  IDLE_IN_TRANSACTION_TIMEOUT: 20000,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
} as const

// Image Processing
export const IMAGE_SIZES = {
  THUMBNAIL: 150,
  MEDIUM: 600,
  LARGE: 1200,
  MIN_DIMENSION: 100, // Reduced from 300 to 100 for more flexibility
  MAX_DIMENSION: 5000,
} as const

// Product Image Optimization Profiles
export const PRODUCT_IMAGE_PROFILES = {
  // Business cards need high quality but smaller dimensions
  BUSINESS_CARD: {
    maxDimension: 800,
    quality: 80,
    thumbnailQuality: 75,
    description: 'High quality for detailed business card designs',
  },
  // Banners and posters can use lower quality, larger dimensions acceptable
  BANNER: {
    maxDimension: 1200,
    quality: 65,
    thumbnailQuality: 60,
    description: 'Optimized for large format prints with aggressive compression',
  },
  // Flyers balanced approach
  FLYER: {
    maxDimension: 1000,
    quality: 75,
    thumbnailQuality: 70,
    description: 'Balanced quality and size for flyer designs',
  },
  // Default profile for other products
  DEFAULT: {
    maxDimension: 1200,
    quality: 75,
    thumbnailQuality: 70,
    description: 'Standard optimization for general products',
  },
  // High detail products that need better quality
  PREMIUM: {
    maxDimension: 1200,
    quality: 85,
    thumbnailQuality: 80,
    description: 'Higher quality for detailed premium products',
  },
} as const

// Image Format Priorities (best to worst compression)
export const IMAGE_FORMAT_PRIORITY = {
  AVIF: {
    extension: 'avif',
    mimeType: 'image/avif',
    quality: 60, // AVIF can use lower quality settings for same visual quality
    compressionRatio: 0.4, // ~60% smaller than JPEG
  },
  WEBP: {
    extension: 'webp',
    mimeType: 'image/webp',
    quality: 75,
    compressionRatio: 0.7, // ~30% smaller than JPEG
  },
  JPEG: {
    extension: 'jpg',
    mimeType: 'image/jpeg',
    quality: 80,
    compressionRatio: 1.0, // Baseline
  },
} as const

// Content Analysis Thresholds
export const IMAGE_ANALYSIS = {
  // Threshold for detecting high contrast images (can use lower quality)
  HIGH_CONTRAST_THRESHOLD: 0.7,
  // Threshold for detecting images with lots of text/graphics
  TEXT_DETECTION_THRESHOLD: 0.6,
  // Minimum file size reduction to consider optimization successful
  MIN_COMPRESSION_RATIO: 0.8,
  // Maximum processing time before fallback (milliseconds)
  MAX_PROCESSING_TIME: 30000,
} as const

// Redis Configuration
export const REDIS_CONFIG = {
  DEFAULT_PORT: DEFAULT_PORTS.REDIS,
  RETRY_DELAY_MAX: 2000,
  RETRY_DELAY_MIN: 50,
  DEFAULT_TTL: 3600, // 1 hour
  SESSION_TTL: 86400, // 24 hours
} as const

// Pricing Engine Constants
export const PRICING = {
  SETUP_FEE_THRESHOLD: 100,
  BULK_DISCOUNT_THRESHOLD: 1000,
  EXPRESS_SHIPPING_COST: 25.0,
  STANDARD_SHIPPING_COST: 10.0,
  TAX_RATE: 0.0875, // 8.75%
  SQUARE_TAX_RATE: 0.0825, // 8.25% for Square payments
  EDDM_BASE_FEE: 50.0,
  EDDM_PRICE_PER_PIECE: 0.239,
  DESIGN_COST_ONE_SIDE: 90.0,
  DESIGN_COST_TWO_SIDE: 135.0,
  BUSINESS_CARD_DESIGN_ONE_SIDE: 160.0,
  BUSINESS_CARD_DESIGN_TWO_SIDE: 240.0,
  DEFAULT_ITEMS_PER_BUNDLE: 100,
} as const

// Tracking URLs
export const TRACKING_URLS = {
  SWA_CARGO: 'https://www.swacargo.com/swacargo_com_ui/tracking-details?trackingId=526-',
  FEDEX: 'https://www.fedex.com/fedextrack/?cntry_code=us&tracknumbers=',
  UPS: 'https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=',
} as const

// Performance Monitoring
export const PERFORMANCE = {
  CORE_WEB_VITALS_DELAY: 2000, // 2 seconds after page load
  CLS_MULTIPLIER: 1000, // Convert CLS to integer
} as const

// Content Security Policy
export const CSP_SOURCES = {
  GOOGLE_ANALYTICS: [
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://stats.g.doubleclick.net',
    'https://region1.google-analytics.com',
    'https://region1.analytics.google.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
  ],
  IMAGES: [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://gangrunprinting.com',
    'https://*.gangrunprinting.com',
    'https://lh3.googleusercontent.com',
  ],
} as const

// String Generation
export const STRING_GENERATION = {
  TOKEN_CHARS: 'abcdefghijklmnopqrstuvwxyz0123456789',
  SKU_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  TOKEN_LENGTH: 32,
} as const

// Test Data
export const TEST_DATA = {
  PHONE_NUMBER: '(123) 456-7890',
  TRACKING_NUMBER: '1Z999AA10123456784',
  SAMPLE_ORDER_NUMBER: '1234567890',
} as const

// Square Payment Configuration
export const SQUARE_CONFIG = {
  API_VERSION: '2024-08-21',
  WEBHOOK_SIGNATURE_ALGORITHM: 'sha256',
} as const

// Email Templates
export const EMAIL_STYLES = {
  CONTAINER_MAX_WIDTH: '600px',
  BUTTON_PADDING: '10px 20px',
  BUTTON_RADIUS: '5px',
  PRIMARY_COLOR: '#007bff',
  DARK_COLOR: '#000000',
  LIGHT_COLOR: '#f3f4f6',
  GRAY_COLOR: '#111827',
} as const
