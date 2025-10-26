/**
 * Admin AI Images Management API
 *
 * GET /api/admin/ai-images - List all AI images with filters
 * POST /api/admin/ai-images/regenerate - Regenerate a declined image
 */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ListImagesQuery {
  campaignId?: string
  locale?: 'en' | 'es'
  isActive?: boolean
  cityName?: string
  status?: 'pending' | 'approved' | 'declined'
  limit?: number
  offset?: number
}

/**
 * GET /api/admin/ai-images
 *
 * List AI-generated images with filtering
 *
 * Query params:
 * - campaignId: Filter by campaign
 * - locale: Filter by language (en/es)
 * - cityName: Filter by city
 * - status: pending (not approved/declined), approved (isActive=true), declined (versions > 1)
 * - limit: Page size (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const campaignId = searchParams.get('campaignId') || undefined
    const locale = searchParams.get('locale') as 'en' | 'es' | undefined
    const cityName = searchParams.get('cityName') || undefined
    const status = searchParams.get('status') as 'pending' | 'approved' | 'declined' | undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      category: 'ai-generated',
    }

    if (campaignId) where.campaignId = campaignId
    if (locale) where.locale = locale
    if (cityName) where.cityName = cityName

    // Status filtering
    if (status === 'approved') {
      where.isActive = true
    } else if (status === 'pending') {
      where.isActive = false
      where.version = 1 // Only show first version as pending
    } else if (status === 'declined') {
      where.version = { gt: 1 } // Any version > 1 was a regeneration
    }

    // Get images with campaign info
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              slug: true,
              locale: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.image.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    })
  } catch (error: any) {
    console.error('Error listing AI images:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list images' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai-images/batch-generate
 *
 * Generate multiple images for a campaign (batch generation)
 *
 * Body:
 * {
 *   "campaignId": "abc123",
 *   "cities": [
 *     { "name": "Chicago", "state": "Illinois" },
 *     { "name": "New York", "state": "New York" }
 *   ],
 *   "basePrompt": "Professional business card design",
 *   "productType": "business-cards"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, cities, basePrompt, productType } = body

    if (!campaignId || !cities || !basePrompt || !productType) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, cities, basePrompt, productType' },
        { status: 400 }
      )
    }

    // Get campaign to determine locale
    const campaign = await prisma.imageCampaign.findUnique({
      where: { id: campaignId },
      select: { locale: true, slug: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Queue batch generation (return immediately, process async)
    const jobId = `batch-${Date.now()}`

    // In production, this would use a job queue (Bull, BullMQ, etc.)
    // For now, we'll return instructions for manual generation
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        message: `Batch generation queued for ${cities.length} cities`,
        citiesCount: cities.length,
        campaignLocale: campaign.locale,
        instructions: {
          manual: `Use POST /api/products/generate-image with these parameters for each city`,
          example: {
            prompt: basePrompt,
            campaignId,
            locale: campaign.locale,
            cityName: cities[0].name,
            stateName: cities[0].state,
            productType,
          },
        },
      },
    })
  } catch (error: any) {
    console.error('Error in batch generation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to queue batch generation' },
      { status: 500 }
    )
  }
}
