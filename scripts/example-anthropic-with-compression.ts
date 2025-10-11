/**
 * Example: Using Image Compression with Anthropic API
 *
 * This demonstrates how to compress images before sending to Anthropic's Claude API
 * to avoid "image exceeds 5 MB maximum" errors.
 *
 * Usage: npx tsx scripts/example-anthropic-with-compression.ts
 *
 * NOTE: This is an EXAMPLE file. Install @anthropic-ai/sdk first:
 * npm install @anthropic-ai/sdk
 */

import dotenv from 'dotenv'
dotenv.config()

import { compressWithRetry, validateBase64Size, formatBytes } from '@/lib/image-compression'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Example: Analyze an image with Claude while ensuring it's properly compressed
 */
async function analyzeImageWithClaude(imagePath: string, prompt: string) {
  console.log('')
  console.log('🤖 Analyzing Image with Claude API')
  console.log('='.repeat(70))
  console.log('')

  // Step 1: Load the image
  console.log(`📁 Loading image: ${imagePath}`)
  const imageBuffer = fs.readFileSync(imagePath)
  const originalSize = imageBuffer.length
  console.log(`   Original size: ${formatBytes(originalSize)}`)
  console.log('')

  // Step 2: Compress the image to ensure it's under 5 MB
  console.log('🗜️  Compressing image...')
  const compressed = await compressWithRetry(imageBuffer, {
    maxDimension: 1920,
    initialQuality: 80,
    maxBase64Size: 5 * 1024 * 1024, // 5 MB for Anthropic
  })

  console.log('✅ Compression complete!')
  console.log(`   Final size: ${compressed.sizeMB} MB (${compressed.sizeBytes} bytes)`)
  console.log(`   Dimensions: ${compressed.dimensions.width}x${compressed.dimensions.height}`)
  console.log(`   Quality: ${compressed.finalQuality}%`)
  console.log(`   Reduction: ${((1 - compressed.sizeBytes / originalSize) * 100).toFixed(1)}%`)
  console.log('')

  // Step 3: Validate base64 size before API call
  const isValid = validateBase64Size(compressed.base64)
  console.log(`✅ Base64 validation: ${isValid ? 'PASSED' : 'FAILED'}`)
  console.log('')

  // Step 4: Prepare the API call (EXAMPLE - requires @anthropic-ai/sdk)
  console.log('📤 Preparing API request...')
  console.log('')

  // EXAMPLE ONLY - Uncomment if you have @anthropic-ai/sdk installed:
  /*
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg", // or "image/png"
              data: compressed.base64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  console.log('✅ API Response:');
  console.log(message.content[0].text);
  */

  console.log('💡 To use this example:')
  console.log('   1. Install SDK: npm install @anthropic-ai/sdk')
  console.log('   2. Set ANTHROPIC_API_KEY in .env')
  console.log('   3. Uncomment the API call code above')
  console.log('')

  return compressed
}

/**
 * Example: Batch process multiple images
 */
async function batchCompressImages(imagePaths: string[]) {
  console.log('')
  console.log('📦 Batch Compressing Images')
  console.log('='.repeat(70))
  console.log('')

  const results = []

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i]
    console.log(`[${i + 1}/${imagePaths.length}] Processing: ${path.basename(imagePath)}`)

    try {
      const compressed = await compressWithRetry(imagePath, {
        maxBase64Size: 5 * 1024 * 1024,
      })

      console.log(`   ✅ Success: ${compressed.sizeMB} MB`)
      results.push({ path: imagePath, success: true, ...compressed })
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`)
      results.push({ path: imagePath, success: false, error: error.message })
    }

    console.log('')
  }

  console.log('📊 Batch Results:')
  console.log(`   Total: ${results.length}`)
  console.log(`   Successful: ${results.filter((r) => r.success).length}`)
  console.log(`   Failed: ${results.filter((r) => !r.success).length}`)
  console.log('')

  return results
}

/**
 * Main execution
 */
async function main() {
  const testImagePath = path.join(process.cwd(), 'test-outputs/test-new-york-hero.png')

  // Check if test image exists
  if (!fs.existsSync(testImagePath)) {
    console.log('')
    console.log('⚠️  Test image not found. Creating a dummy test...')
    console.log('')
    console.log('💡 To test with real images:')
    console.log('   1. Generate an image first: npx tsx scripts/test-new-prompt.ts')
    console.log('   2. Or provide your own image path')
    console.log('')
    return
  }

  // Example 1: Single image analysis
  await analyzeImageWithClaude(
    testImagePath,
    'What do you see in this image? Describe it in detail.'
  )

  console.log('='.repeat(70))
  console.log('')

  // Example 2: Batch processing (if you have multiple images)
  // await batchCompressImages([
  //   'test-outputs/image1.png',
  //   'test-outputs/image2.jpg',
  //   'test-outputs/image3.png',
  // ]);
}

// Run examples
main()
  .then(() => {
    console.log('✅ Examples completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
