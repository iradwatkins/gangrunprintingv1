import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, Heart, ShoppingCart, Bookmark, Package, RotateCcw } from 'lucide-react'
import Link from 'next/link'

async function getSavedData(userId: string) {
  // Get recently completed orders as "saved" items (users might want to reorder)
  const savedOrders = await prisma.order.findMany({
    where: {
      userId,
      status: 'DELIVERED',
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      OrderItem: {
        include: {
          orderItemAddOns: {
            include: {
              addOn: true,
            },
          },
        },
      },
    },
  })

  // Get frequently ordered products (based on order history)
  const frequentProducts = await prisma.orderItem.groupBy({
    by: ['productSku', 'productName'],
    where: {
      Order: {
        userId,
        status: 'DELIVERED',
      },
    },
    _count: {
      productSku: true,
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _count: {
        productSku: 'desc',
      },
    },
    take: 6,
  })

  return {
    savedOrders,
    frequentProducts,
  }
}

export default async function SavedPage() {
  const { user, session } = await validateRequest()

  if (!user?.id) {
    redirect('/sign-in')
  }

  const { savedOrders, frequentProducts } = await getSavedData(user.id)

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Items</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your favorite products and orders you might want to reorder
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Orders</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Recent completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequent Products</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{frequentProducts.length}</div>
              <p className="text-xs text-muted-foreground">Products you order often</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {frequentProducts.reduce((sum, item) => sum + (item._sum.quantity || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Items ordered in total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Frequently Ordered Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Frequently Ordered
              </CardTitle>
              <CardDescription>Products you order most often</CardDescription>
            </CardHeader>
            <CardContent>
              {frequentProducts.length > 0 ? (
                <div className="space-y-4">
                  {frequentProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{product.productName}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.productSku}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">
                            Ordered {product._count.productSku} times
                          </Badge>
                          <Badge variant="outline">Total: {product._sum.quantity} items</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No frequent products yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start ordering to see your favorite products here.
                  </p>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders Available for Reorder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Reorder History
              </CardTitle>
              <CardDescription>
                Your recent completed orders available for reordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedOrders.length > 0 ? (
                <div className="space-y-4">
                  {savedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium">
                            Order #{order.referenceNumber || order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.OrderItem.length} item(s) • ${(order.total / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Delivered: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <Package className="h-3 w-3 mr-1" />
                          Delivered
                        </Badge>
                      </div>

                      {/* Order Items Preview */}
                      <div className="space-y-1 mb-3">
                        {order.OrderItem.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {item.productName} (Qty: {item.quantity})
                          </div>
                        ))}
                        {order.OrderItem.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            • and {order.OrderItem.length - 2} more items...
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save Order
                        </Button>
                        <Button size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No completed orders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your first order to see reorder options here.
                  </p>
                  <Link href="/products">
                    <Button>Place Your First Order</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions for managing your saved items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/products">
                <Button className="w-full justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="font-medium">Browse Products</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Discover new products to add to your favorites
                    </p>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/orders">
                <Button className="w-full justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Order History</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View all your past orders and details
                    </p>
                  </div>
                </Button>
              </Link>

              <Link href="/cart">
                <Button className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="font-medium">View Cart</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check items in your shopping cart
                    </p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
