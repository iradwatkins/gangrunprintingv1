import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const sidesOptions = await prisma.sidesOption.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { paperStockSides: true }
        }
      }
    })

    return NextResponse.json(sidesOptions)
  } catch (error) {
    console.error('Error fetching sides options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sides options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, code, description, isDefault } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    const sidesOption = await prisma.sidesOption.create({
      data: {
        name,
        code,
        description,
        isDefault: isDefault || false
      }
    })

    return NextResponse.json(sidesOption, { status: 201 })
  } catch (error: any) {
    console.error('Error creating sides option:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A sides option with this name or code already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create sides option' },
      { status: 500 }
    )
  }
}