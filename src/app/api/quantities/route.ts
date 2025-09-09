import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/quantity-groups - List all quantity groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'
    
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }
    
    const groups = await prisma.quantityGroup.findMany({
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
    console.error('Error fetching quantity groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quantity groups' },
      { status: 500 }
    )
  }
}

// POST /api/quantity-groups - Create a new quantity group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      values,
      defaultValue,
      customMin,
      customMax,
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
    
    // If custom is in values, validate min/max
    const hasCustom = valuesList.some(v => v.toLowerCase() === 'custom')
    if (hasCustom && customMin && customMax && customMin >= customMax) {
      return NextResponse.json(
        { error: 'Custom minimum must be less than maximum' },
        { status: 400 }
      )
    }
    
    const group = await prisma.quantityGroup.create({
      data: {
        name,
        description,
        values,
        defaultValue,
        customMin: hasCustom ? (customMin || 1) : null,
        customMax: hasCustom ? (customMax || 100000) : null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    
    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    console.error('Error creating quantity group:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A quantity group with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create quantity group' },
      { status: 500 }
    )
  }
}