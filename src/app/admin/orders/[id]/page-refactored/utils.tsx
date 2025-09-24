/**
 * page - utils definitions
 * Auto-refactored by BMAD
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const dynamic = 'force-dynamic'

export const revalidate = 0

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      vendor: true,
      OrderItem: {
        include: {
          product: true,
        },
      },
      Payment: true,
    },
  })

  return order
}

async function getVendors() {
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return vendors
}

const statusConfig: Record<string, { label: string; color: string; icon: Record<string, unknown>; next?: string[] }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
    next: ['PAID', 'CANCELLED'],
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: DollarSign,
    next: ['PROCESSING', 'REFUNDED'],
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Package,
    next: ['PRINTING', 'CANCELLED'],
  },
  PRINTING: {
    label: 'Printing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Printer,
    next: ['QUALITY_CHECK', 'PROCESSING'],
  },
  QUALITY_CHECK: {
    label: 'Quality Check',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: CheckCircle,
    next: ['PACKAGING', 'PRINTING'],
  },
  PACKAGING: {
    label: 'Packaging',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    icon: Package,
    next: ['SHIPPED'],
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    icon: Truck,
    next: ['DELIVERED'],
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    icon: CheckCircle,
    next: [],
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircle,
    next: [],
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: AlertCircle,
    next: [],
  },
}

// Generate order timeline based on order status
function getOrderTimeline(order: Record<string, unknown>) {
  const timeline = []
  const currentStatus = order.status

  // Always show order placed
  timeline.push({
    status: 'Order Placed',
    date: order.createdAt,
    description: `Order ${order.orderNumber} was placed`,
    icon: Package,
    completed: true,
  })

  // Payment status
  if (order.status !== 'PENDING_PAYMENT') {
    timeline.push({
      status: 'Payment Received',
      date: order.createdAt, // In real app, would have separate payment date
      description: 'Payment was successfully processed',
      icon: DollarSign,
      completed: true,
    })
  }

  // Add current status if beyond payment
  const statusFlow = [
    'PROCESSING',
    'PRINTING',
    'QUALITY_CHECK',
    'PACKAGING',
    'SHIPPED',
    'DELIVERED',
  ]
  const currentIndex = statusFlow.indexOf(currentStatus)

  if (currentIndex >= 0) {
    statusFlow.slice(0, currentIndex + 1).forEach((status, index) => {
      const config = statusConfig[status]
      timeline.push({
        status: config.label,
        date: order.updatedAt, // In real app, would track each status change
        description: `Order is ${config.label.toLowerCase()}`,
        icon: config.icon,
        completed: index < currentIndex || status === currentStatus,
      })
    })
  }

  // Handle cancelled/refunded
  if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') {
    const config = statusConfig[currentStatus]
    timeline.push({
      status: config.label,
      date: order.updatedAt,
      description: `Order was ${config.label.toLowerCase()}`,
      icon: config.icon,
      completed: true,
    })
  }

  return timeline
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [order, vendors] = await Promise.all([getOrder(id), getVendors()])

  if (!order) {
    notFound()
  }

  const status = statusConfig[order.status] || statusConfig.PENDING_PAYMENT
  const StatusIcon = status.icon
  const timeline = getOrderTimeline(order)
  const shippingAddress = order.shippingAddress as any
  const billingAddress = order.billingAddress as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button disabled size="sm" variant="outline">

            <Printer className="h-4 w-4 mr-2" />
            Print Order
          </Button>
          <Button disabled size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {order.status === 'PENDING_PAYMENT' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This order is awaiting payment. The customer has been notified to complete payment.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.OrderItem.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product?.name || 'Product Deleted'}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product?.sku || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.configuration ? (
                          <div className="text-sm">
                            {Object.entries(item.configuration as any).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>{' '}
                                {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Standard</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${(item.price / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Order Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${(order.shipping / 100).toFixed(2)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${(order.tax / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.user?.name || 'Guest Customer'}</span>
                  </div>
                  {order.user && (
                    <Link className="inline-block mt-2" href={`/admin/customers/${order.user.id}`}>
                      <Button size="sm" variant="outline">
                        View Profile
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.user?.email || 'No email'}</span>
                    </div>
                    {shippingAddress?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shippingAddress.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Shipping Address
                  </p>
                  {shippingAddress ? (
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{shippingAddress.name}</p>
                      <p>{shippingAddress.street}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shipping address</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Billing Address
                  </p>
                  {billingAddress ? (
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{billingAddress.name}</p>
                      <p>{billingAddress.street}</p>
                      <p>
                        {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
                      </p>
                      <p>{billingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Same as shipping address</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status and Timeline */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${status.color} gap-1 px-3 py-1`}>
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </Badge>
                <Button disabled size="sm" variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Vendor Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VendorAssignment order={order} vendors={vendors} />
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm font-medium">
                  {order.paymentMethod || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={order.status === 'PENDING_PAYMENT' ? 'secondary' : 'default'}>
                  {order.status === 'PENDING_PAYMENT' ? 'Pending' : 'Paid'}
                </Badge>
              </div>
              {order.Payment && order.Payment.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <span className="text-xs font-mono">
                      {order.Payment[0].transactionId?.substring(0, 12)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">
                      ${(order.Payment[0].amount / 100).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => {
                  const EventIcon = event.icon
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`rounded-full p-2 ${
                            event.completed
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <EventIcon className="h-4 w-4" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-16 mt-2 ${
                              event.completed ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-sm">{event.status}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button disabled className="w-full justify-start" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Email to Customer
              </Button>
              <Button disabled className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button disabled className="w-full justify-start" variant="outline">
                <Truck className="h-4 w-4 mr-2" />
                Update Tracking
              </Button>
              {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                <Button disabled className="w-full justify-start" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
