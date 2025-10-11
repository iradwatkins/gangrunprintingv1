import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/carrier-settings
 * Fetch all carrier settings
 */
export async function GET() {
  try {
    // Verify admin authentication
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.carrierSettings.findMany({
      orderBy: {
        carrier: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('[Carrier Settings API] Error fetching settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch carrier settings',
      },
      { status: 500 }
    )
  }
}
