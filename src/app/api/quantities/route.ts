import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/quantities - List all standard quantities
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    const quantities = await prisma.standardQuantity.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(quantities)
  } catch (error) {
    console.error('Error fetching quantities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quantities' },
      { status: 500 }
    )
  }
}

// POST /api/quantities - Create a new standard quantity
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
      displayValue,
      calculationValue,
      adjustmentValue,
      sortOrder,
      isActive
    } = body

    // Validation
    if (!displayValue || !calculationValue) {
      return NextResponse.json(
        { error: 'Display value and calculation value are required' },
        { status: 400 }
      )
    }

    const quantity = await prisma.standardQuantity.create({
      data: {
        displayValue,
        calculationValue,
        adjustmentValue,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(quantity, { status: 201 })
  } catch (error: any) {
    console.error('Error creating quantity:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A quantity with this display value already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create quantity' },
      { status: 500 }
    )
  }
}