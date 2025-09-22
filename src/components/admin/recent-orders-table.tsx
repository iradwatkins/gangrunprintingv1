'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
} from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  email: string
  status: string
  total: number
  createdAt: string | Date
  OrderItem: OrderItem[]
}

interface RecentOrdersTableProps {
  orders: Order[]
}

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    variant: 'secondary',
    icon: Clock,
  },
  PAID: {
    label: 'Paid',
    variant: 'default',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Processing',
    variant: 'default',
    icon: Package,
  },
  PRINTING: {
    label: 'Printing',
    variant: 'default',
    icon: Printer,
  },
  READY_FOR_PICKUP: {
    label: 'Ready',
    variant: 'default',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    variant: 'default',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'default',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    variant: 'destructive',
    icon: XCircle,
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    variant: 'destructive',
    icon: XCircle,
  },
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  // Ensure orders is always an array to prevent .map errors
  const safeOrders = orders || []

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const selectAllOrders = () => {
    if (selectedOrders.length === safeOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(safeOrders.map((order) => order.id))
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
      icon: Clock,
    }
    const Icon = config.icon

    return (
      <Badge className="gap-1" variant={config.variant}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders yet. Your first order will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedOrders.length} order(s) selected
          </span>
          <Button size="sm" variant="outline">
            Print Labels
          </Button>
          <Button size="sm" variant="outline">
            Export
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  className="rounded border-gray-300"
                  name="selectAllOrders"
                  type="checkbox"
                  onChange={selectAllOrders}
                />
              </TableHead>
              <TableHead>Order #</TableHead>
              <TableHead className="hidden sm:table-cell">Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Total</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <input
                    checked={selectedOrders.includes(order.id)}
                    className="rounded border-gray-300"
                    name={`selectOrder-${order.id}`}
                    type="checkbox"
                    onChange={() => toggleOrderSelection(order.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link className="hover:underline" href={`/admin/orders/${order.id}`}>
                    {order.orderNumber}
                  </Link>
                  {/* Mobile-only: Show customer info below order number */}
                  <div className="sm:hidden text-xs text-muted-foreground mt-1">{order.email}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{order.email}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.OrderItem.length} item(s)
                    <div className="text-xs text-muted-foreground">
                      {order.OrderItem[0]?.productName}
                      {order.OrderItem.length > 1 && ` +${order.OrderItem.length - 1} more`}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                  {/* Mobile-only: Show total and date below status */}
                  <div className="md:hidden text-xs text-muted-foreground mt-1">
                    ${(order.total / 100).toFixed(2)} • {formatDate(order.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ${(order.total / 100).toFixed(2)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-8 w-8 p-0" variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
