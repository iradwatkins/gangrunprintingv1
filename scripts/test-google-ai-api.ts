/**
 * Google AI Studio API Test Script
 *
 * Purpose: Verify Google AI Studio API key works and test image generation
 * Model: Imagen 4.0 (latest model as of 2025)
 *
 * Usage: npx tsx scripts/test-google-ai-api.ts
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'node:fs'
import * as path from 'node:path'

// API Key from environment or hardcoded for testing
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || 'AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY'

async function testGoogleAIStudio() {
  console.log('🧪 Google AI Studio API Test')
  console.log('='.repeat(60))
  console.log('')

  // Step 1: Initialize client
  console.log('📡 Step 1: Initializing Google AI client...')
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY })
    console.log('✅ Client initialized successfully')
    console.log('')

    // Step 2: Test simple text generation first (cheaper, faster)
    console.log('📝 Step 2: Testing API key with text generation...')
    try {
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Say 'API key works!' in exactly 3 words",
      })

      const textResult = textResponse.response?.text()
      console.log('✅ API Key Valid! Response:', textResult)
      console.log('')
    } catch (textError: any) {
      console.error('❌ API Key Test Failed:')
      console.error('Error:', textError.message)
      if (textError.status) {
        console.error('Status:', textError.status)
      }
      console.log('')
      console.log('⚠️  Possible issues:')
      console.log('   - API key is invalid or expired')
      console.log("   - API key doesn't have Gemini API access")
      console.log('   - Network connectivity issue')
      console.log('')
      return
    }

    // Step 3: Test image generation (Imagen 4)
    console.log('🎨 Step 3: Testing Imagen 4 image generation...')
    console.log("   Prompt: 'Simple red apple on white background'")
    console.log('   Model: imagen-4.0-generate-001')
    console.log('')

    try {
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: 'Simple red apple on white background, product photography',
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      })

      console.log('✅ Image generation successful!')
      console.log(`   Generated ${imageResponse.generatedImages.length} image(s)`)
      console.log('')

      // Step 4: Save test image
      console.log('💾 Step 4: Saving test image...')
      const outputDir = path.join(process.cwd(), 'test-outputs')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      let idx = 1
      for (const generatedImage of imageResponse.generatedImages) {
        const imgBytes = generatedImage.image.imageBytes
        const buffer = Buffer.from(imgBytes, 'base64')
        const filename = `google-ai-test-${Date.now()}-${idx}.png`
        const filepath = path.join(outputDir, filename)
        fs.writeFileSync(filepath, buffer)
        console.log(`✅ Saved: ${filepath}`)
        idx++
      }
      console.log('')

      // Step 5: Report success
      console.log('='.repeat(60))
      console.log('🎉 ALL TESTS PASSED!')
      console.log('='.repeat(60))
      console.log('')
      console.log('✅ API Key: Valid')
      console.log('✅ Text Generation: Working')
      console.log('✅ Image Generation (Imagen 4): Working')
      console.log('✅ Image Saved: test-outputs/')
      console.log('')
      console.log('📊 API Details:')
      console.log('   - Model: imagen-4.0-generate-001 (latest)')
      console.log('   - Package: @google/genai')
      console.log('   - Response: Base64 encoded image')
      console.log('   - Format: PNG')
      console.log('')
      console.log('🚀 Ready for integration!')
      console.log('')
    } catch (imageError: any) {
      console.error('❌ Image generation failed:')
      console.error('Error:', imageError.message)
      if (imageError.status) {
        console.error('Status:', imageError.status)
      }
      console.log('')
      console.log('⚠️  Possible issues:')
      console.log("   - API key doesn't have Imagen access")
      console.log('   - Imagen 4 model not available in your region')
      console.log('   - Rate limit exceeded')
      console.log('   - Billing not enabled')
      console.log('')
      console.log('💡 Try using Gemini 2.5 Flash Image instead:')
      console.log("   Model: 'gemini-2.5-flash-image'")
      console.log('')
    }
  } catch (error: any) {
    console.error('❌ Critical Error:')
    console.error(error)
    console.log('')
    console.log('⚠️  Please check:')
    console.log('   1. API key is correct')
    console.log('   2. @google/genai package is installed')
    console.log('   3. Network connectivity')
    console.log('')
  }
}

// Run test
console.log('')
testGoogleAIStudio()
  .then(() => {
    console.log('✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
