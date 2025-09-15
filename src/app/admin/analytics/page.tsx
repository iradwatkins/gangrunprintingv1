import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { RevenueChart } from '../components/revenue-chart'
import { OrdersOverviewChart } from '../components/orders-overview-chart'
import { SalesByCategoryChart } from '../components/sales-by-category-chart'
import { prisma } from '@/lib/prisma'

// Performance metrics data
const performanceMetrics = [
  { label: 'Conversion Rate', value: '3.24%', change: '+0.3%', trending: 'up' },
  { label: 'Average Order Value', value: '$284.50', change: '+$12.40', trending: 'up' },
  { label: 'Cart Abandonment', value: '68.3%', change: '-2.1%', trending: 'down' },
  { label: 'Customer Retention', value: '42.7%', change: '+5.2%', trending: 'up' },
]

// Top products data
const topProducts = [
  { name: 'Premium Business Cards', sales: 1234, revenue: '$12,340', growth: '+15%' },
  { name: 'Custom Flyers', sales: 892, revenue: '$8,920', growth: '+8%' },
  { name: 'Vinyl Banners', sales: 456, revenue: '$22,800', growth: '+23%' },
  { name: 'T-Shirt Printing', sales: 678, revenue: '$16,950', growth: '-5%' },
  { name: 'Poster Printing', sales: 345, revenue: '$6,900', growth: '+12%' },
]

// Customer segments
const customerSegments = [
  { segment: 'Enterprise', customers: 45, revenue: '$125,000', percentage: 35 },
  { segment: 'Small Business', customers: 234, revenue: '$89,000', percentage: 25 },
  { segment: 'Individual', customers: 567, revenue: '$71,000', percentage: 20 },
  { segment: 'Non-Profit', customers: 89, revenue: '$53,000', percentage: 15 },
  { segment: 'Education', customers: 34, revenue: '$18,000', percentage: 5 },
]

async function getAnalyticsData() {
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

  // Get monthly revenue data for the last 12 months
  const monthlyRevenue = await prisma.$queryRaw`
    SELECT
      TO_CHAR("createdAt", 'YYYY-MM') as month,
      SUM(total) as revenue,
      COUNT(*) as orders
    FROM "Order"
    WHERE "createdAt" >= ${twelveMonthsAgo}
      AND status NOT IN ('CANCELLED', 'REFUNDED')
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
  ` as Array<{ month: string; revenue: number; orders: number }>

  // Get order status distribution
  const orderStatuses = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) // Last 3 months
      }
    }
  })

  // Get product category sales data
  const categorySales = await prisma.$queryRaw`
    SELECT
      COALESCE(p.category, 'Uncategorized') as category,
      SUM(oi.quantity * oi.price) as revenue,
      SUM(oi.quantity) as quantity
    FROM "OrderItem" oi
    LEFT JOIN "Product" p ON oi."productSku" = p.sku
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 1, 1)}
      AND o.status NOT IN ('CANCELLED', 'REFUNDED')
    GROUP BY p.category
    ORDER BY revenue DESC
    LIMIT 10
  ` as Array<{ category: string; revenue: number; quantity: number }>

  // Format revenue chart data
  const revenueChartData = {
    labels: monthlyRevenue.map(item => {
      const [year, month] = item.month.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [{
      label: 'Revenue',
      data: monthlyRevenue.map(item => Math.round(item.revenue / 100)), // Convert cents to dollars
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  }

  // Format orders chart data
  const ordersChartData = {
    labels: orderStatuses.map(item => item.status),
    datasets: [{
      label: 'Orders',
      data: orderStatuses.map(item => item._count.status),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    }]
  }

  // Format category chart data
  const categoryChartData = {
    labels: categorySales.map(item => item.category),
    datasets: [{
      label: 'Revenue',
      data: categorySales.map(item => Math.round(item.revenue / 100)), // Convert cents to dollars
      borderColor: '#f59e0b',
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
      ],
    }]
  }

  return {
    revenueChartData,
    ordersChartData,
    categoryChartData,
    monthlyRevenue: monthlyRevenue.map(item => ({ ...item, revenue: item.revenue / 100 })),
    orderStatuses,
    categorySales: categorySales.map(item => ({ ...item, revenue: item.revenue / 100 }))
  }
}

export default async function AnalyticsPage() {
  const analyticsData = await getAnalyticsData()
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your business performance and customer behavior
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2" variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select defaultValue="last30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last7">Last 7 days</SelectItem>
            <SelectItem value="last30">Last 30 days</SelectItem>
            <SelectItem value="last90">Last 90 days</SelectItem>
            <SelectItem value="last365">Last 365 days</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Custom Range
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs flex items-center mt-1 ${
                    metric.trending === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trending === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {metric.change}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analyticsData.revenueChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Weekly breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersOverviewChart data={analyticsData.ordersChartData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="revenue">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analyticsData.revenueChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Product category contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesByCategoryChart data={analyticsData.categoryChartData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Revenue distribution by customer type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{segment.segment}</span>
                        <Badge className="text-xs" variant="secondary">
                          {segment.customers} customers
                        </Badge>
                      </div>
                      <span className="font-semibold">{segment.revenue}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-8 bg-blue-500 rounded" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue}</p>
                      <p className={`text-sm ${
                        product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.growth}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}