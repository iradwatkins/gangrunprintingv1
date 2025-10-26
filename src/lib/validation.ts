import { MAX_FILE_SIZE, TAX_RATE, DEFAULT_WAREHOUSE_ZIP } from '@/lib/constants'
import { z } from 'zod'

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255).trim(),
  sku: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]*$/, 'SKU can only contain lowercase letters, numbers, and hyphens')
    .trim()
    .optional()
    .default(''),
  categoryId: z.string().cuid('Category ID must be valid'),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        alt: z.string().max(255).optional(),
        caption: z.string().max(500).optional(),
        isPrimary: z.boolean().optional(),
        sortOrder: z.number().int().min(0).optional(),
        imageId: z.string().optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        fileSize: z.number().int().positive().optional(),
        mimeType: z.string().optional(),
      })
    )
    .default([]),
  paperStockSetId: z.string().min(1, 'Paper stock set ID is required'),
  quantityGroupId: z.string().min(1, 'Quantity group ID is required'),
  sizeGroupId: z.string().min(1, 'Size group ID is required'),
  selectedAddOns: z.array(z.string().min(1)).default([]), // Accept both UUID and CUID formats
  turnaroundTimeSetId: z.string().optional().nullable(),
  addOnSetId: z.string().optional().nullable(),
  designSetId: z.string().optional().nullable(),
  productionTime: z.number().int().min(1).max(365).default(3),
  rushAvailable: z.boolean().default(false),
  rushDays: z.number().int().min(1).max(30).optional().nullable(),
  rushFee: z.number().min(0).max(10000).optional().nullable(),
  basePrice: z.number().min(0).max(100000).default(0),
  setupFee: z.number().min(0).max(10000).default(0),
})

// Pricing calculation validation schema
export const pricingCalculationRequestSchema = z.object({
  productId: z.string().optional(),
  categoryId: z.string().optional(),

  // Size configuration
  sizeSelection: z.enum(['standard', 'custom']).default('standard'),
  standardSizeId: z.string().optional().nullable(),
  customWidth: z.number().positive().optional().nullable(),
  customHeight: z.number().positive().optional().nullable(),

  // Quantity configuration
  quantitySelection: z.enum(['standard', 'custom']).default('standard'),
  standardQuantityId: z.string().optional().nullable(),
  customQuantity: z.number().int().positive().optional().nullable(),

  // Paper configuration
  paperStockId: z.string().optional().nullable(),
  sides: z.enum(['single', 'double']).default('single'),

  // Turnaround
  turnaroundId: z.string().optional().nullable(),

  // Add-ons
  selectedAddons: z
    .array(
      z.object({
        addonId: z.string(),
        quantity: z.number().int().positive().optional(),
        configuration: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .default([]),

  // Customer type
  isBroker: z.boolean().default(false),
  brokerCategoryDiscounts: z
    .array(
      z.object({
        categoryId: z.string(),
        discountPercent: z.number().min(0).max(100),
      })
    )
    .default([]),
})

// Common validation helpers
export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')

// File upload validation
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(MAX_FILE_SIZE), // 10MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
})

export function validateImageFile(
  file: File,
  maxSize = MAX_FILE_SIZE
): { isValid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)' }
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return { isValid: false, error: `Image is ${sizeMB}MB but must be less than ${maxSizeMB}MB` }
  }

  return { isValid: true }
}

export function validateImageDimensions(
  width: number,
  height: number,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 6000,
  maxHeight = 6000
): { isValid: boolean; error?: string } {
  if (width < minWidth || height < minHeight) {
    return {
      isValid: false,
      error: `Image is ${width}x${height}px but must be at least ${minWidth}x${minHeight} pixels`,
    }
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      isValid: false,
      error: `Image is ${width}x${height}px but cannot exceed ${maxWidth}x${maxHeight} pixels`,
    }
  }

  return { isValid: true }
}
