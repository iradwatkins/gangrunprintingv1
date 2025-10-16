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

// Service codes mapping - ALL FedEx services (30+ services)
export const FEDEX_SERVICE_CODES = {
  // Express Services
  FIRST_OVERNIGHT: 'FIRST_OVERNIGHT',
  PRIORITY_OVERNIGHT: 'PRIORITY_OVERNIGHT',
  STANDARD_OVERNIGHT: 'STANDARD_OVERNIGHT',
  FEDEX_2_DAY_AM: 'FEDEX_2_DAY_AM',
  FEDEX_2_DAY: 'FEDEX_2_DAY',
  FEDEX_EXPRESS_SAVER: 'FEDEX_EXPRESS_SAVER',

  // Ground Services
  FEDEX_GROUND: 'FEDEX_GROUND',
  GROUND_HOME_DELIVERY: 'GROUND_HOME_DELIVERY',
  FEDEX_REGIONAL_ECONOMY: 'FEDEX_REGIONAL_ECONOMY',

  // SmartPost
  SMART_POST: 'SMART_POST',

  // Freight Services
  FEDEX_1_DAY_FREIGHT: 'FEDEX_1_DAY_FREIGHT',
  FEDEX_2_DAY_FREIGHT: 'FEDEX_2_DAY_FREIGHT',
  FEDEX_3_DAY_FREIGHT: 'FEDEX_3_DAY_FREIGHT',
  FEDEX_FREIGHT_ECONOMY: 'FEDEX_FREIGHT_ECONOMY',
  FEDEX_FREIGHT_PRIORITY: 'FEDEX_FREIGHT_PRIORITY',
  FEDEX_NATIONAL_FREIGHT: 'FEDEX_NATIONAL_FREIGHT',

  // International Services
  INTERNATIONAL_ECONOMY: 'INTERNATIONAL_ECONOMY',
  INTERNATIONAL_PRIORITY: 'INTERNATIONAL_PRIORITY',
  INTERNATIONAL_FIRST: 'INTERNATIONAL_FIRST',
  INTERNATIONAL_GROUND: 'INTERNATIONAL_GROUND',
  FEDEX_INTERNATIONAL_CONNECT_PLUS: 'FEDEX_INTERNATIONAL_CONNECT_PLUS',
  FEDEX_INTERNATIONAL_PRIORITY_EXPRESS: 'FEDEX_INTERNATIONAL_PRIORITY_EXPRESS',

  // International Freight
  INTERNATIONAL_ECONOMY_FREIGHT: 'INTERNATIONAL_ECONOMY_FREIGHT',
  INTERNATIONAL_PRIORITY_FREIGHT: 'INTERNATIONAL_PRIORITY_FREIGHT',
} as const

export const UPS_SERVICE_CODES = {
  GROUND: '03',
  THREE_DAY_SELECT: '12',
  SECOND_DAY_AIR: '02',
  NEXT_DAY_AIR: '01',
  NEXT_DAY_AIR_SAVER: '13',
} as const

// Service names for display (ALL 30+ FedEx services)
export const SERVICE_NAMES = {
  // FedEx Express Services
  FIRST_OVERNIGHT: 'FedEx First Overnight',
  PRIORITY_OVERNIGHT: 'FedEx Priority Overnight',
  STANDARD_OVERNIGHT: 'FedEx Standard Overnight',
  FEDEX_2_DAY_AM: 'FedEx 2Day A.M.',
  FEDEX_2_DAY: 'FedEx 2Day',
  FEDEX_EXPRESS_SAVER: 'FedEx Express Saver',

  // FedEx Ground Services
  FEDEX_GROUND: 'FedEx Ground',
  GROUND_HOME_DELIVERY: 'FedEx Ground Home Delivery',
  FEDEX_REGIONAL_ECONOMY: 'FedEx Regional Economy',

  // FedEx SmartPost
  SMART_POST: 'FedEx Ground Economy',

  // FedEx Freight
  FEDEX_1_DAY_FREIGHT: 'FedEx 1 Day Freight',
  FEDEX_2_DAY_FREIGHT: 'FedEx 2 Day Freight',
  FEDEX_3_DAY_FREIGHT: 'FedEx 3 Day Freight',
  FEDEX_FREIGHT_ECONOMY: 'FedEx Freight Economy',
  FEDEX_FREIGHT_PRIORITY: 'FedEx Freight Priority',
  FEDEX_NATIONAL_FREIGHT: 'FedEx National Freight',

  // FedEx International
  INTERNATIONAL_ECONOMY: 'FedEx International Economy',
  INTERNATIONAL_PRIORITY: 'FedEx International Priority',
  INTERNATIONAL_FIRST: 'FedEx International First',
  INTERNATIONAL_GROUND: 'FedEx International Ground',
  FEDEX_INTERNATIONAL_CONNECT_PLUS: 'FedEx International Connect Plus',
  FEDEX_INTERNATIONAL_PRIORITY_EXPRESS: 'FedEx International Priority Express',

  // FedEx International Freight
  INTERNATIONAL_ECONOMY_FREIGHT: 'FedEx International Economy Freight',
  INTERNATIONAL_PRIORITY_FREIGHT: 'FedEx International Priority Freight',

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

// Real Southwest Cargo pricing based on actual rates from WooCommerce
export const SOUTHWEST_CARGO_RATES = {
  pickup: {
    // Southwest Cargo Pickup pricing (cheaper, slower, airport pickup)
    weightTiers: [
      {
        maxWeight: 50,
        baseRate: 80.0,
        additionalPerPound: 0,
        handlingFee: 0,
      },
      {
        maxWeight: 100,
        baseRate: 102.0,
        additionalPerPound: 1.75,
        handlingFee: 0,
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
    // Southwest Cargo Dash pricing (premium, faster, next available flight)
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
}
