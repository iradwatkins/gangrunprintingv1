import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const activeHomepage = await prisma.homepageVariant.findFirst({
      where: {
        isActive: true,
        isEnabled: true,
      },
      include: {
        content: {
          where: { isVisible: true },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!activeHomepage) {
      // If no active homepage is found, return the first enabled one as fallback
      const fallbackHomepage = await prisma.homepageVariant.findFirst({
        where: { isEnabled: true },
        include: {
          content: {
            where: { isVisible: true },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      if (!fallbackHomepage) {
        return NextResponse.json({ error: 'No homepage variants available' }, { status: 404 })
      }

      return NextResponse.json(fallbackHomepage)
    }

    return NextResponse.json(activeHomepage)
  } catch (error) {
    console.error('Error fetching active homepage:', error)
    return NextResponse.json({ error: 'Failed to fetch active homepage' }, { status: 500 })
  }
}