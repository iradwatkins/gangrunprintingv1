/**
 * Quantity data transformation utilities
 * Converts QuantityGroup API responses to component-friendly Quantity objects
 */

interface QuantityGroup {
  id: string
  name: string
  description: string | null
  values: string
  defaultValue: string
  customMin: number | null
  customMax: number | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  valuesList?: string[]
  hasCustomOption?: boolean
  _count: {
    products: number
  }
}

interface Quantity {
  id: string
  name: string
  value: number | null
  isCustom: boolean
  minValue?: number | null
  maxValue?: number | null
}

/**
 * Transform a single QuantityGroup into an array of Quantity objects
 * Each value in the group becomes a separate Quantity object
 */
export function transformQuantityGroup(group: QuantityGroup): Quantity[] {
  if (!group.values) {
    return []
  }

  const valuesList = group.values
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v)

  return valuesList.map((value, index) => {
    const isCustomValue = value.toLowerCase() === 'custom'

    return {
      id: `${group.id}-${index}`,
      name: isCustomValue ? 'Custom...' : value,
      value: isCustomValue ? null : parseInt(value) || null,
      isCustom: isCustomValue,
      minValue: isCustomValue ? group.customMin : null,
      maxValue: isCustomValue ? group.customMax : null,
    }
  })
}

/**
 * Transform multiple QuantityGroups into a flattened array of Quantity objects
 * Useful when dealing with multiple quantity groups from the API
 */
export function transformQuantityGroups(groups: QuantityGroup[]): Quantity[] {
  return groups.flatMap((group) => transformQuantityGroup(group))
}

/**
 * Find the default quantity from a transformed array
 * Returns the quantity that matches the group's defaultValue
 */
export function findDefaultQuantity(quantities: Quantity[], defaultValue: string): Quantity | null {
  // For custom default, return the custom quantity object
  if (defaultValue.toLowerCase() === 'custom') {
    return quantities.find((q) => q.isCustom) || null
  }

  // For standard defaults, find by name or value
  return (
    quantities.find((q) => q.name === defaultValue || q.value?.toString() === defaultValue) || null
  )
}

/**
 * Validate a custom quantity value against min/max constraints
 * CRITICAL: Enforces 5000 increment rule for quantities above 5000
 */
export function validateCustomQuantity(
  value: number,
  customQuantity: Quantity
): { isValid: boolean; error?: string } {
  if (!customQuantity.isCustom) {
    return { isValid: false, error: 'Quantity is not a custom option' }
  }

  if (value <= 0) {
    return { isValid: false, error: 'Quantity must be greater than 0' }
  }

  // CRITICAL: Enforce 5000 increment rule for quantities above 5000
  if (value > 5000 && value % 5000 !== 0) {
    const lower = Math.floor(value / 5000) * 5000
    const upper = Math.ceil(value / 5000) * 5000
    return {
      isValid: false,
      error: `Quantities above 5000 must be in increments of 5000. Try ${lower.toLocaleString()} or ${upper.toLocaleString()}`,
    }
  }

  if (customQuantity.minValue && value < customQuantity.minValue) {
    return {
      isValid: false,
      error: `Minimum quantity is ${customQuantity.minValue.toLocaleString()}`,
    }
  }

  if (customQuantity.maxValue && value > customQuantity.maxValue) {
    return {
      isValid: false,
      error: `Maximum quantity is ${customQuantity.maxValue.toLocaleString()}`,
    }
  }

  return { isValid: true }
}

/**
 * Get user-friendly display text for a quantity
 */
export function getQuantityDisplayText(quantity: Quantity, customValue?: number): string {
  if (quantity.isCustom) {
    if (customValue) {
      return `Custom: ${customValue.toLocaleString()} units`
    }
    return 'Custom quantity'
  }

  if (quantity.value) {
    return `${quantity.value.toLocaleString()} units`
  }

  return quantity.name
}

export type { QuantityGroup, Quantity }
