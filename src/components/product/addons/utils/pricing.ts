/**
 * Pricing calculation utilities for addons
 */

/**
 * Calculate variable data addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculateVariableDataPrice(quantity: number): number {
  // Validate input
  const validQuantity = Math.max(0, quantity || 0)

  // Base fee + per piece charge
  const baseFee = 60
  const perPieceRate = 0.02

  return baseFee + perPieceRate * validQuantity
}

/**
 * Calculate perforation addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculatePerforationPrice(quantity: number): number {
  // Validate input
  const validQuantity = Math.max(0, quantity || 0)

  // Setup fee + per piece charge
  const setupFee = 20
  const perPieceRate = 0.01

  return setupFee + perPieceRate * validQuantity
}

/**
 * Calculate banding addon price
 * @param quantity - Order quantity
 * @param bundleSize - Items per bundle
 * @returns Calculated price
 */
export function calculateBandingPrice(quantity: number, bundleSize: number): number {
  // Validate inputs
  const validQuantity = Math.max(0, quantity || 0)

  // Default bundle size if invalid or not provided
  const DEFAULT_BUNDLE_SIZE = 100
  const validBundleSize = bundleSize && bundleSize > 0 ? bundleSize : DEFAULT_BUNDLE_SIZE

  // Calculate number of bundles needed
  const bundles = validQuantity > 0 ? Math.ceil(validQuantity / validBundleSize) : 0

  // Base fee + per bundle charge
  const baseFee = 15
  const perBundleRate = 0.5

  return validQuantity > 0 ? baseFee + perBundleRate * bundles : 0
}

/**
 * Calculate corner rounding addon price
 * @param quantity - Order quantity
 * @returns Calculated price
 */
export function calculateCornerRoundingPrice(quantity: number): number {
  // Validate input
  const validQuantity = Math.max(0, quantity || 0)

  // Setup fee + per piece charge
  const setupFee = 25
  const perPieceRate = 0.02

  return setupFee + perPieceRate * validQuantity
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
