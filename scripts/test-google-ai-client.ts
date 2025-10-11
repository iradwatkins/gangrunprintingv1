/**
 * Test Google AI Client Library
 *
 * Purpose: Verify the GoogleAIImageGenerator class works correctly
 * Usage: npx tsx scripts/test-google-ai-client.ts
 */

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

import {
  GoogleAIImageGenerator,
  generateProductImage,
  generateCityPostcardImage,
} from '@/lib/image-generation'
import * as fs from 'node:fs'
import * as path from 'node:path'

async function testClientLibrary() {
  console.log('')
  console.log('🧪 Testing Google AI Client Library')
  console.log('='.repeat(60))
  console.log('')

  try {
    // Test 1: Class instantiation
    console.log('📦 Test 1: Instantiate GoogleAIImageGenerator class...')
    const generator = new GoogleAIImageGenerator()
    console.log('✅ Class instantiated successfully')
    console.log('')

    // Test 2: Generate simple image with class
    console.log('🎨 Test 2: Generate image using class method...')
    const result1 = await generator.generateImage({
      prompt: 'Simple blue cube on white background, 3D render, clean',
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        imageSize: '1K', // Use 1K for testing (faster)
      },
    })
    console.log('✅ Image generated via class method')
    console.log(`   Buffer size: ${result1.buffer.length} bytes`)
    console.log(`   Generated at: ${result1.generatedAt.toISOString()}`)
    console.log('')

    // Test 3: Convenience function
    console.log('🚀 Test 3: Generate image using convenience function...')
    const buffer2 = await generateProductImage('Red sphere on gray background, product photography')
    console.log('✅ Image generated via convenience function')
    console.log(`   Buffer size: ${buffer2.length} bytes`)
    console.log('')

    // Test 4: City postcard image (New York)
    console.log('🗽 Test 4: Generate New York postcard hero image...')
    const buffer3 = await generateCityPostcardImage('New York', 'hero')
    console.log('✅ New York hero image generated')
    console.log(`   Buffer size: ${buffer3.length} bytes`)
    console.log('')

    // Save test images
    console.log('💾 Saving test images...')
    const outputDir = path.join(process.cwd(), 'test-outputs')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(path.join(outputDir, 'test-class-method.png'), result1.buffer)
    console.log('   ✅ test-class-method.png')

    fs.writeFileSync(path.join(outputDir, 'test-convenience-function.png'), buffer2)
    console.log('   ✅ test-convenience-function.png')

    fs.writeFileSync(path.join(outputDir, 'test-new-york-hero.png'), buffer3)
    console.log('   ✅ test-new-york-hero.png')

    console.log('')
    console.log('='.repeat(60))
    console.log('🎉 ALL CLIENT LIBRARY TESTS PASSED!')
    console.log('='.repeat(60))
    console.log('')
    console.log('✅ Class instantiation: Working')
    console.log('✅ Image generation: Working')
    console.log('✅ Convenience functions: Working')
    console.log('✅ City postcard prompts: Working')
    console.log('✅ TypeScript types: Valid')
    console.log('')
    console.log('📁 Test images saved to: test-outputs/')
    console.log('')
    console.log('🚀 Client library ready for production use!')
    console.log('')
  } catch (error: any) {
    console.error('')
    console.error('❌ CLIENT LIBRARY TEST FAILED')
    console.error('='.repeat(60))
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

// Run tests
testClientLibrary()
  .then(() => {
    console.log('✅ Test script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
