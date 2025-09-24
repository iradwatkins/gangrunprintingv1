/**
 * Data transformation utilities for consistent API responses
 */

import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductSize,
  ProductQuantity,
  ProductPaperStock,
  ProductAddon,
  TransformedProduct,
  TransformedCategory,
  TransformedImage,
  TransformedSize,
  TransformedQuantity,
  TransformedPaperStock,
  TransformedAddon
} from '@/types/product'

/**
 * Transform product data from snake_case/camelCase to PascalCase for frontend consistency
 */
export function transformProductForFrontend(product: Product): TransformedProduct | null {
  if (!product) return null

  return {
    Id: product.id,
    Name: product.name,
    Slug: product.slug,
    Description: product.description,
    BasePrice: product.basePrice || product.base_price,
    TurnaroundTime: product.turnaroundTime || product.turnaround_time,
    IsActive: product.isActive ?? product.is_active ?? true,
    IsFeatured: product.isFeatured ?? product.is_featured ?? false,
    MinQuantity: product.minQuantity || product.min_quantity || 1,
    MaxQuantity: product.maxQuantity || product.max_quantity || 10000,
    CreatedAt: product.createdAt || product.created_at,
    UpdatedAt: product.updatedAt || product.updated_at,

    // Relations
    ProductCategory: transformCategoryForFrontend(product.productCategory || product.category),
    ProductImages: transformImagesForFrontend(product.productImages || product.images || []),
    ProductSizes: transformSizesForFrontend(product.productSizes || product.sizes || []),
    ProductQuantities: transformQuantitiesForFrontend(product.productQuantities || product.quantities || []),
    ProductPaperStocks: transformPaperStocksForFrontend(product.productPaperStocks || product.paperStocks || []),
    ProductAddons: transformAddonsForFrontend(product.productAddons || product.addons || []),

    // Keep backward compatibility
    productCategory: product.productCategory,
    productImages: product.productImages,
  }
}

export function transformCategoryForFrontend(category: ProductCategory | undefined | null): TransformedCategory | null {
  if (!category) return null

  return {
    Id: category.id,
    Name: category.name,
    Slug: category.slug,
    Description: category.description,
    IsActive: category.isActive ?? category.is_active ?? true,
  }
}

export function transformImagesForFrontend(images: ProductImage[] | undefined | null): TransformedImage[] {
  if (!images || !Array.isArray(images)) return []

  return images.map(img => ({
    Id: img.id,
    Url: img.url,
    ThumbnailUrl: img.thumbnailUrl || img.thumbnail_url,
    MediumUrl: img.mediumUrl || img.medium_url,
    LargeUrl: img.largeUrl || img.large_url,
    AltText: img.altText || img.alt_text || '',
    IsPrimary: img.isPrimary ?? img.is_primary ?? false,
    DisplayOrder: img.displayOrder ?? img.display_order ?? 0,
  }))
}

export function transformSizesForFrontend(sizes: ProductSize[] | undefined | null): TransformedSize[] {
  if (!sizes || !Array.isArray(sizes)) return []

  return sizes.map(size => ({
    Id: size.id,
    ProductId: size.productId || size.product_id,
    Name: size.name,
    Width: size.width,
    Height: size.height,
    Unit: size.unit || 'inches',
    IsActive: size.isActive ?? size.is_active ?? true,
  }))
}

export function transformQuantitiesForFrontend(quantities: ProductQuantity[] | undefined | null): TransformedQuantity[] {
  if (!quantities || !Array.isArray(quantities)) return []

  return quantities.map(qty => ({
    Id: qty.id,
    ProductId: qty.productId || qty.product_id,
    Quantity: qty.quantity,
    PriceMultiplier: qty.priceMultiplier || qty.price_multiplier || 1,
    IsActive: qty.isActive ?? qty.is_active ?? true,
  }))
}

export function transformPaperStocksForFrontend(paperStocks: ProductPaperStock[] | undefined | null): TransformedPaperStock[] {
  if (!paperStocks || !Array.isArray(paperStocks)) return []

  return paperStocks.map(stock => ({
    Id: stock.id,
    Name: stock.name,
    Weight: stock.weight,
    WeightUnit: stock.weightUnit || stock.weight_unit || 'lb',
    Finish: stock.finish,
    PriceModifier: stock.priceModifier || stock.price_modifier || 0,
    IsActive: stock.isActive ?? stock.is_active ?? true,
  }))
}

export function transformAddonsForFrontend(addons: ProductAddon[] | undefined | null): TransformedAddon[] {
  if (!addons || !Array.isArray(addons)) return []

  return addons.map(addon => ({
    Id: addon.id,
    Name: addon.name,
    Description: addon.description,
    Price: addon.price,
    PriceType: addon.priceType || addon.price_type || 'fixed',
    Category: addon.category,
    IsActive: addon.isActive ?? addon.is_active ?? true,
  }))
}

/**
 * Transform multiple products
 */
export function transformProductsForFrontend(products: Product[] | undefined | null): (TransformedProduct | null)[] {
  if (!products || !Array.isArray(products)) return []
  return products.map(transformProductForFrontend)
}

/**
 * Error boundary wrapper for safe image URL handling
 */
export function safeImageUrl(imageUrl: string | undefined | null, fallback = '/placeholder.jpg'): string {
  try {
    if (!imageUrl) return fallback

    // Check if it's a valid URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
      return imageUrl
    }

    // If it's a relative path without leading slash, add it
    return `/${imageUrl}`
  } catch (error) {
    console.error('Error processing image URL:', imageUrl, error)
    return fallback
  }
}

/**
 * Get primary image URL with error handling
 */
export function getPrimaryImageUrl(product: Product | TransformedProduct, fallback = '/placeholder.jpg'): string {
  try {
    const images = product.productImages || product.ProductImages || product.images || []

    if (!images || images.length === 0) {
      return fallback
    }

    // Find primary image or use first image
    const primaryImage = images.find((img: ProductImage | TransformedImage) =>
      'isPrimary' in img ? img.isPrimary : (img as TransformedImage).IsPrimary
    ) || images[0]

    return safeImageUrl(primaryImage?.url || primaryImage?.Url, fallback)
  } catch (error) {
    console.error('Error getting primary image:', error)
    return fallback
  }
}
