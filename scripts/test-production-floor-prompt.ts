/**
 * Test Production Floor Prompt
 *
 * Generates an example image using the production floor aesthetic
 */

import { GoogleAIImageGenerator } from '../src/lib/image-generation'
import * as fs from 'fs'

const PRODUCTION_FLOOR_PROMPT = `professional product photography of freshly printed business cards stacked in foreground, Heidelberg printing press visible in soft-focus background, commercial print shop floor, printer operator in distance adjusting machinery, authentic printing facility environment, studio lighting on cards showing crisp edges and premium cardstock quality, industrial professional atmosphere, 4k resolution, shallow depth of field, just-off-the-press aesthetic, commercial printing production`

async function main() {
  console.log('🎨 Generating Production Floor Shot Example...\n')
  console.log('📝 Prompt:')
  console.log(PRODUCTION_FLOOR_PROMPT)
  console.log('\n⏳ Generating image (this takes ~10-15 seconds)...\n')

  try {
    const generator = new GoogleAIImageGenerator()

    const result = await generator.generateImage({
      prompt: PRODUCTION_FLOOR_PROMPT,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        imageSize: '2K',
        personGeneration: 'allow_adult', // Allow worker in background
      },
    })

    console.log('✅ Image generated successfully!')
    console.log(`   Buffer size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Generated at: ${result.generatedAt.toLocaleString()}`)

    // Save to temp file
    const filename = '/tmp/production-floor-example.png'
    fs.writeFileSync(filename, result.buffer)

    console.log(`\n📸 Image saved to: ${filename}`)
    console.log('\n🖼️  To view the image:')
    console.log(
      '   Option 1 (Download): scp root@72.60.28.175:/tmp/production-floor-example.png ./'
    )
    console.log('   Option 2 (Browser):  Upload to MinIO and view in browser\n')

    console.log('✨ This is what customers will see!')
    console.log('   - Product in sharp focus')
    console.log('   - Heidelberg press blurred in background')
    console.log('   - Worker operating machinery (distance)')
    console.log('   - "Just off the press" authentic feel\n')
  } catch (error: any) {
    console.error('❌ Generation failed:', error.message)
    process.exit(1)
  }
}

main()
