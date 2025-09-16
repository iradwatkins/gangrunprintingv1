'use client'

import { Button } from '@/components/ui/button'
import { Package, ExternalLink } from 'lucide-react'
import { type Carrier } from '@prisma/client'
import { getTrackingInfo } from '@/lib/tracking'

interface TrackingButtonProps {
  carrier: Carrier
  trackingNumber: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
}

export function TrackingButton({
  carrier,
  trackingNumber,
  variant = 'default',
  size = 'default',
  className,
  showIcon = true
}: TrackingButtonProps) {
  const trackingInfo = getTrackingInfo(carrier, trackingNumber)

  const handleClick = () => {
    window.open(trackingInfo.trackingUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      onClick={handleClick}
    >
      {showIcon && <Package className="mr-2 h-4 w-4" />}
      {trackingInfo.buttonText}
      <ExternalLink className="ml-2 h-3 w-3" />
    </Button>
  )
}

interface TrackingLinkProps {
  carrier: Carrier
  trackingNumber: string
  className?: string
  showNumber?: boolean
}

export function TrackingLink({
  carrier,
  trackingNumber,
  className,
  showNumber = false
}: TrackingLinkProps) {
  const trackingInfo = getTrackingInfo(carrier, trackingNumber)

  return (
    <a
      className={className || 'text-primary hover:underline inline-flex items-center gap-1'}
      href={trackingInfo.trackingUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {showNumber ? `${trackingInfo.trackingNumber}` : trackingInfo.buttonText}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}