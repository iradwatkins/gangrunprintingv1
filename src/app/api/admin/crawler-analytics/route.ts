/**
 * Crawler Analytics API
 *
 * Provides bot crawl activity data for the admin dashboard
 * Tracks which bots are visiting, which pages they prefer, and trends
 *
 * @route GET /api/admin/crawler-analytics
 */

import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

/**
 * Known crawler user agents
 * Maps user agent patterns to friendly names
 */
const KNOWN_CRAWLERS = {
  // Search Engines
  Googlebot: 'Google',
  Bingbot: 'Bing',
  Applebot: 'Apple',
  DuckAssistBot: 'DuckDuckGo',

  // AI Search Crawlers
  'ChatGPT-User': 'ChatGPT (OpenAI)',
  'OAI-SearchBot': 'SearchGPT (OpenAI)',
  ClaudeBot: 'Claude (Anthropic)',
  'Claude-SearchBot': 'Claude Search',
  'Claude-User': 'Claude User',
  PerplexityBot: 'Perplexity AI',
  'Perplexity-User': 'Perplexity User',

  // Meta AI
  'Meta-ExternalAgent': 'Meta AI',
  'Meta-ExternalFetcher': 'Meta Fetcher',
  FacebookBot: 'Facebook',

  // Google AI
  'Google-CloudVertexBot': 'Google AI',
  'Google-Extended': 'Google Bard',

  // Other AI
  'MistralAI-User': 'Mistral AI',
  anthropic: 'Anthropic',

  // Archival
  'archive.org_bot': 'Internet Archive',
  CCBot: 'Common Crawl',

  // Blocked/Aggressive
  Bytespider: 'ByteDance (Blocked)',
  GPTBot: 'GPTBot (Blocked)',
}

interface CrawlerStats {
  name: string
  category: string
  requests: number
  lastSeen: string | null
  avgRequestsPerDay: number
  topPages: Array<{
    path: string
    requests: number
  }>
}

interface CrawlerAnalytics {
  summary: {
    totalCrawls: number
    uniqueCrawlers: number
    aiCrawls: number
    searchEngineCrawls: number
    dateRange: string
  }
  crawlers: CrawlerStats[]
  topPages: Array<{
    path: string
    requests: number
    crawlers: string[]
  }>
  trends: Array<{
    date: string
    googlebot: number
    bingbot: number
    aiCrawlers: number
    other: number
  }>
}

/**
 * Parse user agent to identify crawler
 */
function identifyCrawler(userAgent: string): string | null {
  for (const [pattern, name] of Object.entries(KNOWN_CRAWLERS)) {
    if (userAgent.includes(pattern)) {
      return name
    }
  }
  return null
}

/**
 * Categorize crawler type
 */
function categorizeCrawler(crawlerName: string): string {
  if (
    crawlerName.includes('Google') ||
    crawlerName.includes('Bing') ||
    crawlerName.includes('Apple') ||
    crawlerName.includes('DuckDuckGo')
  ) {
    return 'Search Engine'
  }
  if (
    crawlerName.includes('ChatGPT') ||
    crawlerName.includes('Claude') ||
    crawlerName.includes('Perplexity') ||
    crawlerName.includes('AI') ||
    crawlerName.includes('GPT')
  ) {
    return 'AI Search'
  }
  if (crawlerName.includes('Archive') || crawlerName.includes('Crawl')) {
    return 'Archival'
  }
  if (crawlerName.includes('Blocked')) {
    return 'Blocked'
  }
  return 'Other'
}

/**
 * GET /api/admin/crawler-analytics
 *
 * Returns crawler activity statistics
 *
 * Query params:
 * - days: number of days to analyze (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    // In production, this would parse actual server logs or database
    // For now, return mock data structure to demonstrate the API

    const mockAnalytics: CrawlerAnalytics = {
      summary: {
        totalCrawls: 0,
        uniqueCrawlers: 0,
        aiCrawls: 0,
        searchEngineCrawls: 0,
        dateRange: `Last ${days} days`,
      },
      crawlers: [],
      topPages: [],
      trends: [],
    }

    // TODO: Implement actual log parsing
    // This would:
    // 1. Read from server access logs or database
    // 2. Parse user agents
    // 3. Count requests per crawler
    // 4. Identify top pages
    // 5. Calculate trends

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error('Crawler analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/crawler-analytics/track
 *
 * Log a crawler visit (called from middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAgent, path, timestamp } = body

    const crawler = identifyCrawler(userAgent)
    if (!crawler) {
      return NextResponse.json({ tracked: false })
    }

    const category = categorizeCrawler(crawler)

    // TODO: Store in database
    // await prisma.crawlerVisit.create({
    //   data: {
    //     crawler,
    //     category,
    //     path,
    //     userAgent,
    //     timestamp: new Date(timestamp),
    //   },
    // })

    return NextResponse.json({
      tracked: true,
      crawler,
      category,
    })
  } catch (error) {
    console.error('Crawler tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
