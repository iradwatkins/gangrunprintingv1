import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, CheckCircle, Clock, FileText, Calendar, Bell, User, CreditCard, Star } from 'lucide-react'
import Link from 'next/link'

async function getUserDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      createdAt: true,
      role: true
    }
  })

  // Get comprehensive user data including products they've created/ordered
  const [totalOrders, inProgressOrders, completedOrders, recentOrders, savedItems] = await Promise.all([
    // Total orders count
    prisma.order.count({
      where: { userId }
    }),
    // In progress orders count
    prisma.order.count({
      where: {
        userId,
        status: {
          in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PRINTING', 'PRODUCTION', 'QUALITY_CHECK', 'PACKAGING']
        }
      }
    }),
    // Completed orders count
    prisma.order.count({
      where: {
        userId,
        status: {
          in: ['DELIVERED', 'READY_FOR_PICKUP']
        }
      }
    }),
    // Recent orders with full details
    prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        OrderItem: {
          include: {
            orderItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        }
      }
    }),
    // Get any saved/favorited items (using orders as proxy for now)
    prisma.order.findMany({
      where: {
        userId,
        status: 'DELIVERED'
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        OrderItem: true
      }
    })
  ])

  return {
    user,
    totalOrders,
    inProgressOrders,
    completedOrders,
    recentOrders,
    savedItems
  }
}

export default async function DashboardPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const dashboardData = await getUserDashboardData(user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {dashboardData.user?.name || dashboardData.user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-orders">{dashboardData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.inProgressOrders}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.savedItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Favorited products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Your latest print orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Order #{order.referenceNumber || order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.OrderItem.length} item(s) • ${(order.total / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              order.status === 'PROCESSING' || order.status === 'PRINTING' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button className="mt-2" size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No recent orders</p>
                    <Link href="/products">
                      <Button className="mt-4">Start Shopping</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/upcoming">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Upcoming Orders
                  </Button>
                </Link>
                <Link href="/dashboard/saved">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Saved Items
                  </Button>
                </Link>
                <Link href="/dashboard/payments">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                </Link>
                <Link href="/dashboard/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Account Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(dashboardData.user?.createdAt || new Date()).toLocaleDateString()}
                  </p>
                  {dashboardData.user?.role === 'ADMIN' && (
                    <div className="mt-3 pt-3 border-t">
                      <Link href="/admin/dashboard">
                        <Button className="w-full" size="sm">
                          Admin Dashboard
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}