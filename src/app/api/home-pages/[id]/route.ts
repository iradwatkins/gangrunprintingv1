import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const homepageVariant = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
      include: {
        content: {
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!homepageVariant) {
      return NextResponse.json({ error: 'Homepage variant not found' }, { status: 404 })
    }

    return NextResponse.json(homepageVariant)
  } catch (error) {
    console.error('Error fetching homepage variant:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage variant' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, sortOrder, isEnabled } = body

    const homepageVariant = await prisma.homepageVariant.update({
      where: { id: params.id },
      data: {
        name,
        description,
        sortOrder,
        isEnabled,
      },
      include: {
        content: {
          orderBy: { position: 'asc' },
        },
      },
    })

    return NextResponse.json(homepageVariant)
  } catch (error) {
    console.error('Error updating homepage variant:', error)
    return NextResponse.json({ error: 'Failed to update homepage variant' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if this is the active homepage
    const homepageVariant = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
    })

    if (!homepageVariant) {
      return NextResponse.json({ error: 'Homepage variant not found' }, { status: 404 })
    }

    if (homepageVariant.isActive) {
      return NextResponse.json({ error: 'Cannot delete active homepage variant' }, { status: 400 })
    }

    await prisma.homepageVariant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Homepage variant deleted successfully' })
  } catch (error) {
    console.error('Error deleting homepage variant:', error)
    return NextResponse.json({ error: 'Failed to delete homepage variant' }, { status: 500 })
  }
}