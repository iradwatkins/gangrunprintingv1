/**
 * Diversity Prompt Enhancement
 *
 * Automatically enhances AI image generation prompts based on target locale
 * to ensure culturally appropriate and diverse representation.
 *
 * - Spanish (es): Latin American people, culturally relevant scenarios
 * - English (en): Mixed ethnicities, diverse representation
 */

export interface DiversityConfig {
  locale: 'en' | 'es'
  cityName?: string
  productType?: string
}

export interface EnhancedPrompt {
  prompt: string
  diversityMetadata: {
    locale: string
    ethnicityFocus: string[]
    demographicNotes: string
    appliedEnhancements: string[]
  }
}

/**
 * Ethnicity representations by locale
 */
const ETHNICITY_MAPPINGS = {
  es: {
    primary: ['Latin American', 'Hispanic', 'Latino'],
    secondary: ['Mexican', 'Colombian', 'Cuban', 'Puerto Rican', 'Dominican'],
    keywords: [
      'Latin American professionals',
      'Hispanic business owners',
      'Latino entrepreneurs',
      'diverse Latin American community',
    ],
  },
  en: {
    primary: [
      'multiethnic',
      'diverse',
      'multicultural',
      'various ethnicities',
    ],
    secondary: [
      'African American',
      'Asian American',
      'Caucasian',
      'Hispanic',
      'Indigenous',
      'Middle Eastern',
    ],
    keywords: [
      'diverse group of professionals',
      'multiethnic business team',
      'multicultural community',
      'people of various backgrounds',
    ],
  },
}

/**
 * Context-aware diversity enhancements
 */
const CONTEXT_PATTERNS = {
  businessCards: {
    es: 'Latin American business professionals in modern office settings',
    en: 'diverse group of business professionals from various ethnic backgrounds',
  },
  postcards: {
    es: 'Latin American families and friends celebrating together',
    en: 'multiethnic groups enjoying activities together',
  },
  flyers: {
    es: 'Hispanic community members engaging in local events',
    en: 'diverse community members from various cultural backgrounds',
  },
  brochures: {
    es: 'Latin American entrepreneurs and small business owners',
    en: 'multicultural team of professionals and entrepreneurs',
  },
}

/**
 * Detects product type from prompt or explicit parameter
 */
function detectProductType(
  prompt: string,
  explicitType?: string
): keyof typeof CONTEXT_PATTERNS | null {
  if (explicitType) {
    const normalized = explicitType
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '')
    if (normalized.includes('businesscard')) return 'businessCards'
    if (normalized.includes('postcard')) return 'postcards'
    if (normalized.includes('flyer')) return 'flyers'
    if (normalized.includes('brochure')) return 'brochures'
  }

  const lowerPrompt = prompt.toLowerCase()
  if (lowerPrompt.includes('business card')) return 'businessCards'
  if (lowerPrompt.includes('postcard')) return 'postcards'
  if (lowerPrompt.includes('flyer') || lowerPrompt.includes('flier'))
    return 'flyers'
  if (lowerPrompt.includes('brochure')) return 'brochures'

  return null
}

/**
 * Checks if prompt already has diversity/ethnicity mentions
 */
function hasDiversityMentions(prompt: string): boolean {
  const diversityKeywords = [
    'diverse',
    'multiethnic',
    'multicultural',
    'latin',
    'hispanic',
    'latino',
    'african american',
    'asian',
    'caucasian',
    'ethnicity',
    'ethnic',
    'race',
    'racial',
  ]

  const lowerPrompt = prompt.toLowerCase()
  return diversityKeywords.some((keyword) => lowerPrompt.includes(keyword))
}

/**
 * Enhances a prompt with diversity-aware language based on locale
 */
export function enhancePromptWithDiversity(
  originalPrompt: string,
  config: DiversityConfig
): EnhancedPrompt {
  const { locale, productType } = config
  const appliedEnhancements: string[] = []

  // If prompt already mentions diversity/ethnicity, return as-is
  if (hasDiversityMentions(originalPrompt)) {
    return {
      prompt: originalPrompt,
      diversityMetadata: {
        locale,
        ethnicityFocus: [],
        demographicNotes: 'Prompt already contains diversity mentions',
        appliedEnhancements: ['none - already specified'],
      },
    }
  }

  let enhancedPrompt = originalPrompt
  const mapping = ETHNICITY_MAPPINGS[locale]

  // Detect product type for context-aware enhancement
  const detectedType = detectProductType(originalPrompt, productType)

  // Apply product-specific diversity context
  if (detectedType && CONTEXT_PATTERNS[detectedType]) {
    const contextPhrase = CONTEXT_PATTERNS[detectedType][locale]
    enhancedPrompt = `${enhancedPrompt}. Focus on ${contextPhrase}`
    appliedEnhancements.push(`context:${detectedType}`)
  }

  // Add general diversity enhancement if no product-specific context
  if (!detectedType) {
    const randomKeyword =
      mapping.keywords[Math.floor(Math.random() * mapping.keywords.length)]
    enhancedPrompt = `${enhancedPrompt}. Features ${randomKeyword}`
    appliedEnhancements.push('general-diversity')
  }

  // Add natural, varied ethnicity descriptors
  if (locale === 'es') {
    // For Spanish: emphasize Latin American representation
    enhancedPrompt += `. Authentic Latin American representation, culturally relevant scenarios`
    appliedEnhancements.push('latin-american-focus')
  } else {
    // For English: emphasize multiethnic diversity
    enhancedPrompt += `. Ensure equal representation across different ethnic backgrounds`
    appliedEnhancements.push('multiethnic-balance')
  }

  // Add quality directives for realistic, professional images
  enhancedPrompt += `. Professional photography, natural lighting, authentic expressions`
  appliedEnhancements.push('quality-directives')

  return {
    prompt: enhancedPrompt,
    diversityMetadata: {
      locale,
      ethnicityFocus: mapping.primary,
      demographicNotes:
        locale === 'es'
          ? 'Latin American-focused representation for Spanish-speaking audience'
          : 'Multiethnic balanced representation for diverse English-speaking audience',
      appliedEnhancements,
    },
  }
}

/**
 * Batch enhance multiple prompts with diversity awareness
 */
export function batchEnhancePrompts(
  prompts: Array<{ prompt: string; config: DiversityConfig }>
): EnhancedPrompt[] {
  return prompts.map(({ prompt, config }) =>
    enhancePromptWithDiversity(prompt, config)
  )
}

/**
 * Generate diversity metadata for existing images (retroactive)
 */
export function generateDiversityMetadata(
  locale: 'en' | 'es',
  originalPrompt?: string
) {
  const mapping = ETHNICITY_MAPPINGS[locale]

  return {
    locale,
    ethnicityFocus: mapping.primary,
    demographicNotes:
      locale === 'es'
        ? 'Latin American-focused representation'
        : 'Multiethnic balanced representation',
    originalPrompt: originalPrompt || null,
    appliedAt: new Date().toISOString(),
  }
}

/**
 * Validate diversity configuration
 */
export function validateDiversityConfig(
  config: Partial<DiversityConfig>
): config is DiversityConfig {
  if (!config.locale) return false
  if (config.locale !== 'en' && config.locale !== 'es') return false
  return true
}

// Example usage
if (require.main === module) {
  console.log('=== Diversity Prompt Enhancement Examples ===\n')

  const examples = [
    {
      prompt:
        'A professional business card design for a marketing consultant in Chicago',
      config: { locale: 'en' as const, productType: 'business-cards' },
    },
    {
      prompt:
        'Tarjeta de presentación profesional para un consultor de marketing en Los Ángeles',
      config: { locale: 'es' as const, productType: 'business-cards' },
    },
    {
      prompt:
        'Happy people celebrating at a community event, vibrant atmosphere',
      config: { locale: 'en' as const, productType: 'postcards' },
    },
    {
      prompt:
        'Personas felices celebrando en un evento comunitario, ambiente vibrante',
      config: { locale: 'es' as const, productType: 'postcards' },
    },
  ]

  examples.forEach(({ prompt, config }, index) => {
    console.log(`Example ${index + 1} (${config.locale.toUpperCase()}):`)
    console.log(`Original: ${prompt}`)

    const enhanced = enhancePromptWithDiversity(prompt, config)
    console.log(`Enhanced: ${enhanced.prompt}`)
    console.log(`Metadata:`, JSON.stringify(enhanced.diversityMetadata, null, 2))
    console.log('\n---\n')
  })
}
