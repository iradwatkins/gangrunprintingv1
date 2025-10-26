/**
 * Product validation schemas using Zod
 * Provides runtime type safety for product-related operations
 */

import { z } from 'zod'

/**
 * Size configuration schema
 */
export const sizeConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Size name is required'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  unit: z.enum(['in', 'cm', 'mm']).default('in'),
  priceMultiplier: z.number().positive().default(1),
  isActive: z.boolean().default(true),
})

/**
 * Quantity configuration schema
 */
export const quantityConfigSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  priceMultiplier: z.number().positive().default(1),
  isActive: z.boolean().default(true),
})

/**
 * Paper stock configuration schema
 */
export const paperStockConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Paper stock name is required'),
  weight: z.number().positive('Weight must be positive'),
  finish: z.string().optional(),
  priceModifier: z.number().default(0),
  pricePerSqInch: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
  sidesOptions: z.array(z.string()).optional(),
  coatingOptions: z.array(z.string()).optional(),
})

/**
 * Turnaround time configuration schema
 */
export const turnaroundTimeConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Turnaround time name is required'),
  days: z.number().int().positive('Days must be positive'),
  multiplier: z.number().positive('Multiplier must be positive'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

/**
 * Add-on pricing schema
 */
export const addonPricingSchema = z.object({
  priceType: z.enum(['FLAT', 'PER_PIECE', 'PERCENTAGE', 'PER_SQ_INCH']),
  price: z.number().nonnegative('Price must be non-negative'),
})

/**
 * Add-on configuration schema
 */
export const addonConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string().optional(),
  pricing: addonPricingSchema,
  category: z.string().optional(),
  isMandatory: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tooltipText: z.string().optional(),
  subOptions: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        priceModifier: z.number().optional(),
      })
    )
    .optional(),
})

/**
 * Complete product configuration schema
 */
export const productConfigurationSchema = z.object({
  sizes: z.array(sizeConfigSchema).min(1, 'At least one size is required'),
  quantities: z.array(quantityConfigSchema).min(1, 'At least one quantity is required'),
  paperStocks: z.array(paperStockConfigSchema).min(1, 'At least one paper stock is required'),
  turnaroundTimes: z
    .array(turnaroundTimeConfigSchema)
    .min(1, 'At least one turnaround time is required'),
  addOns: z.array(addonConfigSchema).default([]),
})

/**
 * Selected product options schema (what customer chooses)
 */
export const selectedProductOptionsSchema = z.object({
  sizeId: z.string().uuid('Valid size must be selected'),
  quantityId: z.string().uuid('Valid quantity must be selected'),
  paperStockId: z.string().uuid('Valid paper stock must be selected'),
  turnaroundTimeId: z.string().uuid('Valid turnaround time must be selected'),
  coating: z.string().optional(),
  sides: z.string().optional(),
  selectedAddOns: z
    .array(
      z.object({
        addOnId: z.string().uuid(),
        configuration: z.record(z.string(), z.any()).optional(),
      })
    )
    .default([]),
})

/**
 * Price calculation input schema
 */
export const priceCalculationInputSchema = z.object({
  productId: z.string().uuid(),
  basePrice: z.number().positive('Base price must be positive'),
  selectedOptions: selectedProductOptionsSchema,
  configuration: productConfigurationSchema,
})

/**
 * Price breakdown schema (result of calculation)
 */
export const priceBreakdownSchema = z.object({
  basePrice: z.number().nonnegative(),
  sizeMultiplier: z.number().positive(),
  quantityMultiplier: z.number().positive(),
  turnaroundMultiplier: z.number().positive(),
  paperStockCost: z.number().nonnegative(),
  addonCosts: z.array(
    z.object({
      addOnId: z.string().uuid(),
      addOnName: z.string(),
      cost: z.number().nonnegative(),
    })
  ),
  subtotal: z.number().nonnegative(),
  totalAddons: z.number().nonnegative(),
  finalPrice: z.number().positive(),
})

/**
 * Product metadata schema (for SEO and city-specific products)
 */
export const productMetadataSchema = z.object({
  cityName: z.string().optional(),
  cityState: z.string().optional(),
  airportCode: z.string().optional(),
  localDelivery: z.boolean().optional(),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  heroImageUrl: z.string().url().optional(),
})

/**
 * Type exports
 */
export type SizeConfig = z.infer<typeof sizeConfigSchema>
export type QuantityConfig = z.infer<typeof quantityConfigSchema>
export type PaperStockConfig = z.infer<typeof paperStockConfigSchema>
export type TurnaroundTimeConfig = z.infer<typeof turnaroundTimeConfigSchema>
export type AddonConfig = z.infer<typeof addonConfigSchema>
export type ProductConfiguration = z.infer<typeof productConfigurationSchema>
export type SelectedProductOptions = z.infer<typeof selectedProductOptionsSchema>
export type PriceCalculationInput = z.infer<typeof priceCalculationInputSchema>
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>
export type ProductMetadata = z.infer<typeof productMetadataSchema>

/**
 * Validation helper functions
 */
export const validateProductConfiguration = (data: unknown) => {
  return productConfigurationSchema.safeParse(data)
}

export const validateSelectedOptions = (data: unknown) => {
  return selectedProductOptionsSchema.safeParse(data)
}

export const validatePriceCalculationInput = (data: unknown) => {
  return priceCalculationInputSchema.safeParse(data)
}

export const validatePriceBreakdown = (data: unknown) => {
  return priceBreakdownSchema.safeParse(data)
}

/**
 * Custom validation rules
 */

/**
 * Validate that turnaround multiplier is within acceptable range
 */
export const validateTurnaroundMultiplier = (multiplier: number): boolean => {
  return multiplier >= 1.0 && multiplier <= 3.0
}

/**
 * Validate that quantity is within product limits
 */
export const validateQuantityRange = (
  quantity: number,
  minQuantity: number = 1,
  maxQuantity: number = 100000
): boolean => {
  return quantity >= minQuantity && quantity <= maxQuantity
}

/**
 * Validate that size dimensions are reasonable
 */
export const validateSizeDimensions = (width: number, height: number, unit: string): boolean => {
  // Convert to inches for validation
  let widthInches = width
  let heightInches = height

  if (unit === 'cm') {
    widthInches = width / 2.54
    heightInches = height / 2.54
  } else if (unit === 'mm') {
    widthInches = width / 25.4
    heightInches = height / 25.4
  }

  // Reasonable limits: 0.5" to 48" (poster size)
  return widthInches >= 0.5 && widthInches <= 48 && heightInches >= 0.5 && heightInches <= 48
}
