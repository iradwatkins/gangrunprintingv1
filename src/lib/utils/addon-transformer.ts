/**
 * Add-on data transformation utilities
 * Converts complex addon set data to simple, consistent addon objects
 * Similar to how size-transformer.ts handles sizes
 */

interface RawAddon {
  id: string
  name: string
  description: string | null
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  configuration: Record<string, unknown>
  additionalTurnaroundDays: number | null
}

interface RawAddonSetItem {
  id: string
  addOn: RawAddon
  isDefault: boolean
  displayPosition: 'ABOVE_DROPDOWN' | 'IN_DROPDOWN' | 'BELOW_DROPDOWN'
  sortOrder: number
}

interface RawProductAddonSet {
  addOnSet: {
    id: string
    name: string
    addOnSetItems: RawAddonSetItem[]
  }
}

interface StandardizedAddon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  price: number
  priceDisplay: string
  isDefault: boolean
  additionalTurnaroundDays: number
  configuration?: Record<string, unknown>
}

/**
 * Calculate price display text from addon configuration
 */
function calculatePriceDisplay(addon: RawAddon): { price: number; priceDisplay: string } {
  const config = addon.configuration as any

  if (config) {
    if (config.displayPrice) {
      return { price: 0, priceDisplay: config.displayPrice }
    } else if (config.price !== undefined) {
      return { price: config.price, priceDisplay: `$${config.price}` }
    } else if (config.basePrice !== undefined) {
      return { price: config.basePrice, priceDisplay: `$${config.basePrice}` }
    } else if (config.percentage !== undefined) {
      return { price: config.percentage, priceDisplay: `${config.percentage}%` }
    } else if (config.pricePerUnit !== undefined) {
      return { price: config.pricePerUnit, priceDisplay: `$${config.pricePerUnit}/pc` }
    }
  }

  // Fallback based on pricing model
  switch (addon.pricingModel) {
    case 'FIXED_FEE':
    case 'FLAT':
      return { price: 0, priceDisplay: 'Variable' }
    case 'PERCENTAGE':
      return { price: 0, priceDisplay: 'Variable %' }
    case 'PER_UNIT':
      return { price: 0, priceDisplay: 'Per Unit' }
    default:
      return { price: 0, priceDisplay: 'Variable' }
  }
}

/**
 * Transform addon set items into standardized addon objects
 * Removes complex grouping and creates consistent structure like sizes
 */
export function transformAddonSets(productAddonSets: any[]): StandardizedAddon[] {
  const allAddons: StandardizedAddon[] = []

  for (const productAddonSet of productAddonSets) {
    for (const setItem of productAddonSet.AddOnSet.addOnSetItems) {
      const addon = setItem.AddOn
      const { price, priceDisplay } = calculatePriceDisplay(addon)

      // Create standardized addon object similar to how sizes are handled
      const standardizedAddon: StandardizedAddon = {
        id: addon.id,
        name: addon.name,
        description: addon.description || '',
        pricingModel: addon.pricingModel,
        price,
        priceDisplay,
        isDefault: setItem.isDefault,
        additionalTurnaroundDays: addon.additionalTurnaroundDays || 0,
        configuration: addon.configuration || {},
      }

      allAddons.push(standardizedAddon)
    }
  }

  // Sort by sort order (default addons first, then by name)
  return allAddons.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Transform legacy addon array to standardized format
 * For backwards compatibility with existing systems
 */
export function transformLegacyAddons(legacyAddons: unknown[]): StandardizedAddon[] {
  return legacyAddons.map((addon) => {
    // Type assertion for legacy addon data
    const data = addon as Record<string, any>
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      pricingModel: data.pricingModel || 'FIXED_FEE',
      price: data.price || 0,
      priceDisplay: data.priceDisplay || `$${data.price || 0}`,
      isDefault: data.isDefault || false,
      additionalTurnaroundDays: data.additionalTurnaroundDays || 0,
      configuration: data.configuration || {},
    }
  })
}

/**
 * Find default addons from a standardized array
 */
export function findDefaultAddons(addons: StandardizedAddon[]): string[] {
  return addons.filter((addon) => addon.isDefault).map((addon) => addon.id)
}

export type { RawAddon, RawAddonSetItem, RawProductAddonSet, StandardizedAddon }
