import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'

const rateSchema = z.object({
  quality: z.enum(['excellent', 'good', 'poor']),
})

// PUT /api/prompts/[id]/images/[imageId]/rate - Rate an image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quality } = rateSchema.parse(body)

    const image = await prisma.promptTestImage.update({
      where: { id: params.imageId },
      data: { quality },
    })

    return NextResponse.json(image)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error rating image:', error)
    return NextResponse.json({ error: 'Failed to rate image' }, { status: 500 })
  }
}
