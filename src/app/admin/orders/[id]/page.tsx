import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Download,
  MessageSquare
} from 'lucide-react'

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      OrderItem: true,
      StatusHistory: {
        orderBy: { createdAt: 'desc' }
      },
      Notification: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return order
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PROCESSING: { color: 'bg-purple-100 text-purple-800', icon: Package },
  PRINTING: { color: 'bg-orange-100 text-orange-800', icon: Printer },
  READY_FOR_PICKUP: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  SHIPPED: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  REFUNDED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  const StatusIcon = statusConfig[order.status]?.icon || Package
  const shippingAddress = order.shippingAddress as any
  const billingAddress = order.billingAddress as any

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status</CardTitle>
                <Badge className={statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference Number:</span>
                  <span className="font-medium">{order.referenceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium">
                    {order.status === 'PENDING_PAYMENT' ? 'Pending' : 'Paid'}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                {order.carrier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Carrier:</span>
                    <span className="font-medium">{order.carrier}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.OrderItem.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.OrderItem.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.productSku}
                        </p>
                        {item.options && (
                          <div className="mt-2 text-sm">
                            {Object.entries(item.options as any).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${(order.tax / 100).toFixed(2)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>${(order.shipping / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.StatusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
                <CardDescription>
                  Track all status changes for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.StatusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {history.fromStatus ? `${history.fromStatus} → ` : ''}
                            {history.toStatus}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            by {history.changedBy}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.createdAt).toLocaleString()}
                        </p>
                        {history.notes && (
                          <p className="text-sm mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.email}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.phone}</span>
                </div>
              )}
              {order.userId && (
                <Link href={`/admin/customers/${order.userId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Customer Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{shippingAddress.name || order.email}</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}<br />
                    {shippingAddress.country || 'United States'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid:</span>
                    <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[100px] p-2 text-sm border rounded-md"
                placeholder="Add internal notes about this order..."
                defaultValue={order.adminNotes || ''}
              />
              <Button size="sm" className="mt-2">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}