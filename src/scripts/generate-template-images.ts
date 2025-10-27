#!/usr/bin/env tsx

/**
 * Generate sample images for all prompt templates
 * This script generates ONE test image per template for the Prompt Library
 *
 * OPTIMIZATION: Converts PNG → WebP @ 85% quality + resizes to 800px
 * Result: ~500KB per image (vs ~6MB original)
 */

import { prisma } from '../lib/prisma'
import { GoogleAIImageGenerator } from '../lib/image-generation/google-ai-client'
import sharp from 'sharp'

async function generateTemplateImages() {
  console.log('🎨 Generating template sample images...\n')

  // Get all prompts
  const prompts = await prisma.promptTemplate.findMany({
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${prompts.length} prompts to process\n`)

  const generator = new GoogleAIImageGenerator()
  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (const prompt of prompts) {
    // Check if prompt already has test images
    const existingImages = await prisma.promptTestImage.count({
      where: { promptTemplateId: prompt.id },
    })

    if (existingImages > 0) {
      console.log(`⏭️  [${prompt.name}] - Already has ${existingImages} image(s), skipping...`)
      skipCount++
      continue
    }

    console.log(`🖼️  [${prompt.name}] - Generating sample image...`)

    try {
      // Build full prompt
      const parts = [prompt.promptText]
      if (prompt.styleModifiers) parts.push(prompt.styleModifiers)
      if (prompt.technicalSpecs) parts.push(prompt.technicalSpecs)
      const fullPrompt = parts.join(', ')

      // Generate image - Use 1K for smallest API option
      const result = await generator.generateImage({
        prompt: fullPrompt,
        negativePrompt: prompt.negativePrompt || undefined,
        config: {
          numberOfImages: 1,
          aspectRatio: '4:3', // Standard product photo ratio
          imageSize: '1K', // Smallest API option
          personGeneration: 'dont_allow',
        },
      })

      // OPTIMIZE: Convert PNG → WebP @ 85% quality + resize to 800px width
      // This reduces file size by ~92% (6MB → ~500KB)
      const optimizedBuffer = await sharp(result.buffer)
        .resize(800, null, {
          // Resize to 800px width, maintain aspect ratio
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({
          quality: 85, // 85% quality - crystal clear, much smaller
          effort: 6, // Maximum compression effort (0-6)
        })
        .toBuffer()

      // Convert optimized WebP to base64 data URL
      const base64Image = optimizedBuffer.toString('base64')
      const imageUrl = `data:image/webp;base64,${base64Image}`

      // Log file size comparison
      const originalSizeKB = Math.round(result.buffer.length / 1024)
      const optimizedSizeKB = Math.round(optimizedBuffer.length / 1024)
      const reduction = Math.round(((1 - optimizedBuffer.length / result.buffer.length) * 100))

      // Save to database
      await prisma.promptTestImage.create({
        data: {
          promptTemplateId: prompt.id,
          imageUrl: imageUrl,
          promptText: fullPrompt,
          iteration: prompt.currentIteration || 1,
          quality: 'good',
          config: {
            aspectRatio: '4:3',
            imageSize: '2K',
          },
        },
      })

      console.log(`   ✅ Successfully generated image`)
      console.log(`   📊 Original: ${originalSizeKB}KB → Optimized: ${optimizedSizeKB}KB (${reduction}% smaller)\n`)
      successCount++

      // Wait 3 seconds between generations to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 3000))
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
      failCount++
      // Continue with next prompt even if one fails
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   ✅ Successfully generated: ${successCount}`)
  console.log(`   ⏭️  Skipped (already have images): ${skipCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📝 Total processed: ${prompts.length}`)
}

// Run the script
generateTemplateImages()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
