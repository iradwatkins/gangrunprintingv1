import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// DELETE /api/prompts/[id]/images/[imageId] - Delete an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.promptTestImage.delete({
      where: { id: params.imageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
