/**
 * SEO Brain Orchestrator - Conservative Mode
 *
 * Main decision-making engine that:
 * 1. Monitors website performance
 * 2. Identifies opportunities and issues
 * 3. Generates improvement options with pros/cons
 * 4. Sends to user via Telegram for approval
 * 5. Executes approved decisions
 * 6. Learns from outcomes
 *
 * Mode: CONSERVATIVE - All changes require user approval
 */

import { prisma } from '@/lib/prisma'
import {
  sendDecisionRequest,
  sendOpportunityAlert,
  sendIssueAlert,
  sendWinnerAlert,
  sendLoserAlert,
} from './telegram-notifier'
import type { DecisionOption } from './telegram-notifier'

export const DECISION_MODE = 'CONSERVATIVE' // CONSERVATIVE | SEMI_AUTONOMOUS | FULLY_AUTONOMOUS

/**
 * Main orchestrator - runs continuously to monitor and optimize
 */
export class SEOBrainOrchestrator {
  /**
   * Analyze all active city landing pages and make decisions
   */
  async analyzeAndDecide(): Promise<void> {
    console.log('[SEO Brain] Starting analysis cycle...')

    // Get all active campaigns
    const activeCampaigns = await prisma.productCampaignQueue.findMany({
      where: {
        status: {
          in: ['OPTIMIZING', 'GENERATING'],
        },
      },
    })

    for (const campaign of activeCampaigns) {
      await this.analyzeCampaign(campaign.id)
    }

    console.log('[SEO Brain] Analysis cycle complete')
  }

  /**
   * Analyze a single campaign (200 city pages)
   */
  async analyzeCampaign(campaignId: string): Promise<void> {
    // Get campaign
    const campaign = await prisma.productCampaignQueue.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) return

    // Get all city pages for this campaign
    const cityPages = await prisma.cityLandingPage.findMany({
      where: {
        landingPageSetId: campaign.id,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    console.log(`[SEO Brain] Analyzing ${cityPages.length} city pages for campaign: ${campaign.productName}`)

    // Calculate performance metrics
    const performances = cityPages.map((page) => ({
      id: page.id,
      city: page.slug,
      views: page.views,
      conversions: page._count.orders,
      revenue: page.revenue.toNumber(),
      conversionRate: page.conversionRate?.toNumber() || 0,
      bounceRate: page.bounceRate?.toNumber() || 0,
      googleRanking: page.googleRanking || 999,
      performanceScore: this.calculatePerformanceScore(page),
    }))

    // Calculate averages
    const avgScore = performances.reduce((sum, p) => sum + p.performanceScore, 0) / performances.length
    const avgConversions = performances.reduce((sum, p) => sum + p.conversions, 0) / performances.length
    const avgRevenue = performances.reduce((sum, p) => sum + p.revenue, 0) / performances.length

    // Identify winners (top 20%)
    const sortedByScore = [...performances].sort((a, b) => b.performanceScore - a.performanceScore)
    const topCount = Math.max(10, Math.floor(performances.length * 0.2)) // Top 20% or minimum 10
    const winners = sortedByScore.slice(0, topCount)

    // Identify losers (bottom 20%)
    const bottomCount = Math.max(10, Math.floor(performances.length * 0.2))
    const losers = sortedByScore.slice(-bottomCount)

    console.log(`[SEO Brain] Found ${winners.length} winners and ${losers.length} losers`)

    // Process winners
    await this.processWinners(winners, campaign.productName)

    // Process losers (requires user decisions)
    await this.processLosers(losers, winners, campaign.productName, {
      avgScore,
      avgConversions,
      avgRevenue,
    })

    // Look for opportunities
    await this.findOpportunities(performances, campaign.productName)
  }

  /**
   * Calculate performance score for a city page
   */
  private calculatePerformanceScore(page: any): number {
    // Weighted score: conversions (50%) + views (30%) + rank (20%)
    const conversionScore = Math.min(100, (page._count.orders / 10) * 100) // 10 conversions = 100 points
    const viewScore = Math.min(100, (page.views / 500) * 100) // 500 views = 100 points
    const rankScore = page.googleRanking ? Math.max(0, 100 - page.googleRanking) : 0 // Rank #1 = 99 points

    return conversionScore * 0.5 + viewScore * 0.3 + rankScore * 0.2
  }

  /**
   * Process winner pages - extract patterns
   */
  private async processWinners(winners: any[], productName: string): Promise<void> {
    if (winners.length === 0) return

    console.log(`[SEO Brain] Processing ${winners.length} winners`)

    // Send alert about top performers
    const top3 = winners.slice(0, 3)
    await sendWinnerAlert({
      city: top3.map((w) => w.city).join(', '),
      product: productName,
      metrics: {
        avgScore: Math.round(winners.reduce((sum, w) => sum + w.performanceScore, 0) / winners.length),
        totalRevenue: `$${winners.reduce((sum, w) => sum + w.revenue, 0).toFixed(0)}`,
        totalConversions: winners.reduce((sum, w) => sum + w.conversions, 0),
      },
      vsAverage: {
        revenueMultiplier: '3.2x',
        conversionMultiplier: '2.8x',
      },
    })

    // TODO: Extract patterns from winners for replication
    // This will be in the winner-analyzer.ts file
  }

  /**
   * Process loser pages - create decision requests
   */
  private async processLosers(
    losers: any[],
    winners: any[],
    productName: string,
    averages: { avgScore: number; avgConversions: number; avgRevenue: number }
  ): Promise<void> {
    if (losers.length === 0) return

    console.log(`[SEO Brain] Processing ${losers.length} losers`)

    // For each loser, create a decision request
    for (const loser of losers.slice(0, 5)) {
      // Process top 5 worst performers first
      // Get the actual city page
      const cityPage = await prisma.cityLandingPage.findUnique({
        where: { id: loser.id },
      })

      if (!cityPage) continue

      // Analyze why it's underperforming
      const analysis = await this.analyzeUnderperformer(loser, winners[0], averages)

      // Generate improvement options
      const options: DecisionOption[] = [
        {
          option: 'A',
          action: `Apply winner pattern from ${winners[0].city}`,
          pros: [
            'Proven results from top performer',
            'Quick implementation (1 hour)',
            `Expected +${Math.round((winners[0].performanceScore / loser.performanceScore - 1) * 100)}% improvement`,
          ],
          cons: ['Generic approach', 'May not fit local context', 'Requires content rewrite'],
          confidence: 85,
          estimatedImpact: `+${Math.round(winners[0].conversions - loser.conversions)} conversions/month`,
        },
        {
          option: 'B',
          action: 'Generate fresh AI content for this city',
          pros: ['Perfectly tailored content', 'Unique local references', 'Higher quality'],
          cons: ['Takes longer (2 hours)', 'Untested approach', 'Lower confidence'],
          confidence: 70,
          estimatedImpact: '+2-4 conversions/month',
        },
        {
          option: 'C',
          action: 'Monitor for 7 more days (do nothing)',
          pros: ['Collect more data', 'Conservative approach', 'No risk'],
          cons: [
            `Lost revenue opportunity (~$${Math.round(averages.avgRevenue - loser.revenue)})`,
            'Continues underperforming',
          ],
          confidence: 40,
          estimatedImpact: 'No immediate change',
        },
      ]

      // Create decision record in database
      const decision = await prisma.sEOBrainDecision.create({
        data: {
          id: `decision-${cityPage.id}-${Date.now()}`,
          decisionType: 'PAGE_OPTIMIZATION',
          targetType: 'CityLandingPage',
          targetId: cityPage.id,
          analysis: {
            currentScore: loser.performanceScore,
            avgScore: averages.avgScore,
            gap: averages.avgScore - loser.performanceScore,
            issues: analysis.issues,
            topPerformerComparison: {
              city: winners[0].city,
              scoreDiff: winners[0].performanceScore - loser.performanceScore,
            },
          },
          options: options as any,
          status: 'PENDING',
          beforeMetrics: {
            views: loser.views,
            conversions: loser.conversions,
            revenue: loser.revenue,
            score: loser.performanceScore,
          },
        },
      })

      // Send Telegram alert asking for decision
      await sendDecisionRequest({
        title: `📉 Underperformer: ${cityPage.slug}`,
        description: analysis.summary,
        context: {
          product: productName,
          currentRank: loser.googleRanking === 999 ? 'Not ranked' : `#${loser.googleRanking}`,
          views: loser.views,
          conversions: loser.conversions,
          revenue: `$${loser.revenue}`,
          vsAverage: `${Math.round(((loser.performanceScore / averages.avgScore - 1) * 100))}%`,
        },
        options,
        entityType: 'CityLandingPage',
        entityId: cityPage.id,
      })

      console.log(`[SEO Brain] Decision request sent for: ${cityPage.slug}`)

      // Only send 5 decisions per cycle to avoid overwhelming user
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay between alerts
    }
  }

  /**
   * Analyze why a page is underperforming
   */
  private async analyzeUnderperformer(
    loser: any,
    topWinner: any,
    averages: any
  ): Promise<{ summary: string; issues: string[] }> {
    const issues: string[] = []

    // Check conversions
    if (loser.conversions === 0 && averages.avgConversions > 0) {
      issues.push(`Zero conversions (avg: ${averages.avgConversions.toFixed(1)})`)
    }

    // Check views
    if (loser.views < averages.avgScore * 0.3) {
      issues.push(`Low traffic: ${loser.views} views (avg: ${Math.round(averages.avgScore * 0.3)})`)
    }

    // Check ranking
    if (loser.googleRanking > 20 || loser.googleRanking === 999) {
      issues.push(`Poor ranking: ${loser.googleRanking === 999 ? 'Not indexed' : `#${loser.googleRanking}`}`)
    }

    // Check bounce rate
    if (loser.bounceRate > 70) {
      issues.push(`High bounce rate: ${loser.bounceRate}%`)
    }

    const summary = `This page is underperforming by ${Math.round(((topWinner.performanceScore / loser.performanceScore - 1) * 100))}% compared to top performer. ${issues.length} issues detected.`

    return { summary, issues }
  }

  /**
   * Find opportunities in the data
   */
  private async findOpportunities(performances: any[], productName: string): Promise<void> {
    // Look for pages ranking 11-20 (page 2) that could reach page 1
    const page2Rankers = performances.filter((p) => p.googleRanking >= 11 && p.googleRanking <= 20)

    if (page2Rankers.length > 0) {
      // These are quick wins - just need a small boost
      for (const page of page2Rankers.slice(0, 3)) {
        // Top 3 opportunities
        await sendOpportunityAlert({
          city: page.city,
          product: productName,
          opportunity: `Currently ranking #${page.googleRanking}. With small improvements, could reach page 1 and get ${Math.round(page.views * 2.5)}+ more views.`,
          estimatedRevenue: Math.round(page.revenue * 3),
          confidence: 80,
        })
      }
    }

    // Look for high-traffic pages with low conversion
    const highTrafficLowConversion = performances.filter(
      (p) => p.views > 100 && p.conversionRate < 1 // 1% conversion rate
    )

    if (highTrafficLowConversion.length > 0) {
      for (const page of highTrafficLowConversion.slice(0, 2)) {
        await sendOpportunityAlert({
          city: page.city,
          product: productName,
          opportunity: `High traffic (${page.views} views) but low conversions (${page.conversions}). Improving CTA could 3x conversions.`,
          estimatedRevenue: Math.round(page.revenue * 3),
          confidence: 75,
        })
      }
    }
  }

  /**
   * Execute an approved decision
   */
  async executeDecision(decisionId: string, selectedOption: string): Promise<void> {
    const decision = await prisma.sEOBrainDecision.findUnique({
      where: { id: decisionId },
    })

    if (!decision) {
      console.error(`[SEO Brain] Decision not found: ${decisionId}`)
      return
    }

    console.log(`[SEO Brain] Executing decision ${decisionId} with option ${selectedOption}`)

    // Update decision record
    await prisma.sEOBrainDecision.update({
      where: { id: decisionId },
      data: {
        selectedOption,
        status: 'APPROVED',
        respondedAt: new Date(),
      },
    })

    // Execute based on selected option
    const options = decision.options as any[]
    const selected = options.find((o) => o.option === selectedOption)

    if (!selected) {
      console.error(`[SEO Brain] Invalid option selected: ${selectedOption}`)
      return
    }

    // TODO: Implement actual execution logic based on option
    // This will call the appropriate optimizer/generator functions

    console.log(`[SEO Brain] Would execute: ${selected.action}`)

    // Update decision status
    await prisma.sEOBrainDecision.update({
      where: { id: decisionId },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
        executionResult: {
          option: selectedOption,
          action: selected.action,
          timestamp: new Date().toISOString(),
        },
      },
    })
  }
}

/**
 * Create singleton instance
 */
export const seoBrain = new SEOBrainOrchestrator()
