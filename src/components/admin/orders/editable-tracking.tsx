'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Truck, ExternalLink, Save, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EditableTrackingProps {
  orderId: string
  initialTrackingNumber?: string | null
  carrier?: string | null
}

export function EditableTracking({ orderId, initialTrackingNumber, carrier }: EditableTrackingProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tracking number')
      }

      toast.success('Tracking number updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update tracking number')
      console.error('Error updating tracking:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getTrackingUrl = () => {
    if (!trackingNumber) return null

    switch (carrier?.toUpperCase()) {
      case 'FEDEX':
        return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
      case 'SOUTHWEST_CARGO':
        return `https://www.southwest-cargo.com/tracking/${trackingNumber}`
      default:
        return `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}+tracking`
    }
  }

  const trackingUrl = getTrackingUrl()

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Tracking Number</span>
        {!isEditing && trackingNumber && trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Track Package
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTrackingNumber(initialTrackingNumber || '')
                setIsEditing(false)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {trackingNumber || 'No tracking number'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
