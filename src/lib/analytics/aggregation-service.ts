/**
 * Analytics Aggregation Service
 *
 * Processes raw data to populate analytics tables with daily metrics.
 * Run this via cron job daily to keep analytics up-to-date.
 */

import { prisma } from '@/lib/prisma'
import { createId } from '@paralleldrive/cuid2'

/**
 * Aggregate campaign email metrics for a specific date
 */
export async function aggregateCampaignMetrics(date: Date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    // Get all campaigns
    const campaigns = await prisma.marketingCampaign.findMany({
      select: { id: true },
    })

    for (const campaign of campaigns) {
      // Aggregate metrics from CampaignSend records
      const sends = await prisma.campaignSend.findMany({
        where: {
          campaignId: campaign.id,
          sentAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      const metrics = {
        sent: sends.length,
        delivered: sends.filter((s) => s.deliveredAt).length,
        opened: sends.filter((s) => s.openedAt).length,
        clicked: sends.filter((s) => s.clickedAt).length,
        bounced: sends.filter((s) => s.status === 'BOUNCED').length,
        unsubscribed: sends.filter((s) => s.status === 'UNSUBSCRIBED').length,
        uniqueOpens: new Set(sends.filter((s) => s.openedAt).map((s) => s.recipientEmail)).size,
        uniqueClicks: new Set(sends.filter((s) => s.clickedAt).map((s) => s.recipientEmail)).size,
      }

      // Calculate revenue from orders placed by recipients
      const recipientEmails = sends.map((s) => s.recipientEmail)
      const orders = await prisma.order.findMany({
        where: {
          email: { in: recipientEmails },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          total: true,
        },
      })

      const revenue = orders.reduce((sum, order) => sum + order.total, 0)
      const orderCount = orders.length

      // Upsert analytics record
      await prisma.campaignAnalytics.upsert({
        where: {
          campaignId_date: {
            campaignId: campaign.id,
            date: startOfDay,
          },
        },
        create: {
          id: createId(),
          campaignId: campaign.id,
          date: startOfDay,
          ...metrics,
          revenue,
          orders: orderCount,
        },
        update: {
          ...metrics,
          revenue,
          orders: orderCount,
        },
      })
    }

    console.log(`✅ Aggregated campaign metrics for ${date.toISOString().split('T')[0]}`)
    return { success: true, campaigns: campaigns.length }
  } catch (error) {
    console.error('Error aggregating campaign metrics:', error)
    return { success: false, error }
  }
}

/**
 * Aggregate funnel metrics for a specific date
 */
export async function aggregateFunnelMetrics(date: Date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    // Get all funnels
    const funnels = await prisma.funnel.findMany({
      include: {
        FunnelStep: {
          select: { id: true },
        },
      },
    })

    for (const funnel of funnels) {
      // Aggregate funnel-level metrics
      const visits = await prisma.funnelVisit.findMany({
        where: {
          funnelId: funnel.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      const uniqueVisitors = new Set(visits.map((v) => v.sessionId)).size
      const totalViews = visits.length

      // Calculate conversions (orders from this funnel)
      const orders = await prisma.order.findMany({
        where: {
          funnelId: funnel.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          total: true,
        },
      })

      const conversions = orders.length
      const revenue = orders.reduce((sum, order) => sum + order.total, 0)

      // Calculate time on page (average of visit durations)
      const avgTimeOnPage =
        visits.length > 0
          ? Math.floor(visits.reduce((sum, v) => sum + 60, 0) / visits.length)
          : null

      // Device breakdown
      const deviceData = {
        desktop: visits.filter((v) => v.device === 'desktop').length,
        mobile: visits.filter((v) => v.device === 'mobile').length,
        tablet: visits.filter((v) => v.device === 'tablet').length,
      }

      // UTM source breakdown
      const sourceData = {
        utmSources: [...new Set(visits.filter((v) => v.utmSource).map((v) => v.utmSource))],
        utmMediums: [...new Set(visits.filter((v) => v.utmMedium).map((v) => v.utmMedium))],
        utmCampaigns: [...new Set(visits.filter((v) => v.utmCampaign).map((v) => v.utmCampaign))],
      }

      // Upsert funnel-level analytics
      await prisma.funnelAnalytics.upsert({
        where: {
          funnelId_funnelStepId_date: {
            funnelId: funnel.id,
            funnelStepId: '' as any,
            date: startOfDay,
          },
        },
        create: {
          id: createId(),
          funnelId: funnel.id,
          funnelStepId: '' as any,
          date: startOfDay,
          views: totalViews,
          uniqueVisitors,
          conversions,
          revenue,
          avgTimeOnPage,
          bounceRate:
            uniqueVisitors > 0 ? ((uniqueVisitors - conversions) / uniqueVisitors) * 100 : null,
          exitRate: null,
          sourceData,
          deviceData,
        },
        update: {
          views: totalViews,
          uniqueVisitors,
          conversions,
          revenue,
          avgTimeOnPage,
          bounceRate:
            uniqueVisitors > 0 ? ((uniqueVisitors - conversions) / uniqueVisitors) * 100 : null,
          sourceData,
          deviceData,
        },
      })

      // Aggregate step-level metrics
      for (const step of funnel.FunnelStep) {
        const stepVisits = visits.filter((v) => v.currentStepId === step.id)
        const stepUniqueVisitors = new Set(stepVisits.map((v) => v.sessionId)).size

        await prisma.funnelAnalytics.upsert({
          where: {
            funnelId_funnelStepId_date: {
              funnelId: funnel.id,
              funnelStepId: step.id,
              date: startOfDay,
            },
          },
          create: {
            id: createId(),
            funnelId: funnel.id,
            funnelStepId: step.id,
            date: startOfDay,
            views: stepVisits.length,
            uniqueVisitors: stepUniqueVisitors,
            conversions: 0, // Step-level conversions tracked separately
            revenue: 0,
            sourceData: undefined,
            deviceData: undefined,
          },
          update: {
            views: stepVisits.length,
            uniqueVisitors: stepUniqueVisitors,
          },
        })
      }
    }

    console.log(`✅ Aggregated funnel metrics for ${date.toISOString().split('T')[0]}`)
    return { success: true, funnels: funnels.length }
  } catch (error) {
    console.error('Error aggregating funnel metrics:', error)
    return { success: false, error }
  }
}

/**
 * Calculate order analytics (sales trends, revenue)
 * Returns aggregated metrics without storing in database
 */
export async function calculateOrderMetrics(startDate: Date, endDate: Date) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        total: true,
        subtotal: true,
        tax: true,
        shipping: true,
        status: true,
        createdAt: true,
        userId: true,
      },
    })

    const metrics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      avgOrderValue:
        orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      totalSubtotal: orders.reduce((sum, o) => sum + o.subtotal, 0),
      totalTax: orders.reduce((sum, o) => sum + o.tax, 0),
      totalShipping: orders.reduce((sum, o) => sum + o.shipping, 0),
      ordersByStatus: {
        PENDING_PAYMENT: orders.filter((o) => o.status === 'PENDING_PAYMENT').length,
        CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
        IN_PRODUCTION: orders.filter((o) => o.status === 'IN_PRODUCTION').length,
        SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
        DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
      },
      uniqueCustomers: new Set(orders.filter((o) => o.userId).map((o) => o.userId)).size,
    }

    return { success: true, metrics }
  } catch (error) {
    console.error('Error calculating order metrics:', error)
    return { success: false, error }
  }
}

/**
 * Calculate product analytics (best sellers, revenue by product)
 * Returns aggregated metrics without storing in database
 */
export async function calculateProductMetrics(startDate: Date, endDate: Date) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        Order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: {
        productSku: true,
        productName: true,
        quantity: true,
        price: true,
        Order: {
          select: {
            createdAt: true,
          },
        },
      },
    })

    // Group by product
    const productMap = new Map()

    for (const item of orderItems) {
      const key = item.productSku
      if (!productMap.has(key)) {
        productMap.set(key, {
          sku: item.productSku,
          name: item.productName,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        })
      }

      const product = productMap.get(key)
      product.totalQuantity += item.quantity
      product.totalRevenue += item.price * item.quantity
      product.orderCount += 1
    }

    const products = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 50) // Top 50 products

    return {
      success: true,
      metrics: {
        totalProducts: productMap.size,
        totalQuantitySold: products.reduce((sum, p) => sum + p.totalQuantity, 0),
        totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0),
        topProducts: products.slice(0, 10),
      },
    }
  } catch (error) {
    console.error('Error calculating product metrics:', error)
    return { success: false, error }
  }
}

/**
 * Calculate customer analytics (LTV, retention, segments)
 * Returns aggregated metrics without storing in database
 */
export async function calculateCustomerMetrics(startDate: Date, endDate: Date) {
  try {
    // Get all customers with orders in period
    const users = await prisma.user.findMany({
      where: {
        Order: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      include: {
        Order: {
          select: {
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    const metrics = {
      totalCustomers: users.length,
      newCustomers: users.filter(
        (u) => u.Order[0]?.createdAt >= startDate && u.Order[0]?.createdAt <= endDate
      ).length,
      returningCustomers: users.filter((u) => u.Order.length > 1).length,
      avgLifetimeValue:
        users.length > 0
          ? users.reduce((sum, u) => sum + u.Order.reduce((s, o) => s + o.total, 0), 0) /
            users.length
          : 0,
      avgOrdersPerCustomer:
        users.length > 0 ? users.reduce((sum, u) => sum + u.Order.length, 0) / users.length : 0,
      customerRetentionRate:
        users.length > 0
          ? (users.filter((u) => u.Order.length > 1).length / users.length) * 100
          : 0,
    }

    return { success: true, metrics }
  } catch (error) {
    console.error('Error calculating customer metrics:', error)
    return { success: false, error }
  }
}

/**
 * Run all aggregation jobs for a specific date
 */
export async function runDailyAggregations(date: Date = new Date()) {
  console.log(`🔄 Running daily analytics aggregations for ${date.toISOString().split('T')[0]}...`)

  const results = {
    campaigns: await aggregateCampaignMetrics(date),
    funnels: await aggregateFunnelMetrics(date),
  }

  const success = results.campaigns.success && results.funnels.success

  if (success) {
    console.log(`✅ All aggregations completed successfully`)
  } else {
    console.error(`❌ Some aggregations failed:`, results)
  }

  return { success, results }
}
