import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/sizes - List all size groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    const sizeGroups = await prisma.sizeGroup.findMany({
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
    const processedGroups = sizeGroups.map((group) => ({
      ...group,
      valuesList: group.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v),
      hasCustomOption: group.values.toLowerCase().includes('custom'),
    }))

    return NextResponse.json(processedGroups)
  } catch (error) {
    console.error('Error fetching size groups:', error)
    return NextResponse.json({ error: 'Failed to fetch size groups' }, { status: 500 })
  }
}

// POST /api/sizes - Create a new size group
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      name,
      description,
      values,
      defaultValue,
      customMinWidth,
      customMaxWidth,
      customMinHeight,
      customMaxHeight,
      sortOrder,
      isActive,
    } = body

    // Validation
    if (!name || !values || !defaultValue) {
      return NextResponse.json(
        { error: 'Name, values, and default value are required' },
        { status: 400 }
      )
    }

    // Validate that defaultValue exists in values
    const valuesList = values
      .split(',')
      .map((v: string) => v.trim())
      .filter((v: string) => v)
    if (!valuesList.includes(defaultValue)) {
      return NextResponse.json(
        { error: 'Default value must exist in the values list' },
        { status: 400 }
      )
    }

    const sizeGroup = await prisma.sizeGroup.create({
      data: {
        name,
        description,
        values,
        defaultValue,
        customMinWidth,
        customMaxWidth,
        customMinHeight,
        customMaxHeight,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    // Process the group to include parsed values list
    const processedGroup = {
      ...sizeGroup,
      valuesList: sizeGroup.values
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v),
      hasCustomOption: sizeGroup.values.toLowerCase().includes('custom'),
    }

    return NextResponse.json(processedGroup, { status: 201 })
  } catch (error: any) {
    console.error('Error creating size group:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A size group with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create size group' }, { status: 500 })
  }
}
