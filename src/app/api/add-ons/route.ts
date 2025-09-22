import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/auth'
import { successResponse, handleApiError, commonErrors } from '@/lib/api/responses'
import { validateSearchParams, querySchemas } from '@/lib/api/validation'
import { randomUUID } from 'crypto'

// Add-on creation schema
const createAddOnSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tooltipText: z.string().optional(),
  pricingModel: z.enum(['FLAT', 'PERCENTAGE', 'PER_UNIT', 'CUSTOM']),
  configuration: z.record(z.any()).default({}),
  additionalTurnaroundDays: z.number().min(0).default(0),
  sortOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  adminNotes: z.string().optional(),
})

// GET /api/add-ons - List all add-ons
export async function GET(request: NextRequest) {
  try {
    const addOns = await prisma.addOn.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    // Return data wrapped in { data: [...] } format for consistency
    return new Response(JSON.stringify({ data: addOns }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch add-ons' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// POST /api/add-ons - Create a new add-on
export const POST = withAuth(
  async (request, context, auth) => {
    try {
      const body = await request.json()
      const validation = createAddOnSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
        return commonErrors.validationError(`Validation failed: ${errors.join(', ')}`)
      }

      const addOn = await prisma.addOn.create({
        data: {
          id: randomUUID(),
          ...validation.data,
          updatedAt: new Date(),
        },
      })

      return successResponse(addOn, 201)
    } catch (error) {
      return handleApiError(error, 'Failed to create add-on')
    }
  },
  { requireAdmin: true }
)
