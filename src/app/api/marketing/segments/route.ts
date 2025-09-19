import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { SegmentationService } from '@/lib/marketing/segmentation'

export async function GET(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const segments = await SegmentationService.getSegments()

    return NextResponse.json(segments)
  } catch (error) {
    console.error('Error fetching segments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, rules } = await request.json()

    if (!name || !rules) {
      return NextResponse.json({ error: 'Name and rules are required' }, { status: 400 })
    }

    const segment = await SegmentationService.createSegment(name, description, rules)

    return NextResponse.json(segment, { status: 201 })
  } catch (error) {
    console.error('Error creating segment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
