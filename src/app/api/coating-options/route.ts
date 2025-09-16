import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export async function GET() {
  try {
    const coatingOptions = await prisma.coatingOption.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { paperStockCoatings: true }
        }
      }
    })

    return NextResponse.json(coatingOptions)
  } catch (error) {
    console.error('Error fetching coating options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coating options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const coatingOption = await prisma.coatingOption.create({
      data: {
        name
      }
    })

    return NextResponse.json(coatingOption, { status: 201 })
  } catch (error: any) {
    console.error('Error creating coating option:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A coating option with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create coating option' },
      { status: 500 }
    )
  }
}