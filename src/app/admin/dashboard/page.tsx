import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/admin/stats-cards'
import { PrintQueueTable } from '@/components/admin/print-queue-table'
import { GangRunSchedule } from '@/components/admin/gang-run-schedule'
import { ProductionChart } from '@/components/admin/production-chart'
import { RecentOrdersTable } from '@/components/admin/recent-orders-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { 
  Printer,
  Layers,
  Clock,
  DollarSign,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ShoppingCart
} from 'lucide-react'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  // Get today's revenue
  const todayRevenue = await prisma.order.aggregate({
    _sum: {
      total: true
    },
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      },
      status: {
        notIn: ['CANCELLED', 'REFUNDED']
      }
    }
  })

  // Get month's revenue
  const monthRevenue = await prisma.order.aggregate({
    _sum: {
      total: true
    },
    where: {
      createdAt: {
        gte: startOfMonth
      },
      status: {
        notIn: ['CANCELLED', 'REFUNDED']
      }
    }
  })

  // Get last month's revenue for comparison
  const lastMonthRevenue = await prisma.order.aggregate({
    _sum: {
      total: true
    },
    where: {
      createdAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth
      },
      status: {
        notIn: ['CANCELLED', 'REFUNDED']
      }
    }
  })

  // Get pending orders count
  const pendingOrders = await prisma.order.count({
    where: {
      status: {
        in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PRINTING']
      }
    }
  })

  // Get urgent orders (orders in processing)
  const urgentOrders = await prisma.order.count({
    where: {
      status: {
        in: ['PAID', 'PROCESSING', 'PRINTING']
      }
    }
  })

  // Get today's completed orders
  const completedToday = await prisma.order.count({
    where: {
      status: 'DELIVERED',
      updatedAt: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  // Get total orders today
  const ordersToday = await prisma.order.count({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      OrderItem: true
    }
  })

  // Get total customers
  const totalCustomers = await prisma.user.count({
    where: {
      role: 'CUSTOMER'
    }
  })

  // Get new customers this month
  const newCustomersThisMonth = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      createdAt: {
        gte: startOfMonth
      }
    }
  })

  // Get recently added products instead of low stock (no inventory field in schema)
  const recentProducts = await prisma.product.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  // Calculate revenue change percentage
  const revenueChange = lastMonthRevenue._sum.total 
    ? ((monthRevenue._sum.total || 0) - (lastMonthRevenue._sum.total || 0)) / (lastMonthRevenue._sum.total || 1) * 100
    : 0

  // Calculate completion rate
  const completionRate = ordersToday > 0 
    ? (completedToday / ordersToday) * 100 
    : 100

  return {
    todayRevenue: todayRevenue._sum.total || 0,
    monthRevenue: monthRevenue._sum.total || 0,
    revenueChange,
    pendingOrders,
    urgentOrders,
    completedToday,
    ordersToday,
    completionRate,
    recentOrders,
    totalCustomers,
    newCustomersThisMonth,
    recentProducts
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={`$${(data.todayRevenue / 100).toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          iconBg="bg-green-100 dark:bg-green-900/20"
          subtitle={`$${(data.monthRevenue / 100).toFixed(2)} this month`}
          change={data.revenueChange}
        />

        <StatsCard
          title="Pending Orders"
          value={data.pendingOrders.toString()}
          icon={<ShoppingCart className="h-4 w-4" />}
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          subtitle={`${data.urgentOrders} urgent`}
        />

        <StatsCard
          title="Customers"
          value={data.totalCustomers.toString()}
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          subtitle={`+${data.newCustomersThisMonth} this month`}
        />

        <StatsCard
          title="Completion Rate"
          value={`${data.completionRate.toFixed(0)}%`}
          icon={<CheckCircle className="h-4 w-4" />}
          iconBg="bg-amber-100 dark:bg-amber-900/20"
          subtitle={`${data.completedToday} completed today`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 sm:h-4 sm:w-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.pendingOrders}</p>
              <p className="text-sm text-muted-foreground">
                Pending orders
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Printer className="h-5 w-5 sm:h-4 sm:w-4" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage products & inventory
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/customers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-4 sm:w-4" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.totalCustomers}</p>
              <p className="text-sm text-muted-foreground">
                Total customers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View detailed reports
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductionChart />
        </div>
        <div className="lg:col-span-1">
          <GangRunSchedule />
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={data.recentOrders} />
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {data.urgentOrders > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  {data.urgentOrders} urgent orders need attention
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}