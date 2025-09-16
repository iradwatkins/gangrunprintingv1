/**
 * SKU Generator for E-commerce Marketplaces
 * Compatible with Google Merchant Center, Amazon, eBay, and other platforms
 *
 * SKU Format: [CATEGORY]-[TYPE]-[DATE]-[RANDOM]
 * Example: BC-STD-2024-A7B3
 */

// Category codes mapping
const CATEGORY_CODES: Record<string, string> = {
  'business-cards': 'BC',
  'flyers': 'FLY',
  'brochures': 'BRO',
  'postcards': 'PC',
  'banners': 'BAN',
  'posters': 'POS',
  'stickers': 'STK',
  'labels': 'LBL',
  'envelopes': 'ENV',
  'letterheads': 'LH',
  'notepads': 'NP',
  'calendars': 'CAL',
  'booklets': 'BKT',
  'catalogs': 'CAT',
  'menus': 'MNU',
  'tickets': 'TKT',
  'invitations': 'INV',
  'greeting-cards': 'GC',
  'presentation-folders': 'PF',
  'door-hangers': 'DH',
  'magnets': 'MAG',
  'vinyl-banners': 'VB',
  'yard-signs': 'YS',
  'car-magnets': 'CM',
  'window-clings': 'WC',
  'roll-labels': 'RL',
  'custom': 'CUS',
  'other': 'OTH'
}

// Product type codes
const TYPE_CODES: Record<string, string> = {
  'standard': 'STD',
  'premium': 'PRM',
  'luxury': 'LUX',
  'economy': 'ECO',
  'express': 'EXP',
  'custom': 'CUS',
  'sample': 'SMP',
  'wholesale': 'WHL',
  'retail': 'RTL'
}

/**
 * Generates a unique SKU for a product
 * @param productName - The name of the product
 * @param category - The category of the product
 * @param type - The type/tier of the product (optional)
 * @returns A unique SKU string
 */
export function generateSKU(
  productName: string,
  category?: string,
  type: string = 'standard'
): string {
  // Clean and normalize inputs
  const cleanCategory = category?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || ''
  const cleanType = type.toLowerCase()

  // Get category code
  let categoryCode = 'PRD' // Default product code
  if (cleanCategory) {
    // Try exact match first
    categoryCode = CATEGORY_CODES[cleanCategory] ||
                  // Try partial match
                  Object.entries(CATEGORY_CODES).find(([key]) =>
                    cleanCategory.includes(key)
                  )?.[1] ||
                  // Use first 3 letters of category
                  cleanCategory.substring(0, 3).toUpperCase()
  } else if (productName) {
    // Try to extract category from product name
    const lowerName = productName.toLowerCase()
    const foundCategory = Object.entries(CATEGORY_CODES).find(([key]) =>
      lowerName.includes(key.replace('-', ' '))
    )
    if (foundCategory) {
      categoryCode = foundCategory[1]
    }
  }

  // Get type code
  const typeCode = TYPE_CODES[cleanType] || 'STD'

  // Get year for date component
  const year = new Date().getFullYear()

  // Generate random alphanumeric string (4 characters)
  const randomCode = generateRandomCode(4)

  // Combine all parts
  const sku = `${categoryCode}-${typeCode}-${year}-${randomCode}`

  // Ensure SKU meets marketplace requirements
  return sanitizeSKU(sku)
}

/**
 * Generates a simple SKU based on product name and timestamp
 * @param productName - The name of the product
 * @returns A simple unique SKU
 */
export function generateSimpleSKU(productName: string): string {
  // Extract initials from product name
  const initials = productName
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4) || 'PROD'

  // Get timestamp components
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  // Generate random code
  const randomCode = generateRandomCode(4)

  // Combine: INITIALS-YYMM-RANDOM
  const sku = `${initials}-${year}${month}-${randomCode}`

  return sanitizeSKU(sku)
}

/**
 * Generates a SKU with custom prefix
 * @param prefix - Custom prefix for the SKU
 * @param includeDate - Whether to include date in SKU
 * @returns A custom SKU
 */
export function generateCustomSKU(prefix: string, includeDate: boolean = true): string {
  const cleanPrefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6) || 'SKU'

  if (includeDate) {
    const date = new Date()
    const dateCode = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`
    const randomCode = generateRandomCode(4)
    return `${cleanPrefix}-${dateCode}-${randomCode}`
  } else {
    const randomCode = generateRandomCode(8)
    return `${cleanPrefix}-${randomCode}`
  }
}

/**
 * Validates if a SKU meets marketplace requirements
 * @param sku - The SKU to validate
 * @returns Boolean indicating if SKU is valid
 */
export function isValidSKU(sku: string): boolean {
  // Check basic requirements
  if (!sku || sku.length < 3 || sku.length > 50) {
    return false
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  const validPattern = /^[A-Z0-9\-_]+$/i
  if (!validPattern.test(sku)) {
    return false
  }

  // Check for marketplace-specific requirements
  // Google Merchant: Max 50 chars, no spaces
  // Amazon: Max 40 chars, alphanumeric + limited special chars
  // eBay: Max 50 chars

  // No spaces allowed
  if (sku.includes(' ')) {
    return false
  }

  // No special characters except hyphen and underscore
  if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
    return false
  }

  return true
}

/**
 * Sanitizes a SKU to ensure it meets all requirements
 * @param sku - The SKU to sanitize
 * @returns A sanitized SKU
 */
function sanitizeSKU(sku: string): string {
  return sku
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '-') // Replace invalid chars with hyphen
    .replace(/\-+/g, '-') // Replace multiple hyphens with single
    .replace(/^\-|\-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 40) // Limit length for compatibility
}

/**
 * Generates a random alphanumeric code
 * @param length - Length of the code to generate
 * @returns Random alphanumeric string
 */
function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Checks if a SKU already exists (would need to be connected to database)
 * @param sku - The SKU to check
 * @returns Promise<boolean> indicating if SKU exists
 */
export async function skuExists(sku: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/check-sku?sku=${encodeURIComponent(sku)}`)
    if (response.ok) {
      const data = await response.json()
      return data.exists
    }
    return false
  } catch (error) {
    console.error('Error checking SKU:', error)
    return false
  }
}

/**
 * Generates a unique SKU, checking for duplicates
 * @param productName - The name of the product
 * @param category - The category of the product
 * @param type - The type of the product
 * @param maxAttempts - Maximum attempts to generate unique SKU
 * @returns Promise<string> A unique SKU
 */
export async function generateUniqueSKU(
  productName: string,
  category?: string,
  type: string = 'standard',
  maxAttempts: number = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const sku = generateSKU(productName, category, type)
    const exists = await skuExists(sku)
    if (!exists) {
      return sku
    }
  }

  // If all attempts fail, add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).toUpperCase()
  return sanitizeSKU(`${generateSKU(productName, category, type)}-${timestamp}`)
}

// Export all functions
export default {
  generateSKU,
  generateSimpleSKU,
  generateCustomSKU,
  generateUniqueSKU,
  isValidSKU,
  skuExists
}