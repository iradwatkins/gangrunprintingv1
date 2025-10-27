import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { PromptOptimizer } from '@/lib/ai/prompt-optimizer'
import { GoogleAIImageGenerator } from '@/lib/image-generation/google-ai-client'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

/**
 * AI-Assisted Prompt Generation
 * POST /api/prompts/[id]/ai-generate
 *
 * Workflow:
 * 1. Analyze prompt with Gemini
 * 2. Generate 4 prompt variations (lighting, composition, 2x style)
 * 3. Generate images for each variation
 * 4. Analyze results with Gemini
 * 5. Return all data for user selection
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Get the prompt template
    const prompt = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    console.log(`[AI Generate] Starting AI-assisted generation for prompt: ${prompt.name}`)

    // 2. Build full prompt text
    const parts = [prompt.promptText]
    if (prompt.styleModifiers) parts.push(prompt.styleModifiers)
    if (prompt.technicalSpecs) parts.push(prompt.technicalSpecs)
    const fullPrompt = parts.join(', ')

    console.log(`[AI Generate] Base prompt length: ${fullPrompt.length} characters`)

    // 3. Generate AI variations with Gemini
    console.log(`[AI Generate] Requesting variations from Gemini...`)
    const optimizer = new PromptOptimizer()
    const variations = await optimizer.generateVariations(fullPrompt)

    console.log(`[AI Generate] Received ${variations.length} variations from Gemini`)

    // 4. Generate images for each variation
    const generator = new GoogleAIImageGenerator()
    const variationSetId = randomUUID()
    const generatedImages = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i]
      console.log(`[AI Generate] Generating image ${i + 1}/4 (${variation.type})...`)

      try {
        // Generate image with Google Imagen
        const result = await generator.generateImage({
          prompt: variation.modifiedPrompt,
          negativePrompt: prompt.negativePrompt || undefined,
          config: {
            numberOfImages: 1,
            aspectRatio: '4:3',
            imageSize: '1K', // Optimize for web
            personGeneration: 'dont_allow',
          },
        })

        // Optimize image (WebP @ 85% quality, 800px width)
        const optimizedBuffer = await sharp(result.buffer)
          .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 85, effort: 6 })
          .toBuffer()

        const base64Image = optimizedBuffer.toString('base64')
        const imageUrl = `data:image/webp;base64,${base64Image}`

        const sizeKB = Math.round(optimizedBuffer.length / 1024)
        console.log(`[AI Generate] Image ${i + 1} generated: ${sizeKB}KB`)

        // Save to database
        const testImage = await prisma.promptTestImage.create({
          data: {
            promptTemplateId: prompt.id,
            imageUrl,
            promptText: variation.modifiedPrompt,
            iteration: prompt.currentIteration,
            quality: 'good',
            variationType: variation.type,
            aiSuggestion: variation.explanation,
            variationSet: variationSetId,
            config: {
              aspectRatio: '4:3',
              imageSize: '1K',
              variationType: variation.type,
            },
          },
        })

        generatedImages.push({
          id: testImage.id,
          imageUrl: testImage.imageUrl,
          type: variation.type,
          prompt: variation.modifiedPrompt,
          explanation: variation.explanation,
          priority: variation.priority,
        })

        successCount++

        // Wait 3s between generations (rate limiting)
        if (i < variations.length - 1) {
          console.log(`[AI Generate] Waiting 3s before next generation...`)
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      } catch (error) {
        console.error(`[AI Generate] Failed to generate ${variation.type} variation:`, error)
        failCount++
        // Continue with next variation even if one fails
      }
    }

    console.log(`[AI Generate] Image generation complete: ${successCount} success, ${failCount} failed`)

    // 5. Get AI analysis of results (if we have images)
    let analysis = 'Analysis unavailable - please review images manually.'

    if (generatedImages.length > 0) {
      try {
        console.log(`[AI Generate] Requesting image analysis from Gemini...`)
        analysis = await optimizer.analyzeGeneratedImages(
          generatedImages.map((img) => ({
            type: img.type,
            prompt: img.prompt,
            imageDataUrl: img.imageUrl,
          }))
        )
        console.log(`[AI Generate] Analysis received from Gemini`)
      } catch (error) {
        console.error(`[AI Generate] Failed to analyze images:`, error)
        analysis = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease review images manually based on clarity, composition, lighting, and professional appearance.`
      }
    }

    console.log(`[AI Generate] Complete! Generated ${generatedImages.length} images`)

    return NextResponse.json({
      success: true,
      variationSetId,
      images: generatedImages,
      aiAnalysis: analysis,
      count: generatedImages.length,
      stats: {
        requested: variations.length,
        generated: successCount,
        failed: failCount,
      },
    })
  } catch (error) {
    console.error('[AI Generate] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate AI variations',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
