import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// GET /api/add-ons - List all add-ons
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching add-ons from database...')
    
    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('active')
    
    const where = isActive !== null ? { isActive: isActive === 'true' } : {}
    
    // Simplified query without includes first
    const addOns = await prisma.addOn.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log(`Found ${addOns.length} add-ons`)
    
    return NextResponse.json(addOns)
  } catch (error) {
    console.error('Error fetching add-ons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch add-ons', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/add-ons - Create a new add-on
export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const {
      name,
      description,
      tooltipText,
      pricingModel,
      configuration,
      additionalTurnaroundDays,
      sortOrder,
      isActive,
      adminNotes
    } = body
    
    // Create add-on without sub-options for now
    const addOn = await prisma.addOn.create({
      data: {
        name,
        description,
        tooltipText,
        pricingModel,
        configuration: configuration || {},
        additionalTurnaroundDays: additionalTurnaroundDays || 0,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        adminNotes
      }
    })
    
    return NextResponse.json(addOn, { status: 201 })
  } catch (error) {
    console.error('Error creating add-on:', error)
    return NextResponse.json(
      { error: 'Failed to create add-on', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}