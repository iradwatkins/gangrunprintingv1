import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, Package, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

async function getUpcomingData(userId: string) {
  // Get orders that are in progress or upcoming
  const upcomingOrders = await prisma.order.findMany({
    where: {
      userId,
      status: {
        in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PRINTING', 'PRODUCTION', 'QUALITY_CHECK', 'PACKAGING', 'SHIPPED']
      }
    },
    orderBy: [
      { createdAt: 'desc' },
      { status: 'asc' }
    ],
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
  })

  // Calculate estimated delivery dates (adding production time to order date)
  const upcomingWithEstimates = upcomingOrders.map(order => {
    const createdDate = new Date(order.createdAt)
    const estimatedDelivery = new Date(createdDate)

    // Add default production time (can be customized based on order items)
    let productionDays = 3 // Default production time

    // Add shipping time
    const shippingDays = 2

    estimatedDelivery.setDate(estimatedDelivery.getDate() + productionDays + shippingDays)

    return {
      ...order,
      estimatedDelivery,
      isOverdue: new Date() > estimatedDelivery && order.status !== 'SHIPPED' && order.status !== 'DELIVERED',
      daysUntilDelivery: Math.ceil((estimatedDelivery.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }
  })

  return upcomingWithEstimates
}

function getStatusInfo(status: string) {
  const statusMap = {
    'PENDING_PAYMENT': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pending Payment' },
    'PAID': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, text: 'Paid' },
    'PROCESSING': { color: 'bg-purple-100 text-purple-800', icon: Clock, text: 'Processing' },
    'PRINTING': { color: 'bg-indigo-100 text-indigo-800', icon: Package, text: 'Printing' },
    'PRODUCTION': { color: 'bg-orange-100 text-orange-800', icon: Package, text: 'In Production' },
    'QUALITY_CHECK': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle2, text: 'Quality Check' },
    'PACKAGING': { color: 'bg-cyan-100 text-cyan-800', icon: Package, text: 'Packaging' },
    'SHIPPED': { color: 'bg-green-100 text-green-800', icon: Package, text: 'Shipped' },
  }
  return statusMap[status as keyof typeof statusMap] || statusMap['PROCESSING']
}

export default async function UpcomingPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const upcomingOrders = await getUpcomingData(user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upcoming Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your orders in progress and upcoming deliveries
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingOrders.filter(order => ['PROCESSING', 'PRINTING', 'PRODUCTION'].includes(order.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingOrders.filter(order => order.status === 'SHIPPED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                On the way to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingOrders.filter(order => order.status === 'PENDING_PAYMENT').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Order Timeline
            </CardTitle>
            <CardDescription>
              Your orders with estimated delivery dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingOrders.length > 0 ? (
              <div className="space-y-4">
                {upcomingOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Order #{order.referenceNumber || order.orderNumber}
                            </h3>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            {order.isOverdue && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.OrderItem.length} item(s) • ${(order.total / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ordered: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Estimated Delivery
                          </p>
                          <p className="text-lg font-semibold">
                            {order.estimatedDelivery.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.daysUntilDelivery > 0 ? (
                              `${order.daysUntilDelivery} days`
                            ) : order.daysUntilDelivery === 0 ? (
                              'Today'
                            ) : (
                              `${Math.abs(order.daysUntilDelivery)} days overdue`
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        {order.OrderItem.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span>{item.productName}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                        {order.trackingNumber && (
                          <Link href={`/track/${order.orderNumber}`}>
                            <Button size="sm" variant="outline">
                              Track Package
                            </Button>
                          </Link>
                        )}
                        {order.status === 'PENDING_PAYMENT' && (
                          <Button size="sm">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No upcoming orders</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any orders in progress right now.
                </p>
                <Link href="/products">
                  <Button>
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}