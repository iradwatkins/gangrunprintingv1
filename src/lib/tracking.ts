import { type Carrier } from '@prisma/client'

export interface TrackingInfo {
  carrier: Carrier
  trackingNumber: string
  trackingUrl: string
  buttonText: string
}

export function getTrackingUrl(carrier: Carrier, trackingNumber: string): string {
  switch (carrier) {
    case 'SOUTHWEST_CARGO':
      return `https://www.swacargo.com/swacargo_com_ui/tracking-details?trackingId=526-${trackingNumber}`
    case 'FEDEX':
      return `https://www.fedex.com/fedextrack/?cntry_code=us&tracknumbers=${trackingNumber}`
    case 'UPS':
      return `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${trackingNumber}`
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
