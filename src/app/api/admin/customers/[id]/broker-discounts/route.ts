import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for broker discount updates
const brokerDiscountSchema = z.record(z.string(), z.number().min(0).max(100))

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check admin role
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch customer with broker discounts
    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isBroker: true,
        brokerDiscounts: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error('Error fetching broker discounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch broker discounts' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check admin role
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate broker discounts
    const discounts = brokerDiscountSchema.parse(body.discounts)

    // Update customer broker discounts
    const customer = await prisma.user.update({
      where: { id },
      data: {
        isBroker: true, // Automatically set to broker if discounts are being configured
        brokerDiscounts: discounts,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBroker: true,
        brokerDiscounts: true,
      },
    })

    return NextResponse.json({
      success: true,
      customer,
      message: 'Broker discounts updated successfully',
    })
  } catch (error) {
    console.error('Error updating broker discounts:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid discount configuration',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update broker discounts' },
      { status: 500 }
    )
  }
}
