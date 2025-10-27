/**
 * Prompt Builder Utility for Design Center
 *
 * Purpose: Intelligently build final prompts from base text + product type + selected modifiers
 *
 * The builder handles:
 * - Product type variable substitution ([PRODUCT] → "Business Cards")
 * - Product data variable substitution ([PRODUCT_NAME], [PRODUCT_DESC], [PRODUCT_CATEGORY], [DIMENSIONS])
 * - Selected modifier integration (quick-select buttons)
 * - Negative prompt construction
 * - Deduplication and smart ordering
 *
 * Date: October 27, 2025
 * Updated: October 27, 2025 - Added product variable substitution for category-based templates
 */

export interface SelectedModifiers {
  style?: string[] // Array of selected style modifier values
  technical?: string[] // Array of selected technical spec values
  negative?: string[] // Array of selected negative prompt values
  holiday?: string // Single holiday/season value
  location?: string // Single location/setting value
  camera?: string // Single camera/equipment value
}

/**
 * Product data for variable substitution in prompts
 * Used when generating images for actual products (not just templates)
 */
export interface ProductData {
  name: string // Product name, e.g., "Premium Business Cards"
  description?: string // Product description
  categoryName?: string // Category name, e.g., "Business Cards"
  dimensions?: {
    // Product dimensions
    width?: number
    height?: number
    length?: number
    unit?: string // "in", "mm", etc.
  }
}

interface PromptBuilderOptions {
  basePrompt: string
  productType?: string | null
  selectedModifiers?: SelectedModifiers | null
  productData?: ProductData | null // NEW: Product-specific data for variable substitution
  // Legacy fields (keep for backwards compatibility)
  styleModifiers?: string | null
  technicalSpecs?: string | null
  negativePrompt?: string | null
}

/**
 * Substitute product-specific variables in a prompt string
 *
 * Supports:
 * - [PRODUCT_NAME] → Product name
 * - [PRODUCT_DESC] / [PRODUCT_DESCRIPTION] → Product description
 * - [PRODUCT_CATEGORY] → Category name
 * - [DIMENSIONS] → Formatted dimensions (e.g., "3.5 x 2 inches")
 */
function substituteProductVariables(
  prompt: string,
  productData?: ProductData | null
): string {
  if (!productData) return prompt

  let result = prompt

  // Substitute product name
  if (productData.name) {
    result = result.replace(/\[PRODUCT_NAME\]/gi, productData.name)
  }

  // Substitute product description
  if (productData.description) {
    result = result.replace(/\[PRODUCT_DESC(?:RIPTION)?\]/gi, productData.description)
  }

  // Substitute category name
  if (productData.categoryName) {
    result = result.replace(/\[PRODUCT_CATEGORY\]/gi, productData.categoryName)
  }

  // Substitute dimensions
  if (productData.dimensions) {
    const { width, height, length, unit = 'in' } = productData.dimensions
    let dimensionsStr = ''

    if (width && height && !length) {
      dimensionsStr = `${width} x ${height} ${unit}`
    } else if (width && height && length) {
      dimensionsStr = `${width} x ${height} x ${length} ${unit}`
    }

    if (dimensionsStr) {
      result = result.replace(/\[DIMENSIONS\]/gi, dimensionsStr)
      result = result.replace(/\[PRODUCT_DIMENSIONS\]/gi, dimensionsStr)
    }
  }

  return result
}

/**
 * Build the final positive prompt (everything except negatives)
 */
export function buildPositivePrompt(options: PromptBuilderOptions): string {
  const {
    basePrompt,
    productType,
    productData,
    selectedModifiers,
    styleModifiers,
    technicalSpecs,
  } = options

  const parts: string[] = []

  // 1. Start with base prompt (with product data + product type substitution)
  let base = basePrompt.trim()

  // NEW: Product-specific variable substitution (for actual products)
  base = substituteProductVariables(base, productData)

  // Legacy: Product type substitution (for templates)
  if (productType) {
    base = base.replace(/\[PRODUCT\]/gi, productType)
    base = base.replace(/\[product\]/g, productType.toLowerCase())
  }

  if (base) parts.push(base)

  // 2. Add product type explicitly if not already in prompt
  if (productType && !base.toLowerCase().includes(productType.toLowerCase())) {
    parts.push(productType)
  }

  // 3. Add location/setting (single selection)
  if (selectedModifiers?.location) {
    parts.push(selectedModifiers.location)
  }

  // 4. Add holiday/season (single selection)
  if (selectedModifiers?.holiday && selectedModifiers.holiday.trim()) {
    parts.push(selectedModifiers.holiday)
  }

  // 5. Add style modifiers (multi-select quick buttons)
  if (selectedModifiers?.style && selectedModifiers.style.length > 0) {
    parts.push(...selectedModifiers.style)
  }

  // 6. Add technical specs (multi-select quick buttons)
  if (selectedModifiers?.technical && selectedModifiers.technical.length > 0) {
    parts.push(...selectedModifiers.technical)
  }

  // 7. Add camera/equipment (single selection)
  if (selectedModifiers?.camera && selectedModifiers.camera.trim()) {
    parts.push(selectedModifiers.camera)
  }

  // 8. Add legacy style modifiers (free-text field - backwards compatible)
  if (styleModifiers?.trim()) {
    parts.push(styleModifiers.trim())
  }

  // 9. Add legacy technical specs (free-text field - backwards compatible)
  if (technicalSpecs?.trim()) {
    parts.push(technicalSpecs.trim())
  }

  // Join with commas and clean up
  return parts
    .filter((p) => p && p.trim())
    .join(', ')
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/g, '') // Remove trailing comma
    .trim()
}

/**
 * Build the negative prompt (things to avoid)
 */
export function buildNegativePrompt(options: PromptBuilderOptions): string {
  const { selectedModifiers, negativePrompt } = options

  const parts: string[] = []

  // 1. Add selected negative modifiers (multi-select quick buttons)
  if (selectedModifiers?.negative && selectedModifiers.negative.length > 0) {
    parts.push(...selectedModifiers.negative)
  }

  // 2. Add legacy negative prompt (free-text field - backwards compatible)
  if (negativePrompt?.trim()) {
    parts.push(negativePrompt.trim())
  }

  // Join with commas and clean up
  return parts
    .filter((p) => p && p.trim())
    .join(', ')
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/g, '') // Remove trailing comma
    .trim()
}

/**
 * Build complete prompt package for image generation
 */
export function buildCompletePrompt(options: PromptBuilderOptions) {
  const positivePrompt = buildPositivePrompt(options)
  const negativePrompt = buildNegativePrompt(options)

  return {
    prompt: positivePrompt,
    negativePrompt: negativePrompt || undefined,
    fullPrompt: negativePrompt
      ? `${positivePrompt} | Negative: ${negativePrompt}`
      : positivePrompt,
  }
}

/**
 * Preview the built prompt (for UI display)
 *
 * Shows what the final prompt will look like before generating
 */
export function previewPrompt(options: PromptBuilderOptions): {
  positive: string
  negative: string
  combined: string
  wordCount: number
} {
  const { prompt, negativePrompt, fullPrompt } = buildCompletePrompt(options)

  return {
    positive: prompt,
    negative: negativePrompt || '',
    combined: fullPrompt,
    wordCount: prompt.split(/\s+/).length,
  }
}

/**
 * Helper: Extract modifier values from database records
 *
 * Converts array of modifier objects to SelectedModifiers format
 */
export function extractModifierValues(
  modifiers: Array<{ category: string; value: string }>
): SelectedModifiers {
  const selected: SelectedModifiers = {
    style: [],
    technical: [],
    negative: [],
    holiday: '',
    location: '',
    camera: '',
  }

  for (const mod of modifiers) {
    switch (mod.category.toUpperCase()) {
      case 'STYLE':
        selected.style?.push(mod.value)
        break
      case 'TECHNICAL':
        selected.technical?.push(mod.value)
        break
      case 'NEGATIVE':
        selected.negative?.push(mod.value)
        break
      case 'HOLIDAY':
        selected.holiday = mod.value
        break
      case 'LOCATION':
        selected.location = mod.value
        break
      case 'CAMERA':
        selected.camera = mod.value
        break
    }
  }

  return selected
}
