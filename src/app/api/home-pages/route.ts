import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const homepageVariants = await prisma.homepageVariant.findMany({
      include: {
        content: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(homepageVariants)
  } catch (error) {
    console.error('Error fetching homepage variants:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage variants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, sortOrder } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    const homepageVariant = await prisma.homepageVariant.create({
      data: {
        name,
        type,
        description,
        sortOrder: sortOrder || 0,
      },
      include: {
        content: true,
      },
    })

    return NextResponse.json(homepageVariant)
  } catch (error) {
    console.error('Error creating homepage variant:', error)
    return NextResponse.json({ error: 'Failed to create homepage variant' }, { status: 500 })
  }
}