'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Truck, ExternalLink, Save, Edit2, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShipmentTrackingEmailService } from '@/lib/email/shipment-tracking-email-service'

interface EditableTrackingProps {
  orderId: string
  initialTrackingNumber?: string | null
  carrier?: string | null
}

interface ValidationResult {
  isValid: boolean
  carrier?: string
  error?: string
}

export function EditableTracking({ orderId, initialTrackingNumber, carrier }: EditableTrackingProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [isSaving, setIsSaving] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false })
  const [detectedCarrier, setDetectedCarrier] = useState<string | null>(null)

  // Real-time validation and carrier detection
  useEffect(() => {
    if (trackingNumber.trim()) {
      const result = ShipmentTrackingEmailService.validateTrackingNumber(trackingNumber)
      setValidation(result)
      setDetectedCarrier(result.carrier || null)
    } else {
      setValidation({ isValid: false })
      setDetectedCarrier(null)
    }
  }, [trackingNumber])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trackingNumber,
          carrier: detectedCarrier 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tracking number')
      }

      const result = await response.json()
      
      // Enhanced success message with automation details
      toast.success(
        `✅ Tracking updated successfully!\n📦 Status changed to SHIPPED\n📧 Customer notification sent`,
        { duration: 5000 }
      )
      
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tracking number'
      toast.error(errorMessage)
      console.error('Error updating tracking:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getTrackingUrl = () => {
    if (!trackingNumber) return null
    
    // Use the smart tracking URL generation from ShipmentTrackingEmailService
    const carrierToUse = detectedCarrier || carrier || 'OTHER'
    return ShipmentTrackingEmailService.generateTrackingUrl?.(trackingNumber, carrierToUse) ||
           `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}+tracking`
  }

  const getCarrierDisplayName = (carrierCode: string) => {
    return ShipmentTrackingEmailService.getCarrierDisplayName(carrierCode)
  }

  const trackingUrl = getTrackingUrl()

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tracking Number</span>
          {isEditing && detectedCarrier && (
            <Badge variant="secondary" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              {getCarrierDisplayName(detectedCarrier)}
            </Badge>
          )}
        </div>
        {!isEditing && trackingNumber && trackingUrl && (
          <a
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            href={trackingUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Track Package
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Input
                  className={`pr-8 ${
                    trackingNumber && !validation.isValid 
                      ? 'border-red-300 focus:border-red-500' 
                      : trackingNumber && validation.isValid 
                      ? 'border-green-300 focus:border-green-500'
                      : ''
                  }`}
                  placeholder="Enter tracking number..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                {trackingNumber && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {validation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Validation feedback */}
              {trackingNumber && !validation.isValid && validation.error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validation.error}
                </p>
              )}
              
              {trackingNumber && validation.isValid && detectedCarrier && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Valid {getCarrierDisplayName(detectedCarrier)} tracking number
                </p>
              )}
            </div>
            
            <Button
              disabled={isSaving || !validation.isValid}
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              disabled={isSaving}
              size="sm"
              variant="outline"
              onClick={() => {
                setTrackingNumber(initialTrackingNumber || '')
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {trackingNumber || 'No tracking number'}
                </span>
                {trackingNumber && (detectedCarrier || carrier) && (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getCarrierDisplayName(detectedCarrier || carrier || '')}
                    </Badge>
                  </div>
                )}
              </div>
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
      
      {/* Status automation info */}
      {isEditing && validation.isValid && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span className="font-medium">Auto-actions when saved:</span>
          </div>
          <ul className="mt-1 space-y-0.5 text-xs text-blue-700">
            <li>• Order status will change to "SHIPPED"</li>
            <li>• Customer will receive tracking notification email</li>
            <li>• Tracking URL will be generated automatically</li>
          </ul>
        </div>
      )}
    </div>
  )
}
