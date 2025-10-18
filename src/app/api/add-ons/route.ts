import { z } from 'zod'
import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/auth'
import {
  createSuccessResponse,
  createErrorResponse,
  createDatabaseErrorResponse,
  createServerErrorResponse,
} from '@/lib/api-response'
import { randomUUID } from 'crypto'

// Add-on creation schema
const createAddOnSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tooltipText: z.string().optional(),
  pricingModel: z.enum(['FLAT', 'PERCENTAGE', 'PER_UNIT', 'CUSTOM']),
  configuration: z.record(z.string(), z.any()).default({}),
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

    return createSuccessResponse(addOns)
  } catch (error) {
    return createServerErrorResponse('Failed to fetch add-ons')
  }
}

// POST /api/add-ons - Create a new add-on
export const POST = withAuth(
  async (request, context, auth) => {
    try {
      const body = await request.json()
      const validation = createAddOnSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
        return createErrorResponse(`Validation failed: ${errors.join(', ')}`, 400)
      }

      const addOn = await prisma.addOn.create({
        data: {
          id: randomUUID(),
          ...validation.data,
          updatedAt: new Date(),
        },
      })

      return createSuccessResponse(addOn, 201)
    } catch (error) {
      if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
        return createDatabaseErrorResponse(error)
      }
      return createServerErrorResponse('Failed to create add-on')
    }
  },
  { requireAdmin: true }
)
