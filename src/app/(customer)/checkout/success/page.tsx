'use client'

import { Suspense, useEffect, useState } from 'react'
import { CheckCircle, Download, Mail, Package, Truck, Clock, MapPin, User, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface OrderItem {
  productName: string
  quantity: number
  price: number
  options?: any
}

interface OrderInfo {
  orderNumber: string
  orderId?: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  items: OrderItem[]
  customerInfo?: {
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  status?: string
  createdAt?: string
  paidAt?: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // First try to get order info from session storage
        const storedOrder = sessionStorage.getItem('lastOrder')
        if (storedOrder) {
          const orderData = JSON.parse(storedOrder)
          setOrderInfo(orderData)
          sessionStorage.removeItem('lastOrder')
          setIsLoading(false)
          return
        }

        // Fallback to query params and API call
        const orderNumber = searchParams.get('order') || searchParams.get('orderNumber')
        if (orderNumber) {
          const response = await fetch(`/api/orders/${orderNumber}/public`)
          if (response.ok) {
            const orderData = await response.json()
            setOrderInfo(orderData)
          } else {
            // Minimal fallback data
            setOrderInfo({
              orderNumber,
              total: 0,
              subtotal: 0,
              tax: 0,
              shipping: 0,
              items: [],
            })
          }
        }
      } catch (error) {
        console.error('Error fetching order data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [searchParams])

  const orderNumber = orderInfo?.orderNumber || searchParams.get('order') || 'ORD-XXXXXX'

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for your order. We&apos;ve received your payment and will begin processing your
          items shortly.
        </p>

        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold font-mono">{orderNumber}</p>
            {orderInfo?.createdAt && (
              <p className="text-sm text-muted-foreground mt-2">
                Placed on {new Date(orderInfo.createdAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderInfo?.items && orderInfo.items.length > 0 ? (
              <>
                {orderInfo.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b border-border/50 pb-3 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      {item.options && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.options.size && <span>Size: {item.options.size}</span>}
                          {item.options.size && item.options.paperStock && <span> • </span>}
                          {item.options.paperStock && <span>Paper: {item.options.paperStock}</span>}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderInfo.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${orderInfo.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${orderInfo.shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${orderInfo.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Order details not available</p>
            )}
          </CardContent>
        </Card>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          {orderInfo?.customerInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {orderInfo.customerInfo.firstName} {orderInfo.customerInfo.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{orderInfo.customerInfo.email}</p>
                  {orderInfo.customerInfo.phone && (
                    <p className="text-sm text-muted-foreground">{orderInfo.customerInfo.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {orderInfo?.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{orderInfo.shippingAddress.street}</p>
                  <p>
                    {orderInfo.shippingAddress.city}, {orderInfo.shippingAddress.state}{' '}
                    {orderInfo.shippingAddress.zipCode}
                  </p>
                  <p>{orderInfo.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status & Notifications */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Confirmation email sent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">Design review notification (within 24 hours)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">Production start notification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">Shipping notification</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What&apos;s Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Design Review</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your files within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Production</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will enter production once approved
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll notify you when your order ships
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/track">
            <Button size="lg" className="min-w-40">
              <Truck className="mr-2 h-4 w-4" />
              Track Your Order
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="min-w-40">
              <Package className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (orderInfo?.orderNumber) {
                window.open(`/api/orders/${orderInfo.orderNumber}/receipt`, '_blank')
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button size="sm" variant="ghost">
            <CreditCard className="mr-2 h-4 w-4" />
            View Payment Details
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mt-6">
          <p>Need help? Contact us at <a href="mailto:support@gangrunprinting.com" className="text-primary hover:underline">support@gangrunprinting.com</a> or call 1-800-PRINTING</p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
