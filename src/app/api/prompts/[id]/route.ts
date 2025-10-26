import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'

const updatePromptSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['PRODUCT', 'PROMOTIONAL', 'SEASONAL', 'LIFESTYLE', 'ENVIRONMENT']).optional(),
  productType: z.string().min(1).optional(),
  promptText: z.string().min(1).optional(),
  styleModifiers: z.string().optional(),
  technicalSpecs: z.string().optional(),
  negativePrompt: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/prompts/[id] - Get a single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id: params.id },
      include: {
        testImages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 })
  }
}

// PUT /api/prompts/[id] - Update a prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePromptSchema.parse(body)

    const prompt = await prisma.promptTemplate.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(prompt)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating prompt:', error)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all test images first (cascade)
    await prisma.promptTestImage.deleteMany({
      where: { promptTemplateId: params.id },
    })

    // Delete the prompt
    await prisma.promptTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
