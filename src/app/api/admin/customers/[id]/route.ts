import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id
    const body = await request.json()
    const { name, email, phoneNumber } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: { id: customerId },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // If email is being changed, check if new email is already taken
    if (email.toLowerCase() !== existingCustomer.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'This email is already registered to another customer' },
          { status: 400 }
        )
      }
    }

    // Update customer
    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        phoneNumber: phoneNumber?.trim() || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phoneNumber: updatedCustomer.phoneNumber,
      },
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
