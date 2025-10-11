import { type Carrier } from '@prisma/client'
import type { ShippingConfiguration } from './interfaces'

// FedEx configuration
export const fedexConfig: ShippingConfiguration = {
  enabled: true, // Always enabled - will use test mode if no API keys
  testMode: !process.env.FEDEX_API_KEY || process.env.FEDEX_TEST_MODE === 'true',
  defaultPackaging: {
    weight: 0.5, // 0.5 lbs for box/packaging
  },
  markupPercentage: 0, // NO markup - show raw FedEx rates
}

// UPS configuration
export const upsConfig: ShippingConfiguration = {
  enabled: !!process.env.UPS_ACCESS_LICENSE_NUMBER,
  testMode: process.env.UPS_TEST_MODE === 'true',
  defaultPackaging: {
    weight: 0.5,
  },
  markupPercentage: 10,
}

// Southwest Cargo configuration
export const southwestCargoConfig: ShippingConfiguration = {
  enabled: true, // ENABLED: Southwest Cargo is active
  testMode: false,
  defaultPackaging: {
    weight: 1.0, // Heavier packaging for freight
  },
  markupPercentage: 5, // Lower markup for freight
}

// Service codes mapping - Only services used by GangRun Printing
export const FEDEX_SERVICE_CODES = {
  FEDEX_GROUND: 'FEDEX_GROUND',
  GROUND_HOME_DELIVERY: 'GROUND_HOME_DELIVERY',
  FEDEX_2_DAY: 'FEDEX_2_DAY',
  STANDARD_OVERNIGHT: 'STANDARD_OVERNIGHT',
} as const

export const UPS_SERVICE_CODES = {
  GROUND: '03',
  THREE_DAY_SELECT: '12',
  SECOND_DAY_AIR: '02',
  NEXT_DAY_AIR: '01',
  NEXT_DAY_AIR_SAVER: '13',
} as const

// Service names for display
export const SERVICE_NAMES = {
  // FedEx - Only services used by GangRun Printing
  FEDEX_GROUND: 'FedEx Ground',
  GROUND_HOME_DELIVERY: 'FedEx Home Delivery',
  FEDEX_2_DAY: 'FedEx 2Day',
  STANDARD_OVERNIGHT: 'FedEx Standard Overnight',

  // UPS
  '03': 'UPS Ground',
  '12': 'UPS 3 Day Select',
  '02': 'UPS 2nd Day Air',
  '01': 'UPS Next Day Air',
  '13': 'UPS Next Day Air Saver',

  // Southwest Cargo
  SOUTHWEST_CARGO_PICKUP: 'Southwest Cargo Pickup',
  SOUTHWEST_CARGO_DASH: 'Southwest Cargo Dash',
} as const

// Default sender address (your warehouse)
export const DEFAULT_SENDER_ADDRESS = {
  street: '1300 Basswood Road',
  city: 'Schaumburg',
  state: 'IL',
  zipCode: '60173',
  country: 'US',
  isResidential: false,
}

// Carrier availability by state
export const CARRIER_AVAILABILITY: Record<Carrier, string[]> = {
  FEDEX: [], // Available in all states
  UPS: [], // Available in all states
  SOUTHWEST_CARGO: [
    'TX',
    'OK',
    'NM',
    'AR',
    'LA',
    'AZ',
    'CA',
    'NV',
    'CO',
    'UT',
    'FL',
    'GA',
    'AL',
    'TN',
    'MS',
    'SC',
    'NC',
    'KY',
    'MO',
    'KS',
  ], // Limited to Southwest's service area
}

// Real Southwest Cargo pricing based on actual rates
export const SOUTHWEST_CARGO_RATES = {
  pickup: {
    // Southwest Cargo Pickup pricing (cheaper, slower)
    weightTiers: [
      {
        maxWeight: 50,
        baseRate: 85.0,
        additionalPerPound: 0,
        handlingFee: 10.0,
      },
      {
        maxWeight: 100,
        baseRate: 133.0,
        additionalPerPound: 0,
        handlingFee: 10.0,
      },
      {
        maxWeight: Infinity,
        baseRate: 133.0,
        additionalPerPound: 1.75,
        handlingFee: 10.0,
      },
    ],
  },
  dash: {
    // Southwest Cargo Dash pricing (premium, faster)
    weightTiers: [
      {
        maxWeight: 50,
        baseRate: 80.0,
        additionalPerPound: 1.75,
        handlingFee: 0,
      },
      {
        maxWeight: Infinity,
        baseRate: 102.0,
        additionalPerPound: 1.75,
        handlingFee: 0,
      },
    ],
  },
}
