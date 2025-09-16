'use client'

import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Factory, Mail, Phone, Clock, Truck, AlertCircle, Send, Loader2 } from 'lucide-react'
import toast from '@/lib/toast'

interface VendorAssignmentProps {
  order: any
  vendors: any[]
}

export function VendorAssignment({ order, vendors }: VendorAssignmentProps) {
  const [selectedVendorId, setSelectedVendorId] = useState(order.vendorId || '')
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isNotifying, setIsNotifying] = useState(false)

  const assignVendor = async () => {
    if (!selectedVendorId) {
      toast.error('Please select a vendor')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/assign-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendorId,
          notes: notes
        })
      })

      if (response.ok) {
        toast.success('Vendor assigned successfully')
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to assign vendor')
      }
    } catch (error) {
      console.error('Error assigning vendor:', error)
      toast.error('Failed to assign vendor')
    } finally {
      setIsAssigning(false)
      setIsDialogOpen(false)
    }
  }

  const notifyVendor = async () => {
    if (!order.vendor) {
      toast.error('No vendor assigned')
      return
    }

    setIsNotifying(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/notify-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        toast.success('Vendor notification sent')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to notify vendor')
      }
    } catch (error) {
      console.error('Error notifying vendor:', error)
      toast.error('Failed to notify vendor')
    } finally {
      setIsNotifying(false)
    }
  }

  const currentVendor = order.vendor

  // Check if order is in a state where vendor can be assigned
  const canAssignVendor = ['PAID', 'PROCESSING', 'PRINTING', 'QUALITY_CHECK', 'PACKAGING'].includes(order.status)

  if (!canAssignVendor && !currentVendor) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vendor assignment is available after payment is received
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {currentVendor ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{currentVendor.name}</span>
              </div>
              <Badge variant="default">Assigned</Badge>
            </div>

            <div className="space-y-2 text-sm">
              {currentVendor.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentVendor.contactEmail}</span>
                </div>
              )}
              {currentVendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentVendor.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {currentVendor.turnaroundDays} day turnaround
                </span>
              </div>
              {currentVendor.supportedCarriers && currentVendor.supportedCarriers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {currentVendor.supportedCarriers.map((carrier: string) => (
                      <Badge key={carrier} className="text-xs" variant="secondary">
                        {carrier}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              Change Vendor
            </Button>
            <Button
              disabled={isNotifying}
              size="sm"
              variant="outline"
              onClick={notifyVendor}
            >
              {isNotifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No vendor assigned yet
            </AlertDescription>
          </Alert>
          <Button
            className="w-full"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Assign Vendor
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentVendor ? 'Change Vendor Assignment' : 'Assign Vendor'}
            </DialogTitle>
            <DialogDescription>
              Select a vendor to fulfill this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="vendor">Select Vendor</Label>
              <Select
                value={selectedVendorId}
                onValueChange={setSelectedVendorId}
              >
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Choose a vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{vendor.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {vendor.turnaroundDays} days
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVendorId && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                {(() => {
                  const vendor = vendors.find(v => v.id === selectedVendorId)
                  if (!vendor) return null
                  return (
                    <div className="space-y-2">
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-muted-foreground">
                        <div>Turnaround: {vendor.turnaroundDays} days</div>
                        {vendor.minimumOrderAmount && (
                          <div>Min Order: ${vendor.minimumOrderAmount.toFixed(2)}</div>
                        )}
                        {vendor.supportedCarriers && vendor.supportedCarriers.length > 0 && (
                          <div>Carriers: {vendor.supportedCarriers.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Internal Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for this assignment..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isAssigning || !selectedVendorId} onClick={assignVendor}>
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Vendor'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}