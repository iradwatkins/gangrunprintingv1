import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTurnaroundTimeSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().optional(),
  daysMin: z.number().min(0).max(30),
  daysMax: z.number().min(0).max(30).optional(),
  pricingModel: z.enum(['FLAT', 'PERCENTAGE', 'PER_UNIT', 'CUSTOM']),
  basePrice: z.number().min(0),
  priceMultiplier: z.number().min(0.1).max(10),
  requiresNoCoating: z.boolean().default(false),
  restrictedCoatings: z.array(z.string()).default([]),
  restrictedOptions: z.any().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
})

const updateTurnaroundTimeSchema = createTurnaroundTimeSchema.partial()

// GET /api/turnaround-times
export async function GET() {
  try {
    const turnaroundTimes = await prisma.turnaroundTime.findMany({
      orderBy: [{ sortOrder: 'asc' }, { daysMin: 'asc' }],
      include: {
        turnaroundTimeSetItems: {
          include: {
            TurnaroundTimeSet: true,
          },
        },
      },
    })

    return NextResponse.json(turnaroundTimes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch turnaround times' }, { status: 500 })
  }
}

// POST /api/turnaround-times
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTurnaroundTimeSchema.parse(body)

    const turnaroundTime = await prisma.turnaroundTime.create({
      data,
    })

    return NextResponse.json(turnaroundTime, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create turnaround time' }, { status: 500 })
  }
}
