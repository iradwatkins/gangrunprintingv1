import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/quantities - List all quantity groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    const quantityGroups = await prisma.quantityGroup.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Process the groups to include parsed values list
    const processedGroups = quantityGroups.map((group) => ({
      ...group,
      valuesList: group.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v),
      hasCustomOption: group.values.toLowerCase().includes('custom'),
    }))

    return NextResponse.json(processedGroups)
  } catch (error) {
    console.error('Error fetching quantity groups:', error)
    return NextResponse.json({ error: 'Failed to fetch quantity groups' }, { status: 500 })
  }
}

// POST /api/quantities - Create a new quantity group
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { name, description, values, defaultValue, customMin, customMax, sortOrder, isActive } =
      body

    // Validation
    if (!name || !values || !defaultValue) {
      return NextResponse.json(
        { error: 'Name, values, and default value are required' },
        { status: 400 }
      )
    }

    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        name,
        description,
        values,
        defaultValue,
        customMin,
        customMax,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(quantityGroup, { status: 201 })
  } catch (error: any) {
    console.error('Error creating quantity group:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A quantity group with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create quantity group' }, { status: 500 })
  }
}
