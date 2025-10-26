import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'

const createPromptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['PRODUCT', 'PROMOTIONAL', 'SEASONAL', 'LIFESTYLE', 'ENVIRONMENT']),
  productType: z.string().min(1, 'Product type is required'),
  promptText: z.string().min(1, 'Prompt text is required'),
  styleModifiers: z.string().optional(),
  technicalSpecs: z.string().optional(),
  negativePrompt: z.string().optional(),
  isTemplate: z.boolean().default(false),
  description: z.string().optional(),
})

// GET /api/prompts - List all prompts
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isTemplate = searchParams.get('isTemplate') === 'true'

    const prompts = await prisma.promptTemplate.findMany({
      where: { isTemplate },
      include: {
        _count: {
          select: { testImages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPromptSchema.parse(body)

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const prompt = await prisma.promptTemplate.create({
      data: {
        ...validatedData,
        slug,
        currentIteration: 1,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}
