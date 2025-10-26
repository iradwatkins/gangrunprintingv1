import { PrismaClient, PromptCategory, PromptStatus } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

const promptTemplates = [
  {
    name: 'E-Commerce Clean Product Shot',
    slug: 'ecommerce-clean-product-shot',
    description: 'Pure white background, 100% product focus, trust and quality showcase',
    category: 'PRODUCT' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on clean white surface, e-commerce product shot, square composition centered.

The product displays clearly with all details visible, premium quality cardstock/material evident, colors accurate and vibrant.

Setting: pure white seamless background or minimal clean surface, product perfectly centered, professional studio setup

Props: minimal or none - focus is 100% on the product itself, maybe subtle shadow for depth

Lighting: professional studio lighting, three-point softbox setup creating soft diffused highlights, eliminates harsh shadows, color-accurate lighting for true product representation, bright and clean

Atmosphere: professional e-commerce quality, trustworthy and premium feel, catalog-ready presentation, customer confidence inspiring, "what you see is what you get" honesty

Details to emphasize: paper quality texture visible, sharp edges, vivid color printing, professional finish, material thickness apparent

Branding: small gangrunprinting logo in bottom right corner if on product, otherwise no branding in frame

Shot with Canon EOS R5, straight-on or 45-degree angle for optimal product view, every detail in sharp focus, professional product photography, 8K, HDR, color-accurate

Aspect ratio: 1:1`,
    variables: {
      PRODUCT: 'business cards',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 1,
  },
  {
    name: 'Product-First with Print Shop Environment',
    slug: 'product-print-shop-environment',
    description: '90% Product / 10% Office Environment - Real business credibility',
    category: 'ENVIRONMENT' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on clean modern desk, centered, product is clear focal point.

[PRODUCT] displayed prominently in sharp focus showing all details - colors vibrant, text readable, quality evident.

Setting: modern desk in professional office, product centered and dominant.

Background (subtle, soft focus): hint of GangRunPrinting company name on wall visible but blurred, suggests "real print shop" without overwhelming.

Props: minimal - maybe one small branded item slightly out of focus to side.

Lighting: professional studio on product, bright clean illumination, soft ambient in background, color-accurate.

Atmosphere: legitimate business, "real location" credibility, product quality star.

Product focus: 90% attention on details, 10% subtle environment, sharp focus product with background gently blurred.

Branding: GangRunPrinting text softly visible on background wall (out of focus), small logo bottom right if applicable.

Canon EOS R5, 45-degree angle, shallow depth of field, 1:1`,
    variables: {
      PRODUCT: 'business cards',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 2,
  },
  {
    name: 'Factory Floor - Manufacturing Transparency',
    slug: 'factory-floor-manufacturing',
    description: '90% Product / 10% Factory Environment - In-house production credibility',
    category: 'ENVIRONMENT' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on industrial work table, centered, product is focal point.

[PRODUCT] in sharp focus showing vivid colors, text readable, quality evident, fresh from press.

Setting: clean industrial surface on printing factory floor, product dominant.

Background (soft focus): large commercial printing press machinery blurred behind, factory equipment, paper rolls, industrial printing environment.

Props: minimal - fresh printed stack to side, color strips, printing tools barely visible.

Lighting: bright industrial overhead on product, factory floor ambient behind, accurate colors.

Atmosphere: real manufacturing facility, "we print in-house" credibility, working factory authenticity, "see where it's made" transparency.

Product focus: 90% on details, 10% factory context, sharp product with press machinery softly blurred.

Branding: GangRunPrinting elements on equipment if visible (blurred).

Canon EOS R5, 45-degree angle, shallow depth of field, 1:1`,
    variables: {
      PRODUCT: 'business cards',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 3,
  },
  {
    name: 'Black Friday - High Energy Sales',
    slug: 'black-friday-high-energy',
    description: 'Maximum urgency, explosive sales vibe for Black Friday promotions',
    category: 'PROMOTIONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on rustic wooden table, Black Friday sale theme with bold energetic design, square 1:1 composition with flyer centered showing correct 4x6 proportions. The flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible.

The flyer displays:
- Header "[CITY] BLACK FRIDAY SPECIAL" in bold red letters
- Main offer "[QUANTITY] [PRODUCT] - Only $[PRICE]" in large eye-catching typography
- Subtext "ORDER NOW USE LATER" in urgent styling
- Black Friday themed graphics with shopping bags, sale tags, urgent design elements

Setting: rustic wooden table with [CITY_PROPS], centered composition for square format

City elements: [CITY]-themed props

Lighting: dramatic high-energy lighting, vibrant saturated colors, bold contrast

Atmosphere: urgent Black Friday shopping energy, explosive sales vibe, attention-grabbing

Branding: small gangrunprinting logo in bottom right corner of flyer

Aspect ratio 1:1, sharp focus on flyer text, professional product photography`,
    variables: {
      CITY: 'Chicago',
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '$179',
      CITY_PROPS: 'deep dish pizza slice on plate, Chicago flag napkin, shopping bag',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 4,
  },
  {
    name: 'Black Friday - Enhanced (8K HDR)',
    slug: 'black-friday-enhanced',
    description: 'High energy Black Friday with enhanced photorealism (8K, HDR)',
    category: 'PROMOTIONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on rustic wooden table, high-energy sales campaign theme with bold explosive design, square 1:1 composition with flyer centered showing correct 4x6 proportions. The flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible.

The flyer displays:
- Header "[CITY] BLACK FRIDAY SPECIAL" in bold red letters, urgent typography
- Main offer "[QUANTITY] [PRODUCT] - Only $[PRICE]" in large eye-catching typography with dynamic energy
- Subtext "ORDER NOW USE LATER" in urgent action-oriented styling
- Graphics: shopping bags, sale tags, countdown timers, urgent explosive elements, bold geometric shapes

Setting: rustic wooden table with [CITY_PROPS], centered composition for square format

City elements: [CITY_COLORS], [CITY_VIBE] - AI agent should incorporate 2-3 city-specific props that reflect local culture

Lighting: dramatic high-energy lighting, vibrant saturated colors, bold red and black contrast, explosive brightness

Atmosphere: urgent shopping energy, explosive sales vibe, adrenaline-pumping excitement, attention-grabbing, time-sensitive urgency, "act now" energy

Branding: small gangrunprinting logo in bottom right corner of flyer

Shot with Canon EOS R5, 45-degree angle centered for square format, sharp focus on flyer text and pricing, professional product photography, 8K, HDR

Aspect ratio: 1:1`,
    variables: {
      CITY: 'Chicago',
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '$179',
      CITY_PROPS: 'deep dish pizza, Chicago flag napkin, shopping bag',
      CITY_COLORS: 'red and blue flag colors',
      CITY_VIBE: 'industrial bold heartland vibe',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 5,
  },
  {
    name: 'Lifestyle/Blog Context',
    slug: 'lifestyle-blog-context',
    description: '70% Product / 30% Usage Context - Social media and blog content',
    category: 'LIFESTYLE' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on office desk, centered, product is focal point. [PRODUCT] in sharp focus showing vivid colors, text readable, quality evident. Setting: modern office desk surface, product dominant. Background (soft focus): laptop keyboard, leather portfolio, coffee cup, notepad blurred behind. Props: minimal office items - pen, smartphone barely visible. Lighting: natural window light, warm office ambient. Atmosphere: realistic workplace, authentic business setting, "this is how you'll use these". Product focus: 70% on [PRODUCT] details, 30% usage context, sharp product with office items softly blurred. Canon EOS R5, 45-degree angle, shallow depth of field, 1:1`,
    variables: {
      PRODUCT: 'business cards',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 6,
  },
  {
    name: 'Lifestyle Product Hero',
    slug: 'lifestyle-product-hero',
    description: '90% Product / 10% Subtle Context - Product pages with usage hints',
    category: 'LIFESTYLE' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on office desk, product fills frame, sharp focal point. [PRODUCT] dominant in composition showing all details - vivid colors, crisp text, quality cardstock texture visible. Setting: minimal office desk surface, product is hero. Background (heavily blurred): laptop edge, coffee cup rim barely visible, hints of office context. Props: extremely minimal - suggestion of workplace only. Lighting: bright natural window light on product, warm ambient. Atmosphere: realistic usage hint, professional quality showcase, product is star. Product focus: 90% on [PRODUCT] details filling image, 10% subtle context hints heavily blurred. Canon EOS R5, 45-degree angle, very shallow depth of field, 1:1`,
    variables: {
      PRODUCT: 'business cards',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 7,
  },
  {
    name: 'Real-World Usage Scenarios',
    slug: 'real-world-usage-scenarios',
    description: 'Product-specific contexts showing authentic usage (table tents, door hangers, etc.)',
    category: 'LIFESTYLE' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Professional product photography of [PRODUCT] on [SETTING_SURFACE], product fills frame, sharp focal point. [PRODUCT] dominant showing vivid colors, text readable, quality cardstock. Setting: [SETTING_SURFACE], realistic [CONTEXT_TYPE] context. Background (soft focus): [CONTEXT_PROPS] blurred behind. Props: contextual [CONTEXT_ITEMS] visible but blurred. Lighting: [CONTEXT_LIGHTING], natural realistic atmosphere. Atmosphere: authentic [CONTEXT_SETTING], relatable scenario, "this is how you'll use this product". Product focus: 70% on [PRODUCT] details clearly visible, 30% environment showing usage context. Small gangrunprinting logo on product. Canon EOS R5, natural perspective, product sharp with environment context, 8K, HDR, 1:1`,
    variables: {
      PRODUCT: 'table tent standing upright',
      SETTING_SURFACE: 'restaurant table',
      CONTEXT_TYPE: 'restaurant',
      CONTEXT_PROPS: 'menu nearby, salt/pepper shakers, coffee cup, silverware, napkin blurred behind',
      CONTEXT_ITEMS: 'dining items',
      CONTEXT_LIGHTING: 'warm restaurant ambient',
      CONTEXT_SETTING: 'restaurant table setting, relatable dining scenario, standing promotional card',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 8,
  },
  {
    name: 'Thanksgiving Harvest Promotional',
    slug: 'thanksgiving-harvest-promotional',
    description: 'Warm autumn harvest celebration for Thanksgiving campaigns',
    category: 'SEASONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on rustic wooden table, Thanksgiving holiday theme with warm harvest design, square 1:1 composition with flyer centered showing correct 4x6 proportions. The flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible, displays: Header "[CITY] THANKSGIVING SPECIAL" in warm autumn typography with orange and burgundy colors, Main offer "[QUANTITY] [PRODUCT] - Only $[PRICE]" in elegant harvest typography, Subtext "ORDER NOW USE LATER" in welcoming style, Graphics: autumn leaves, pumpkins, cornucopia, turkey feathers, wheat stalks, harvest elements. Setting: rustic wooden table with [CITY_PROPS], small pumpkins, autumn leaves (orange, red, gold), centered composition. City elements: [CITY_COLORS], [CITY_VIBE] - AI adds 2-3 [CITY] props with autumn touches. Lighting: warm golden autumn glow, cozy harvest lighting, soft amber tones, late afternoon sun, rich warm shadows. Atmosphere: gratitude and family warmth, harvest celebration joy, cozy autumn comfort, "gather together" energy, thankful spirit, traditional holiday feeling. Color palette: burnt orange, deep burgundy, golden yellow, rich brown, cream, warm autumn colors. Small gangrunprinting logo bottom right. Canon EOS R5, 45-degree angle, warm autumn color grading, sharp focus on text, 8K, HDR, 1:1`,
    variables: {
      CITY: 'Chicago',
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '$179',
      CITY_PROPS: 'deep dish pizza slice, Chicago flag napkin',
      CITY_COLORS: 'red and blue flag colors',
      CITY_VIBE: 'industrial heartland vibe',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 9,
  },
  {
    name: 'Back to School - K-12 Cafeteria',
    slug: 'back-to-school-k12-cafeteria',
    description: 'Fresh school energy for K-12 targeting (August/September)',
    category: 'SEASONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on school cafeteria lunch table, back to school theme, square 1:1 composition with flyer centered showing correct 4x6 proportions. The flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible, displays: Header "[CITY] BACK TO SCHOOL SPECIAL" in bold primary colors (red, blue, yellow), Main offer "[QUANTITY] [PRODUCT] - Only $[PRICE]", Subtext "START THE YEAR RIGHT", Graphics: pencils, notebooks, apples, school buses, ABC/123 elements. Setting: school cafeteria lunch table surface with lunch tray, apple, milk carton, sharpened pencils, notebooks, ruler, school supplies, centered in square frame. Background (soft focus): cafeteria chairs, other lunch tables blurred, school setting atmosphere. City elements: [CITY] flag sticker on notebook, [CITY_COLORS] - AI adds [CITY] props with school touches. Lighting: bright fluorescent cafeteria lighting, clean vibrant illumination. Atmosphere: new beginnings excitement, fresh start energy, authentic school environment, student life. Color palette: primary colors (red, blue, yellow), bright green, chalkboard black. Small gangrunprinting logo on flyer. Canon EOS R5, 45-degree angle, flyer showing accurate 4x6 rectangular shape, sharp focus, 8K, HDR, 1:1 aspect ratio`,
    variables: {
      CITY: 'Chicago',
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '$179',
      CITY_COLORS: 'red and blue colors',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 10,
  },
  {
    name: 'Back to School - Generic (No City)',
    slug: 'back-to-school-generic',
    description: 'Universal back to school (no city-specific elements)',
    category: 'SEASONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on school cafeteria lunch table, back to school theme, square 1:1 composition with flyer centered showing correct 4x6 proportions. The flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible, displays: Header "BACK TO SCHOOL SPECIAL" in bold primary colors (red, blue, yellow), Main offer "[QUANTITY] [PRODUCT] - Starting at $[PRICE]", Subtext "START THE YEAR RIGHT", Graphics: pencils, notebooks, apples, school buses, ABC/123 elements, ruler borders, academic achievement symbols. Setting: school cafeteria lunch table surface with lunch tray, apple, milk carton, sharpened pencils, notebooks, ruler, school supplies, centered in square frame. Background (soft focus): cafeteria chairs, other lunch tables blurred, authentic school setting atmosphere. Lighting: bright fluorescent cafeteria lighting, clean vibrant illumination, optimistic bright tones. Atmosphere: new beginnings excitement, fresh start energy, educational opportunity, authentic school environment, student life, youthful optimistic energy. Color palette: primary colors (red, blue, yellow), bright green, chalkboard black, clean white, vibrant youthful. Small gangrunprinting logo on flyer. Canon EOS R5, 45-degree angle, flyer showing accurate 4x6 rectangular shape, sharp focus, 8K, HDR, 1:1 aspect ratio`,
    variables: {
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '179',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 11,
  },
  {
    name: 'Back to School - College Library',
    slug: 'back-to-school-college-library',
    description: 'College/university targeting with library study desk setting',
    category: 'SEASONAL' as PromptCategory,
    status: 'PRODUCTION' as PromptStatus,
    promptText: `Product photography of 4x6 inch rectangular glossy flyer on college library study desk, back to school theme, square 1:1 composition centered showing correct 4x6 proportions. Flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible, displays: Header "[CITY] BACK TO SCHOOL SPECIAL" in bold primary colors, Main offer "[QUANTITY] [PRODUCT] - Only $[PRICE]", Subtext "GEAR UP FOR SUCCESS", Graphics: pencils, notebooks, backpacks, graduation caps, ABC/123 elements. Setting: library study desk with textbooks, notebooks, campus coffee cup, calculator, pencils, backpack strap visible, centered in square frame. Background (soft focus): bookshelves, students studying blurred, library environment. City elements: [CITY] flag bookmark - AI adds [CITY] campus props. Lighting: natural library window light, institutional lighting, fresh campus feel. Atmosphere: new beginnings excitement, fresh start energy, authentic campus life, student hustle. Color palette: primary colors (red, blue, yellow), bright green, chalkboard black. Small gangrunprinting logo on flyer. Canon EOS R5, 45-degree angle, flyer sharp focus with library softly visible, 8K, HDR, 1:1`,
    variables: {
      CITY: 'Chicago',
      PRODUCT: '4x6 Flyers',
      QUANTITY: '5000',
      PRICE: '$179',
    },
    aiProvider: 'google-imagen',
    aspectRatio: '1:1',
    sortOrder: 12,
  },
]

async function main() {
  console.log('🌱 Seeding prompt templates...')

  for (const template of promptTemplates) {
    const id = createId()

    try {
      await prisma.promptTemplate.upsert({
        where: { slug: template.slug },
        update: {
          name: template.name,
          description: template.description,
          category: template.category,
          status: template.status,
          promptText: template.promptText,
          variables: template.variables,
          aiProvider: template.aiProvider,
          aspectRatio: template.aspectRatio,
          sortOrder: template.sortOrder,
        },
        create: {
          id,
          ...template,
        },
      })

      console.log(`✅ Seeded: ${template.name}`)
    } catch (error) {
      console.error(`❌ Failed to seed ${template.name}:`, error)
    }
  }

  console.log('✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
