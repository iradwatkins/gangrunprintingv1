import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'

const createTurnaroundTimeSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().optional().or(z.literal('')),
  daysMin: z.number().min(0).max(30),
  daysMax: z.number().min(0).max(30).optional().nullable(),
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
        TurnaroundTimeSetItem: {
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
    console.log('🚀 Turnaround time POST request received')
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))

    const data = createTurnaroundTimeSchema.parse(body)
    console.log('✅ Validation passed, parsed data:', JSON.stringify(data, null, 2))

    const turnaroundTime = await prisma.turnaroundTime.create({
      data: {
        id: createId(),
        ...data,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(turnaroundTime, { status: 201 })
  } catch (error) {
    console.error('Turnaround time creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
          message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create turnaround time' }, { status: 500 })
  }
}
