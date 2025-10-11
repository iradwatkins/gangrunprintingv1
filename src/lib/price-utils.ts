/**
 * Price Utility Functions
 *
 * Handles high-precision pricing internally while displaying
 * customer-friendly 2-decimal prices on the frontend.
 */

/**
 * Store price with full precision (no rounding)
 * Database stores as Float, supporting up to ~15 decimal places
 */
export function formatPriceForStorage(price: number | string): number {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? 0 : numPrice
}

/**
 * Format price for customer display (always 2 decimals)
 * @param price - The price value
 * @param includeCurrency - Whether to include $ symbol (default: true)
 * @returns Formatted price string (e.g., "$1.23" or "1.23")
 */
export function formatPriceForCustomer(
  price: number | string,
  includeCurrency: boolean = true
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return includeCurrency ? '$0.00' : '0.00'
  }

  const formatted = numPrice.toFixed(2)
  return includeCurrency ? `$${formatted}` : formatted
}

/**
 * Format price for admin display (configurable precision)
 * Shows full precision for accurate configuration
 * @param price - The price value
 * @param decimals - Number of decimal places to show (default: 7)
 * @param includeCurrency - Whether to include $ symbol (default: true)
 * @returns Formatted price string
 */
export function formatPriceForAdmin(
  price: number | string,
  decimals: number = 7,
  includeCurrency: boolean = true
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return includeCurrency ? `$${(0).toFixed(decimals)}` : (0).toFixed(decimals)
  }

  const formatted = numPrice.toFixed(decimals)
  return includeCurrency ? `$${formatted}` : formatted
}

/**
 * Calculate total with full precision, format for customer
 * Use this for cart totals, order totals, etc.
 */
export function calculateAndFormatTotal(
  price: number,
  quantity: number,
  includeCurrency: boolean = true
): string {
  const total = price * quantity
  return formatPriceForCustomer(total, includeCurrency)
}

/**
 * Parse price input from string to number with validation
 * Useful for form inputs
 */
export function parsePriceInput(input: string): number {
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate price input
 * @param price - The price to validate
 * @param min - Minimum allowed price (default: 0)
 * @param max - Maximum allowed price (default: 999999)
 * @returns Object with isValid boolean and optional error message
 */
export function validatePrice(
  price: number | string,
  min: number = 0,
  max: number = 999999
): { isValid: boolean; error?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Invalid price format' }
  }

  if (numPrice < min) {
    return { isValid: false, error: `Price must be at least $${min}` }
  }

  if (numPrice > max) {
    return { isValid: false, error: `Price must be less than $${max}` }
  }

  return { isValid: true }
}
