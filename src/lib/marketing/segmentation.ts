import { prisma } from '@/lib/prisma'
import { type CustomerSegment, type User, type Order } from '@prisma/client'

export interface SegmentCriteria {
  name: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in' | 'between'
  value: any
  field: string
  type: 'user' | 'order' | 'custom'
}

export interface SegmentRule {
  criteria: SegmentCriteria[]
  logic: 'AND' | 'OR'
}

export interface RFMAnalysis {
  userId: string
  recency: number // Days since last order
  frequency: number // Number of orders
  monetary: number // Total amount spent
  recencyScore: number // 1-5 scale
  frequencyScore: number // 1-5 scale
  monetaryScore: number // 1-5 scale
  rfmScore: string // Combined score like "555"
  segment: string // Customer segment based on RFM
}

export interface SegmentInsights {
  totalCustomers: number
  averageOrderValue: number
  totalRevenue: number
  averageRecency: number
  topProducts: Array<{
    productName: string
    orderCount: number
    revenue: number
  }>
  geographicDistribution: Array<{
    location: string
    customerCount: number
  }>
  engagementMetrics: {
    emailOpenRate: number
    emailClickRate: number
    lastActivityDays: number
  }
}

export class SegmentationService {
  static async createSegment(
    name: string,
    description: string | null,
    rules: SegmentRule[]
  ): Promise<CustomerSegment> {
    const criteria = { rules }
    const customerIds = await this.calculateSegmentMembers(criteria)

    return await prisma.customerSegment.create({
      data: {
        name,
        description,
        criteria,
        customerIds,
        count: customerIds.length,
        isDynamic: true,
      },
    })
  }

  static async updateSegment(
    id: string,
    data: {
      name?: string
      description?: string | null
      criteria?: any
      isActive?: boolean
    }
  ): Promise<CustomerSegment> {
    const updateData: any = { ...data }

    if (data.criteria) {
      const customerIds = await this.calculateSegmentMembers(data.criteria)
      updateData.customerIds = customerIds
      updateData.count = customerIds.length
      updateData.lastUpdated = new Date()
    }

    return await prisma.customerSegment.update({
      where: { id },
      data: updateData,
    })
  }

  static async refreshSegment(id: string): Promise<CustomerSegment> {
    const segment = await prisma.customerSegment.findUnique({
      where: { id },
    })

    if (!segment) {
      throw new Error('Segment not found')
    }

    const customerIds = await this.calculateSegmentMembers(segment.criteria)

    return await prisma.customerSegment.update({
      where: { id },
      data: {
        customerIds,
        count: customerIds.length,
        lastUpdated: new Date(),
      },
    })
  }

  static async refreshAllDynamicSegments(): Promise<void> {
    const dynamicSegments = await prisma.customerSegment.findMany({
      where: {
        isDynamic: true,
        isActive: true,
      },
    })

    for (const segment of dynamicSegments) {
      await this.refreshSegment(segment.id)
    }
  }

  static async getSegments(): Promise<CustomerSegment[]> {
    return await prisma.customerSegment.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getSegment(id: string): Promise<CustomerSegment | null> {
    return await prisma.customerSegment.findUnique({
      where: { id },
    })
  }

  static async deleteSegment(id: string): Promise<void> {
    await prisma.customerSegment.delete({
      where: { id },
    })
  }

  static async calculateSegmentMembers(criteria: any): Promise<string[]> {
    const { rules } = criteria as { rules: SegmentRule[] }

    if (!rules || rules.length === 0) {
      return []
    }

    let userIds: Set<string> = new Set()
    let isFirstRule = true

    for (const rule of rules) {
      const ruleUserIds = await this.evaluateRule(rule)

      if (isFirstRule) {
        userIds = new Set(ruleUserIds)
        isFirstRule = false
      } else {
        // Apply AND logic between rules (you can modify this for OR logic)
        userIds = new Set([...userIds].filter(id => ruleUserIds.includes(id)))
      }
    }

    return Array.from(userIds)
  }

  private static async evaluateRule(rule: SegmentRule): Promise<string[]> {
    const { criteria, logic } = rule
    const results: string[][] = []

    for (const criterion of criteria) {
      const userIds = await this.evaluateCriterion(criterion)
      results.push(userIds)
    }

    if (logic === 'OR') {
      const allIds = new Set<string>()
      results.forEach(ids => ids.forEach(id => allIds.add(id)))
      return Array.from(allIds)
    } else {
      // AND logic
      if (results.length === 0) return []

      let intersection = new Set(results[0])
      for (let i = 1; i < results.length; i++) {
        intersection = new Set([...intersection].filter(id => results[i].includes(id)))
      }
      return Array.from(intersection)
    }
  }

  private static async evaluateCriterion(criterion: SegmentCriteria): Promise<string[]> {
    const { field, operator, value, type } = criterion

    if (type === 'user') {
      return await this.evaluateUserCriterion(field, operator, value)
    } else if (type === 'order') {
      return await this.evaluateOrderCriterion(field, operator, value)
    } else if (type === 'custom') {
      return await this.evaluateCustomCriterion(field, operator, value)
    }

    return []
  }

  private static async evaluateUserCriterion(
    field: string,
    operator: string,
    value: any
  ): Promise<string[]> {
    const where: any = {}

    switch (field) {
      case 'email':
        where.email = this.buildWhereCondition(operator, value)
        break
      case 'name':
        where.name = this.buildWhereCondition(operator, value)
        break
      case 'role':
        where.role = this.buildWhereCondition(operator, value)
        break
      case 'emailVerified':
        where.emailVerified = this.buildWhereCondition(operator, value)
        break
      case 'marketingOptIn':
        where.marketingOptIn = this.buildWhereCondition(operator, value)
        break
      case 'createdAt':
        where.createdAt = this.buildWhereCondition(operator, value)
        break
      default:
        return []
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    })

    return users.map(user => user.id)
  }

  private static async evaluateOrderCriterion(
    field: string,
    operator: string,
    value: any
  ): Promise<string[]> {
    const where: any = {}

    switch (field) {
      case 'total':
        where.total = this.buildWhereCondition(operator, value)
        break
      case 'status':
        where.status = this.buildWhereCondition(operator, value)
        break
      case 'createdAt':
        where.createdAt = this.buildWhereCondition(operator, value)
        break
      case 'orderCount':
        // Special case: count of orders per user
        return await this.evaluateOrderCountCriterion(operator, value)
      case 'totalSpent':
        // Special case: total amount spent per user
        return await this.evaluateTotalSpentCriterion(operator, value)
      case 'lastOrderDate':
        // Special case: days since last order
        return await this.evaluateLastOrderDateCriterion(operator, value)
      default:
        return []
    }

    const orders = await prisma.order.findMany({
      where,
      select: { userId: true },
      distinct: ['userId'],
    })

    return orders.map(order => order.userId).filter(Boolean) as string[]
  }

  private static async evaluateOrderCountCriterion(
    operator: string,
    value: number
  ): Promise<string[]> {
    const orderCounts = await prisma.order.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      having: {
        userId: {
          not: null,
        },
      },
    })

    return orderCounts
      .filter(group => {
        const count = group._count.id
        return this.compareValues(count, operator, value)
      })
      .map(group => group.userId)
      .filter(Boolean) as string[]
  }

  private static async evaluateTotalSpentCriterion(
    operator: string,
    value: number
  ): Promise<string[]> {
    const totals = await prisma.order.groupBy({
      by: ['userId'],
      _sum: {
        total: true,
      },
      having: {
        userId: {
          not: null,
        },
      },
    })

    return totals
      .filter(group => {
        const total = group._sum.total || 0
        return this.compareValues(total, operator, value)
      })
      .map(group => group.userId)
      .filter(Boolean) as string[]
  }

  private static async evaluateLastOrderDateCriterion(
    operator: string,
    value: number
  ): Promise<string[]> {
    const lastOrders = await prisma.order.groupBy({
      by: ['userId'],
      _max: {
        createdAt: true,
      },
      having: {
        userId: {
          not: null,
        },
      },
    })

    const now = new Date()
    return lastOrders
      .filter(group => {
        if (!group._max.createdAt) return false
        const daysSince = Math.floor(
          (now.getTime() - group._max.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        return this.compareValues(daysSince, operator, value)
      })
      .map(group => group.userId)
      .filter(Boolean) as string[]
  }

  private static async evaluateCustomCriterion(
    field: string,
    operator: string,
    value: any
  ): Promise<string[]> {
    // Handle custom criteria like RFM scores, engagement metrics, etc.
    switch (field) {
      case 'rfmScore':
        return await this.evaluateRFMScore(operator, value)
      case 'engagementScore':
        return await this.evaluateEngagementScore(operator, value)
      default:
        return []
    }
  }

  private static async evaluateRFMScore(operator: string, value: string): Promise<string[]> {
    const rfmData = await this.calculateRFMAnalysis()
    return rfmData
      .filter(customer => this.compareValues(customer.rfmScore, operator, value))
      .map(customer => customer.userId)
  }

  private static async evaluateEngagementScore(operator: string, value: number): Promise<string[]> {
    // Calculate engagement scores based on email opens, clicks, website visits, etc.
    // This is a simplified implementation
    const engagementData = await prisma.campaignSend.groupBy({
      by: ['userId'],
      _count: {
        openedAt: true,
        clickedAt: true,
      },
      where: {
        userId: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
    })

    return engagementData
      .filter(group => {
        const score = group._count.openedAt + group._count.clickedAt * 2
        return this.compareValues(score, operator, value)
      })
      .map(group => group.userId)
      .filter(Boolean) as string[]
  }

  private static buildWhereCondition(operator: string, value: any): any {
    switch (operator) {
      case 'equals':
        return value
      case 'not_equals':
        return { not: value }
      case 'greater_than':
        return { gt: value }
      case 'less_than':
        return { lt: value }
      case 'contains':
        return { contains: value, mode: 'insensitive' }
      case 'in':
        return { in: Array.isArray(value) ? value : [value] }
      case 'not_in':
        return { notIn: Array.isArray(value) ? value : [value] }
      case 'between':
        return { gte: value[0], lte: value[1] }
      default:
        return value
    }
  }

  private static compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected
      case 'not_equals':
        return actual !== expected
      case 'greater_than':
        return actual > expected
      case 'less_than':
        return actual < expected
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase())
      case 'in':
        return Array.isArray(expected) ? expected.includes(actual) : actual === expected
      case 'not_in':
        return Array.isArray(expected) ? !expected.includes(actual) : actual !== expected
      case 'between':
        return actual >= expected[0] && actual <= expected[1]
      default:
        return false
    }
  }

  static async calculateRFMAnalysis(): Promise<RFMAnalysis[]> {
    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {},
        },
      },
      include: {
        orders: {
          select: {
            total: true,
            createdAt: true,
          },
        },
      },
    })

    const now = new Date()
    const rfmData: RFMAnalysis[] = []

    for (const user of users) {
      if (user.orders.length === 0) continue

      // Calculate Recency (days since last order)
      const lastOrderDate = Math.max(...user.orders.map(order => order.createdAt.getTime()))
      const recency = Math.floor((now.getTime() - lastOrderDate) / (1000 * 60 * 60 * 24))

      // Calculate Frequency (number of orders)
      const frequency = user.orders.length

      // Calculate Monetary (total amount spent)
      const monetary = user.orders.reduce((sum, order) => sum + order.total, 0)

      rfmData.push({
        userId: user.id,
        recency,
        frequency,
        monetary,
        recencyScore: 0, // Will be calculated below
        frequencyScore: 0, // Will be calculated below
        monetaryScore: 0, // Will be calculated below
        rfmScore: '', // Will be calculated below
        segment: '', // Will be calculated below
      })
    }

    // Calculate scores using quintiles
    const recencyValues = rfmData.map(d => d.recency).sort((a, b) => a - b)
    const frequencyValues = rfmData.map(d => d.frequency).sort((a, b) => b - a)
    const monetaryValues = rfmData.map(d => d.monetary).sort((a, b) => b - a)

    const getQuintile = (value: number, values: number[], reverse = false): number => {
      const quintileSize = Math.ceil(values.length / 5)
      const index = values.indexOf(value)
      const quintile = Math.ceil((index + 1) / quintileSize)
      return reverse ? 6 - quintile : quintile
    }

    // Assign scores and segments
    for (const data of rfmData) {
      data.recencyScore = getQuintile(data.recency, recencyValues, true) // Lower recency = higher score
      data.frequencyScore = getQuintile(data.frequency, frequencyValues)
      data.monetaryScore = getQuintile(data.monetary, monetaryValues)
      data.rfmScore = `${data.recencyScore}${data.frequencyScore}${data.monetaryScore}`
      data.segment = this.getRFMSegment(data.recencyScore, data.frequencyScore, data.monetaryScore)
    }

    return rfmData
  }

  private static getRFMSegment(r: number, f: number, m: number): string {
    // Define RFM segments based on scores
    if (r >= 4 && f >= 4 && m >= 4) return 'Champions'
    if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers'
    if (r >= 4 && f <= 2) return 'New Customers'
    if (r >= 3 && f >= 3 && m <= 3) return 'Potential Loyalists'
    if (r >= 3 && f <= 2) return 'Promising'
    if (r <= 2 && f >= 3) return 'Need Attention'
    if (r <= 2 && f <= 2 && m >= 3) return 'About to Sleep'
    if (r <= 2 && f <= 2 && m <= 2) return 'At Risk'
    if (r <= 1) return 'Cannot Lose Them'
    return 'Others'
  }

  static async getSegmentInsights(segmentId: string): Promise<SegmentInsights> {
    const segment = await prisma.customerSegment.findUnique({
      where: { id: segmentId },
    })

    if (!segment) {
      throw new Error('Segment not found')
    }

    const customerIds = segment.customerIds

    // Get orders for segment customers
    const orders = await prisma.order.findMany({
      where: {
        userId: { in: customerIds },
      },
      include: {
        OrderItem: true,
      },
    })

    const totalCustomers = customerIds.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Calculate average recency
    const now = new Date()
    const lastOrderDates = await prisma.order.groupBy({
      by: ['userId'],
      _max: {
        createdAt: true,
      },
      where: {
        userId: { in: customerIds },
      },
    })

    const recencies = lastOrderDates
      .filter(group => group._max.createdAt)
      .map(group => Math.floor((now.getTime() - group._max.createdAt!.getTime()) / (1000 * 60 * 60 * 24)))

    const averageRecency = recencies.length > 0 ? recencies.reduce((a, b) => a + b, 0) / recencies.length : 0

    // Top products
    const productStats = orders.reduce((acc, order) => {
      order.OrderItem.forEach(item => {
        if (!acc[item.productName]) {
          acc[item.productName] = { orderCount: 0, revenue: 0 }
        }
        acc[item.productName].orderCount += item.quantity
        acc[item.productName].revenue += item.price * item.quantity
      })
      return acc
    }, {} as Record<string, { orderCount: number; revenue: number }>)

    const topProducts = Object.entries(productStats)
      .map(([productName, stats]) => ({ productName, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Geographic distribution (simplified - based on shipping address)
    const locations = orders.reduce((acc, order) => {
      if (order.shippingAddress && typeof order.shippingAddress === 'object') {
        const address = order.shippingAddress as any
        const location = address.state || address.city || 'Unknown'
        acc[location] = (acc[location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const geographicDistribution = Object.entries(locations)
      .map(([location, customerCount]) => ({ location, customerCount }))
      .sort((a, b) => b.customerCount - a.customerCount)
      .slice(0, 10)

    // Engagement metrics
    const campaignSends = await prisma.campaignSend.findMany({
      where: {
        userId: { in: customerIds },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
    })

    const totalSends = campaignSends.length
    const opens = campaignSends.filter(send => send.openedAt).length
    const clicks = campaignSends.filter(send => send.clickedAt).length

    const engagementMetrics = {
      emailOpenRate: totalSends > 0 ? (opens / totalSends) * 100 : 0,
      emailClickRate: totalSends > 0 ? (clicks / totalSends) * 100 : 0,
      lastActivityDays: averageRecency,
    }

    return {
      totalCustomers,
      averageOrderValue,
      totalRevenue,
      averageRecency,
      topProducts,
      geographicDistribution,
      engagementMetrics,
    }
  }

  // Predefined segment templates
  static async createPredefinedSegments(): Promise<void> {
    const segments = [
      {
        name: 'VIP Customers',
        description: 'High-value customers with frequent purchases',
        rules: [
          {
            criteria: [
              { field: 'totalSpent', operator: 'greater_than', value: 1000, type: 'order' },
              { field: 'orderCount', operator: 'greater_than', value: 5, type: 'order' },
            ],
            logic: 'AND' as const,
          },
        ],
      },
      {
        name: 'New Customers',
        description: 'Customers who joined in the last 30 days',
        rules: [
          {
            criteria: [
              {
                field: 'createdAt',
                operator: 'greater_than',
                value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                type: 'user',
              },
            ],
            logic: 'AND' as const,
          },
        ],
      },
      {
        name: 'At Risk Customers',
        description: 'Customers who haven\'t ordered in 90+ days',
        rules: [
          {
            criteria: [
              { field: 'lastOrderDate', operator: 'greater_than', value: 90, type: 'order' },
              { field: 'orderCount', operator: 'greater_than', value: 0, type: 'order' },
            ],
            logic: 'AND' as const,
          },
        ],
      },
      {
        name: 'High Engagement',
        description: 'Customers with high email engagement',
        rules: [
          {
            criteria: [
              { field: 'engagementScore', operator: 'greater_than', value: 10, type: 'custom' },
            ],
            logic: 'AND' as const,
          },
        ],
      },
    ]

    for (const segmentData of segments) {
      try {
        await this.createSegment(segmentData.name, segmentData.description, segmentData.rules)
      } catch (error) {
        console.log(`Segment ${segmentData.name} may already exist`)
      }
    }
  }
}