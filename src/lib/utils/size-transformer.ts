/**
 * Size data transformation utilities
 * Converts SizeGroup API responses to component-friendly Size objects
 */

interface SizeGroup {
  id: string
  name: string
  description: string | null
  values: string
  defaultValue: string
  customMinWidth: number | null
  customMaxWidth: number | null
  customMinHeight: number | null
  customMaxHeight: number | null
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

interface Size {
  id: string
  name: string
  displayName: string
  width: number | null
  height: number | null
  squareInches: number | null
  priceMultiplier: number
  isDefault: boolean
  isCustom: boolean
  customMinWidth?: number | null
  customMaxWidth?: number | null
  customMinHeight?: number | null
  customMaxHeight?: number | null
}

/**
 * Parse a size string like "2x3.5" into width and height
 */
function parseSizeDimensions(sizeStr: string): { width: number; height: number } | null {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)$/)
  if (match) {
    return {
      width: parseFloat(match[1]),
      height: parseFloat(match[2])
    }
  }
  return null
}

/**
 * Format size dimensions for display
 */
function formatSizeDisplay(width: number, height: number): string {
  // Format with proper inches symbol
  const formatNum = (n: number) => n % 1 === 0 ? n.toString() : n.toFixed(1).replace(/\.0$/, '')
  return `${formatNum(width)}″ × ${formatNum(height)}″`
}

/**
 * Calculate price multiplier based on square inches
 * This is a placeholder - actual multiplier logic may vary
 */
function calculatePriceMultiplier(squareInches: number): number {
  // Base multiplier calculation
  // You may want to adjust this based on your pricing strategy
  if (squareInches <= 10) return 1.0  // Small sizes
  if (squareInches <= 25) return 1.2  // Medium sizes
  if (squareInches <= 50) return 1.5  // Large sizes
  if (squareInches <= 100) return 2.0 // Extra large sizes
  return 2.5 + (squareInches - 100) * 0.01 // Progressive pricing for very large sizes
}

/**
 * Transform a single SizeGroup into an array of Size objects
 * Each value in the group becomes a separate Size object
 */
export function transformSizeGroup(group: SizeGroup): Size[] {
  if (!group.values) {
    return []
  }

  const valuesList = group.values
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v)

  return valuesList.map((value, index) => {
    const isCustomValue = value.toLowerCase() === 'custom'
    const isDefault = value === group.defaultValue

    if (isCustomValue) {
      // Custom size option
      return {
        id: `${group.id}-custom`,
        name: 'Custom',
        displayName: 'Custom Size',
        width: null,
        height: null,
        squareInches: null,
        priceMultiplier: 1.0, // Will be calculated based on actual dimensions
        isDefault,
        isCustom: true,
        customMinWidth: group.customMinWidth,
        customMaxWidth: group.customMaxWidth,
        customMinHeight: group.customMinHeight,
        customMaxHeight: group.customMaxHeight,
      }
    }

    // Parse standard size dimensions
    const dimensions = parseSizeDimensions(value)
    if (dimensions) {
      const squareInches = dimensions.width * dimensions.height
      return {
        id: `${group.id}-${index}`,
        name: value,
        displayName: formatSizeDisplay(dimensions.width, dimensions.height),
        width: dimensions.width,
        height: dimensions.height,
        squareInches,
        priceMultiplier: calculatePriceMultiplier(squareInches),
        isDefault,
        isCustom: false,
      }
    }

    // Fallback for non-standard format
    return {
      id: `${group.id}-${index}`,
      name: value,
      displayName: value,
      width: null,
      height: null,
      squareInches: null,
      priceMultiplier: 1.0,
      isDefault,
      isCustom: false,
    }
  })
}

/**
 * Transform multiple SizeGroups into a flattened array of Size objects
 */
export function transformSizeGroups(groups: SizeGroup[]): Size[] {
  return groups.flatMap((group) => transformSizeGroup(group))
}

/**
 * Find the default size from a transformed array
 */
export function findDefaultSize(sizes: Size[]): Size | null {
  return sizes.find(s => s.isDefault) || sizes[0] || null
}

/**
 * Validate custom size dimensions against constraints
 */
export function validateCustomSize(
  width: number,
  height: number,
  customSize: Size
): { isValid: boolean; error?: string } {
  if (!customSize.isCustom) {
    return { isValid: false, error: 'Size is not a custom option' }
  }

  if (width <= 0 || height <= 0) {
    return { isValid: false, error: 'Width and height must be greater than 0' }
  }

  // Check width constraints
  if (customSize.customMinWidth && width < customSize.customMinWidth) {
    return {
      isValid: false,
      error: `Minimum width is ${customSize.customMinWidth} inches`
    }
  }

  if (customSize.customMaxWidth && width > customSize.customMaxWidth) {
    return {
      isValid: false,
      error: `Maximum width is ${customSize.customMaxWidth} inches`
    }
  }

  // Check height constraints
  if (customSize.customMinHeight && height < customSize.customMinHeight) {
    return {
      isValid: false,
      error: `Minimum height is ${customSize.customMinHeight} inches`
    }
  }

  if (customSize.customMaxHeight && height > customSize.customMaxHeight) {
    return {
      isValid: false,
      error: `Maximum height is ${customSize.customMaxHeight} inches`
    }
  }

  return { isValid: true }
}

/**
 * Get display text for a size (handles both standard and custom)
 */
export function getSizeDisplayText(
  size: Size,
  customWidth?: number,
  customHeight?: number
): string {
  if (size.isCustom && customWidth && customHeight) {
    const squareInches = customWidth * customHeight
    return `${formatSizeDisplay(customWidth, customHeight)} (${squareInches.toFixed(1)} sq in)`
  }

  if (size.squareInches) {
    return `${size.displayName} (${size.squareInches.toFixed(1)} sq in)`
  }

  return size.displayName
}

/**
 * Calculate square inches for a size (handles custom dimensions)
 */
export function calculateSquareInches(
  size: Size,
  customWidth?: number,
  customHeight?: number
): number {
  if (size.isCustom && customWidth && customHeight) {
    return customWidth * customHeight
  }
  return size.squareInches || 0
}

export type { SizeGroup, Size }