import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the homepage variant exists
    const homepageVariant = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
    })

    if (!homepageVariant) {
      return NextResponse.json({ error: 'Homepage variant not found' }, { status: 404 })
    }

    if (!homepageVariant.isEnabled) {
      return NextResponse.json({ error: 'Cannot activate disabled homepage variant' }, { status: 400 })
    }

    // Use a transaction to ensure only one homepage is active at a time
    await prisma.$transaction(async (tx) => {
      // First, deactivate all homepage variants
      await tx.homepageVariant.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })

      // Then activate the specified homepage variant
      await tx.homepageVariant.update({
        where: { id: params.id },
        data: {
          isActive: true,
          lastActivatedAt: new Date(),
          activatedBy: user.id,
        },
      })
    })

    // Fetch the updated homepage variant with content
    const updatedHomepage = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
      include: {
        content: {
          orderBy: { position: 'asc' },
        },
      },
    })

    return NextResponse.json({
      message: 'Homepage variant activated successfully',
      homepage: updatedHomepage,
    })
  } catch (error) {
    console.error('Error activating homepage variant:', error)
    return NextResponse.json({ error: 'Failed to activate homepage variant' }, { status: 500 })
  }
}