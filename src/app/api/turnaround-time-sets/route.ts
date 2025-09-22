import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// GET /api/turnaround-time-sets - List all turnaround time sets
export async function GET(request: NextRequest) {
  try {
    const sets = await prisma.turnaroundTimeSet.findMany({
      include: {
        TurnaroundTimeSetItem: {
          include: {
            TurnaroundTime: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json(sets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch turnaround time sets' }, { status: 500 })
  }
}

// POST /api/turnaround-time-sets - Create a new turnaround time set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive, turnaroundTimeIds } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create the set with items
    const set = await prisma.turnaroundTimeSet.create({
      data: {
        id: randomUUID(),
        name,
        description,
        isActive: isActive ?? true,
        sortOrder: 0,
        updatedAt: new Date(),
        TurnaroundTimeSetItem: {
          create:
            turnaroundTimeIds?.map((turnaroundTimeId: string, index: number) => ({
              id: randomUUID(),
              turnaroundTimeId,
              sortOrder: index,
              isDefault: index === 0,
              updatedAt: new Date(),
            })) || [],
        },
      },
      include: {
        TurnaroundTimeSetItem: {
          include: {
            TurnaroundTime: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json(set, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create turnaround time set' }, { status: 500 })
  }
}
