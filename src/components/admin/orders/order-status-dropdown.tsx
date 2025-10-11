'use client'

import { useState } from 'react'
import { type OrderStatus } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'

// Status configuration with colors and icons - GangRun Printing Workflow
const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  CONFIRMATION: {
    label: 'Confirmation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: AlertCircle,
  },
  PRODUCTION: {
    label: 'Production',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Truck,
  },
  ON_THE_WAY: {
    label: 'On The Way',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    icon: Package,
  },
  PICKED_UP: {
    label: 'Has Been Picked Up',
    color: 'bg-green-200 text-green-900 dark:bg-green-800/20 dark:text-green-300',
    icon: CheckCircle,
  },
  ON_HOLD: {
    label: 'On Hold',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    icon: DollarSign,
  },
}

interface OrderStatusDropdownProps {
  orderId: string
  currentStatus: OrderStatus
  onStatusChange?: () => void
}

export function OrderStatusDropdown({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toStatus: newStatus,
          notes: `Status updated from ${status} to ${newStatus}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setStatus(newStatus)
      toast.success(`Order status updated to ${statusConfig[newStatus]?.label || newStatus}`)

      // Call the callback if provided
      onStatusChange?.()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    icon: AlertCircle,
  }
  const StatusIcon = currentConfig.icon

  return (
    <Select
      disabled={isUpdating}
      value={status}
      onValueChange={(value) => handleStatusChange(value as OrderStatus)}
    >
      <SelectTrigger className="w-[180px] border-0 p-0 h-auto">
        <SelectValue>
          <Badge className={`${currentConfig.color} gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {currentConfig.label}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CONFIRMATION">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Confirmation
          </div>
        </SelectItem>
        <SelectItem value="PRODUCTION">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Production
          </div>
        </SelectItem>
        <SelectItem value="SHIPPED">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipped
          </div>
        </SelectItem>
        <SelectItem value="ON_THE_WAY">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            On The Way
          </div>
        </SelectItem>
        <SelectItem value="DELIVERED">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Delivered
          </div>
        </SelectItem>
        <SelectItem value="READY_FOR_PICKUP">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ready for Pickup
          </div>
        </SelectItem>
        <SelectItem value="PICKED_UP">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Has Been Picked Up
          </div>
        </SelectItem>
        <SelectItem value="ON_HOLD">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            On Hold (Issue)
          </div>
        </SelectItem>
        <SelectItem value="CANCELLED">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Cancelled
          </div>
        </SelectItem>
        <SelectItem value="REFUNDED">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Refunded
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
