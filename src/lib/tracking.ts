import { type Carrier } from '@prisma/client'
import { TRACKING_URLS } from '@/config/constants'

export interface TrackingInfo {
  carrier: Carrier
  trackingNumber: string
  trackingUrl: string
  buttonText: string
}

export function getTrackingUrl(carrier: Carrier, trackingNumber: string): string {
  switch (carrier) {
    case 'SOUTHWEST_CARGO':
      return `${TRACKING_URLS.SWA_CARGO}${trackingNumber}`
    case 'FEDEX':
      return `${TRACKING_URLS.FEDEX}${trackingNumber}`
    case 'UPS':
      return `${TRACKING_URLS.UPS}${trackingNumber}`
    default:
      return '#'
  }
}

export function getCarrierName(carrier: Carrier): string {
  switch (carrier) {
    case 'SOUTHWEST_CARGO':
      return 'Southwest Cargo'
    case 'FEDEX':
      return 'FedEx'
    case 'UPS':
      return 'UPS'
    default:
      return 'Carrier'
  }
}

export function getTrackingInfo(carrier: Carrier, trackingNumber: string): TrackingInfo {
  return {
    carrier,
    trackingNumber,
    trackingUrl: getTrackingUrl(carrier, trackingNumber),
    buttonText: `Track with ${getCarrierName(carrier)}`,
  }
}

export function formatTrackingNumber(carrier: Carrier, trackingNumber: string): string {
  // Southwest Cargo tracking numbers need the 526- prefix for display
  if (carrier === 'SOUTHWEST_CARGO') {
    return `526-${trackingNumber}`
  }
  return trackingNumber
}
