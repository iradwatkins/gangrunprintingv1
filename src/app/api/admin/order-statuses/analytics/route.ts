import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

/**
 * GET /api/admin/order-statuses/analytics
 *
 * Returns comprehensive analytics data for order status system:
 * - Average time spent in each status
 * - Order counts by status
 * - Status transition frequency
 * - Bottleneck detection
 * - Time series data for visualizations
 *
 * Query Parameters:
 * - startDate: ISO date string (optional, defaults to 30 days ago)
 * - endDate: ISO date string (optional, defaults to now)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Parse date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: 30 days ago
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date() // Default: now

    // 1. Get all statuses
    const statuses = await prisma.customOrderStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // 2. Get order counts by status (filtered by date range)
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    const orderCountMap = ordersByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count
        return acc
      },
      {} as Record<string, number>
    )

    // 3. Calculate average time in each status
    const statusHistory = await prisma.statusHistory.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group status history by order to calculate time in each status
    const orderStatusTimes: Record<string, Record<string, number>> = {}

    statusHistory.forEach((history) => {
      if (!orderStatusTimes[history.orderId]) {
        orderStatusTimes[history.orderId] = {}
      }
    })

    // Calculate time spent in each status for each order
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        StatusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const timeInStatusData: Record<
      string,
      { totalTime: number; orderCount: number; avgTime: number }
    > = {}

    orders.forEach((order) => {
      const history = order.StatusHistory

      for (let i = 0; i < history.length; i++) {
        const currentHistory = history[i]
        const nextHistory = history[i + 1]

        const statusSlug = currentHistory.toStatus
        const enteredAt = currentHistory.createdAt
        const exitedAt = nextHistory ? nextHistory.createdAt : new Date()

        const timeSpent = exitedAt.getTime() - enteredAt.getTime() // milliseconds

        if (!timeInStatusData[statusSlug]) {
          timeInStatusData[statusSlug] = {
            totalTime: 0,
            orderCount: 0,
            avgTime: 0,
          }
        }

        timeInStatusData[statusSlug].totalTime += timeSpent
        timeInStatusData[statusSlug].orderCount += 1
      }
    })

    // Calculate averages
    Object.keys(timeInStatusData).forEach((slug) => {
      const data = timeInStatusData[slug]
      data.avgTime = data.orderCount > 0 ? data.totalTime / data.orderCount : 0
    })

    // 4. Get status transition frequency
    const transitionFrequency = await prisma.statusHistory.groupBy({
      by: ['fromStatus', 'toStatus'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    // 5. Build analytics response
    const statusAnalytics = statuses.map((status) => {
      const orderCount = orderCountMap[status.slug] || 0
      const timeData = timeInStatusData[status.slug]

      const avgTimeMs = timeData?.avgTime || 0
      const avgTimeHours = avgTimeMs / (1000 * 60 * 60)
      const avgTimeDays = avgTimeMs / (1000 * 60 * 60 * 24)

      return {
        slug: status.slug,
        name: status.name,
        icon: status.icon,
        badgeColor: status.badgeColor,
        orderCount,
        avgTimeMs,
        avgTimeHours: Math.round(avgTimeHours * 100) / 100,
        avgTimeDays: Math.round(avgTimeDays * 100) / 100,
        avgTimeFormatted:
          avgTimeDays >= 1
            ? `${avgTimeDays.toFixed(1)} days`
            : avgTimeHours >= 1
              ? `${avgTimeHours.toFixed(1)} hours`
              : `${Math.round(avgTimeMs / (1000 * 60))} minutes`,
      }
    })

    // 6. Identify bottlenecks (statuses with longest average time)
    const bottlenecks = [...statusAnalytics]
      .sort((a, b) => b.avgTimeMs - a.avgTimeMs)
      .slice(0, 5)
      .filter((s) => s.avgTimeMs > 0)

    // 7. Build transition heatmap data
    const transitionMatrix = transitionFrequency.map((t) => ({
      from: t.fromStatus,
      to: t.toStatus,
      count: t._count,
    }))

    // 8. Time series data (orders created by day for the date range)
    const dailyOrderCounts = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::bigint as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `

    const timeSeriesData = dailyOrderCounts.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count),
    }))

    // 9. Summary metrics
    const totalOrders = Object.values(orderCountMap).reduce((sum, count) => sum + count, 0)
    const activeStatuses = statusAnalytics.filter((s) => s.orderCount > 0).length
    const avgOrderProcessingTime =
      statusAnalytics.reduce((sum, s) => sum + s.avgTimeMs * s.orderCount, 0) / totalOrders || 0

    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalOrders,
        activeStatuses,
        totalStatuses: statuses.length,
        avgProcessingTimeMs: avgOrderProcessingTime,
        avgProcessingTimeDays:
          Math.round((avgOrderProcessingTime / (1000 * 60 * 60 * 24)) * 100) / 100,
      },
      statusAnalytics,
      bottlenecks,
      transitionMatrix,
      timeSeriesData,
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
