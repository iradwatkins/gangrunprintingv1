/**
 * Seed Image Campaigns
 *
 * Creates initial campaigns for 200 Cities AI image generation
 *
 * Campaigns:
 * - 200 Cities - Postcards (English/Spanish)
 * - 200 Cities - Flyers (English/Spanish)
 * - 200 Cities - Business Cards (English/Spanish)
 *
 * Run: npx tsx src/scripts/seed-image-campaigns.ts
 */

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

interface Campaign {
  name: string
  slug: string
  description: string
  locale: 'en' | 'es'
  productType: string
}

const CAMPAIGNS: Campaign[] = [
  // POSTCARDS
  {
    name: '200 Cities - Postcards (English)',
    slug: '200-cities-postcards-en',
    description:
      'AI-generated postcard images for 200 US cities. Professional photography featuring diverse communities celebrating local events and attractions.',
    locale: 'en',
    productType: 'postcards',
  },
  {
    name: '200 Cities - Postcards (Spanish)',
    slug: '200-cities-postcards-es',
    description:
      'Imágenes de postales generadas por IA para 200 ciudades de EE. UU. Fotografía profesional con comunidades latinas celebrando eventos y atracciones locales.',
    locale: 'es',
    productType: 'postcards',
  },

  // FLYERS
  {
    name: '200 Cities - Flyers (English)',
    slug: '200-cities-flyers-en',
    description:
      'AI-generated flyer images for 200 US cities. Eye-catching designs featuring multiethnic communities and local businesses.',
    locale: 'en',
    productType: 'flyers',
  },
  {
    name: '200 Cities - Flyers (Spanish)',
    slug: '200-cities-flyers-es',
    description:
      'Imágenes de volantes generadas por IA para 200 ciudades de EE. UU. Diseños llamativos con comunidades latinas y negocios locales.',
    locale: 'es',
    productType: 'flyers',
  },

  // BUSINESS CARDS
  {
    name: '200 Cities - Business Cards (English)',
    slug: '200-cities-business-cards-en',
    description:
      'AI-generated business card images for 200 US cities. Professional designs featuring diverse business professionals.',
    locale: 'en',
    productType: 'business-cards',
  },
  {
    name: '200 Cities - Business Cards (Spanish)',
    slug: '200-cities-business-cards-es',
    description:
      'Imágenes de tarjetas de presentación generadas por IA para 200 ciudades de EE. UU. Diseños profesionales con empresarios latinos.',
    locale: 'es',
    productType: 'business-cards',
  },
]

async function main() {
  console.log('🌱 Seeding image campaigns...\n')

  let created = 0
  let skipped = 0

  for (const campaign of CAMPAIGNS) {
    // Check if campaign already exists
    const existing = await prisma.imageCampaign.findUnique({
      where: { slug: campaign.slug },
    })

    if (existing) {
      console.log(`⏭️  Skipped: ${campaign.name} (already exists)`)
      skipped++
      continue
    }

    // Create campaign
    await prisma.imageCampaign.create({
      data: {
        id: nanoid(),
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        locale: campaign.locale,
        status: 'active',
      },
    })

    console.log(`✅ Created: ${campaign.name}`)
    created++
  }

  console.log('\n📊 Summary:')
  console.log(`   Created: ${created} campaigns`)
  console.log(`   Skipped: ${skipped} campaigns`)
  console.log(`   Total: ${CAMPAIGNS.length} campaigns\n`)

  console.log('🎉 Seeding complete!\n')
  console.log('Next steps:')
  console.log('1. View campaigns: SELECT * FROM "ImageCampaign";')
  console.log('2. Generate images using: POST /api/products/generate-image')
  console.log('3. Review images at: /admin/ai-images/review\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding campaigns:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
