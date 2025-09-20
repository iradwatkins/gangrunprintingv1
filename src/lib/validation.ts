/**
 * Common validation utilities for form inputs and data
 * Provides reusable validation functions across the application
 */

import { z } from 'zod'
import { PATTERNS, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/config/constants'

// Common Zod schemas
export const emailSchema = z.string().email('Invalid email address')

export const phoneSchema = z.string().regex(PATTERNS.PHONE, 'Invalid phone number').optional()

export const zipCodeSchema = z.string().regex(PATTERNS.ZIP_CODE, 'Invalid ZIP code')

export const urlSchema = z.string().regex(PATTERNS.URL, 'Invalid URL').optional()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: zipCodeSchema,
  country: z.string().default('US'),
})

// User profile schema
export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().optional(),
})

// Product configuration schema
export const productConfigSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  size: z.string().min(1, 'Size is required'),
  paperStock: z.string().optional(),
  coating: z.string().optional(),
  sides: z.enum(['single', 'double']).default('double'),
})

// Order schema
export const orderSchema = z.object({
  customerInfo: userProfileSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethod: z.enum(['standard', 'express', 'pickup']),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      options: z.record(z.unknown()).optional(),
    })
  ),
})

// File validation schema
export const imageFileSchema = z.custom<File>(
  (file) => {
    if (!(file instanceof File)) return false
    if (file.size > MAX_FILE_SIZE) return false
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as string)) return false
    return true
  },
  {
    message: `File must be an image (JPEG, PNG, WebP, or GIF) and less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  }
)

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return PATTERNS.EMAIL.test(email)
}

/**
 * Validates a phone number
 */
export function isValidPhone(phone: string): boolean {
  return PATTERNS.PHONE.test(phone)
}

/**
 * Validates a ZIP code
 */
export function isValidZipCode(zip: string): boolean {
  return PATTERNS.ZIP_CODE.test(zip)
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  return PATTERNS.URL.test(url)
}

/**
 * Validates a credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '')

  if (!/^\d{13,19}$/.test(cleaned)) return false

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validates file size
 */
export function isValidFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize
}

/**
 * Validates file type
 */
export function isValidFileType(file: File, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Sanitizes user input by removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
    .trim()
}

/**
 * Formats validation errors from Zod
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}

  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formatted[path] = err.message
  })

  return formatted
}

/**
 * Safe parser that returns typed result or error
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: formatZodErrors(result.error) }
}

/**
 * Validates required fields are not empty
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  requiredFields.forEach((field) => {
    const value = data[field]
    if (value === undefined || value === null || value === '') {
      missing.push(String(field))
    }
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Validates a date is not in the past
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date()
}

/**
 * Validates a date is within a range
 */
export function isDateInRange(date: Date, min: Date, max: Date): boolean {
  return date >= min && date <= max
}

/**
 * Validates password strength
 */
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score++
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score++

  if (/[a-z]/.test(password)) score++
  else feedback.push('Include lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Include uppercase letters')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Include numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score++
  else feedback.push('Include special characters')

  return { score: Math.min(score, 5), feedback }
}
