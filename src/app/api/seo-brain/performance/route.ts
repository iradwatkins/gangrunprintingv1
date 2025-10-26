/**
 * SEO Brain API - Performance Data
 *
 * GET /api/seo-brain/performance?campaignId=xxx
 *
 * Get performance metrics for a campaign
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
    }

    // Get all city pages for this campaign
    const cityPages = await prisma.cityLandingPage.findMany({
      where: { landingPageSetId: campaignId },
      include: {
        _count: {
          select: { Order: true },
        },
      },
      orderBy: { revenue: 'desc' },
    })

    // Type assertion for _count field
    const pagesWithCount = cityPages as Array<
      (typeof cityPages)[number] & { _count: { orders: number } }
    >

    // Calculate metrics
    const totalViews = pagesWithCount.reduce((sum, page) => sum + page.views, 0)
    const totalConversions = pagesWithCount.reduce((sum, page) => sum + page._count.orders, 0)
    const totalRevenue = pagesWithCount.reduce((sum, page) => sum + page.revenue, 0)

    // Top 10 performers
    const topPerformers = pagesWithCount.slice(0, 10).map((page) => ({
      city: page.slug,
      views: page.views,
      conversions: page._count.orders,
      revenue: page.revenue,
      conversionRate: page.conversionRate || 0,
    }))

    // Bottom 10 performers
    const bottomPerformers = pagesWithCount
      .slice(-10)
      .reverse()
      .map((page) => ({
        city: page.slug,
        views: page.views,
        conversions: page._count.orders,
        revenue: page.revenue,
        conversionRate: page.conversionRate || 0,
      }))

    return NextResponse.json({
      success: true,
      summary: {
        totalCities: pagesWithCount.length,
        totalViews,
        totalConversions,
        totalRevenue,
        avgConversionRate: totalConversions / totalViews || 0,
      },
      topPerformers,
      bottomPerformers,
    })
  } catch (error) {
    console.error('[SEO Brain API] Performance error:', error)
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 })
  }
}
