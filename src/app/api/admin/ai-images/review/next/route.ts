/**
 * Get Next Image to Review
 *
 * GET /api/admin/ai-images/review/next
 *
 * Returns the next pending image for the simple click-through approval workflow
 */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/ai-images/review/next
 *
 * Query params:
 * - campaignId: Filter by specific campaign
 * - locale: Filter by locale (en/es)
 *
 * Returns:
 * - Next pending image (isActive=false, version=1)
 * - Progress stats (total pending, approved, declined)
 * - Campaign info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId') || undefined
    const locale = searchParams.get('locale') as 'en' | 'es' | undefined

    // Build where clause for pending images
    const where: any = {
      category: 'ai-generated',
      isActive: false, // Not yet approved
      version: 1, // Only show first versions (not regenerations)
    }

    if (campaignId) where.campaignId = campaignId
    if (locale) where.locale = locale

    // Get next pending image
    const nextImage = await prisma.image.findFirst({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            locale: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first (FIFO)
      },
    })

    if (!nextImage) {
      // No more pending images - get stats for completion message
      const stats = await getReviewStats(campaignId, locale)

      return NextResponse.json({
        success: true,
        data: {
          image: null,
          message: 'No pending images to review',
          stats,
          completed: true,
        },
      })
    }

    // Get stats for progress tracking
    const stats = await getReviewStats(campaignId, locale)

    // Get versions of this image (to show regeneration history)
    const allVersions = nextImage.cityName
      ? await prisma.image.findMany({
          where: {
            campaignId: nextImage.campaignId,
            cityName: nextImage.cityName,
            locale: nextImage.locale,
          },
          select: {
            id: true,
            version: true,
            isActive: true,
            url: true,
            createdAt: true,
          },
          orderBy: {
            version: 'desc',
          },
        })
      : []

    return NextResponse.json({
      success: true,
      data: {
        image: nextImage,
        stats,
        versions: allVersions,
        completed: false,
      },
    })
  } catch (error: any) {
    console.error('Error getting next image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get next image' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get review statistics
 */
async function getReviewStats(
  campaignId: string | undefined,
  locale: 'en' | 'es' | undefined
) {
  const where: any = {
    category: 'ai-generated',
  }

  if (campaignId) where.campaignId = campaignId
  if (locale) where.locale = locale

  const [total, approved, pendingCount, regenerated] = await Promise.all([
    // Total AI images
    prisma.image.count({ where }),

    // Approved (active) images
    prisma.image.count({
      where: {
        ...where,
        isActive: true,
      },
    }),

    // Pending (not active, version 1)
    prisma.image.count({
      where: {
        ...where,
        isActive: false,
        version: 1,
      },
    }),

    // Regenerated (version > 1)
    prisma.image.count({
      where: {
        ...where,
        version: { gt: 1 },
      },
    }),
  ])

  // Declined = regenerated images (those with version > 1 indicate previous version was declined)
  const declined = regenerated

  return {
    total,
    approved,
    pending: pendingCount,
    declined,
    progress: {
      percentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      remaining: pendingCount,
    },
  }
}
