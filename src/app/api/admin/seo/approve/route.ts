import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { approveProductSEO } from '@/lib/seo-brain/generate-product-seo'

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId } = body

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 })
    }

    await approveProductSEO(contentId)

    return NextResponse.json({
      success: true,
      message: 'SEO content approved and published',
    })
  } catch (error) {
    console.error('[API] Error approving SEO content:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to approve SEO content',
      },
      { status: 500 }
    )
  }
}
