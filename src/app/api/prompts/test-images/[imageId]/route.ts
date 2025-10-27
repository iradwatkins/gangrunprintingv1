import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const image = await prisma.promptTestImage.findUnique({
      where: { id: params.imageId },
      select: { imageUrl: true },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({ imageUrl: image.imageUrl })
  } catch (error) {
    console.error('Error fetching test image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
