import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { Carrier } from '@prisma/client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const updateCarrierSchema = z.object({
  enabled: z.boolean().optional(),
  testMode: z.boolean().optional(),
  markupPercentage: z.number().min(0).max(100).optional(),
  serviceArea: z.array(z.string()).optional(),
  packagingWeight: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
})

/**
 * PUT /api/admin/carrier-settings/[carrier]
 * Update a specific carrier's settings
 */
export async function PUT(request: NextRequest, { params }: { params: { carrier: string } }) {
  try {
    // Verify admin authentication
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const carrier = params.carrier.toUpperCase() as Carrier

    // Validate carrier
    if (!Object.values(Carrier).includes(carrier)) {
      return NextResponse.json({ error: 'Invalid carrier' }, { status: 400 })
    }

    const body = await request.json()
    const validation = updateCarrierSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Update carrier settings
    const updated = await prisma.carrierSettings.update({
      where: { carrier },
      data: {
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.testMode !== undefined && { testMode: data.testMode }),
        ...(data.markupPercentage !== undefined && { markupPercentage: data.markupPercentage }),
        ...(data.serviceArea !== undefined && { serviceArea: data.serviceArea }),
        ...(data.packagingWeight !== undefined && { packagingWeight: data.packagingWeight }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    // console.log(`[Carrier Settings] Updated ${carrier}:`, updated)

    return NextResponse.json({
      success: true,
      settings: updated,
    })
  } catch (error) {
    console.error('[Carrier Settings API] Error updating settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update carrier settings',
      },
      { status: 500 }
    )
  }
}
