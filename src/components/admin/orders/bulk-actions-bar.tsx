'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'

interface StatusOption {
  slug: string
  name: string
  icon: string
  badgeColor: string
}

interface BulkActionsBarProps {
  selectedOrderIds: string[]
  onClearSelection: () => void
  onSuccess: () => void
}

export function BulkActionsBar({
  selectedOrderIds,
  onClearSelection,
  onSuccess,
}: BulkActionsBarProps) {
  const [statuses, setStatuses] = useState<StatusOption[]>([])
  const [loadingStatuses, setLoadingStatuses] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch available statuses
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await fetch('/api/admin/order-statuses')
        if (response.ok) {
          const data = await response.json()
          const activeStatuses = data.statuses
            .filter((s: any) => s.isActive)
            .map((s: any) => ({
              slug: s.slug,
              name: s.name,
              icon: s.icon,
              badgeColor: s.badgeColor,
            }))
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)

          setStatuses(activeStatuses)
        }
      } catch (error) {
        console.error('Failed to fetch statuses:', error)
      } finally {
        setLoadingStatuses(false)
      }
    }

    fetchStatuses()
  }, [])

  const handleBulkUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          toStatus: selectedStatus,
          notes: notes || undefined,
          sendEmail,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bulk update failed')
      }

      const result = await response.json()

      // Show results
      if (result.result.summary.succeeded > 0) {
        toast.success(
          `Successfully updated ${result.result.summary.succeeded} of ${result.result.summary.total} orders`
        )
      }

      if (result.result.failed.length > 0) {
        toast.error(
          `Failed to update ${result.result.failed.length} orders. Check console for details.`
        )
        console.error('Failed orders:', result.result.failed)
      }

      // Reset form
      setSelectedStatus('')
      setNotes('')
      setSendEmail(false)
      setShowDialog(false)
      onClearSelection()
      onSuccess()
    } catch (error) {
      console.error('Bulk update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update orders')
    } finally {
      setIsUpdating(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Circle
  }

  const selectedStatusDetails = statuses.find((s) => s.slug === selectedStatus)

  if (selectedOrderIds.length === 0) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-primary text-primary-foreground shadow-lg rounded-lg p-4 flex items-center gap-4 min-w-[500px]">
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-primary" variant="secondary">
              {selectedOrderIds.length}
            </Badge>
            <span className="font-medium">
              {selectedOrderIds.length === 1
                ? '1 order selected'
                : `${selectedOrderIds.length} orders selected`}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            {loadingStatuses ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading statuses...
              </div>
            ) : (
              <>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[200px] bg-white text-primary border-white">
                    <SelectValue placeholder="Change status to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => {
                      const StatusIcon = getIconComponent(status.icon)
                      return (
                        <SelectItem key={status.slug} value={status.slug}>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            {status.name}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                <Button
                  disabled={!selectedStatus}
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowDialog(true)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Update {selectedOrderIds.length} Order{selectedOrderIds.length !== 1 ? 's' : ''}
                </Button>
              </>
            )}
          </div>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update {selectedOrderIds.length} order
              {selectedOrderIds.length !== 1 ? 's' : ''} to:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {selectedStatusDetails && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                {(() => {
                  const StatusIcon = getIconComponent(selectedStatusDetails.icon)
                  return <StatusIcon className="h-5 w-5" />
                })()}
                <span className="font-semibold text-lg">{selectedStatusDetails.name}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={sendEmail}
                id="sendEmail"
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label className="cursor-pointer" htmlFor="sendEmail">
                Send email notifications to customers
              </Label>
            </div>

            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Important:</p>
              <ul className="mt-1 space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>• Only valid transitions will be applied</li>
                <li>• Invalid transitions will be skipped and reported</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdating} onClick={handleBulkUpdate}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Orders
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
