import { prisma } from '@/lib/prisma'

export interface DateRange {
  from: Date
  to: Date
}

export interface AnalyticsMetrics {
  revenue: {
    total: number
    growth: number
    previousPeriod: number
  }
  orders: {
    total: number
    growth: number
    previousPeriod: number
  }
  customers: {
    total: number
    new: number
    returning: number
    growth: number
  }
  products: {
    topSelling: Array<{
      id: string
      name: string
      revenue: number
      quantity: number
    }>
    categories: Array<{
      name: string
      revenue: number
      orders: number
    }>
  }
  conversion: {
    rate: number
    averageOrderValue: number
    repeatCustomerRate: number
  }
}

export interface ChartData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export class AnalyticsService {
  static async getMetrics(dateRange: DateRange): Promise<AnalyticsMetrics> {
    const { from, to } = dateRange

    // Calculate previous period for comparison
    const periodLength = to.getTime() - from.getTime()
    const previousFrom = new Date(from.getTime() - periodLength)
    const previousTo = new Date(from.getTime())

    // Get orders for current and previous periods
    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        include: {
          OrderItem: true,
          User: true,
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: previousFrom, lte: previousTo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      }),
    ])

    // Calculate revenue metrics
    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0)
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
    const revenueGrowth =
      previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Calculate order metrics
    const orderGrowth =
      previousOrders.length > 0
        ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
        : 0

    // Calculate customer metrics
    const customerIds = new Set(currentOrders.map((order) => order.userId))
    const allCustomers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { Order: true },
    })

    const newCustomers = allCustomers.filter(
      (customer) => new Date(customer.createdAt) >= from && new Date(customer.createdAt) <= to
    ).length

    const returningCustomers = allCustomers.filter(
      (customer) => customer.Order.length > 1 && customerIds.has(customer.id)
    ).length

    const previousCustomers = allCustomers.filter(
      (customer) =>
        new Date(customer.createdAt) >= previousFrom && new Date(customer.createdAt) <= previousTo
    ).length

    const customerGrowth =
      previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0

    // Calculate product metrics
    const productSales = new Map<string, { name: string; revenue: number; quantity: number }>()

    currentOrders.forEach((order) => {
      order.OrderItem.forEach((item) => {
        // Use productSku as unique identifier since we don't have product relation
        const existing = productSales.get(item.productSku) || {
          name: item.productName,
          revenue: 0,
          quantity: 0,
        }
        productSales.set(item.productSku, {
          ...existing,
          revenue: existing.revenue + item.price, // Use actual item price
          quantity: existing.quantity + item.quantity,
        })
      })
    })

    const topSelling = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate category metrics from order items
    const categoryMap = new Map<string, { revenue: number; orderIds: Set<string> }>()

    currentOrders.forEach((order) => {
      order.OrderItem.forEach((item) => {
        if (item.categoryName) {
          const existing = categoryMap.get(item.categoryName) || {
            revenue: 0,
            orderIds: new Set<string>(),
          }
          categoryMap.set(item.categoryName, {
            revenue: existing.revenue + item.price,
            orderIds: existing.orderIds.add(order.id),
          })
        }
      })
    })

    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      orders: data.orderIds.size,
    }))

    // Calculate conversion metrics
    const completedOrders = currentOrders.filter(
      (order) => order.status === 'DELIVERED' || order.status === 'COMPLETED'
    )

    const averageOrderValue =
      completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length
        : 0

    const customersWithMultipleOrders = allCustomers.filter(
      (customer) => customer.Order.length > 1
    ).length

    const repeatCustomerRate =
      allCustomers.length > 0 ? (customersWithMultipleOrders / allCustomers.length) * 100 : 0

    return {
      revenue: {
        total: currentRevenue / 100, // Convert cents to dollars
        growth: revenueGrowth,
        previousPeriod: previousRevenue / 100,
      },
      orders: {
        total: currentOrders.length,
        growth: orderGrowth,
        previousPeriod: previousOrders.length,
      },
      customers: {
        total: customerIds.size,
        new: newCustomers,
        returning: returningCustomers,
        growth: customerGrowth,
      },
      products: {
        topSelling: topSelling.map((product) => ({
          ...product,
          revenue: product.revenue / 100,
        })),
        categories: categories.map((category) => ({
          ...category,
          revenue: category.revenue / 100,
        })),
      },
      conversion: {
        rate: currentOrders.length > 0 ? (completedOrders.length / currentOrders.length) * 100 : 0,
        averageOrderValue: averageOrderValue / 100,
        repeatCustomerRate,
      },
    }
  }

  static async getChartData(
    dateRange: DateRange,
    granularity: 'day' | 'week' | 'month' = 'day'
  ): Promise<ChartData[]> {
    const { from, to } = dateRange

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      include: { User: true },
    })

    // Group data by date
    const dataMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>()

    // Initialize all dates in range
    const current = new Date(from)
    while (current <= to) {
      const dateKey = this.formatDateKey(current, granularity)
      dataMap.set(dateKey, { revenue: 0, orders: 0, customers: new Set() })

      if (granularity === 'day') {
        current.setDate(current.getDate() + 1)
      } else if (granularity === 'week') {
        current.setDate(current.getDate() + 7)
      } else {
        current.setMonth(current.getMonth() + 1)
      }
    }

    // Populate with actual data
    orders.forEach((order) => {
      const dateKey = this.formatDateKey(order.createdAt, granularity)
      const existing = dataMap.get(dateKey)
      if (existing) {
        existing.revenue += order.total
        existing.orders += 1
        if (order.userId) {
          existing.customers.add(order.userId)
        }
      }
    })

    // Convert to array and format
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue / 100,
        orders: data.orders,
        customers: data.customers.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static formatDateKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    if (granularity === 'day') {
      return date.toISOString().split('T')[0]
    } else if (granularity === 'week') {
      const week = this.getWeekNumber(date)
      return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`
    } else {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    }
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  static async getTopCustomers(dateRange: DateRange, limit: number = 10) {
    const { from, to } = dateRange

    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        Order: {
          some: {
            createdAt: { gte: from, lte: to },
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
        },
      },
      include: {
        Order: {
          where: {
            createdAt: { gte: from, lte: to },
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
        },
      },
    })

    return customers
      .map((customer) => {
        const totalSpent = customer.Order.reduce((sum, order) => sum + order.total, 0)
        return {
          id: customer.id,
          name: customer.name || 'Unknown',
          email: customer.email,
          totalSpent: totalSpent / 100,
          orderCount: customer.Order.length,
        }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit)
  }

  static async getOrderStatusBreakdown(dateRange: DateRange) {
    const { from, to } = dateRange

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: from, lte: to },
      },
      _count: true,
    })

    const total = statusCounts.reduce((sum, item) => sum + item._count, 0)

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count,
      percentage: total > 0 ? (item._count / total) * 100 : 0,
    }))
  }
}
