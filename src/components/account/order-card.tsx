'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'
import { ReorderModal } from './reorder-modal'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    referenceNumber?: string | null
    status: string
    total: number
    createdAt: string
    OrderItem: Array<{
      id: string
      quantity: number
      productName: string
      productSku: string
    }>
  }
  isBroker: boolean
}

// Status configuration with colors and icons
const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
  },
  PAYMENT_DECLINED: {
    label: 'Payment Declined',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  CONFIRMATION: {
    label: 'Confirmation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: CheckCircle,
  },
  ON_HOLD: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    icon: AlertCircle,
  },
  PRODUCTION: {
    label: 'Production',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    icon: Truck,
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    icon: Package,
  },
  ON_THE_WAY: {
    label: 'On the Way',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: Truck,
  },
  PICKED_UP: {
    label: 'Picked Up',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    icon: CheckCircle,
  },
  REPRINT: {
    label: 'Reprint',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
}

export function OrderCard({ order, isBroker }: OrderCardProps) {
  const [showReorderModal, setShowReorderModal] = useState(false)

  const config = statusConfig[order.status] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-800',
    icon: Package,
  }

  const StatusIcon = config.icon
  const itemCount = order.OrderItem.reduce((sum, item) => sum + item.quantity, 0)
  const productCount = order.OrderItem.length

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Format currency
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(order.total)

  // Check if order can be reordered
  const canReorder = !['CANCELLED', 'REFUNDED'].includes(order.status)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link className="font-semibold hover:underline" href={`/account/orders/${order.id}`}>
              {order.orderNumber}
            </Link>
            <p className="text-sm text-muted-foreground">{orderDate}</p>
          </div>
          <Badge className={config.color} variant="secondary">
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span className="font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ({productCount}{' '}
              {productCount === 1 ? 'product' : 'products'})
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{formattedTotal}</span>
          </div>
        </div>

        {/* Products Preview */}
        {order.OrderItem.length > 0 && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Products:</p>
            <ul className="space-y-1">
              {order.OrderItem.slice(0, 2).map((item) => (
                <li key={item.id} className="text-sm truncate">
                  • {item.productName} (×{item.quantity})
                </li>
              ))}
              {order.OrderItem.length > 2 && (
                <li className="text-sm text-muted-foreground">
                  + {order.OrderItem.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link className="block" href={`/account/orders/${order.id}`}>
            <Button className="w-full" variant="outline">
              View Details
            </Button>
          </Link>
          <Button
            className="w-full"
            disabled={!canReorder}
            variant="default"
            onClick={() => setShowReorderModal(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Re-Order
          </Button>
        </div>
      </CardContent>

      {/* Re-order Modal */}
      <ReorderModal
        open={showReorderModal}
        orderId={order.id}
        orderNumber={order.orderNumber}
        onOpenChange={setShowReorderModal}
      />
    </Card>
  )
}
