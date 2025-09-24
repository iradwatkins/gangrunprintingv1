/**
 * Pricing calculation utilities for addons
 */

/**
 * Calculate variable data addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculateVariableDataPrice(quantity: number): number {
  return 60 + 0.02 * quantity
}

/**
 * Calculate perforation addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculatePerforationPrice(quantity: number): number {
  return 20 + 0.01 * quantity
}

/**
 * Calculate banding addon price
 * @param quantity - Order quantity
 * @param bundleSize - Items per bundle
 * @returns Calculated price
 */
export function calculateBandingPrice(quantity: number, bundleSize: number): number {
  const bundles = Math.ceil(quantity / bundleSize)
  return 15 + 0.5 * bundles
}

/**
 * Calculate corner rounding addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculateCornerRoundingPrice(quantity: number): number {
  return 25 + 0.02 * quantity
}

/**
 * Format price for display
 * @param price - Price value
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}
