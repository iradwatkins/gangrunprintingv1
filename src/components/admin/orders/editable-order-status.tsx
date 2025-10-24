'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Package,
  DollarSign,
  Printer,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Save,
} from 'lucide-react'
import toast from '@/lib/toast'

const statusConfig: Record<string, { label: string; color: string; icon: any; next?: string[] }> = {
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

interface Props {
  orderId: string
  currentStatus: string
  onStatusChange?: () => void
}

export function EditableOrderStatus({ orderId, currentStatus, onStatusChange }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const status = statusConfig[currentStatus] || statusConfig.PENDING_PAYMENT
  const StatusIcon = status.icon
  const nextStatuses = status.next || []

  const handleStatusSelect = (newStatus: string) => {
    setSelectedStatus(newStatus)
    setDialogOpen(true)
  }

  const handleConfirmStatusChange = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      })

      if (response.ok) {
        toast.success(`Order status updated to ${statusConfig[selectedStatus]?.label}`)
        onStatusChange?.()
        setIsEditing(false)
        setDialogOpen(false)
        // Refresh page to show updated status
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (nextStatuses.length === 0) {
    // No valid status transitions available
    return (
      <div className="flex items-center justify-between">
        <Badge className={`${status.color} gap-1 px-3 py-1`}>
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </Badge>
        <span className="text-xs text-muted-foreground">Final status</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={`${status.color} gap-1 px-3 py-1`}>
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Update
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="space-y-3">
            <Select onValueChange={handleStatusSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((statusKey) => {
                  const statusInfo = statusConfig[statusKey]
                  const StatusIcon = statusInfo.icon
                  return (
                    <SelectItem key={statusKey} value={statusKey}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        {statusInfo.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the order status from <strong>{status.label}</strong>{' '}
              to <strong>{statusConfig[selectedStatus]?.label}</strong>?
              <br />
              <br />
              This action cannot be undone and may trigger customer notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdating} onClick={handleConfirmStatusChange}>
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
