import { z } from 'zod'

/**
 * Form validation utilities and schemas
 */

// Common field validators
export const fieldValidators = {
  email: z.string().email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
      message: 'Please enter a valid phone number',
    }),

  url: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid URL',
    }),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  sku: z
    .string()
    .min(1, 'SKU is required')
    .regex(/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens'),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(999999.99, 'Price is too large')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),

  percentage: z
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),

  requiredString: z.string().min(1, 'This field is required'),

  optionalString: z.string().optional(),

  positiveInteger: z.number().int('Must be a whole number').min(1, 'Must be at least 1'),

  nonNegativeInteger: z.number().int('Must be a whole number').min(0, 'Cannot be negative'),
}

// Product form schemas
export const productFormSchemas = {
  basicInfo: z.object({
    name: fieldValidators.requiredString.max(255, 'Name is too long'),
    slug: fieldValidators.slug,
    sku: fieldValidators.sku,
    categoryId: z.string().uuid('Please select a category'),
    description: fieldValidators.optionalString,
    shortDescription: fieldValidators.optionalString.refine(
      (val) => !val || val.length <= 500,
      'Short description must be 500 characters or less'
    ),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  }),

  pricing: z.object({
    basePrice: fieldValidators.price,
    setupFee: fieldValidators.price.default(0),
  }),

  production: z
    .object({
      productionTime: fieldValidators.positiveInteger,
      rushAvailable: z.boolean().default(false),
      rushDays: fieldValidators.positiveInteger.optional(),
      rushFee: fieldValidators.price.optional(),
      gangRunEligible: z.boolean().default(false),
      minGangQuantity: fieldValidators.positiveInteger.optional(),
      maxGangQuantity: fieldValidators.positiveInteger.optional(),
    })
    .refine(
      (data) => {
        if (data.rushAvailable && !data.rushDays) return false
        return true
      },
      {
        message: 'Rush days is required when rush is available',
        path: ['rushDays'],
      }
    )
    .refine(
      (data) => {
        if (data.gangRunEligible && (!data.minGangQuantity || !data.maxGangQuantity)) {
          return false
        }
        return true
      },
      {
        message: 'Gang run quantities are required when gang run is enabled',
        path: ['minGangQuantity'],
      }
    )
    .refine(
      (data) => {
        if (data.minGangQuantity && data.maxGangQuantity) {
          return data.minGangQuantity <= data.maxGangQuantity
        }
        return true
      },
      {
        message: 'Minimum quantity cannot be greater than maximum quantity',
        path: ['maxGangQuantity'],
      }
    ),
}

// Category form schema
export const categoryFormSchema = z.object({
  name: fieldValidators.requiredString.max(100, 'Name is too long'),
  slug: fieldValidators.slug,
  description: fieldValidators.optionalString,
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  sortOrder: fieldValidators.nonNegativeInteger.default(0),
})

// User form schemas
export const userFormSchemas = {
  profile: z.object({
    name: fieldValidators.requiredString.max(100, 'Name is too long'),
    email: fieldValidators.email,
    phone: fieldValidators.phone,
  }),

  changePassword: z
    .object({
      currentPassword: fieldValidators.requiredString,
      newPassword: fieldValidators.password,
      confirmPassword: fieldValidators.requiredString,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
}

// Order form schema
export const orderFormSchema = z.object({
  email: fieldValidators.email,
  phone: fieldValidators.phone,
  shippingAddress: z.object({
    name: fieldValidators.requiredString,
    company: fieldValidators.optionalString,
    address1: fieldValidators.requiredString,
    address2: fieldValidators.optionalString,
    city: fieldValidators.requiredString,
    state: fieldValidators.requiredString,
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: fieldValidators.requiredString.default('US'),
  }),
})

/**
 * Utility to generate a slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Utility to format validation errors for display
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}

  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formatted[path] = error.message
  })

  return formatted
}

/**
 * Utility to validate a form field in real-time
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: Record<string, unknown>
): { isValid: boolean; error?: string } {
  const result = schema.safeParse(value)

  if (result.success) {
    return { isValid: true }
  } else {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid value',
    }
  }
}
