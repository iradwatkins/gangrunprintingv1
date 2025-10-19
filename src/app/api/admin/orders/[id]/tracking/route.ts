import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin user
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trackingNumber } = await request.json()

    // Update tracking number
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        trackingNumber,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating tracking number:', error)
    return NextResponse.json(
      { error: 'Failed to update tracking number' },
      { status: 500 }
    )
  }
}
