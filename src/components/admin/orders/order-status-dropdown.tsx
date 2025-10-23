'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'

interface StatusDetails {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  badgeColor: string
  isPaid: boolean
}

interface ValidNextState extends StatusDetails {
  requiresPayment: boolean
  requiresAdmin: boolean
}

interface OrderStatusDropdownProps {
  orderId: string
  currentStatus: string
  onStatusChange?: () => void
}

export function OrderStatusDropdown({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStatusDetails, setCurrentStatusDetails] = useState<StatusDetails | null>(null)
  const [validNextStates, setValidNextStates] = useState<ValidNextState[]>([])

  // Fetch status details and valid transitions
  useEffect(() => {
    async function fetchStatusInfo() {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`)
        if (response.ok) {
          const data = await response.json()
          setCurrentStatusDetails(data.currentStatusDetails)
          setValidNextStates(data.validNextStates || [])
        } else {
          console.error('Failed to fetch status info')
        }
      } catch (error) {
        console.error('Error fetching status info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatusInfo()
  }, [orderId, status])

  const handleStatusChange = async (newStatus: string) => {
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
          notes: `Status updated via dropdown`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update status')
      }

      const result = await response.json()
      setStatus(newStatus)

      // Find the new status details
      const newStatusDetails = validNextStates.find((s) => s.slug === newStatus)
      toast.success(`Order status updated to ${newStatusDetails?.name || newStatus}`)

      // Call the callback if provided
      onStatusChange?.()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Circle
  }

  if (isLoading || !currentStatusDetails) {
    return (
      <Button
        disabled
        className="h-9 w-9 rounded-full bg-gray-300 hover:bg-gray-400 p-0"
        size="sm"
        variant="ghost"
      >
        <Icons.Loader2 className="h-4 w-4 animate-spin text-white" />
      </Button>
    )
  }

  const CurrentIcon = getIconComponent(currentStatusDetails.icon)

  // Determine button color based on status
  const getStatusColor = (statusSlug: string) => {
    switch (statusSlug) {
      case 'PENDING_PAYMENT':
      case 'PAYMENT_DECLINED':
      case 'PAYMENT_FAILED':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'PAID':
      case 'CONFIRMATION':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'ON_HOLD':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'PROCESSING':
      case 'PRINTING':
      case 'PRODUCTION':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'SHIPPED':
      case 'ON_THE_WAY':
        return 'bg-indigo-500 hover:bg-indigo-600'
      case 'READY_FOR_PICKUP':
      case 'PICKED_UP':
      case 'DELIVERED':
        return 'bg-green-500 hover:bg-green-600'
      case 'REPRINT':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-blue-500 hover:bg-blue-600'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`h-9 w-9 rounded-full ${getStatusColor(status)} p-0 transition-all ${
            isUpdating ? 'opacity-50' : ''
          }`}
          disabled={isUpdating}
          size="sm"
          title={currentStatusDetails.name}
        >
          <CurrentIcon className="h-4 w-4 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <CurrentIcon className="h-4 w-4" />
          {currentStatusDetails.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {validNextStates.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No status changes available
          </div>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Change status to:</div>
            {validNextStates.map((nextState) => {
              const NextIcon = getIconComponent(nextState.icon)
              return (
                <DropdownMenuItem
                  key={nextState.slug}
                  className="cursor-pointer"
                  onClick={() => handleStatusChange(nextState.slug)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className={`h-6 w-6 rounded-full ${getStatusColor(nextState.slug)} flex items-center justify-center`}
                    >
                      <NextIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="flex-1">{nextState.name}</span>
                    {nextState.requiresPayment && (
                      <Icons.CreditCard
                        className="h-3 w-3 text-muted-foreground"
                        title="Requires payment"
                      />
                    )}
                    {nextState.requiresAdmin && (
                      <Icons.Shield
                        className="h-3 w-3 text-muted-foreground"
                        title="Requires admin"
                      />
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
