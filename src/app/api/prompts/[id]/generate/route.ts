import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { GoogleAIImageGenerator } from '@/lib/image-generation/google-ai-client'
import { z } from 'zod'

const generateSchema = z.object({
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '9:16', '16:9']).optional(),
  imageSize: z.enum(['1K', '2K']).optional(),
})

// POST /api/prompts/[id]/generate - Generate 4 test images
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

    // Build the full prompt
    const fullPrompt = buildFullPrompt(prompt)

    // Initialize Google AI client
    const generator = new GoogleAIImageGenerator()

    // Generate 4 images
    const images: Array<{
      imageUrl: string
      iteration: number
      quality: 'excellent' | 'good' | 'poor'
    }> = []

    for (let i = 0; i < 4; i++) {
      try {
        const result = await generator.generateImage({
          prompt: fullPrompt,
          negativePrompt: prompt.negativePrompt || undefined,
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
            },
          },
        })

        images.push({
          imageUrl: testImage.imageUrl,
          iteration: testImage.iteration,
          quality: testImage.quality,
        })

        // Wait 2 seconds between generations to avoid rate limits
        if (i < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error)
        // Continue with next image even if one fails
      }
    }

    // Update prompt iteration
    await prisma.promptTemplate.update({
      where: { id: params.id },
      data: { currentIteration: prompt.currentIteration + 1 },
    })

    return NextResponse.json({
      success: true,
      images,
      iteration: prompt.currentIteration,
      message: `Generated ${images.length} images`,
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

/**
 * Build the full prompt from template fields
 */
function buildFullPrompt(prompt: {
  promptText: string
  styleModifiers: string | null
  technicalSpecs: string | null
}): string {
  const parts = [prompt.promptText]

  if (prompt.styleModifiers) {
    parts.push(prompt.styleModifiers)
  }

  if (prompt.technicalSpecs) {
    parts.push(prompt.technicalSpecs)
  }

  return parts.join(', ')
}
