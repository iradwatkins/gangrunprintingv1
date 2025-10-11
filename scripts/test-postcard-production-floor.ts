/**
 * Test Postcard Production Floor Shot
 *
 * Improved prompt with centered product and print shop atmosphere
 */

import { GoogleAIImageGenerator } from '../src/lib/image-generation'
import * as fs from 'fs'

// Improved production floor prompt - centered product, print shop atmosphere
const POSTCARD_PRODUCTION_FLOOR_PROMPT = `professional product photography of glossy 4x6 postcard centered in frame, commercial print shop production floor setting in background, paper cutting equipment and printed sheets visible but softly blurred, authentic printing facility atmosphere, industrial workspace with professional lighting on centered postcard showing premium cardstock quality and UV coating shine, ambient workshop lighting in background, shallow depth of field keeping postcard in sharp focus, 4k resolution, just-completed-off-the-floor aesthetic, commercial printing environment, product shot composition`

async function main() {
  console.log('🎨 Generating Postcard Production Floor Example...\n')
  console.log('📝 Improved Prompt (Centered Product + Print Shop Feel):')
  console.log(POSTCARD_PRODUCTION_FLOOR_PROMPT)
  console.log('\n⏳ Generating image (~10-15 seconds)...\n')

  try {
    const generator = new GoogleAIImageGenerator()

    const result = await generator.generateImage({
      prompt: POSTCARD_PRODUCTION_FLOOR_PROMPT,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        imageSize: '2K',
        personGeneration: 'allow_adult',
      },
    })

    console.log('✅ Postcard image generated!')
    console.log(`   Buffer size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Generated at: ${result.generatedAt.toLocaleString()}`)

    // Save to temp and public
    const tempFile = '/tmp/postcard-production-floor.png'
    const publicFile = '/root/websites/gangrunprinting/public/postcard-production-floor.png'

    fs.writeFileSync(tempFile, result.buffer)
    fs.writeFileSync(publicFile, result.buffer)

    console.log(`\n📸 Image saved to: ${publicFile}`)
    console.log('\n🌐 View at: https://gangrunprinting.com/postcard-production-floor.png')
    console.log('\n✨ Key improvements:')
    console.log('   ✅ Product centered in frame')
    console.log('   ✅ Print shop atmosphere (not just machinery)')
    console.log('   ✅ Paper cutting equipment visible')
    console.log('   ✅ Printed sheets in background')
    console.log('   ✅ Authentic production floor feel\n')
  } catch (error: any) {
    console.error('❌ Generation failed:', error.message)
    process.exit(1)
  }
}

main()
