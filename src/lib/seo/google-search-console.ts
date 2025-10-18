/**
 * Google Search Console Integration
 *
 * Tracks real Google rankings, clicks, impressions for all products
 * Detects ranking drops and traffic changes
 * Sends alerts when action needed
 */

import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

interface GSCQuery {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface RankingData {
  keyword: string
  position: number
  clicks: number
  impressions: number
  ctr: number
  positionChange?: number
  clicksChange?: number
}

interface SEOAlert {
  type: 'RANKING_DROP' | 'TRAFFIC_DROP' | 'CTR_DROP' | 'RANKING_IMPROVE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  keyword: string
  oldValue: number
  newValue: number
  change: number
  action: string
  suggestion: string
}

/**
 * Initialize Google Search Console API client
 */
function getGSCClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
  )

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN,
  })

  return google.searchconsole({ version: 'v1', auth })
}

/**
 * Get search analytics data for a specific page
 */
export async function getPageSearchData(
  pageUrl: string,
  startDate: string,
  endDate: string
): Promise<GSCQuery[]> {
  try {
    const searchConsole = getGSCClient()
    const siteUrl = 'sc-domain:gangrunprinting.com'

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'page',
                operator: 'equals',
                expression: pageUrl,
              },
            ],
          },
        ],
        rowLimit: 100,
        aggregationType: 'auto',
      },
    })

    return response.data.rows || []
  } catch (error) {
    console.error('Google Search Console API error:', error)
    throw new Error(
      `Failed to fetch GSC data: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get search analytics for all pages (site-wide)
 */
export async function getSiteSearchData(startDate: string, endDate: string): Promise<GSCQuery[]> {
  try {
    const searchConsole = getGSCClient()
    const siteUrl = 'sc-domain:gangrunprinting.com'

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 1000,
      },
    })

    return response.data.rows || []
  } catch (error) {
    console.error('Site-wide GSC data error:', error)
    return []
  }
}

/**
 * Track SEO metrics for a single product
 */
export async function trackProductSEO(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      seoKeywords: true,
      seoMetrics: true,
    },
  })

  if (!product) {
    throw new Error(`Product ${productId} not found`)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gangrunprinting.com'
  const pageUrl = `${siteUrl}/products/${product.slug}`

  // Get data for last 7 days
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const gscData = await getPageSearchData(pageUrl, startDate, endDate)

  // Process rankings
  const rankings: RankingData[] = gscData.map((row) => ({
    keyword: row.keys[0],
    position: Math.round(row.position),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
  }))

  // Compare with previous data and detect issues
  const previousMetrics = product.seoMetrics as any
  const alerts = detectSEOIssues(rankings, previousMetrics?.rankings || [])

  // Calculate totals
  const totalClicks = rankings.reduce((sum, r) => sum + r.clicks, 0)
  const totalImpressions = rankings.reduce((sum, r) => sum + r.impressions, 0)
  const avgPosition =
    rankings.length > 0 ? rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length : 0

  // Update database
  await prisma.product.update({
    where: { id: productId },
    data: {
      seoMetrics: {
        lastChecked: new Date().toISOString(),
        dateRange: { startDate, endDate },
        rankings,
        alerts,
        summary: {
          totalClicks,
          totalImpressions,
          avgPosition: Math.round(avgPosition * 10) / 10,
          totalKeywords: rankings.length,
        },
      },
    },
  })

  return { rankings, alerts }
}

/**
 * Track SEO for all active products
 */
export async function trackAllProductsSEO() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  })

  // console.log(`📊 Tracking SEO for ${products.length} products...`)

  const results = []

  for (const product of products) {
    try {
      const result = await trackProductSEO(product.id)
      results.push({
        productId: product.id,
        productName: product.name,
        success: true,
        alerts: result.alerts.length,
      })

      /*
      console.log(
        `✅ ${product.name}: ${result.rankings.length} keywords, ${result.alerts.length} alerts`
      )
      */

      // Rate limit: Wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ ${product.name}:`, error)
      results.push({
        productId: product.id,
        productName: product.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Detect SEO issues by comparing current vs previous rankings
 */
function detectSEOIssues(
  currentRankings: RankingData[],
  previousRankings: RankingData[]
): SEOAlert[] {
  const alerts: SEOAlert[] = []

  for (const current of currentRankings) {
    const previous = previousRankings.find((r) => r.keyword === current.keyword)

    if (previous) {
      const positionChange = current.position - previous.position
      const clicksChange = current.clicks - previous.clicks
      const ctrChange = current.ctr - previous.ctr

      // CRITICAL: Ranking dropped 5+ positions
      if (positionChange >= 5) {
        alerts.push({
          type: 'RANKING_DROP',
          severity: 'CRITICAL',
          keyword: current.keyword,
          oldValue: previous.position,
          newValue: current.position,
          change: positionChange,
          action: 'UPDATE_CONTENT_NOW',
          suggestion: `Keyword "${current.keyword}" dropped from #${previous.position} to #${current.position}. Update meta description, add related keywords, improve content quality.`,
        })
      }
      // HIGH: Ranking dropped 3-4 positions
      else if (positionChange >= 3) {
        alerts.push({
          type: 'RANKING_DROP',
          severity: 'HIGH',
          keyword: current.keyword,
          oldValue: previous.position,
          newValue: current.position,
          change: positionChange,
          action: 'UPDATE_KEYWORDS',
          suggestion: `Add long-tail variations of "${current.keyword}" to content and meta tags.`,
        })
      }

      // Traffic drop (50%+ fewer clicks)
      const clicksDropPercent =
        previous.clicks > 0 ? (previous.clicks - current.clicks) / previous.clicks : 0

      if (clicksDropPercent >= 0.5 && previous.clicks >= 10) {
        alerts.push({
          type: 'TRAFFIC_DROP',
          severity: 'HIGH',
          keyword: current.keyword,
          oldValue: previous.clicks,
          newValue: current.clicks,
          change: Math.round(clicksDropPercent * 100),
          action: 'CHECK_COMPETITION',
          suggestion: `Traffic from "${current.keyword}" dropped ${Math.round(clicksDropPercent * 100)}%. Check if competitors launched new content.`,
        })
      }

      // CTR drop (25%+ lower)
      const ctrDropPercent = previous.ctr > 0 ? (previous.ctr - current.ctr) / previous.ctr : 0

      if (ctrDropPercent >= 0.25 && previous.ctr >= 0.02) {
        alerts.push({
          type: 'CTR_DROP',
          severity: 'MEDIUM',
          keyword: current.keyword,
          oldValue: previous.ctr,
          newValue: current.ctr,
          change: Math.round(ctrDropPercent * 100),
          action: 'IMPROVE_TITLE_DESC',
          suggestion: `Click-through rate dropped ${Math.round(ctrDropPercent * 100)}%. Update meta title to be more compelling, add price or urgency.`,
        })
      }

      // POSITIVE: Ranking improved 3+ positions
      if (positionChange <= -3) {
        alerts.push({
          type: 'RANKING_IMPROVE',
          severity: 'LOW',
          keyword: current.keyword,
          oldValue: previous.position,
          newValue: current.position,
          change: Math.abs(positionChange),
          action: 'KEEP_STRATEGY',
          suggestion: `Great! "${current.keyword}" improved from #${previous.position} to #${current.position}. Keep current content strategy.`,
        })
      }
    }
  }

  return alerts
}

/**
 * Generate daily SEO report
 */
export async function generateDailySEOReport() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      seoMetrics: true,
    },
  })

  const report = {
    date: new Date().toISOString(),
    totalProducts: products.length,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    improvements: 0,
    productReports: [] as any[],
  }

  for (const product of products) {
    const metrics = product.seoMetrics as any
    if (!metrics?.alerts) continue

    const criticalAlerts = metrics.alerts.filter((a: SEOAlert) => a.severity === 'CRITICAL')
    const highAlerts = metrics.alerts.filter((a: SEOAlert) => a.severity === 'HIGH')
    const mediumAlerts = metrics.alerts.filter((a: SEOAlert) => a.severity === 'MEDIUM')
    const improvements = metrics.alerts.filter((a: SEOAlert) => a.type === 'RANKING_IMPROVE')

    report.criticalIssues += criticalAlerts.length
    report.highIssues += highAlerts.length
    report.mediumIssues += mediumAlerts.length
    report.improvements += improvements.length

    if (metrics.alerts.length > 0) {
      report.productReports.push({
        productName: product.name,
        slug: product.slug,
        alerts: metrics.alerts,
        summary: metrics.summary,
      })
    }
  }

  return report
}

/**
 * Check if Google Search Console is configured
 */
export function isGSCConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID &&
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET &&
    process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
  )
}
