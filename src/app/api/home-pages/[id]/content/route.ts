import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.homepageContent.findMany({
      where: { homepageVariantId: params.id },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage content' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sectionType, content, position, isVisible } = body

    if (!sectionType || !content) {
      return NextResponse.json({ error: 'Section type and content are required' }, { status: 400 })
    }

    // Check if the homepage variant exists
    const homepageVariant = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
    })

    if (!homepageVariant) {
      return NextResponse.json({ error: 'Homepage variant not found' }, { status: 404 })
    }

    const homepageContent = await prisma.homepageContent.upsert({
      where: {
        homepageVariantId_sectionType: {
          homepageVariantId: params.id,
          sectionType,
        },
      },
      update: {
        content,
        position: position || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
      create: {
        homepageVariantId: params.id,
        sectionType,
        content,
        position: position || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    })

    return NextResponse.json(homepageContent)
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json({ error: 'Failed to update homepage content' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentSections } = body

    if (!Array.isArray(contentSections)) {
      return NextResponse.json({ error: 'Content sections must be an array' }, { status: 400 })
    }

    // Check if the homepage variant exists
    const homepageVariant = await prisma.homepageVariant.findUnique({
      where: { id: params.id },
    })

    if (!homepageVariant) {
      return NextResponse.json({ error: 'Homepage variant not found' }, { status: 404 })
    }

    // Update multiple content sections in a transaction
    const updatedContent = await prisma.$transaction(
      contentSections.map((section: any) =>
        prisma.homepageContent.upsert({
          where: {
            homepageVariantId_sectionType: {
              homepageVariantId: params.id,
              sectionType: section.sectionType,
            },
          },
          update: {
            content: section.content,
            position: section.position || 0,
            isVisible: section.isVisible !== undefined ? section.isVisible : true,
          },
          create: {
            homepageVariantId: params.id,
            sectionType: section.sectionType,
            content: section.content,
            position: section.position || 0,
            isVisible: section.isVisible !== undefined ? section.isVisible : true,
          },
        })
      )
    )

    return NextResponse.json({
      message: 'Content sections updated successfully',
      content: updatedContent,
    })
  } catch (error) {
    console.error('Error updating content sections:', error)
    return NextResponse.json({ error: 'Failed to update content sections' }, { status: 500 })
  }
}