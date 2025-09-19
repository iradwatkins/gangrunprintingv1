import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, DollarSign, Receipt, Download, Calendar } from 'lucide-react'
import Link from 'next/link'

async function getPaymentData(userId: string) {
  // Get all orders with payment information
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      OrderItem: true,
    },
  })

  // Calculate payment statistics
  const totalSpent = orders
    .filter((order) => order.status !== 'CANCELLED' && order.status !== 'REFUNDED')
    .reduce((sum, order) => sum + order.total, 0)

  const refundedAmount = orders
    .filter((order) => order.status === 'REFUNDED')
    .reduce((sum, order) => sum + (order.refundAmount || order.total), 0)

  return {
    orders,
    totalSpent,
    refundedAmount,
    totalOrders: orders.length,
  }
}

function getPaymentStatusInfo(status: string, paidAt: Date | null) {
  if (paidAt) {
    return { color: 'bg-green-100 text-green-800', text: 'Paid' }
  }

  const statusMap = {
    PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Payment' },
    CANCELLED: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
    REFUNDED: { color: 'bg-red-100 text-red-800', text: 'Refunded' },
  }
  return (
    statusMap[status as keyof typeof statusMap] || {
      color: 'bg-green-100 text-green-800',
      text: 'Paid',
    }
  )
}

export default async function PaymentsPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const { orders, totalSpent, refundedAmount, totalOrders } = await getPaymentData(user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your order payments, receipts, and transaction history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalSpent / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across {totalOrders} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(refundedAmount / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total refunds received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalOrders > 0 ? (totalSpent / totalOrders / 100).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Average order value</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>All your orders and payment details</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => {
                  const paymentInfo = getPaymentStatusInfo(order.status, order.paidAt)

                  return (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Order #{order.referenceNumber || order.orderNumber}
                            </h3>
                            <Badge className={paymentInfo.color}>{paymentInfo.text}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.OrderItem.length} item(s)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Order Date: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          {order.paidAt && (
                            <p className="text-sm text-muted-foreground">
                              Paid: {new Date(order.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${(order.total / 100).toFixed(2)}</p>
                          {order.refundAmount && (
                            <p className="text-sm text-red-600">
                              Refunded: ${(order.refundAmount / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="font-medium">${(order.subtotal / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax</p>
                          <p className="font-medium">${(order.tax / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Shipping</p>
                          <p className="font-medium">${(order.shipping / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold">${(order.total / 100).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            View Order
                          </Button>
                        </Link>
                        {order.paidAt && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download Receipt
                          </Button>
                        )}
                        {order.status === 'PENDING_PAYMENT' && <Button size="sm">Pay Now</Button>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No payment history</h3>
                <p className="text-muted-foreground mb-4">You haven't made any orders yet.</p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
