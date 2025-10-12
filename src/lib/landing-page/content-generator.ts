/**
 * LANDING PAGE AI CONTENT GENERATOR
 *
 * Generates TRULY UNIQUE content for each of 200 cities to avoid Google duplicate content penalty.
 *
 * Multi-layer uniqueness strategy:
 * 1. City-specific data enrichment (neighborhoods, landmarks, events)
 * 2. AI-generated introductions (200 unique words per city)
 * 3. Dynamic FAQs with local context
 * 4. Case studies with city economic data
 */

import { prisma } from '@/lib/prisma'

// City-specific enrichment data
export interface CityContext {
  // Basic data
  city: string
  state: string
  stateCode: string
  population: number
  populationFormatted: string

  // Geographic data
  latitude?: number
  longitude?: number
  timezone?: string

  // Local data (enriched)
  neighborhoods: string[]
  landmarks: string[]
  businessDistricts: string[]
  localEvents: string[]
  economicData: string
  zipCodes: string[]
  areaCodes: string[]

  // Market data
  avgBusinessCount: string
  localIndustries: string[]
}

/**
 * Enrich city data with local context for content generation
 */
export async function enrichCityData(cityId: string): Promise<CityContext> {
  const city = await prisma.city.findUnique({
    where: { id: cityId }
  })

  if (!city) {
    throw new Error(`City not found: ${cityId}`)
  }

  // Format population with commas
  const populationFormatted = new Intl.NumberFormat('en-US').format(city.population)

  // City-specific enrichment data (would ideally come from a database or API)
  // For now, we'll use intelligent defaults and placeholders
  const enrichment = getCityEnrichment(city.name, city.state)

  return {
    city: city.name,
    state: city.state,
    stateCode: city.stateCode,
    population: city.population,
    populationFormatted,
    latitude: city.latitude || undefined,
    longitude: city.longitude || undefined,
    timezone: city.timezone || undefined,
    ...enrichment
  }
}

/**
 * Get city-specific enrichment data
 * TODO: Move to database or external API for richer data
 */
function getCityEnrichment(city: string, state: string): Partial<CityContext> {
  // Major city-specific data (top 20 cities with detailed info)
  const cityData: Record<string, Partial<CityContext>> = {
    'New York': {
      neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
      landmarks: ['Times Square', 'Central Park', 'Statue of Liberty', 'Empire State Building'],
      businessDistricts: ['Midtown', 'Financial District', 'Hudson Yards', 'Chelsea'],
      localEvents: ['NYC Marathon', 'Times Square New Year', 'Tribeca Film Festival', 'NYC Fashion Week'],
      economicData: 'Major financial hub with 200+ Fortune 500 companies',
      zipCodes: ['10001', '10002', '10003', '11201', '11211'],
      areaCodes: ['212', '646', '917', '332', '718'],
      avgBusinessCount: '240,000+',
      localIndustries: ['Finance', 'Media', 'Technology', 'Fashion', 'Entertainment']
    },
    'Los Angeles': {
      neighborhoods: ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'Downtown LA'],
      landmarks: ['Hollywood Sign', 'Griffith Observatory', 'Santa Monica Pier', 'Getty Center'],
      businessDistricts: ['Downtown LA', 'Century City', 'Culver City', 'Pasadena'],
      localEvents: ['Academy Awards', 'LA Auto Show', 'Art Basel LA', 'LA Film Festival'],
      economicData: 'Entertainment capital with thriving tech and creative industries',
      zipCodes: ['90001', '90012', '90210', '90291', '91001'],
      areaCodes: ['213', '323', '310', '424', '818'],
      avgBusinessCount: '180,000+',
      localIndustries: ['Entertainment', 'Technology', 'Tourism', 'Fashion', 'Aerospace']
    },
    'Chicago': {
      neighborhoods: ['Loop', 'River North', 'Wicker Park', 'Lincoln Park', 'South Loop'],
      landmarks: ['Willis Tower', 'Navy Pier', 'Millennium Park', 'Art Institute'],
      businessDistricts: ['Loop', 'West Loop', 'River North', 'Magnificent Mile'],
      localEvents: ['Lollapalooza', 'Chicago Air & Water Show', 'Taste of Chicago', 'Chicago Marathon'],
      economicData: 'Major transportation and trading hub with diverse economy',
      zipCodes: ['60601', '60602', '60614', '60622', '60657'],
      areaCodes: ['312', '773', '872', '224', '847'],
      avgBusinessCount: '120,000+',
      localIndustries: ['Finance', 'Manufacturing', 'Transportation', 'Technology', 'Healthcare']
    },
    // Add more major cities as needed...
  }

  // Return city-specific data if available, otherwise intelligent defaults
  if (cityData[city]) {
    return cityData[city]
  }

  // Intelligent defaults for smaller cities
  return {
    neighborhoods: [`Downtown ${city}`, `North ${city}`, `South ${city}`],
    landmarks: [`${city} City Hall`, `${city} Park`, `${city} Historic District`],
    businessDistricts: [`Downtown ${city}`, `${city} Business Park`],
    localEvents: [`${city} Festival`, `${city} Fair`, `${state} State Fair`],
    economicData: `Growing city in ${state} with diverse local businesses`,
    zipCodes: ['00000'], // Placeholder
    areaCodes: ['000'],  // Placeholder
    avgBusinessCount: '5,000+',
    localIndustries: ['Retail', 'Healthcare', 'Services', 'Manufacturing']
  }
}

/**
 * Generate AI prompt for unique city introduction
 * This will be sent to an LLM (Ollama, OpenAI, etc.) to generate unique content
 */
export function buildIntroPrompt(cityContext: CityContext, productType: string): string {
  return `Write a unique, engaging introduction (150-200 words) for professional ${productType} printing services in ${cityContext.city}, ${cityContext.state}.

INCLUDE:
- Why local businesses in ${cityContext.city} need quality ${productType}
- 2-3 specific use cases relevant to ${cityContext.city}'s economy (${cityContext.economicData})
- Mention of specific ${cityContext.neighborhoods[0]} and ${cityContext.neighborhoods[1]} service areas
- Reference to ${cityContext.landmarks[0]} area businesses
- Natural mention of ${cityContext.populationFormatted} potential customers
- One local event: ${cityContext.localEvents[0]}

TONE: Professional, local, trustworthy, helpful
AVOID: Generic content, keyword stuffing, sales-heavy language
WRITE AS: Local expert with 10+ years serving ${cityContext.city}

IMPORTANT: Make this content UNIQUE and DIFFERENT from other cities. Use specific local details.`
}

/**
 * Generate AI prompt for unique benefits section
 */
export function buildBenefitsPrompt(cityContext: CityContext, productType: string): string {
  return `Write a unique benefits section (100-150 words) explaining why businesses in ${cityContext.city}, ${cityContext.state} choose us for ${productType}.

INCLUDE:
- Free delivery to all ${cityContext.neighborhoods.length} areas of ${cityContext.city}
- Same-day printing available in ${cityContext.neighborhoods[0]}
- ${cityContext.avgBusinessCount} businesses in ${cityContext.city} trust us
- Specific local event marketing: ${cityContext.localEvents[0]}
- ${cityContext.populationFormatted} potential customers in ${cityContext.city}

TONE: Benefit-focused, specific to ${cityContext.city}
FORMAT: 3-4 bullet points with specific local details`
}

/**
 * Generate city-specific FAQs
 */
export function generateCityFAQs(cityContext: CityContext, productType: string): Array<{question: string, answer: string}> {
  return [
    {
      question: `Do you deliver to ${cityContext.neighborhoods[0]} and ${cityContext.neighborhoods[1]} in ${cityContext.city}?`,
      answer: `Yes! We deliver to all ${cityContext.neighborhoods.length} areas of ${cityContext.city}, including ${cityContext.neighborhoods.join(', ')}. We offer same-day service in ${cityContext.neighborhoods[0]} and next-day delivery across ${cityContext.city}.`
    },
    {
      question: `What businesses in ${cityContext.city} use your ${productType}?`,
      answer: `We serve ${cityContext.avgBusinessCount} businesses in ${cityContext.city}, from ${cityContext.businessDistricts[0]} startups to ${cityContext.businessDistricts[1]} enterprises. Popular uses include ${cityContext.localEvents[0]} marketing materials and ${cityContext.landmarks[0]} area promotions.`
    },
    {
      question: `How fast can I get ${productType} printed in ${cityContext.city}?`,
      answer: `We offer same-day printing in ${cityContext.neighborhoods[0]}, with pickup or delivery available. For other areas of ${cityContext.city}, standard turnaround is 1-3 business days. Rush options available for urgent needs.`
    },
    {
      question: `Do you work with ${cityContext.localIndustries[0]} and ${cityContext.localIndustries[1]} companies in ${cityContext.city}?`,
      answer: `Absolutely! We specialize in serving ${cityContext.localIndustries.join(', ')} businesses throughout ${cityContext.city}. We understand the unique needs of ${cityContext.economicData.toLowerCase()}.`
    },
    {
      question: `Can you handle large orders for events like ${cityContext.localEvents[0]}?`,
      answer: `Yes! We've produced ${productType} for major ${cityContext.city} events including ${cityContext.localEvents[0]}, ${cityContext.localEvents[1]}, and more. Our capacity handles orders from 50 to 50,000+ pieces.`
    }
  ]
}

/**
 * Replace template variables with city-specific data
 */
export function replaceVariables(template: string, cityContext: CityContext): string {
  return template
    .replace(/\[CITY\]/g, cityContext.city)
    .replace(/\[STATE\]/g, cityContext.state)
    .replace(/\[STATE_CODE\]/g, cityContext.stateCode)
    .replace(/\[POPULATION\]/g, cityContext.population.toString())
    .replace(/\[POPULATION_FORMATTED\]/g, cityContext.populationFormatted)
    .replace(/\[NEIGHBORHOODS\]/g, cityContext.neighborhoods.join(', '))
    .replace(/\[LANDMARK\]/g, cityContext.landmarks[0])
    .replace(/\[LANDMARKS\]/g, cityContext.landmarks.join(', '))
    .replace(/\[BUSINESS_DISTRICT\]/g, cityContext.businessDistricts[0])
    .replace(/\[EVENT\]/g, cityContext.localEvents[0])
    .replace(/\[EVENTS\]/g, cityContext.localEvents.join(', '))
    .replace(/\[BUSINESS_COUNT\]/g, cityContext.avgBusinessCount)
    .replace(/\[INDUSTRIES\]/g, cityContext.localIndustries.join(', '))
}

/**
 * Generate complete unique content for a city landing page
 *
 * This is the main function called when publishing a landing page set
 */
export async function generateCityContent(
  cityId: string,
  landingPageSetId: string,
  templates: {
    titleTemplate: string
    metaDescTemplate: string
    h1Template: string
    contentTemplate: string
  },
  productType: string
): Promise<{
  title: string
  metaDesc: string
  h1: string
  aiIntro: string
  aiBenefits: string
  contentSections: Array<{title: string, content: string}>
  faqSchema: Array<{question: string, answer: string}>
}> {
  // 1. Enrich city data
  const cityContext = await enrichCityData(cityId)

  // 2. Replace variables in templates
  const title = replaceVariables(templates.titleTemplate, cityContext)
  const metaDesc = replaceVariables(templates.metaDescTemplate, cityContext)
  const h1 = replaceVariables(templates.h1Template, cityContext)
  const content = replaceVariables(templates.contentTemplate, cityContext)

  // 3. Generate AI prompts (to be sent to LLM)
  const introPrompt = buildIntroPrompt(cityContext, productType)
  const benefitsPrompt = buildBenefitsPrompt(cityContext, productType)

  // 4. Call LLM to generate unique content
  // TODO: Integrate with Ollama or OpenAI API
  // For now, we'll use template-based generation
  const aiIntro = generatePlaceholderIntro(cityContext, productType)
  const aiBenefits = generatePlaceholderBenefits(cityContext, productType)

  // 5. Generate FAQs
  const faqSchema = generateCityFAQs(cityContext, productType)

  // 6. Build content sections
  const contentSections = [
    {
      title: `Why ${cityContext.city} Businesses Choose Us`,
      content: aiIntro
    },
    {
      title: `${productType} Services in ${cityContext.city}`,
      content: aiBenefits
    },
    {
      title: `Delivery & Service Areas in ${cityContext.city}`,
      content: `We proudly serve all areas of ${cityContext.city}, including ${cityContext.neighborhoods.join(', ')}. With same-day service in ${cityContext.neighborhoods[0]} and next-day delivery across ${cityContext.city}, we make professional printing accessible to all ${cityContext.populationFormatted} residents.`
    }
  ]

  return {
    title,
    metaDesc,
    h1,
    aiIntro,
    aiBenefits,
    contentSections,
    faqSchema
  }
}

/**
 * Placeholder intro generation (will be replaced with real AI)
 * TODO: Replace with Ollama or OpenAI API call
 */
function generatePlaceholderIntro(cityContext: CityContext, productType: string): string {
  return `Looking for professional ${productType} printing in ${cityContext.city}, ${cityContext.state}? With ${cityContext.populationFormatted} residents and ${cityContext.avgBusinessCount} businesses across ${cityContext.neighborhoods.length} neighborhoods, ${cityContext.city} has a thriving economy built on ${cityContext.localIndustries.join(', ')}.

Our printing services support businesses from ${cityContext.businessDistricts[0]} to ${cityContext.neighborhoods[1]}, helping companies prepare for major events like ${cityContext.localEvents[0]} and day-to-day marketing needs. Whether you're near ${cityContext.landmarks[0]} or anywhere in ${cityContext.city}, we deliver quality ${productType} with same-day service options.

${cityContext.economicData} - and we're proud to support this vibrant community with fast, affordable, professional printing services.`
}

/**
 * Placeholder benefits generation (will be replaced with real AI)
 * TODO: Replace with Ollama or OpenAI API call
 */
function generatePlaceholderBenefits(cityContext: CityContext, productType: string): string {
  return `• Free delivery to all ${cityContext.neighborhoods.length} areas of ${cityContext.city}
• Same-day printing available in ${cityContext.neighborhoods[0]}
• Trusted by ${cityContext.avgBusinessCount} ${cityContext.city} businesses
• Perfect for ${cityContext.localEvents[0]} and local event marketing
• Serving ${cityContext.populationFormatted} residents with quality ${productType}`
}
