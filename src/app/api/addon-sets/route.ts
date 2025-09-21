import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// GET /api/addon-sets - List all addon sets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const include = searchParams.get('include') === 'items'

    const addOnSets = await prisma.addOnSet.findMany({
      where: {
        isActive: true,
      },
      include: {
        addOnSetItems: include
          ? {
              include: {
                addOn: true,
              },
              orderBy: {
                sortOrder: 'asc',
              },
            }
          : false,
        _count: {
          select: {
            addOnSetItems: true,
            productAddOnSets: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json(addOnSets)
  } catch (error) {
    console.error('Error fetching addon sets:', error)
    return NextResponse.json({ error: 'Failed to fetch addon sets' }, { status: 500 })
  }
}

// POST /api/addon-sets - Create a new addon set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, addOnIds = [] } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create the addon set
    const addOnSet = await prisma.addOnSet.create({
      data: {
        id: randomUUID(),
        name,
        description,
        sortOrder: 0, // Will be updated if needed
      },
    })

    // If addOnIds provided, create the addon set items
    if (addOnIds.length > 0) {
      await prisma.addOnSetItem.createMany({
        data: addOnIds.map((addOnId: string, index: number) => ({
          id: randomUUID(),
          addOnSetId: addOnSet.id,
          addOnId,
          displayPosition: 'IN_DROPDOWN' as const,
          sortOrder: index,
        })),
      })
    }

    // Fetch the complete addon set with items
    const completeAddOnSet = await prisma.addOnSet.findUnique({
      where: { id: addOnSet.id },
      include: {
        addOnSetItems: {
          include: {
            addOn: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json(completeAddOnSet, { status: 201 })
  } catch (error) {
    console.error('Error creating addon set:', error)
    return NextResponse.json({ error: 'Failed to create addon set' }, { status: 500 })
  }
}
