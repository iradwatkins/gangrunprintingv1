#!/usr/bin/env tsx

/**
 * Generate Factory Floor Photos - Direct Database Script
 *
 * Creates two product photos from Factory Floor template:
 * 1. Eye-level Bumper Sticker
 * 2. 45-degree angle Banner
 */

import { prisma } from '../src/lib/prisma'
import { GoogleAIImageGenerator } from '../src/lib/image-generation/google-ai-client'
import sharp from 'sharp'

const BASE_URL = 'https://gangrunprinting.com'
const TEMPLATE_ID = 'betzvu58rbs997ek5c9g4lne' // Factory Floor template

async function main() {
  console.log('🏭 Generating Factory Floor Photos...\n')

  try {
    // Get the template
    const template = await prisma.promptTemplate.findUnique({
      where: { id: TEMPLATE_ID }
    })

    if (!template) {
      throw new Error('Factory Floor template not found')
    }

    console.log(`Found template: ${template.name}\n`)

    const generator = new GoogleAIImageGenerator()

    // Photo 1: Eye-level Bumper Sticker
    console.log('📸 Photo 1: Eye-level Bumper Sticker')
    console.log('Creating copy from template...')

    const eyeLevelPrompt = `Professional product photography of BUMPER STICKER on industrial work table, centered, product is focal point.

BUMPER STICKER in sharp focus showing vivid colors, text readable, quality evident, fresh from press.

Setting: clean industrial surface on printing factory floor, product dominant.

Background (soft focus): large commercial printing press machinery blurred behind, factory equipment, paper rolls, industrial printing environment.

Props: minimal - fresh printed stack to side, color strips, printing tools barely visible.

Lighting: bright industrial overhead on product, factory floor ambient behind, accurate colors.

Atmosphere: real manufacturing facility, "we print in-house" credibility, working factory authenticity, "see where it's made" transparency.

Product focus: 90% on details, 10% factory context, sharp product with press machinery softly blurred.

Branding: GangRunPrinting elements on equipment if visible (blurred).

Canon EOS R5, eye-level straight-on angle, shallow depth of field, product photography, 4:3`

    const prompt1 = await prisma.promptTemplate.create({
      data: {
        name: 'Factory Floor - Eye Level Bumper Sticker',
        slug: `factory-floor-eye-level-bumper-sticker-${Date.now()}`,
        category: template.category,
        productType: 'BUMPER_STICKER',
        promptText: eyeLevelPrompt,
        styleModifiers: template.styleModifiers,
        technicalSpecs: template.technicalSpecs,
        negativePrompt: template.negativePrompt,
        description: 'Eye-level product photography of bumper sticker on factory floor',
        aiProvider: template.aiProvider,
        aspectRatio: '4:3',
        isTemplate: false,
        currentIteration: 1,
        status: 'DRAFT',
      }
    })

    console.log(`✓ Created prompt: ${prompt1.id}`)

    // Generate image 1
    console.log('Generating image...')
    const result1 = await generator.generateImage({
      prompt: eyeLevelPrompt,
      negativePrompt: template.negativePrompt || undefined,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        imageSize: '2K',
        personGeneration: 'dont_allow',
      },
    })

    // Optimize image
    const optimizedBuffer1 = await sharp(result1.buffer)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toBuffer()

    const base64Image1 = optimizedBuffer1.toString('base64')
    const imageUrl1 = `data:image/webp;base64,${base64Image1}`

    // Save test image
    await prisma.promptTestImage.create({
      data: {
        promptTemplateId: prompt1.id,
        promptText: eyeLevelPrompt,
        imageUrl: imageUrl1,
        iteration: 1,
        quality: 'good',
        isWinner: true,
        config: {
          aspectRatio: '4:3',
          imageSize: '2K'
        }
      }
    })

    const originalSizeKB1 = Math.round(result1.buffer.length / 1024)
    const optimizedSizeKB1 = Math.round(optimizedBuffer1.length / 1024)
    const reduction1 = Math.round(((1 - optimizedBuffer1.length / result1.buffer.length) * 100))

    console.log(`✓ Generated! ${originalSizeKB1}KB → ${optimizedSizeKB1}KB (${reduction1}% smaller)`)
    console.log(`   View at: ${BASE_URL}/en/admin/design-center/${prompt1.id}/edit\n`)

    // Wait 3 seconds to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Photo 2: 45-degree Banner
    console.log('📸 Photo 2: 45-Degree Angle Banner')
    console.log('Creating copy from template...')

    const anglePrompt = `Professional product photography of BANNER on industrial work table, centered, product is focal point.

BANNER in sharp focus showing vivid colors, text readable, quality evident, fresh from press.

Setting: clean industrial surface on printing factory floor, product dominant.

Background (soft focus): large commercial printing press machinery blurred behind, factory equipment, paper rolls, industrial printing environment.

Props: minimal - fresh printed stack to side, color strips, printing tools barely visible.

Lighting: bright industrial overhead on product, factory floor ambient behind, accurate colors.

Atmosphere: real manufacturing facility, "we print in-house" credibility, working factory authenticity, "see where it's made" transparency.

Product focus: 90% on details, 10% factory context, sharp product with press machinery softly blurred.

Branding: GangRunPrinting elements on equipment if visible (blurred).

Canon EOS R5, 45-degree angle, shallow depth of field, product photography, 4:3`

    const prompt2 = await prisma.promptTemplate.create({
      data: {
        name: 'Factory Floor - 45 Degree Banner',
        slug: `factory-floor-45-degree-banner-${Date.now()}`,
        category: template.category,
        productType: 'BANNER',
        promptText: anglePrompt,
        styleModifiers: template.styleModifiers,
        technicalSpecs: template.technicalSpecs,
        negativePrompt: template.negativePrompt,
        description: '45-degree angle product photography of banner on factory floor',
        aiProvider: template.aiProvider,
        aspectRatio: '4:3',
        isTemplate: false,
        currentIteration: 1,
        status: 'DRAFT',
      }
    })

    console.log(`✓ Created prompt: ${prompt2.id}`)

    // Generate image 2
    console.log('Generating image...')
    const result2 = await generator.generateImage({
      prompt: anglePrompt,
      negativePrompt: template.negativePrompt || undefined,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        imageSize: '2K',
        personGeneration: 'dont_allow',
      },
    })

    // Optimize image
    const optimizedBuffer2 = await sharp(result2.buffer)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toBuffer()

    const base64Image2 = optimizedBuffer2.toString('base64')
    const imageUrl2 = `data:image/webp;base64,${base64Image2}`

    // Save test image
    await prisma.promptTestImage.create({
      data: {
        promptTemplateId: prompt2.id,
        promptText: anglePrompt,
        imageUrl: imageUrl2,
        iteration: 1,
        quality: 'good',
        isWinner: true,
        config: {
          aspectRatio: '4:3',
          imageSize: '2K'
        }
      }
    })

    const originalSizeKB2 = Math.round(result2.buffer.length / 1024)
    const optimizedSizeKB2 = Math.round(optimizedBuffer2.length / 1024)
    const reduction2 = Math.round(((1 - optimizedBuffer2.length / result2.buffer.length) * 100))

    console.log(`✓ Generated! ${originalSizeKB2}KB → ${optimizedSizeKB2}KB (${reduction2}% smaller)`)
    console.log(`   View at: ${BASE_URL}/en/admin/design-center/${prompt2.id}/edit\n`)

    // Summary
    console.log('✅ COMPLETE! Both photos generated successfully\n')
    console.log('📷 Photo 1 - Eye-level Bumper Sticker:')
    console.log(`   ${BASE_URL}/en/admin/design-center/${prompt1.id}/edit`)
    console.log('')
    console.log('📷 Photo 2 - 45-Degree Banner:')
    console.log(`   ${BASE_URL}/en/admin/design-center/${prompt2.id}/edit`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
