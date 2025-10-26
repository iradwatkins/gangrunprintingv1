import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

/**
 * GET /api/seo-brain/campaigns
 * Fetch all SEO Brain campaigns with their statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch city landing page campaigns
    const campaigns = await prisma.cityLandingPage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to most recent 100
      select: {
        id: true,
        City: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        views: true,
        conversions: true,
        revenue: true,
        seoScore: true,
        title: true,
        metaDesc: true,
      },
    })

    // Calculate summary statistics
    const campaignsData = campaigns as any[]
    const stats = {
      total: campaignsData.length,
      active: campaignsData.filter((c) => c.status === 'PUBLISHED').length,
      draft: campaignsData.filter((c) => c.status === 'DRAFT').length,
      totalVisits: campaignsData.reduce((sum, c) => sum + (c.visits || 0), 0),
      totalConversions: campaignsData.reduce((sum, c) => sum + (c.conversions || 0), 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
      avgSeoScore: campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + (c.seoScore || 0), 0) / campaigns.length
        : 0,
    }

    return NextResponse.json({
      campaigns,
      stats,
    })
  } catch (error) {
    console.error('Error fetching SEO Brain campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/seo-brain/campaigns
 * Create a new SEO Brain campaign
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { city, state, productSlug, metaTitle, metaDescription, content } = body

    if (!city || !state || !productSlug) {
      return NextResponse.json(
        { error: 'City, state, and productSlug are required' },
        { status: 400 }
      )
    }

    // Generate URL slug
    const urlSlug = `${productSlug}-${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`

    // Create campaign
    const campaign = await prisma.cityLandingPage.create({
      data: {
        id: `clp_${randomBytes(16).toString('hex')}`,
        // Note: city/state/productSlug fields don't exist - CityLandingPage uses slug, cityId + relations
        slug: urlSlug,
        h1: metaTitle || `${productSlug} in ${city}, ${state}`,
        title: metaTitle || `${productSlug} in ${city}, ${state}`,
        metaDesc: metaDescription || `Get the best ${productSlug} in ${city}, ${state}. Fast delivery and great prices.`,
        content: content || '',
        status: 'draft',
        seoScore: 0,
        views: 0,
        conversions: 0,
        revenue: 0,
        faqSchema: {},
        Product: { connect: { id: 'default-product-id' } },
        City: { connect: { id: 'default-city-id' } },
      } as any,
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating SEO Brain campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
