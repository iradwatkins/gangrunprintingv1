/**
 * Generate Hero Images for Landing Pages (Quick Version)
 *
 * Generates just the 2 main hero images needed for postcard pages
 */

import { GoogleAIImageGenerator } from '../src/lib/image-generation/google-ai-client'
import * as fs from 'fs'
import * as path from 'path'

const HERO_PROMPTS = {
  generic:
    'Professional product photography of vibrant 4x6 postcards fanned out on clean white surface, showing multiple colorful designs, studio lighting with soft shadows, high-end marketing photography, ultra sharp focus, premium paper texture visible, 4k resolution',

  nyc: 'Professional product photography of 4x6 postcards featuring New York City skyline imagery, postcards displayed on modern marble desk with Manhattan skyline visible through window in background, golden hour lighting, premium urban business aesthetic, 4k resolution, sophisticated composition',
}

async function main() {
  console.log('🚀 Generating Hero Images\n')

  if (!process.env.GOOGLE_AI_STUDIO_API_KEY) {
    console.error('❌ GOOGLE_AI_STUDIO_API_KEY not found')
    process.exit(1)
  }

  const generator = new GoogleAIImageGenerator(process.env.GOOGLE_AI_STUDIO_API_KEY)
  console.log('✅ Generator initialized\n')

  const outputDir = path.join(process.cwd(), 'public', 'generated-images')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Generate Generic Postcard Hero
  console.log('🎨 Generating: Generic Postcard Hero')
  console.log(`📝 Prompt: ${HERO_PROMPTS.generic.substring(0, 80)}...\n`)

  try {
    const result1 = await generator.generateImage({
      prompt: HERO_PROMPTS.generic,
      config: {
        imageSize: '2K',
        aspectRatio: '4:3',
      },
    })

    const filepath1 = path.join(outputDir, 'postcard-hero-generic.png')
    fs.writeFileSync(filepath1, result1.buffer)
    console.log(`✅ Generated! Size: ${(result1.buffer.length / 1024 / 1024).toFixed(2)}MB`)
    console.log(`💾 Saved to: ${filepath1}\n`)
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  // Wait 3 seconds (rate limit)
  console.log('⏳ Waiting 3s for rate limit...\n')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Generate NYC Postcard Hero
  console.log('🎨 Generating: NYC Postcard Hero')
  console.log(`📝 Prompt: ${HERO_PROMPTS.nyc.substring(0, 80)}...\n`)

  try {
    const result2 = await generator.generateImage({
      prompt: HERO_PROMPTS.nyc,
      config: {
        imageSize: '2K',
        aspectRatio: '4:3',
      },
    })

    const filepath2 = path.join(outputDir, 'postcard-hero-nyc.png')
    fs.writeFileSync(filepath2, result2.buffer)
    console.log(`✅ Generated! Size: ${(result2.buffer.length / 1024 / 1024).toFixed(2)}MB`)
    console.log(`💾 Saved to: ${filepath2}\n`)
  } catch (error) {
    console.error('❌ Failed:', error)
  }

  console.log('✨ Done! Images saved to public/generated-images/')
}

main().catch(console.error)
