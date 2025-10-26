/**
 * Auto-SEO Label Generator
 *
 * Automatically generates SEO-optimized labels for AI-generated images:
 * - Filenames (URL-friendly, keyword-rich)
 * - Alt text (descriptive, accessible)
 * - Titles (concise, keyword-focused)
 * - Descriptions (detailed, natural language)
 *
 * All labels follow SEO best practices and are localized for en/es.
 */

export interface SEOConfig {
  cityName: string
  stateName?: string
  productType: string // e.g., "postcards", "business-cards", "flyers"
  locale: 'en' | 'es'
  version?: number // For v1, v2, v3 regenerations
  campaignSlug?: string
}

export interface SEOLabels {
  filename: string // e.g., "chicago-il-postcard-printing-v1.png"
  alt: string // e.g., "Custom postcard printing services in Chicago, IL"
  title: string // e.g., "Chicago Postcard Printing | GangRun Printing"
  description: string // e.g., "Professional postcard printing in Chicago..."
  keywords: string[] // e.g., ["chicago postcard printing", "illinois postcards"]
}

/**
 * Product type translations (en/es)
 */
const PRODUCT_TRANSLATIONS = {
  'business-cards': {
    en: {
      singular: 'business card',
      plural: 'business cards',
      service: 'business card printing',
      adjectives: ['professional', 'custom', 'high-quality'],
    },
    es: {
      singular: 'tarjeta de presentación',
      plural: 'tarjetas de presentación',
      service: 'impresión de tarjetas de presentación',
      adjectives: ['profesional', 'personalizada', 'de alta calidad'],
    },
  },
  postcards: {
    en: {
      singular: 'postcard',
      plural: 'postcards',
      service: 'postcard printing',
      adjectives: ['custom', 'vibrant', 'high-quality'],
    },
    es: {
      singular: 'postal',
      plural: 'postales',
      service: 'impresión de postales',
      adjectives: ['personalizada', 'vibrante', 'de alta calidad'],
    },
  },
  flyers: {
    en: {
      singular: 'flyer',
      plural: 'flyers',
      service: 'flyer printing',
      adjectives: ['eye-catching', 'custom', 'professional'],
    },
    es: {
      singular: 'volante',
      plural: 'volantes',
      service: 'impresión de volantes',
      adjectives: ['llamativo', 'personalizado', 'profesional'],
    },
  },
  brochures: {
    en: {
      singular: 'brochure',
      plural: 'brochures',
      service: 'brochure printing',
      adjectives: ['professional', 'custom', 'high-quality'],
    },
    es: {
      singular: 'folleto',
      plural: 'folletos',
      service: 'impresión de folletos',
      adjectives: ['profesional', 'personalizado', 'de alta calidad'],
    },
  },
}

/**
 * Location-specific service phrases (en/es)
 */
const LOCATION_TEMPLATES = {
  en: {
    'in-city': 'in {city}', // "in Chicago"
    'city-state': '{city}, {state}', // "Chicago, IL"
    'near-you': 'near you in {city}',
    serving: 'serving {city}',
  },
  es: {
    'in-city': 'en {city}', // "en Chicago"
    'city-state': '{city}, {state}', // "Chicago, IL"
    'near-you': 'cerca de ti en {city}',
    serving: 'sirviendo a {city}',
  },
}

/**
 * Slugifies text for URL-friendly filenames
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Normalizes product type to match PRODUCT_TRANSLATIONS keys
 */
function normalizeProductType(productType: string): string {
  const normalized = slugify(productType)

  // Map variations to canonical keys
  const mappings: Record<string, string> = {
    'business-card': 'business-cards',
    businesscard: 'business-cards',
    businesscards: 'business-cards',
    postcard: 'postcards',
    flyer: 'flyers',
    flier: 'flyers',
    fliers: 'flyers',
    brochure: 'brochures',
  }

  return mappings[normalized] || normalized
}

/**
 * Gets state abbreviation from full name (US states only)
 */
function getStateAbbreviation(stateName: string): string {
  const states: Record<string, string> = {
    illinois: 'IL',
    california: 'CA',
    texas: 'TX',
    florida: 'FL',
    'new york': 'NY',
    pennsylvania: 'PA',
    ohio: 'OH',
    georgia: 'GA',
    'north carolina': 'NC',
    michigan: 'MI',
    // Add more as needed
  }

  const normalized = stateName.toLowerCase().trim()
  return states[normalized] || stateName.substring(0, 2).toUpperCase()
}

/**
 * Generates SEO-optimized filename
 */
function generateFilename(config: SEOConfig): string {
  const { cityName, stateName, productType, locale, version = 1 } = config

  const citySlug = slugify(cityName)
  const productSlug = normalizeProductType(productType)
  const versionSuffix = version > 1 ? `-v${version}` : ''

  // Include state abbreviation if available
  const stateSlug = stateName
    ? `-${slugify(getStateAbbreviation(stateName))}`
    : ''

  // Format: chicago-il-postcard-printing-v1.png
  return `${citySlug}${stateSlug}-${productSlug}-printing${versionSuffix}.png`
}

/**
 * Generates SEO-optimized alt text
 */
function generateAltText(config: SEOConfig): string {
  const { cityName, stateName, productType, locale } = config
  const productKey = normalizeProductType(productType) as keyof typeof PRODUCT_TRANSLATIONS
  const translation = PRODUCT_TRANSLATIONS[productKey]?.[locale]

  if (!translation) {
    // Fallback if product type not found
    return locale === 'es'
      ? `Impresión de ${productType} en ${cityName}`
      : `${productType} printing in ${cityName}`
  }

  const locationPhrase = stateName
    ? LOCATION_TEMPLATES[locale]['city-state']
        .replace('{city}', cityName)
        .replace('{state}', getStateAbbreviation(stateName))
    : cityName

  const adjective = translation.adjectives[0] // Use first adjective for brevity

  if (locale === 'es') {
    return `${translation.service} ${adjective} en ${locationPhrase}`
  } else {
    return `${adjective} ${translation.service} in ${locationPhrase}`
  }
}

/**
 * Generates SEO-optimized title
 */
function generateTitle(config: SEOConfig): string {
  const { cityName, stateName, productType, locale } = config
  const productKey = normalizeProductType(productType) as keyof typeof PRODUCT_TRANSLATIONS
  const translation = PRODUCT_TRANSLATIONS[productKey]?.[locale]

  if (!translation) {
    return locale === 'es'
      ? `Impresión de ${productType} en ${cityName}`
      : `${cityName} ${productType} Printing`
  }

  const stateAbbr = stateName ? getStateAbbreviation(stateName) : null

  if (locale === 'es') {
    const location = stateAbbr ? `${cityName}, ${stateAbbr}` : cityName
    return `Impresión de ${translation.plural} en ${location} | GangRun Printing`
  } else {
    const location = stateAbbr ? `${cityName}, ${stateAbbr}` : cityName
    return `${location} ${translation.singular.charAt(0).toUpperCase() + translation.singular.slice(1)} Printing | GangRun Printing`
  }
}

/**
 * Generates SEO-optimized description
 */
function generateDescription(config: SEOConfig): string {
  const { cityName, stateName, productType, locale } = config
  const productKey = normalizeProductType(productType) as keyof typeof PRODUCT_TRANSLATIONS
  const translation = PRODUCT_TRANSLATIONS[productKey]?.[locale]

  if (!translation) {
    return locale === 'es'
      ? `Servicios profesionales de impresión de ${productType} en ${cityName}.`
      : `Professional ${productType} printing services in ${cityName}.`
  }

  const location = stateName ? `${cityName}, ${stateName}` : cityName

  if (locale === 'es') {
    return `Servicios profesionales de ${translation.service} en ${location}. Ofrecemos ${translation.plural} ${translation.adjectives.join(', ')} con envío rápido y precios competitivos. Calidad garantizada.`
  } else {
    return `Professional ${translation.service} services in ${location}. We offer ${translation.adjectives.join(', ')} ${translation.plural} with fast turnaround and competitive pricing. Quality guaranteed.`
  }
}

/**
 * Generates SEO keywords array
 */
function generateKeywords(config: SEOConfig): string[] {
  const { cityName, stateName, productType, locale } = config
  const productKey = normalizeProductType(productType) as keyof typeof PRODUCT_TRANSLATIONS
  const translation = PRODUCT_TRANSLATIONS[productKey]?.[locale]

  const keywords: string[] = []
  const cityLower = cityName.toLowerCase()
  const stateAbbr = stateName ? getStateAbbreviation(stateName).toLowerCase() : null

  if (!translation) {
    // Fallback keywords
    keywords.push(`${cityLower} ${productType}`)
    keywords.push(`${productType} ${cityLower}`)
    if (stateAbbr) {
      keywords.push(`${cityLower} ${stateAbbr} ${productType}`)
    }
    return keywords
  }

  if (locale === 'es') {
    keywords.push(`${translation.service} ${cityLower}`)
    keywords.push(`${translation.plural} ${cityLower}`)
    keywords.push(`impresión ${cityLower}`)
    if (stateAbbr) {
      keywords.push(`${translation.service} ${cityLower} ${stateAbbr}`)
    }
    keywords.push(`${translation.plural} personalizadas`)
  } else {
    keywords.push(`${cityLower} ${translation.service}`)
    keywords.push(`${cityLower} ${translation.plural}`)
    keywords.push(`${translation.singular} printing ${cityLower}`)
    if (stateAbbr) {
      keywords.push(`${cityLower} ${stateAbbr} ${translation.service}`)
    }
    keywords.push(`custom ${translation.plural}`)
  }

  return keywords
}

/**
 * Main function: Generate all SEO labels
 */
export function generateSEOLabels(config: SEOConfig): SEOLabels {
  return {
    filename: generateFilename(config),
    alt: generateAltText(config),
    title: generateTitle(config),
    description: generateDescription(config),
    keywords: generateKeywords(config),
  }
}

/**
 * Batch generate SEO labels for multiple images
 */
export function batchGenerateSEOLabels(
  configs: SEOConfig[]
): SEOLabels[] {
  return configs.map((config) => generateSEOLabels(config))
}

/**
 * Validate SEO config
 */
export function validateSEOConfig(
  config: Partial<SEOConfig>
): config is SEOConfig {
  if (!config.cityName || !config.productType || !config.locale) return false
  if (config.locale !== 'en' && config.locale !== 'es') return false
  return true
}

// Example usage
if (require.main === module) {
  console.log('=== Auto-SEO Label Generator Examples ===\n')

  const examples: SEOConfig[] = [
    {
      cityName: 'Chicago',
      stateName: 'Illinois',
      productType: 'business-cards',
      locale: 'en',
      version: 1,
    },
    {
      cityName: 'Los Angeles',
      stateName: 'California',
      productType: 'business-cards',
      locale: 'es',
      version: 1,
    },
    {
      cityName: 'Miami',
      stateName: 'Florida',
      productType: 'postcards',
      locale: 'es',
      version: 2,
    },
    {
      cityName: 'New York',
      stateName: 'New York',
      productType: 'flyers',
      locale: 'en',
      version: 1,
    },
  ]

  examples.forEach((config, index) => {
    console.log(`Example ${index + 1} (${config.cityName} - ${config.locale.toUpperCase()}):`)
    const labels = generateSEOLabels(config)
    console.log(`Filename: ${labels.filename}`)
    console.log(`Alt: ${labels.alt}`)
    console.log(`Title: ${labels.title}`)
    console.log(`Description: ${labels.description}`)
    console.log(`Keywords: ${labels.keywords.join(', ')}`)
    console.log('\n---\n')
  })
}
