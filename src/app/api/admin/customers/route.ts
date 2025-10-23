import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phoneNumber } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      )
    }

    // Create customer
    const customer = await prisma.user.create({
      data: {
        id: nanoid(),
        email: email.toLowerCase(),
        name: name.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        role: 'CUSTOMER',
        emailVerified: false, // They'll verify when they set up password
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // TODO: Send welcome email with magic link to set up password
    // This could be handled by a separate email service

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
