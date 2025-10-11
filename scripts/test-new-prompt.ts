/**
 * Test New Office/Print Shop Prompt
 *
 * Purpose: Test updated prompt with print shop branding and office setting
 * Usage: npx tsx scripts/test-new-prompt.ts
 */

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

import { GoogleAIImageGenerator } from '@/lib/image-generation'
import { compressWithRetry } from '@/lib/image-compression'
import * as fs from 'node:fs'
import * as path from 'node:path'

async function testNewPrompt() {
  console.log('')
  console.log('🧪 Testing New Office/Print Shop Prompt')
  console.log('='.repeat(70))
  console.log('')

  const generator = new GoogleAIImageGenerator()

  // TEST: Back to School Library Study Desk - Condensed
  const newPrompt = `Product photography of 4x6 inch rectangular glossy flyer on college library study desk, back to school theme, square 1:1 composition centered showing correct 4x6 proportions. Flyer is rectangular 4 inches wide by 6 inches tall with clear edges visible, displays: Header "CHICAGO BACK TO SCHOOL SPECIAL" in bold primary colors, Main offer "5000 4x6 Flyers - Only $179", Subtext "GEAR UP FOR SUCCESS", Graphics: pencils, notebooks, backpacks, graduation caps, ABC/123 elements. Setting: library study desk with textbooks, notebooks, campus coffee cup, calculator, pencils, backpack strap visible, centered in square frame. Background (soft focus): bookshelves, students studying blurred, library environment. City elements: Chicago flag bookmark - AI adds Chicago campus props. Lighting: natural library window light, institutional lighting, fresh campus feel. Atmosphere: new beginnings excitement, fresh start energy, authentic campus life, student hustle. Color palette: primary colors (red, blue, yellow), bright green, chalkboard black. Small gangrunprinting logo on flyer. Canon EOS R5, 45-degree angle, flyer sharp focus with library softly visible, 8K, HDR, 1:1`

  console.log('📝 NEW PROMPT:')
  console.log('-'.repeat(70))
  console.log(newPrompt)
  console.log('-'.repeat(70))
  console.log('')

  console.log('🎨 Generating image with NEW prompt...')
  console.log('⏱️  This may take 5-10 seconds...')
  console.log('')

  try {
    const result = await generator.generateImage({
      prompt: newPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1', // 4x4 square for product pages
        imageSize: '2K',
        personGeneration: 'dont_allow',
      },
    })

    console.log('✅ Image generated successfully!')
    console.log(`   Buffer size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Generated at: ${result.generatedAt.toISOString()}`)
    console.log('')

    // Compress image to ensure it never exceeds API limits
    console.log('🗜️  Compressing image for optimal size...')
    const compressed = await compressWithRetry(result.buffer, {
      targetAPI: 'google-imagen', // Uses 20 MB limit for Google AI
      maxDimension: 1920,
      initialQuality: 85, // Higher quality since we have more size budget
    })

    console.log('✅ Image compressed successfully!')
    console.log(`   Final size: ${compressed.sizeMB} MB`)
    console.log(`   Dimensions: ${compressed.dimensions.width}x${compressed.dimensions.height}`)
    console.log(`   Quality: ${compressed.finalQuality}%`)
    console.log(`   Was compressed: ${compressed.wasCompressed ? 'Yes' : 'No (already optimal)'}`)
    console.log('')

    // Save compressed image
    const outputDir = path.join(process.cwd(), 'test-outputs')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = `new-prompt-library-back-to-school-${Date.now()}.png`
    const filepath = path.join(outputDir, filename)
    fs.writeFileSync(filepath, compressed.buffer)

    console.log('💾 Image saved:')
    console.log(`   ${filepath}`)
    console.log('')

    console.log('='.repeat(70))
    console.log('🎉 TEST COMPLETE!')
    console.log('='.repeat(70))
    console.log('')
    console.log('📊 EXPECTED RESULT:')
    console.log('')
    console.log(`   test-outputs/${filename}`)
    console.log('   - FLYER IS RECTANGULAR 4x6 (4" wide x 6" tall) with visible edges')
    console.log('   - Flyer centered in 1:1 square frame with space around it')
    console.log('   - "CHICAGO BACK TO SCHOOL SPECIAL" header on flyer')
    console.log('   - "5000 4x6 Flyers - Only $179" pricing visible')
    console.log('   - Educational graphics: pencils, notebooks, backpacks, graduation caps')
    console.log('   - COLLEGE LIBRARY study desk setting (not cafeteria)')
    console.log('   - Textbooks, spiral notebooks, campus coffee cup, calculator')
    console.log('   - Highlighted notes, sharpened pencils, backpack strap visible')
    console.log('   - Background: bookshelves, students studying blurred (library)')
    console.log('   - Chicago flag bookmark, city props with campus touches')
    console.log('   - Natural library window light, institutional lighting')
    console.log('   - "Authentic campus life" atmosphere')
    console.log('   - gangrunprinting logo on flyer')
    console.log('')
    console.log('👁️  Review - LIBRARY STUDY setting, enhanced campus realism!')
    console.log('')
  } catch (error: any) {
    console.error('')
    console.error('❌ TEST FAILED')
    console.error('='.repeat(70))
    console.error('')
    console.error('Error:', error.message)
    if (error.stack) {
      console.error('')
      console.error('Stack trace:')
      console.error(error.stack)
    }
    console.error('')
    process.exit(1)
  }
}

// Run test
testNewPrompt()
  .then(() => {
    console.log('✅ Test script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
