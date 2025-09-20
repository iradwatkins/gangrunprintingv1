import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/auth'
import { successResponse, handleApiError, commonErrors } from '@/lib/api/responses'
import { validateSearchParams, querySchemas } from '@/lib/api/validation'

// Add-on creation schema
const createAddOnSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tooltipText: z.string().optional(),
  pricingModel: z.enum(['FIXED_FEE', 'PERCENTAGE', 'PER_UNIT']),
  configuration: z.record(z.any()).default({}),
  additionalTurnaroundDays: z.number().min(0).default(0),
  sortOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  adminNotes: z.string().optional(),
})

// GET /api/add-ons - List all add-ons
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching add-ons from database...')

    const searchParams = request.nextUrl.searchParams
    const validation = validateSearchParams(searchParams, querySchemas.activeFilter)

    if (!validation.success) {
      return commonErrors.badRequest(`Invalid query parameters: ${validation.errors.join(', ')}`)
    }

    const { active } = validation.data
    const where = active !== undefined ? { isActive: active } : {}

    const addOns = await prisma.addOn.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    console.log(`Found ${addOns.length} add-ons`)
    return successResponse(addOns)
  } catch (error) {
    console.error('Error fetching add-ons:', error)
    return handleApiError(error, 'Failed to fetch add-ons')
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
        data: validation.data,
      })

      return successResponse(addOn, 201)
    } catch (error) {
      console.error('Error creating add-on:', error)
      return handleApiError(error, 'Failed to create add-on')
    }
  },
  { requireAdmin: true }
)
