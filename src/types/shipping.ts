/**
 * Shipping type definitions for Gang Run Printing
 */

export interface ShippingAddress {
  street1: string
  street2?: string
  city: string
  state: string
  zipCode: string
  countryCode?: string
}

export interface ShippingDestination {
  zipCode: string
  state: string
  city: string
  countryCode?: string
}

export interface ShippingPackage {
  weight: number // in pounds
  dimensions?: {
    length: number
    width: number
    height: number
    unit?: string
  }
}

export interface ShippingRate {
  provider: string
  providerName: string
  serviceType: string
  rate: {
    amount: number
    currency: string
  }
  delivery: {
    estimatedDays: {
      min: number
      max: number
    }
    text: string
  }
}

export interface ShippingRateRequest {
  destination: ShippingDestination
  package: ShippingPackage
  providers?: Array<'fedex' | 'southwest-dash'>
}

export interface ShippingRateResponse {
  success: boolean
  rates?: ShippingRate[]
  error?: string
  details?: unknown
  requestId: string
}

export interface DynamicShippingRate {
  provider: string
  rate: {
    amount: number
  }
}
