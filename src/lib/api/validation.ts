import { z } from 'zod'

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  positiveNumber: z.number().min(0, 'Must be a positive number'),
  requiredString: z.string().min(1, 'This field is required'),
  optionalString: z.string().optional(),
  boolean: z.boolean(),
  price: z
    .number()
    .min(0, 'Price must be positive')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  percentage: z
    .number()
    .min(0, 'Percentage must be positive')
    .max(100, 'Percentage cannot exceed 100'),
}

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Common query parameter schemas
 */
export const querySchemas = {
  search: z.object({
    q: z.string().optional(),
    active: z.coerce.boolean().optional(),
    ...paginationSchema.shape,
  }),

  resourceId: z.object({
    id: commonSchemas.id,
  }),

  activeFilter: z.object({
    active: z.coerce.boolean().optional(),
  }),
}

/**
 * Product-related schemas
 */
export const productSchemas = {
  basicInfo: z.object({
    name: commonSchemas.requiredString,
    slug: commonSchemas.slug,
    sku: commonSchemas.requiredString,
    categoryId: commonSchemas.id,
    description: commonSchemas.optionalString,
    shortDescription: commonSchemas.optionalString,
    isActive: commonSchemas.boolean.default(true),
    isFeatured: commonSchemas.boolean.default(false),
  }),

  pricing: z.object({
    basePrice: commonSchemas.price,
    setupFee: commonSchemas.price.default(0),
  }),

  production: z.object({
    productionTime: z.number().min(1, 'Production time must be at least 1 day'),
    rushAvailable: commonSchemas.boolean.default(false),
    rushDays: z.number().min(1).optional(),
    rushFee: commonSchemas.price.optional(),
    gangRunEligible: commonSchemas.boolean.default(false),
    minGangQuantity: z.number().min(1).optional(),
    maxGangQuantity: z.number().min(1).optional(),
  }),
}

/**
 * Validate request body with a schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
  } catch (error) {
    return { success: false, errors: ['Invalid JSON in request body'] }
  }
}

/**
 * Validate URL search parameters
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)

    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
  } catch (error) {
    return { success: false, errors: ['Invalid search parameters'] }
  }
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate that a slug is unique in the database
 */
export async function validateUniqueSlug(
  slug: string,
  tableName: string,
  excludeId?: string
): Promise<boolean> {
  // This would need to be implemented based on your database setup
  // For now, just return true
  return true
}
