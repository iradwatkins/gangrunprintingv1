/**
 * Common validation schemas and utilities
 * Reusable validation logic across the application
 */

import { z } from 'zod'

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * Email validation with detailed error messages
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')

/**
 * Phone number validation (US format)
 */
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number is too long')
  .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\D/g, '')) // Strip non-digits

/**
 * US ZIP code validation
 */
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
  .transform((val) => val.replace(/[^0-9]/g, ''))

/**
 * US state code validation (2-letter abbreviation)
 */
export const stateCodeSchema = z
  .string()
  .length(2, 'State code must be 2 characters')
  .toUpperCase()
  .refine(
    (val) => {
      const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
      ]
      return validStates.includes(val)
    },
    { message: 'Invalid US state code' }
  )

/**
 * URL validation with protocol requirement
 */
export const urlSchema = z.string().url('Invalid URL format')

/**
 * Positive number validation
 */
export const positiveNumberSchema = z.number().positive('Must be a positive number')

/**
 * Non-negative number validation
 */
export const nonNegativeNumberSchema = z.number().nonnegative('Must be zero or positive')

/**
 * Positive integer validation
 */
export const positiveIntegerSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number')

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100')

/**
 * Currency amount validation (in cents or dollars)
 */
export const currencySchema = z
  .number()
  .nonnegative('Amount must be zero or positive')
  .finite('Amount must be a valid number')

/**
 * Slug validation (URL-friendly string)
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug is too long')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
}).refine(
  (data) => data.from <= data.to,
  { message: 'Start date must be before or equal to end date' }
)

/**
 * Pagination parameters validation
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Search query validation
 */
export const searchQuerySchema = z
  .string()
  .min(1, 'Search query cannot be empty')
  .max(200, 'Search query is too long')
  .trim()

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255),
  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(50 * 1024 * 1024, 'File size cannot exceed 50MB'),
  mimeType: z.string().regex(/^[\w-]+\/[\w-]+$/, 'Invalid MIME type'),
  url: urlSchema,
})

/**
 * Image metadata validation
 */
export const imageMetadataSchema = z.object({
  width: positiveIntegerSchema.optional(),
  height: positiveIntegerSchema.optional(),
  alt: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
})

/**
 * Status enum validation
 */
export const orderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAYMENT_DECLINED',
  'CONFIRMATION',
  'ON_HOLD',
  'PRODUCTION',
  'SHIPPED',
  'READY_FOR_PICKUP',
  'ON_THE_WAY',
  'PICKED_UP',
  'DELIVERED',
  'REPRINT',
  'CANCELLED',
  'REFUNDED',
])

/**
 * Carrier enum validation
 */
export const carrierSchema = z.enum([
  'USPS',
  'UPS',
  'FEDEX',
  'DHL',
  'SOUTHWEST_CARGO',
  'DELTA_CARGO',
  'AMERICAN_CARGO',
  'LOCAL_DELIVERY',
])

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: z.ZodError }

/**
 * Helper function to safely validate data
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Validation failed',
      details: result.error,
    }
  }
}

/**
 * Helper function to format Zod errors for display
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.join('.')
      return path ? `${path}: ${err.message}` : err.message
    })
    .join(', ')
}

/**
 * Helper function to extract first error message
 */
export function getFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation failed'
}

/**
 * Type exports
 */
export type UUID = z.infer<typeof uuidSchema>
export type Email = z.infer<typeof emailSchema>
export type Phone = z.infer<typeof phoneSchema>
export type ZipCode = z.infer<typeof zipCodeSchema>
export type StateCode = z.infer<typeof stateCodeSchema>
export type URL = z.infer<typeof urlSchema>
export type Slug = z.infer<typeof slugSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type ImageMetadata = z.infer<typeof imageMetadataSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type Carrier = z.infer<typeof carrierSchema>
