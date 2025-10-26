import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'

const fromTemplateSchema = z.object({
  templateId: z.string(),
})

// POST /api/prompts/from-template - Create a prompt from a template
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = fromTemplateSchema.parse(body)

    // Get the template
    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (!template.isTemplate) {
      return NextResponse.json({ error: 'Not a template' }, { status: 400 })
    }

    // Generate unique slug for the copy
    const slug = `${template.slug}-copy-${Date.now()}`

    // Create a copy as a user prompt
    const newPrompt = await prisma.promptTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        slug,
        category: template.category,
        productType: template.productType,
        promptText: template.promptText,
        styleModifiers: template.styleModifiers,
        technicalSpecs: template.technicalSpecs,
        negativePrompt: template.negativePrompt,
        description: template.description,
        aiProvider: template.aiProvider,
        aspectRatio: template.aspectRatio,
        isTemplate: false,
        currentIteration: 1,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ promptId: newPrompt.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating prompt from template:', error)
    return NextResponse.json({ error: 'Failed to create prompt from template' }, { status: 500 })
  }
}
