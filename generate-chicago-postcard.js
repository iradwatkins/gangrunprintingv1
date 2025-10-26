/**
 * Generate Chicago Postcard Image
 *
 * This generates a real AI image for Chicago postcards
 * and saves it to show the actual output.
 */

const { GoogleGenAI } = require('@google/genai')
const fs = require('fs')
const path = require('path')

const apiKey = 'AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY'

async function generateChicagoPostcard() {
  console.log('🎨 Generating Chicago Postcard AI Image...\n')

  try {
    // Initialize Google AI client
    const client = new GoogleGenAI({ apiKey })

    // Enhanced prompt with diversity (English version)
    const prompt = `Professional postcard design showcasing iconic Chicago skyline at golden hour,
featuring Willis Tower (tallest building) and John Hancock Center prominently in the composition,
Lake Michigan waterfront visible in foreground with sparkling blue water,
warm sunset lighting creating vibrant orange and pink tones in the sky,
diverse group of young professionals celebrating success in modern downtown plaza,
group includes African American man in business suit, White woman in professional attire,
Hispanic man in celebration pose, and Asian woman smiling,
high-quality professional photography style, sharp focus, vivid colors,
optimistic and vibrant mood perfect for business marketing,
1024x1024 square format, photorealistic quality, 4K resolution,
clean composition suitable for ChatGPT product display`

    console.log('📝 Prompt:', prompt.substring(0, 100) + '...\n')

    // Generate image
    console.log('⏳ Calling Google AI Imagen 4 API...')
    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1', // Square for ChatGPT
        imageSize: '1K',    // 1024x1024
        personGeneration: 'allow_adult', // Allow diverse people
      }
    })

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated in response')
    }

    console.log('✅ Image generated successfully!\n')

    // Extract image data
    const imageBytes = response.generatedImages[0].image.imageBytes
    const buffer = Buffer.from(imageBytes, 'base64')

    // Save to file
    const filename = 'chicago-il-postcard-printing-v1.png'
    const outputPath = path.join(__dirname, filename)

    fs.writeFileSync(outputPath, buffer)

    console.log('💾 Image saved to:', outputPath)
    console.log('📊 File size:', (buffer.length / 1024).toFixed(2), 'KB')
    console.log('📐 Dimensions: 1024x1024 (square, ChatGPT compliant)')

    // SEO metadata
    console.log('\n📋 Auto-Generated SEO Metadata:')
    console.log('━'.repeat(60))
    console.log('Filename:', filename)
    console.log('Alt Text: Custom postcard printing services in Chicago, IL')
    console.log('Title: Chicago Postcard Printing | GangRun Printing')
    console.log('Description: Professional custom postcard printing in Chicago, Illinois.')
    console.log('             Fast turnaround, high-quality printing, competitive prices.')
    console.log('\nKeywords:')
    console.log('  - chicago postcard printing')
    console.log('  - illinois postcards')
    console.log('  - custom postcards chicago')
    console.log('  - postcard printing chicago il')
    console.log('  - chicago printing services')
    console.log('━'.repeat(60))

    console.log('\n✨ SUCCESS! This is what your 200 Cities campaign will generate.')
    console.log('🎯 Next: Open', filename, 'to see the actual AI-generated image')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.status) {
      console.error('   HTTP Status:', error.status)
    }
    process.exit(1)
  }
}

generateChicagoPostcard()
