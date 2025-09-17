import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/sizes - List all standard sizes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    const sizes = await prisma.standardSize.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(sizes)
  } catch (error) {
    console.error('Error fetching sizes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sizes' },
      { status: 500 }
    )
  }
}

// POST /api/sizes - Create a new standard size
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      name,
      displayName,
      width,
      height,
      preCalculatedValue,
      sortOrder,
      isActive
    } = body

    // Validation
    if (!name || !displayName || !width || !height || !preCalculatedValue) {
      return NextResponse.json(
        { error: 'All size fields are required' },
        { status: 400 }
      )
    }

    const size = await prisma.standardSize.create({
      data: {
        name,
        displayName,
        width,
        height,
        preCalculatedValue,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(size, { status: 201 })
  } catch (error: any) {
    console.error('Error creating size:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A size with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create size' },
      { status: 500 }
    )
  }
}