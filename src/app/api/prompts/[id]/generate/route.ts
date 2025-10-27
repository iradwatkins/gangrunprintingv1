import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { GoogleAIImageGenerator } from '@/lib/image-generation/google-ai-client'
import { buildCompletePrompt } from '@/lib/ai/prompt-builder'
import { z } from 'zod'

const generateSchema = z.object({
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '9:16', '16:9']).optional(),
  imageSize: z.enum(['1K', '2K']).optional(),
  selectedModifiers: z
    .object({
      style: z.array(z.string()).optional(),
      technical: z.array(z.string()).optional(),
      negative: z.array(z.string()).optional(),
      holiday: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
})

// POST /api/prompts/[id]/generate - Generate single test image (Design Center Rebuild Oct 27, 2025)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the prompt template
    const prompt = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Parse request body for config
    const body = await request.json().catch(() => ({}))
    const config = generateSchema.parse(body)

    // Build the full prompt using new prompt builder
    const { prompt: fullPrompt, negativePrompt } = buildCompletePrompt({
      basePrompt: prompt.promptText,
      productType: prompt.productType,
      selectedModifiers: config.selectedModifiers || null,
      styleModifiers: prompt.styleModifiers,
      technicalSpecs: prompt.technicalSpecs,
      negativePrompt: prompt.negativePrompt,
    })

    // Initialize Google AI client
    const generator = new GoogleAIImageGenerator()

    // Generate single image
    const result = await generator.generateImage({
      prompt: fullPrompt,
      negativePrompt: negativePrompt || prompt.negativePrompt || undefined,
      config: {
        numberOfImages: 1,
        aspectRatio: config.aspectRatio || '4:3',
        imageSize: config.imageSize || '2K',
        personGeneration: 'dont_allow',
      },
    })

    // Convert buffer to base64 data URL for immediate display
    const base64Image = result.buffer.toString('base64')
    const imageUrl = `data:image/png;base64,${base64Image}`

    // Save to database
    const testImage = await prisma.promptTestImage.create({
      data: {
        promptTemplateId: prompt.id,
        imageUrl: imageUrl,
        promptText: fullPrompt, // Exact prompt used
        iteration: prompt.currentIteration,
        quality: 'good', // Default - can be updated by user
        config: {
          aspectRatio: config.aspectRatio || '4:3',
          imageSize: config.imageSize || '2K',
          selectedModifiers: config.selectedModifiers || undefined,
        },
      },
    })

    // Update prompt iteration
    await prisma.promptTemplate.update({
      where: { id: params.id },
      data: { currentIteration: prompt.currentIteration + 1 },
    })

    return NextResponse.json({
      success: true,
      image: {
        id: testImage.id,
        imageUrl: testImage.imageUrl,
        iteration: testImage.iteration,
        quality: testImage.quality,
        promptText: testImage.promptText,
        createdAt: testImage.createdAt,
      },
      iteration: prompt.currentIteration,
      message: 'Image generated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error generating images:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate images',
      },
      { status: 500 }
    )
  }
}
