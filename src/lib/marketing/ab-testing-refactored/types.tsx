/**
 * ab-testing - types definitions
 * Auto-refactored by BMAD
 */


export interface ABTestVariant {
  id: string
  name: string
  type: ABTestType
  content: any
  trafficPercentage: number
}


export interface ABTestResults {
  variantId: string
  name: string
  sends: number
  opens: number
  clicks: number
  conversions: number
  revenue: number
  openRate: number
  clickRate: number
  conversionRate: number
  revenuePerSend: number
  confidence: number
  isWinner: boolean
  significanceLevel: number
}


export interface ABTestStatistics {
  testId: string
  status: 'running' | 'completed' | 'inconclusive'
  confidence: number
  winnerVariant?: string
  results: ABTestResults[]
  recommendations: string[]
  duration: number // days
  totalSends: number
  overallMetrics: {
    openRate: number
    clickRate: number
    conversionRate: number
    revenue: number
  }
}

export class ABTestingService {
  static async createABTest(
    campaignId: string,
    name: string,
    description: string | null,
    testType: ABTestType,
    variants: ABTestVariant[],
    winnerCriteria: string,
    confidence: number = 95.0
  ): Promise<CampaignABTest> {
    // Validate traffic split
    const totalTraffic = variants.reduce((sum, variant) => sum + variant.trafficPercentage, 0)
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Traffic split must equal 100%')
    }

    // Ensure at least 2 variants
    if (variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants')
    }

    const trafficSplit = variants.reduce(
      (acc, variant) => {
        acc[variant.id] = variant.trafficPercentage
        return acc
      },
      {} as Record<string, number>
    )

    return await prisma.campaignABTest.create({
      data: {
        campaignId,
        name,
        description,
        testType,
        variants,
        trafficSplit,
        winnerCriteria,
        confidence,
        isActive: true,
        startedAt: new Date(),
      },
    })
  }

  static async getABTest(id: string): Promise<CampaignABTest | null> {
    return await prisma.campaignABTest.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            sends: true,
            analytics: true,
          },
        },
      },
    })
  }

  static async getABTestsForCampaign(campaignId: string): Promise<CampaignABTest[]> {
    return await prisma.campaignABTest.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async endABTest(id: string, winnerId?: string): Promise<CampaignABTest> {
    const updateData: any = {
      isActive: false,
      endedAt: new Date(),
    }

    if (winnerId) {
      updateData.winnerId = winnerId
    }

    return await prisma.campaignABTest.update({
      where: { id },
      data: updateData,
    })
  }

  static async calculateABTestResults(testId: string): Promise<ABTestStatistics> {
    const abTest = await this.getABTest(testId)
    if (!abTest) {
      throw new Error('A/B test not found')
    }

    const variants = abTest.variants as ABTestVariant[]
    const campaign = abTest.campaign
    const sends = campaign.sends || []

    const results: ABTestResults[] = []
    let totalSends = 0

    for (const variant of variants) {
      // Get sends for this variant
      const variantSends = sends.filter((send: any) => send.trackingData?.variantId === variant.id)

      const sends_count = variantSends.length
      const opens = variantSends.filter((send: any) => send.openedAt).length
      const clicks = variantSends.filter((send: any) => send.clickedAt).length

      // TODO: Calculate conversions and revenue based on tracking data
      const conversions = 0 // This would be calculated from order tracking
      const revenue = 0 // This would be calculated from order tracking

      const openRate = sends_count > 0 ? (opens / sends_count) * 100 : 0
      const clickRate = sends_count > 0 ? (clicks / sends_count) * 100 : 0
      const conversionRate = sends_count > 0 ? (conversions / sends_count) * 100 : 0
      const revenuePerSend = sends_count > 0 ? revenue / sends_count : 0

      results.push({
        variantId: variant.id,
        name: variant.name,
        sends: sends_count,
        opens,
        clicks,
        conversions,
        revenue,
        openRate,
        clickRate,
        conversionRate,
        revenuePerSend,
        confidence: 0, // Will be calculated below
        isWinner: false, // Will be determined below
        significanceLevel: 0,
      })

      totalSends += sends_count
    }

    // Calculate statistical significance
    const statisticalResults = this.calculateStatisticalSignificance(results, abTest.winnerCriteria)

    // Update results with statistical data
    results.forEach((result, index) => {
      result.confidence = statisticalResults[index].confidence
      result.significanceLevel = statisticalResults[index].significanceLevel
    })

    // Determine winner
    const winner = this.determineWinner(results, abTest.winnerCriteria, abTest.confidence)
    if (winner) {
      results.find((r) => r.variantId === winner.variantId)!.isWinner = true
    }

    // Calculate overall metrics
    const overallMetrics = {
      openRate:
        totalSends > 0 ? (results.reduce((sum, r) => sum + r.opens, 0) / totalSends) * 100 : 0,
      clickRate:
        totalSends > 0 ? (results.reduce((sum, r) => sum + r.clicks, 0) / totalSends) * 100 : 0,
      conversionRate:
        totalSends > 0
          ? (results.reduce((sum, r) => sum + r.conversions, 0) / totalSends) * 100
          : 0,
      revenue: results.reduce((sum, r) => sum + r.revenue, 0),
    }

    // Determine test status
    let status: 'running' | 'completed' | 'inconclusive' = 'running'
    if (abTest.endedAt) {
      status = winner && winner.confidence >= abTest.confidence ? 'completed' : 'inconclusive'
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, winner, abTest.confidence)

    const duration = abTest.startedAt
      ? Math.ceil((Date.now() - abTest.startedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      testId,
      status,
      confidence: winner?.confidence || 0,
      winnerVariant: winner?.variantId,
      results,
      recommendations,
      duration,
      totalSends,
      overallMetrics,

    }
  }

  private static calculateStatisticalSignificance(
    results: ABTestResults[],
    metric: string
  ): Array<{ confidence: number; significanceLevel: number }> {
    if (results.length < 2) {
      return results.map(() => ({ confidence: 0, significanceLevel: 0 }))
    }

    // For simplicity, we'll use a basic Z-test for proportions
    // In a real implementation, you might want to use more sophisticated statistical tests
    const controlResult = results[0]

    return results.map((variant, index) => {
      if (index === 0) {
        return { confidence: 0, significanceLevel: 0 } // Control has no confidence against itself
      }

      const controlRate = this.getMetricValue(controlResult, metric) / 100
      const variantRate = this.getMetricValue(variant, metric) / 100

      const controlSize = controlResult.sends
      const variantSize = variant.sends

      if (controlSize === 0 || variantSize === 0) {
        return { confidence: 0, significanceLevel: 0 }
      }

      // Calculate pooled standard error
      const pooledRate =
        (controlRate * controlSize + variantRate * variantSize) / (controlSize + variantSize)
      const standardError = Math.sqrt(
        pooledRate * (1 - pooledRate) * (1 / controlSize + 1 / variantSize)
      )

      if (standardError === 0) {
        return { confidence: 0, significanceLevel: 0 }
      }

      // Calculate Z-score
      const zScore = Math.abs(variantRate - controlRate) / standardError

      // Convert to confidence level (this is a simplified calculation)
      const confidence = Math.min(99.9, (1 - 2 * (1 - this.normalCDF(Math.abs(zScore)))) * 100)
      const significanceLevel = 100 - confidence

      return { confidence, significanceLevel }
    })
  }

  private static normalCDF(x: number): number {
    // Approximation of the normal cumulative distribution function
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = x < 0 ? -1 : 1
    x = Math.abs(x) / Math.sqrt(2.0)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return 0.5 * (1.0 + sign * y)
  }

  private static getMetricValue(result: ABTestResults, metric: string): number {
    switch (metric) {
      case 'open_rate':
        return result.openRate
      case 'click_rate':
        return result.clickRate
      case 'conversion_rate':
        return result.conversionRate
      case 'revenue_per_send':
        return result.revenuePerSend
      default:
        return result.openRate
    }
  }

  private static determineWinner(
    results: ABTestResults[],
    winnerCriteria: string,
    requiredConfidence: number
  ): ABTestResults | null {
    if (results.length < 2) return null

    // Sort by the winner criteria metric
    const sortedResults = [...results].sort((a, b) => {
      const aValue = this.getMetricValue(a, winnerCriteria)
      const bValue = this.getMetricValue(b, winnerCriteria)
      return bValue - aValue // Descending order
    })

    const topResult = sortedResults[0]

    // Check if the top result has sufficient confidence
    if (topResult.confidence >= requiredConfidence) {
      return topResult
    }

    return null
  }

  private static generateRecommendations(
    results: ABTestResults[],
    winner: ABTestResults | null,
    requiredConfidence: number
  ): string[] {
    const recommendations: string[] = []

    if (!winner) {
      recommendations.push(
        'No statistically significant winner found. Consider running the test longer or increasing sample size.'
      )
    } else {
      recommendations.push(
        `Variant "${winner.name}" is the winner with ${winner.confidence.toFixed(1)}% confidence.`
      )

      const improvement =
        results.length > 1
          ? ((this.getMetricValue(winner, 'open_rate') -
              this.getMetricValue(
                results.find((r) => r.variantId !== winner.variantId)!,
                'open_rate'
              )) /
              this.getMetricValue(
                results.find((r) => r.variantId !== winner.variantId)!,
                'open_rate'
              )) *
            100
          : 0

      if (improvement > 0) {
        recommendations.push(
          `This represents a ${improvement.toFixed(1)}% improvement over the control.`
        )
      }
    }

    // Check sample sizes
    const smallSamples = results.filter((r) => r.sends < 100)
    if (smallSamples.length > 0) {
      recommendations.push(
        'Some variants have small sample sizes. Consider running the test longer for more reliable results.'
      )
    }

    // Check for high confidence but small effect size
    if (winner && winner.confidence > 95) {
      const otherResults = results.filter((r) => r.variantId !== winner.variantId)
      const maxOtherRate = Math.max(...otherResults.map((r) => this.getMetricValue(r, 'open_rate')))
      const winnerRate = this.getMetricValue(winner, 'open_rate')

      if ((winnerRate - maxOtherRate) / maxOtherRate < 0.05) {
        recommendations.push(
          'While statistically significant, the practical difference is small. Consider the implementation effort.'
        )
      }
    }

    // Duration recommendations
    const hasResults = results.some((r) => r.sends > 0)
    if (!hasResults) {
      recommendations.push('Test is too new. Wait for more data before making decisions.')
    }

    return recommendations
  }

  static async assignVariantToSend(testId: string, sendId: string): Promise<string> {
    const abTest = await prisma.campaignABTest.findUnique({
      where: { id: testId },
    })

    if (!abTest || !abTest.isActive) {
      throw new Error('A/B test not found or inactive')
    }

    const variants = abTest.variants as ABTestVariant[]
    const trafficSplit = abTest.trafficSplit as Record<string, number>

    // Use deterministic assignment based on send ID
    const hash = this.hashString(sendId)
    const random = (hash % 10000) / 100 // 0-99.99

    let cumulativePercentage = 0
    for (const variant of variants) {
      cumulativePercentage += trafficSplit[variant.id]
      if (random < cumulativePercentage) {
        // Update the send record with variant information
        await prisma.campaignSend.update({
          where: { id: sendId },
          data: {

            trackingData: {
              variantId: variant.id,
              testId: testId,
            },
          },
        })

        return variant.id
      }
    }

    // Fallback to first variant
    const fallbackVariant = variants[0]
    await prisma.campaignSend.update({
      where: { id: sendId },
      data: {
        trackingData: {
          variantId: fallbackVariant.id,
          testId: testId,
        },
      },
    })

    return fallbackVariant.id
  }

  private static hashString(str: string): number {
    let hash = 0
    if (str.length === 0) return hash

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash)
  }

  static async updateABTestResults(testId: string): Promise<void> {
    const statistics = await this.calculateABTestResults(testId)

    await prisma.campaignABTest.update({
      where: { id: testId },
      data: {
        results: statistics,
      },
    })

    // Auto-complete test if winner is found with sufficient confidence
    if (statistics.status === 'completed' && statistics.winnerVariant) {
      await this.endABTest(testId, statistics.winnerVariant)
    }
  }

  // Predefined A/B test templates
  static getABTestTemplates(): Array<{
    name: string
    description: string
    type: ABTestType
    variants: Partial<ABTestVariant>[]
  }> {
    return [
      {
        name: 'Subject Line Test',
        description: 'Test different subject lines to improve open rates',
        type: ABTestType.SUBJECT_LINE,
        variants: [
          {
            name: 'Control',
            trafficPercentage: 50,
          },
          {
            name: 'Variant A',
            trafficPercentage: 50,
          },
        ],
      },
      {
        name: 'Content Test',
        description: 'Test different email content layouts',
        type: ABTestType.CONTENT,
        variants: [
          {
            name: 'Current Design',
            trafficPercentage: 50,
          },
          {
            name: 'New Design',
            trafficPercentage: 50,
          },
        ],
      },
      {
        name: 'Send Time Test',
        description: 'Test different send times for optimal engagement',
        type: ABTestType.SEND_TIME,
        variants: [
          {
            name: 'Morning (9 AM)',
            trafficPercentage: 33.33,
          },
          {
            name: 'Afternoon (2 PM)',
            trafficPercentage: 33.33,
          },
          {
            name: 'Evening (6 PM)',
            trafficPercentage: 33.34,
          },
        ],
      },
      {
        name: 'Sender Name Test',
        description: 'Test different sender names for better recognition',
        type: ABTestType.SENDER_NAME,
        variants: [
          {
            name: 'Company Name',
            trafficPercentage: 50,
          },
          {
            name: 'Personal Name',
            trafficPercentage: 50,
          },
        ],
      },
    ]
  }
}
