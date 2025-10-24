'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, X } from 'lucide-react'
import toast from '@/lib/toast'

interface OrderItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  price: number
}

interface ShippingAddress {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

interface EditOrderFormProps {
  order: {
    id: string
    orderNumber: string
    status: string
    email: string
    shippingAddress: ShippingAddress
    billingAddress?: ShippingAddress
    adminNotes?: string
    trackingNumber?: string
    carrier?: string
    subtotal: number
    tax: number
    shipping: number
    total: number
    OrderItem: OrderItem[]
  }
}

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAYMENT_DECLINED',
  'CONFIRMATION',
  'ON_HOLD',
  'PRODUCTION',
  'SHIPPED',
  'READY_FOR_PICKUP',
  'ON_THE_WAY',
  'PICKED_UP',
  'DELIVERED',
  'REPRINT',
  'CANCELLED',
  'REFUNDED',
]

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Southwest Cargo', 'Other']

export function EditOrderForm({ order }: EditOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [status, setStatus] = useState(order.status)
  const [email, setEmail] = useState(order.email)
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '')
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
  const [carrier, setCarrier] = useState(order.carrier || '')

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(order.shippingAddress)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          email,
          adminNotes,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
          shippingAddress,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Failed to update order')
      }

      toast.success('Order updated successfully')
      router.push(`/admin/orders/${order.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/orders/${order.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Status & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status & Details</CardTitle>
          <CardDescription>Update order status, tracking, and administrative notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusOption.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Customer Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          {/* Carrier */}
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier..." />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((carrierOption) => (
                  <SelectItem key={carrierOption} value={carrierOption}>
                    {carrierOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add internal notes about this order..."
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Update the shipping destination for this order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={shippingAddress.name}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, name: e.target.value })
              }
              required
            />
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={shippingAddress.address1}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address1: e.target.value })
              }
              required
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="address2">Address Line 2 (Optional)</Label>
            <Input
              id="address2"
              value={shippingAddress.address2 || ''}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address2: e.target.value })
              }
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, state: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={shippingAddress.zip}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, zip: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingAddress.phone || ''}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, phone: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items (Read-Only Summary) */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            Items in this order (editing items coming soon - currently read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.OrderItem.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Qty: {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">
                    ${(item.price / 100).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${(order.subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>${(order.tax / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span>${(order.shipping / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
