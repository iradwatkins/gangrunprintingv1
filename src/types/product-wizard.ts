/**
 * Shared types for Product Wizard
 * Used across product-wizard.tsx and all wizard step components
 */

export interface ProductData {
  // Basic Info
  name: string
  slug: string
  sku: string
  categoryId: string
  description: string
  shortDescription: string
  isActive: boolean
  isFeatured: boolean

  // Images
  images: Record<string, unknown>[]

  // Paper Stocks
  paperStocks: Record<string, unknown>[]

  // Quantities
  useQuantityGroup: boolean
  quantityGroupId: string
  quantityIds: string[]

  // Sizes
  useSizeGroup: boolean
  sizeGroupId: string
  sizeIds: string[]

  // Options/Add-ons
  options: Record<string, unknown>[]

  // Turnaround/Production
  productionTime: number
  rushAvailable: boolean
  rushDays: number
  rushFee: number
  gangRunEligible: boolean
  minGangQuantity: number
  maxGangQuantity: number

  // Pricing
  basePrice: number
  setupFee: number
  pricingTiers: Record<string, unknown>[]
}
