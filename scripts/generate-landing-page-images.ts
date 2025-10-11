/**
 * Generate AI Images for Landing Pages
 *
 * Creates professional product images using Google Imagen 4
 * for postcard landing pages (generic and city-specific)
 */

import { GoogleAIImageGenerator } from '../src/lib/image-generation/google-ai-client'
import { prisma } from '../src/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Image prompts for different sections
// Note: Using single line strings to avoid whitespace issues
const IMAGE_PROMPTS = {
  // Hero/Main Product Images
  hero_generic_postcard:
    'Professional product photography of vibrant 4x6 postcards fanned out on a clean white surface, showing multiple colorful designs, studio lighting with soft shadows, high-end marketing photography, ultra sharp focus, premium paper texture visible, 4k resolution',

  hero_nyc_postcard:
    'Professional product photography of 4x6 postcards featuring New York City skyline imagery, postcards displayed on modern marble desk with Manhattan skyline visible through window in background, golden hour lighting, premium urban business aesthetic, 4k resolution, sophisticated composition',

  // Benefits/Features Section Images
  benefit_quality:
    'Close-up macro photography of premium cardstock postcard edge, showing paper thickness and quality, professional studio lighting highlighting texture, shallow depth of field, luxury print product shot, 4k detail, commercial photography',

  benefit_fast_turnaround:
    'Professional product photography of postcards being carefully packaged in shipping box, clean workspace, organized and efficient, modern fulfillment center aesthetic, bright natural lighting, 4k resolution, process photography',

  benefit_design:
    'Professional flat lay of design tools and postcard mockups on clean white desk, laptop showing design software, color swatches, ruler, modern creative workspace, overhead shot, natural window lighting, 4k resolution, lifestyle photography',

  // Process/How It Works Images
  process_upload:
    'Modern laptop screen showing file upload interface with postcard designs, clean UI mockup, professional workspace setting, soft lighting, 4k resolution, technology photography, user-friendly interface visible',

  process_review:
    'Professional photography of person reviewing printed postcard proof, hands holding quality postcard sample, close-up on approval stamp or checkmark, clean office setting, natural lighting, 4k business photography',

  process_printing:
    'Professional commercial printing press in action, modern offset printer, vibrant colored postcards being printed, industrial photography, clean factory setting, dynamic angle, professional equipment photography, 4k resolution',

  process_shipping:
    'Stack of neatly packaged postcard boxes ready for shipping, professional fulfillment center, USPS priority mail packaging visible, organized warehouse setting, bright overhead lighting, 4k commercial photography, logistics photography',

  // City-Specific NYC Images
  nyc_skyline:
    'Stunning New York City skyline at golden hour, Manhattan skyscrapers, iconic buildings, warm sunset lighting, professional cityscape photography, ultra high definition, 4k resolution, travel photography aesthetic',

  nyc_brooklyn_bridge:
    'Brooklyn Bridge with Manhattan skyline in background, golden hour lighting, iconic NYC landmark, professional architectural photography, vivid colors, 4k resolution, postcard-worthy composition',

  nyc_times_square:
    'Times Square at dusk, vibrant billboards and lights beginning to illuminate, bustling energy, professional urban photography, sharp focus, 4k resolution, classic New York atmosphere',

  nyc_central_park:
    'Central Park in autumn, colorful fall foliage, Manhattan buildings visible in background, peaceful urban oasis, professional landscape photography, golden afternoon light, 4k resolution, serene composition',

  // Trust/Social Proof Images
  trust_review:
    'Five gold stars rating badge on clean white background, premium metallic finish, professional product photography, soft shadow, centered composition, 4k resolution, certification badge photography',

  trust_guarantee:
    'Professional shield badge icon with checkmark, representing quality guarantee, premium metallic finish, clean white background, studio lighting, 4k resolution, certification photography, trust badge',

  // Generic Background/Lifestyle
  lifestyle_business:
    'Professional business environment, modern office desk with laptop and coffee, postcards scattered artfully, natural window lighting, clean aesthetic, 4k resolution, corporate lifestyle photography',

  lifestyle_marketing:
    'Marketing campaign materials laid out on conference table, postcards, brochures, strategy documents, professional business setting, overhead shot, natural lighting, 4k resolution, corporate photography',
}

async function generateImage(generator: GoogleAIImageGenerator, name: string, prompt: string) {
  console.log(`\n🎨 Generating: ${name}`)
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)

  try {
    const buffer = await generator.generateImage(prompt, {
      imageSize: '2K',
      aspectRatio: '4:3',
    })

    console.log(`✅ Generated! Size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)
    return buffer
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error)
    return null
  }
}

async function saveImageToFile(buffer: Buffer, filename: string) {
  const outputDir = path.join(process.cwd(), 'public', 'generated-images')

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, buffer)
  console.log(`💾 Saved to: ${filepath}`)

  return `/generated-images/${filename}`
}

async function main() {
  console.log('🚀 Starting AI Image Generation for Landing Pages\n')
  console.log('================================================\n')

  // Check API key
  if (!process.env.GOOGLE_AI_STUDIO_API_KEY) {
    console.error('❌ GOOGLE_AI_STUDIO_API_KEY not found in environment')
    process.exit(1)
  }

  const generator = new GoogleAIImageGenerator(process.env.GOOGLE_AI_STUDIO_API_KEY)
  console.log('✅ Google AI Image Generator initialized\n')

  // Phase 1: Generate hero images
  console.log('📦 Phase 1: Hero Product Images')
  console.log('================================\n')

  const heroGeneric = await generateImage(
    generator,
    'Generic Postcard Hero',
    IMAGE_PROMPTS.hero_generic_postcard
  )

  if (heroGeneric) {
    await saveImageToFile(heroGeneric, 'postcard-hero-generic.png')
  }

  // Wait 3 seconds to avoid rate limits
  console.log('⏳ Waiting 3s...')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const heroNYC = await generateImage(
    generator,
    'NYC Postcard Hero',
    IMAGE_PROMPTS.hero_nyc_postcard
  )

  if (heroNYC) {
    await saveImageToFile(heroNYC, 'postcard-hero-nyc.png')
  }

  // Phase 2: Generate benefit images
  console.log('\n📦 Phase 2: Benefits Section Images')
  console.log('====================================\n')

  const benefitImages = [
    { key: 'benefit_quality', filename: 'benefit-quality.png' },
    { key: 'benefit_fast_turnaround', filename: 'benefit-turnaround.png' },
    { key: 'benefit_design', filename: 'benefit-design.png' },
  ]

  for (const { key, filename } of benefitImages) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const buffer = await generateImage(
      generator,
      filename,
      IMAGE_PROMPTS[key as keyof typeof IMAGE_PROMPTS]
    )
    if (buffer) {
      await saveImageToFile(buffer, filename)
    }
  }

  // Phase 3: Generate process/how-it-works images
  console.log('\n📦 Phase 3: Process Section Images')
  console.log('===================================\n')

  const processImages = [
    { key: 'process_upload', filename: 'process-upload.png' },
    { key: 'process_review', filename: 'process-review.png' },
    { key: 'process_printing', filename: 'process-printing.png' },
    { key: 'process_shipping', filename: 'process-shipping.png' },
  ]

  for (const { key, filename } of processImages) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const buffer = await generateImage(
      generator,
      filename,
      IMAGE_PROMPTS[key as keyof typeof IMAGE_PROMPTS]
    )
    if (buffer) {
      await saveImageToFile(buffer, filename)
    }
  }

  // Phase 4: Generate NYC-specific images
  console.log('\n📦 Phase 4: NYC City-Specific Images')
  console.log('=====================================\n')

  const nycImages = [
    { key: 'nyc_skyline', filename: 'nyc-skyline.png' },
    { key: 'nyc_brooklyn_bridge', filename: 'nyc-brooklyn-bridge.png' },
    { key: 'nyc_times_square', filename: 'nyc-times-square.png' },
    { key: 'nyc_central_park', filename: 'nyc-central-park.png' },
  ]

  for (const { key, filename } of nycImages) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const buffer = await generateImage(
      generator,
      filename,
      IMAGE_PROMPTS[key as keyof typeof IMAGE_PROMPTS]
    )
    if (buffer) {
      await saveImageToFile(buffer, filename)
    }
  }

  // Phase 5: Generate trust/social proof images
  console.log('\n📦 Phase 5: Trust Badge Images')
  console.log('================================\n')

  const trustImages = [
    { key: 'trust_review', filename: 'trust-5-stars.png' },
    { key: 'trust_guarantee', filename: 'trust-guarantee.png' },
  ]

  for (const { key, filename } of trustImages) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const buffer = await generateImage(
      generator,
      filename,
      IMAGE_PROMPTS[key as keyof typeof IMAGE_PROMPTS]
    )
    if (buffer) {
      await saveImageToFile(buffer, filename)
    }
  }

  console.log('\n\n✨ AI Image Generation Complete!')
  console.log('=================================\n')
  console.log('📁 Images saved to: public/generated-images/')
  console.log('\n📋 Next Steps:')
  console.log('1. Review generated images in public/generated-images/')
  console.log('2. Run upload script to add to products')
  console.log('3. Update product metadata with image references')
  console.log('\n🎉 Done!')
}

main()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
