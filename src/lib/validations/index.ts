/**
 * Validation schemas index
 * Central export point for all validation schemas and utilities
 */

// Common validations
export * from './common'

// Checkout validations
export * from './checkout'

// Product validations
export * from './product'

// Re-export commonly used schemas for convenience
export {
  // Common
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  stateCodeSchema,
  uuidSchema,
  currencySchema,
  paginationSchema,
  safeValidate,
  formatZodError,
  getFirstError,
  type ValidationResult,
} from './common'

export {
  // Checkout
  customerInfoSchema,
  addressSchema,
  cartItemSchema,
  checkoutDataSchema,
  validateCustomerInfo,
  validateAddress,
  validateCheckoutData,
  type CustomerInfo,
  type Address,
  type CartItem,
  type CheckoutData,
} from './checkout'

export {
  // Product
  productConfigurationSchema,
  selectedProductOptionsSchema,
  priceCalculationInputSchema,
  validateProductConfiguration,
  validateSelectedOptions,
  type ProductConfiguration,
  type SelectedProductOptions,
  type PriceCalculationInput,
  type PriceBreakdown,
} from './product'
