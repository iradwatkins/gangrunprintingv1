/**
 * Test AI Image Generation
 *
 * Tests the Google AI Imagen 4 integration
 * Verifies image generation basic functionality
 */

import { GoogleAIImageGenerator } from '../src/lib/image-generation'

async function main() {
  console.log('🧪 Testing AI Image Generation\n')

  // Test 1: Initialize generator
  console.log('1️⃣  Initializing Google AI generator...')
  try {
    const generator = new GoogleAIImageGenerator()
    console.log('   ✅ Generator initialized\n')

    // Test 2: Generate a simple test image
    console.log('2️⃣  Generating test image...')
    console.log(
      '   Prompt: "Professional product photography of red business cards on white background"'
    )

    const result = await generator.generateImage({
      prompt:
        'Professional product photography of red business cards on white background, studio lighting, high quality',
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        imageSize: '1K', // Use 1K for faster testing
        personGeneration: 'dont_allow',
      },
    })

    console.log('   ✅ Image generated!')
    console.log(`   Buffer size: ${result.buffer.length} bytes`)
    console.log(`   Generated at: ${result.generatedAt}\n`)

    console.log('\n✨ All tests passed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Go to /admin/products/new')
    console.log('   2. Fill in product name')
    console.log('   3. Click "AI Generate" button')
    console.log('   4. Enter a prompt and click "Generate Image"')
    console.log('   5. View all versions in "Drafts" folder')
    console.log('   6. Select your favorite and continue creating product\n')
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.error('\nTroubleshooting:')

    if (error.message?.includes('API key')) {
      console.error('   - Check that GOOGLE_AI_STUDIO_API_KEY is set in .env')
      console.error('   - Get API key from: https://aistudio.google.com/app/apikey')
    } else if (error.message?.includes('Rate limit')) {
      console.error('   - Wait a moment and try again')
    } else {
      console.error('   - Full error:', error)
    }

    process.exit(1)
  }
}

main()
