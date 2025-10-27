import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete test images first (cascade should handle this, but being explicit)
    await prisma.promptTestImage.deleteMany({
      where: { promptTemplateId: params.id },
    })

    // Delete the prompt template
    await prisma.promptTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
