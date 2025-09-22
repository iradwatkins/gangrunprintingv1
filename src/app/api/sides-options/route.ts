import { validateRequest } from '@/lib/auth'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sidesOptions = await prisma.sidesOption.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { paperStockSides: true },
        },
      },
    })

    return NextResponse.json(sidesOptions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sides options' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const sidesOption = await prisma.sidesOption.create({
      data: {
        name,
      },
    })

    return NextResponse.json(sidesOption, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A sides option with this name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create sides option' }, { status: 500 })
  }
}
