/**
 * Southwest Cargo Configuration
 * Pricing matches WooCommerce implementation exactly
 */

import type { SouthwestCargoRates } from './types'

/**
 * Southwest Cargo pricing structure (from WooCommerce)
 * Based on 82 airports nationwide
 */
export const SOUTHWEST_CARGO_RATES: SouthwestCargoRates = {
  pickup: {
    // Southwest Cargo Pickup - Airport pickup service
    weightTiers: [
      {
        // 0-50 lbs
        maxWeight: 50,
        baseRate: 80.0,
        additionalPerPound: 0,
        handlingFee: 0,
      },
      {
        // 51-100 lbs
        maxWeight: 100,
        baseRate: 102.0,
        additionalPerPound: 1.75,
        handlingFee: 0,
      },
      {
        // 101+ lbs
        maxWeight: Infinity,
        baseRate: 133.0,
        additionalPerPound: 1.75,
        handlingFee: 10.0,
      },
    ],
  },
  dash: {
    // Southwest Cargo Dash - Next available flight (premium)
    weightTiers: [
      {
        // 0-50 lbs
        maxWeight: 50,
        baseRate: 85.0,
        additionalPerPound: 0,
        handlingFee: 10.0,
      },
      {
        // 51-100 lbs
        maxWeight: 100,
        baseRate: 133.0,
        additionalPerPound: 0,
        handlingFee: 10.0,
      },
      {
        // 101+ lbs
        maxWeight: Infinity,
        baseRate: 133.0,
        additionalPerPound: 1.75,
        handlingFee: 10.0,
      },
    ],
  },
}

/**
 * Module configuration
 */
export const SOUTHWEST_CARGO_CONFIG = {
  enabled: true,
  priority: 2, // After FedEx (priority 1)
  testMode: false,
  markupPercentage: 5, // 5% markup on rates
  defaultPackaging: {
    weight: 1.0, // Heavier packaging for freight
  },
}

/**
 * Service names for display
 */
export const SERVICE_NAMES = {
  SOUTHWEST_CARGO_PICKUP: 'Southwest Cargo Pickup',
  SOUTHWEST_CARGO_DASH: 'Southwest Cargo Dash',
} as const
