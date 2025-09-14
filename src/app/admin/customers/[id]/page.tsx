import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Edit,
  MessageSquare,
  TrendingUp,
  Clock,
  MapPin,
  UserCheck,
  UserX,
  Star,
  Tag,
  ShoppingCart,
  CreditCard,
  ChevronRight,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Printer
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Status configuration (matching orders page)
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: DollarSign
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Package
  },
  PRINTING: {
    label: 'Printing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Printer
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    icon: Truck
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircle
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: AlertCircle
  }
}

// Broker tier configuration
const brokerTiers = [
  { value: 'NONE', label: 'Regular Customer', discount: 0 },
  { value: 'BRONZE', label: 'Bronze Broker', discount: 5 },
  { value: 'SILVER', label: 'Silver Broker', discount: 10 },
  { value: 'GOLD', label: 'Gold Broker', discount: 15 },
  { value: 'PLATINUM', label: 'Platinum Broker', discount: 20 },
]

async function getCustomer(id: string) {
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          OrderItem: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  return customer
}

async function getCustomerStats(customerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId: customerId,
      status: {
        notIn: ['CANCELLED', 'REFUNDED']
      }
    }
  })

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
  const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null

  // Get monthly order trend (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentOrders = await prisma.order.findMany({
    where: {
      userId: customerId,
      createdAt: { gte: sixMonthsAgo },
      status: { notIn: ['CANCELLED', 'REFUNDED'] }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Group by month
  const monthlyOrders = recentOrders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
    if (!acc[month]) {
      acc[month] = { count: 0, revenue: 0 }
    }
    acc[month].count++
    acc[month].revenue += order.total
    return acc
  }, {} as Record<string, { count: number; revenue: number }>)

  return {
    totalOrders: orders.length,
    totalSpent: totalSpent / 100,
    averageOrderValue: averageOrderValue / 100,
    lastOrderDate,
    monthlyOrders
  }
}

// Generate activity timeline
function getActivityTimeline(customer: any) {
  const activities = []

  // Account created
  activities.push({
    type: 'account',
    icon: User,
    title: 'Account created',
    description: 'Customer joined the platform',
    date: customer.createdAt
  })

  // Email verified
  if (customer.emailVerified) {
    activities.push({
      type: 'verification',
      icon: UserCheck,
      title: 'Email verified',
      description: 'Customer verified their email address',
      date: customer.emailVerified
    })
  }

  // Orders
  customer.orders.forEach((order: any) => {
    activities.push({
      type: 'order',
      icon: ShoppingCart,
      title: `Order #${order.orderNumber}`,
      description: `${order.OrderItem.length} items - $${(order.total / 100).toFixed(2)}`,
      date: order.createdAt,
      link: `/admin/orders/${order.id}`
    })
  })

  // Sort by date (newest first)
  return activities.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id)

  if (!customer || customer.role === 'ADMIN' || customer.role === 'STAFF') {
    notFound()
  }

  const stats = await getCustomerStats(customer.id)
  const activities = getActivityTimeline(customer)

  // Determine customer tags based on behavior
  const tags = []
  if (stats.totalOrders === 0) tags.push({ label: 'New Customer', color: 'outline' })
  if (stats.totalOrders > 10) tags.push({ label: 'Loyal Customer', color: 'default' })
  if (stats.totalSpent > 1000) tags.push({ label: 'High Value', color: 'default' })
  if (stats.totalSpent > 5000) tags.push({ label: 'VIP', color: 'default' })
  if (customer.role === 'BROKER') tags.push({ label: 'Broker', color: 'secondary' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {customer.name || 'Unknown Customer'}
            </h1>
            <p className="text-muted-foreground">
              Customer since {new Date(customer.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button disabled>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="broker">Broker Settings</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        Last 10 orders from this customer
                      </CardDescription>
                    </div>
                    <Link href={`/admin/orders?search=${customer.email}`}>
                      <Button variant="outline" size="sm">
                        View All Orders
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {customer.orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No orders yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Orders will appear here when the customer makes a purchase
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.orders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.PENDING_PAYMENT
                            const StatusIcon = status.icon

                            return (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="font-medium hover:underline"
                                  >
                                    {order.orderNumber}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p>{order.OrderItem.length} items</p>
                                    {order.OrderItem[0] && (
                                      <p className="text-xs text-muted-foreground">
                                        {order.OrderItem[0].product?.name}
                                        {order.OrderItem.length > 1 && ` +${order.OrderItem.length - 1} more`}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${status.color} gap-1`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {status.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ${(order.total / 100).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Recent customer interactions and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.slice(0, 20).map((activity, index) => {
                      const ActivityIcon = activity.icon
                      return (
                        <div key={index} className="flex gap-3">
                          <div className="relative flex flex-col items-center">
                            <div className="rounded-full p-2 bg-muted">
                              <ActivityIcon className="h-4 w-4" />
                            </div>
                            {index < activities.length - 1 && (
                              <div className="w-0.5 h-16 bg-muted mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2">
                              {activity.link ? (
                                <Link href={activity.link} className="font-medium hover:underline">
                                  {activity.title}
                                </Link>
                              ) : (
                                <p className="font-medium">{activity.title}</p>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Broker Settings Tab */}
            <TabsContent value="broker" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Broker Configuration</CardTitle>
                  <CardDescription>
                    Manage broker status and pricing tiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Customer Type</Label>
                      <Select defaultValue={customer.role} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">Regular Customer</SelectItem>
                          <SelectItem value="BROKER">Broker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {customer.role === 'BROKER' && (
                      <>
                        <div className="grid gap-2">
                          <Label>Broker Tier</Label>
                          <Select defaultValue="SILVER" disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {brokerTiers.map(tier => (
                                <SelectItem key={tier.value} value={tier.value}>
                                  {tier.label} ({tier.discount}% discount)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Custom Discount (%)</Label>
                          <Input
                            type="number"
                            placeholder="0-100"
                            defaultValue="10"
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">
                            Override tier discount with custom percentage
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label>Authorized Categories</Label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Business Cards</Badge>
                            <Badge variant="secondary">Flyers</Badge>
                            <Badge variant="secondary">Banners</Badge>
                            <Badge variant="outline">+ Add Category</Badge>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="font-medium">Broker Performance</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">This Month</p>
                              <p className="font-medium">$2,450.00 in sales</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Commission Earned</p>
                              <p className="font-medium">$245.00</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-4">
                      <Button disabled>Save Broker Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                  <CardDescription>
                    Internal notes and communication history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Internal Notes</Label>
                      <Textarea
                        className="mt-2"
                        placeholder="Add notes about this customer..."
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label>Communication Log</Label>
                      <div className="mt-2 space-y-2 rounded-md border p-4">
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No communication history yet
                        </p>
                      </div>
                    </div>

                    <Button disabled>Save Notes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {customer.emailVerified ? (
                    <Badge variant="default" className="gap-1">
                      <UserCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <UserX className="h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {customer.role === 'BROKER' ? 'Broker Account' : 'Customer Account'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Customer Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lifetime Value</p>
                  <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold">
                    ${stats.averageOrderValue.toFixed(2)}
                  </p>
                </div>
                {stats.lastOrderDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Order</p>
                    <p className="text-sm font-medium">
                      {new Date(stats.lastOrderDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Customer Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant={tag.color as any}>
                    {tag.label}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" disabled>
                  + Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" disabled>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <CreditCard className="h-4 w-4 mr-2" />
                Process Refund
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Star className="h-4 w-4 mr-2" />
                Add to VIP List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}