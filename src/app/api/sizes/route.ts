import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/size-groups - List all size groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'
    
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }
    
    const groups = await prisma.sizeGroup.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })
    
    // Parse values into arrays for frontend consumption
    const parsedGroups = groups.map(group => ({
      ...group,
      valuesList: group.values.split(',').map(v => v.trim()),
      hasCustomOption: group.values.toLowerCase().includes('custom')
    }))
    
    return NextResponse.json(parsedGroups)
  } catch (error) {
    console.error('Error fetching size groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch size groups' },
      { status: 500 }
    )
  }
}

// POST /api/size-groups - Create a new size group
export async function POST(request: NextRequest) {
  try {
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
      isActive
    } = body
    
    // Validation
    if (!name || !values || !defaultValue) {
      return NextResponse.json(
        { error: 'Name, values, and default value are required' },
        { status: 400 }
      )
    }
    
    // Validate that defaultValue exists in values
    const valuesList = values.split(',').map((v: string) => v.trim())
    if (!valuesList.includes(defaultValue)) {
      return NextResponse.json(
        { error: 'Default value must be one of the provided values' },
        { status: 400 }
      )
    }
    
    // If custom is in values, validate dimensions
    const hasCustom = valuesList.some(v => v.toLowerCase() === 'custom')
    if (hasCustom) {
      if (customMinWidth && customMaxWidth && customMinWidth >= customMaxWidth) {
        return NextResponse.json(
          { error: 'Custom minimum width must be less than maximum width' },
          { status: 400 }
        )
      }
      if (customMinHeight && customMaxHeight && customMinHeight >= customMaxHeight) {
        return NextResponse.json(
          { error: 'Custom minimum height must be less than maximum height' },
          { status: 400 }
        )
      }
    }
    
    const group = await prisma.sizeGroup.create({
      data: {
        name,
        description,
        values,
        defaultValue,
        customMinWidth: hasCustom ? (customMinWidth || 1) : null,
        customMaxWidth: hasCustom ? (customMaxWidth || 96) : null,
        customMinHeight: hasCustom ? (customMinHeight || 1) : null,
        customMaxHeight: hasCustom ? (customMaxHeight || 96) : null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    
    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    console.error('Error creating size group:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A size group with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create size group' },
      { status: 500 }
    )
  }
}