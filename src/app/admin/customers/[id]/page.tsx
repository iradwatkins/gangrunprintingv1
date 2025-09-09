import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  MapPin
} from 'lucide-react'

async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      Order: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!customer) {
    // Try to find by userId
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (user) {
      return await prisma.customer.findFirst({
        where: { userId: user.id },
        include: {
          Order: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
    }
  }

  return customer
}

async function getCustomerStats(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { 
      OR: [
        { customerId },
        { Customer: { id: customerId } }
      ]
    }
  })

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
  const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null

  return {
    totalOrders: orders.length,
    totalSpent: totalSpent / 100,
    averageOrderValue: averageOrderValue / 100,
    lastOrderDate
  }
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id)

  if (!customer) {
    notFound()
  }

  const stats = await getCustomerStats(customer.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Last 10 orders from this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.Order.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No orders yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {customer.Order.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-primary">
                              Order #{order.orderNumber}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              ${(order.total / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Customer interactions and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">Account created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {customer.Order.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div>
                          <p className="font-medium">Placed order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                  <CardDescription>
                    Internal notes about this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full min-h-[200px] p-3 text-sm border rounded-md"
                    placeholder="Add notes about this customer..."
                    defaultValue={customer.notes || ''}
                  />
                  <Button className="mt-4">
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.company}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">
                      {typeof customer.address === 'object' 
                        ? `${(customer.address as any).street}, ${(customer.address as any).city}, ${(customer.address as any).state} ${(customer.address as any).zip}`
                        : customer.address}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Customer Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</p>
                </div>
                {stats.lastOrderDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Order</p>
                    <p className="text-sm font-medium">
                      {new Date(stats.lastOrderDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.totalOrders > 10 && (
                  <Badge variant="secondary">Loyal Customer</Badge>
                )}
                {stats.totalSpent > 1000 && (
                  <Badge variant="secondary">High Value</Badge>
                )}
                {stats.totalOrders === 0 && (
                  <Badge variant="outline">New Customer</Badge>
                )}
                <Badge variant="outline">+ Add Tag</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}