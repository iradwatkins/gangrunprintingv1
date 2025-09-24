/**
 * Product type definitions for Gang Run Printing
 */

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive?: boolean
  is_active?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ProductImage {
  id: string
  productId?: string
  product_id?: string
  url: string
  thumbnailUrl?: string | null
  thumbnail_url?: string | null
  mediumUrl?: string | null
  medium_url?: string | null
  largeUrl?: string | null
  large_url?: string | null
  altText?: string | null
  alt_text?: string | null
  alt?: string | null
  caption?: string | null
  isPrimary?: boolean
  is_primary?: boolean
  displayOrder?: number
  display_order?: number
  sortOrder?: number
  width?: number | null
  height?: number | null
  fileSize?: number | null
  mimeType?: string | null
}

export interface ProductSize {
  id: string
  productId?: string
  product_id?: string
  name: string
  width: number
  height: number
  unit?: string
  isActive?: boolean
  is_active?: boolean
}

export interface ProductQuantity {
  id: string
  productId?: string
  product_id?: string
  quantity: number
  priceMultiplier?: number
  price_multiplier?: number
  isActive?: boolean
  is_active?: boolean
}

export interface PaperStock {
  id: string
  name: string
  weight: number
  weightUnit?: string
  weight_unit?: string
  finish?: string | null
  priceModifier?: number
  price_modifier?: number
  isActive?: boolean
  is_active?: boolean
}

export interface ProductPaperStock extends PaperStock {
  productId?: string
  product_id?: string
}

export interface ProductAddon {
  id: string
  productId?: string
  product_id?: string
  addOnId?: string
  name: string
  description?: string | null
  price: number
  priceType?: string
  price_type?: string
  category?: string | null
  isActive?: boolean
  is_active?: boolean
  AddOn?: Addon
}

export interface Addon {
  id: string
  name: string
  description?: string | null
  price: number
  priceType?: string
  price_type?: string
  category?: string | null
  isActive?: boolean
  is_active?: boolean
}

export interface PricingTier {
  id: string
  productId: string
  minQuantity: number
  maxQuantity?: number | null
  pricePerUnit: number
  setupFee?: number
}

export interface QuantityGroup {
  id: string
  name: string
  quantities: number[]
  isActive?: boolean
}

export interface SizeGroup {
  id: string
  name: string
  sizes: Array<{
    width: number
    height: number
    unit: string
  }>
  isActive?: boolean
}

export interface PaperStockSet {
  id: string
  name: string
  description?: string | null
  isActive?: boolean
  PaperStockSetItem?: Array<{
    id: string
    paperStockSetId: string
    paperStockId: string
    sortOrder?: number
    PaperStock: PaperStock
  }>
}

export interface ProductOption {
  id: string
  productId: string
  name: string
  type: string
  required?: boolean
  sortOrder?: number
  OptionValue?: Array<{
    id: string
    productOptionId: string
    name: string
    value: string
    priceModifier?: number
    sortOrder?: number
  }>
}

export interface Product {
  id: string
  name: string
  sku?: string | null
  slug?: string | null
  categoryId?: string
  category_id?: string
  description?: string | null
  shortDescription?: string | null
  short_description?: string | null
  basePrice?: number
  base_price?: number
  setupFee?: number
  setup_fee?: number
  turnaroundTime?: number
  turnaround_time?: number
  productionTime?: number
  production_time?: number
  rushAvailable?: boolean
  rush_available?: boolean
  rushDays?: number | null
  rush_days?: number | null
  rushFee?: number | null
  rush_fee?: number | null
  isActive?: boolean
  is_active?: boolean
  isFeatured?: boolean
  is_featured?: boolean
  gangRunEligible?: boolean
  gang_run_eligible?: boolean
  minQuantity?: number
  min_quantity?: number
  maxQuantity?: number
  max_quantity?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string

  // Relations
  productCategory?: ProductCategory
  ProductCategory?: ProductCategory
  category?: ProductCategory

  productImages?: ProductImage[]
  ProductImages?: ProductImage[]
  images?: ProductImage[]
  ProductImage?: ProductImage[]

  productSizes?: ProductSize[]
  ProductSizes?: ProductSize[]
  sizes?: ProductSize[]

  productQuantities?: ProductQuantity[]
  ProductQuantities?: ProductQuantity[]
  quantities?: ProductQuantity[]

  productPaperStocks?: ProductPaperStock[]
  ProductPaperStocks?: ProductPaperStock[]
  paperStocks?: ProductPaperStock[]

  productPaperStockSets?: Array<{
    id: string
    productId: string
    paperStockSetId: string
    isDefault?: boolean
    PaperStockSet?: PaperStockSet
  }>

  productAddons?: ProductAddon[]
  ProductAddons?: ProductAddon[]
  productAddOns?: ProductAddon[]
  ProductAddOns?: ProductAddon[]
  addons?: ProductAddon[]

  pricingTiers?: PricingTier[]

  productQuantityGroups?: Array<{
    id: string
    productId: string
    quantityGroupId: string
    QuantityGroup?: QuantityGroup
  }>

  productSizeGroups?: Array<{
    id: string
    productId: string
    sizeGroupId: string
    SizeGroup?: SizeGroup
  }>

  productOptions?: ProductOption[]
  ProductOptions?: ProductOption[]

  _count?: {
    productImages?: number
    productPaperStockSets?: number
    productOptions?: number
    productQuantityGroups?: number
    productSizeGroups?: number
    productAddOns?: number
  }
}

// Frontend-optimized types (PascalCase)
export interface TransformedProduct {
  Id: string
  Name: string
  Slug?: string | null
  Description?: string | null
  BasePrice?: number
  SetupFee?: number
  TurnaroundTime?: number
  IsActive: boolean
  IsFeatured: boolean
  MinQuantity: number
  MaxQuantity: number
  CreatedAt?: Date | string
  UpdatedAt?: Date | string

  ProductCategory?: TransformedCategory | null
  ProductImages?: TransformedImage[]
  ProductSizes?: TransformedSize[]
  ProductQuantities?: TransformedQuantity[]
  ProductPaperStocks?: TransformedPaperStock[]
  ProductAddons?: TransformedAddon[]

  // Backward compatibility
  productCategory?: ProductCategory
  productImages?: ProductImage[]
}

export interface TransformedCategory {
  Id: string
  Name: string
  Slug?: string | null
  Description?: string | null
  IsActive: boolean
}

export interface TransformedImage {
  Id: string
  Url: string
  ThumbnailUrl?: string | null
  MediumUrl?: string | null
  LargeUrl?: string | null
  AltText: string
  IsPrimary: boolean
  DisplayOrder: number
}

export interface TransformedSize {
  Id: string
  ProductId?: string
  Name: string
  Width: number
  Height: number
  Unit: string
  IsActive: boolean
}

export interface TransformedQuantity {
  Id: string
  ProductId?: string
  Quantity: number
  PriceMultiplier: number
  IsActive: boolean
}

export interface TransformedPaperStock {
  Id: string
  Name: string
  Weight: number
  WeightUnit: string
  Finish?: string | null
  PriceModifier: number
  IsActive: boolean
}

export interface TransformedAddon {
  Id: string
  Name: string
  Description?: string | null
  Price: number
  PriceType: string
  Category?: string | null
  IsActive: boolean
}