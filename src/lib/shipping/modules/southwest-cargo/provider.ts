/**
 * Southwest Cargo Shipping Provider
 * Handles rate calculation for 82 airports nationwide
 */

import { Carrier } from '@prisma/client'
import type {
  ShippingAddress,
  ShippingPackage,
  ShippingRate,
  ShippingLabel,
  ShippingProvider,
  TrackingInfo,
} from '../../interfaces'
import { SOUTHWEST_CARGO_RATES, SOUTHWEST_CARGO_CONFIG } from './config'
import { isStateAvailable } from './airport-availability'
import { roundWeight, ensureMinimumWeight } from '../../weight-calculator'

export class SouthwestCargoProvider implements ShippingProvider {
  carrier = Carrier.SOUTHWEST_CARGO

  /**
   * Calculate shipping rates based on 82 airports
   */
  async getRates(
    _fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    // Check if destination has Southwest Cargo airport (from 82 airports)
    const hasAirport = await isStateAvailable(toAddress.state)

    if (!hasAirport) {
      return []
    }

    // Calculate total weight
    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)
    const billableWeight = ensureMinimumWeight(roundWeight(totalWeight))

    // Calculate both PICKUP and DASH rates
    // Both require customer airport pickup (no home delivery)
    const pickupRate = this.calculatePickupRate(billableWeight)
    const dashRate = this.calculateDashRate(billableWeight)

    // Apply markup if configured
    const markup = 1 + (SOUTHWEST_CARGO_CONFIG.markupPercentage || 0) / 100

    const rates: ShippingRate[] = [
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_PICKUP',
        serviceName: 'Southwest Cargo Pickup',
        rateAmount: roundWeight(pickupRate * markup, 2),
        currency: 'USD',
        estimatedDays: 3, // Standard service - 3 business days
        isGuaranteed: false,
      },
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_DASH',
        serviceName: 'Southwest Cargo Dash (Next Flight Guaranteed)',
        rateAmount: roundWeight(dashRate * markup, 2),
        currency: 'USD',
        estimatedDays: 1, // Premium - next available flight
        isGuaranteed: true,
      },
    ]

    return rates
  }

  /**
   * Create a shipping label
   */
  async createLabel(
    _fromAddress: ShippingAddress,
    _toAddress: ShippingAddress,
    _packages: ShippingPackage[],
    _serviceCode: string
  ): Promise<ShippingLabel> {
    const trackingNumber = this.generateTrackingNumber()

    return {
      trackingNumber,
      labelUrl: `/api/shipping/label/southwest/${trackingNumber}`,
      labelFormat: 'PDF',
      carrier: this.carrier,
    }
  }

  /**
   * Track a shipment
   */
  async track(trackingNumber: string): Promise<TrackingInfo> {
    return {
      trackingNumber,
      carrier: this.carrier,
      status: 'in_transit',
      currentLocation: 'In Transit',
      events: [
        {
          timestamp: new Date(),
          location: 'Southwest Cargo Facility',
          status: 'in_transit',
          description: 'Package in transit',
        },
      ],
    }
  }

  /**
   * Validate an address (checks if airport exists in destination)
   */
  async validateAddress(address: ShippingAddress): Promise<boolean> {
    return isStateAvailable(address.state)
  }

  /**
   * Calculate Southwest Cargo Pickup rate (Standard Service)
   * Formula: baseRate + (weight × additionalPerPound) for 51+ lbs tier
   */
  private calculatePickupRate(weight: number): number {
    const pickupTiers = SOUTHWEST_CARGO_RATES.pickup.weightTiers

    for (const tier of pickupTiers) {
      if (weight <= tier.maxWeight) {
        // If no per-pound charge, use flat rate
        if (tier.additionalPerPound === 0) {
          return tier.baseRate + tier.handlingFee
        }

        // For 51+ lbs: multiply full weight by per-pound rate
        const additionalCost = weight * tier.additionalPerPound
        return tier.baseRate + additionalCost + tier.handlingFee
      }
    }

    // Fallback
    const lastTier = pickupTiers[pickupTiers.length - 1]
    const additionalCost = weight * lastTier.additionalPerPound
    return lastTier.baseRate + additionalCost + lastTier.handlingFee
  }

  /**
   * Calculate Southwest Cargo Dash rate
   * Formula varies by tier:
   * - Tiers with 0 additionalPerPound: baseRate + handlingFee (flat rate)
   * - Tiers with additionalPerPound > 0: baseRate + ((weight - tierThreshold) × additionalPerPound) + handlingFee
   *
   * Example: 150 lbs in 101+ tier with baseRate $148, additionalPerPound $1.90
   * = $148 + ((150 - 100) × $1.90) = $148 + $95 = $243
   */
  private calculateDashRate(weight: number): number {
    const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers
    let previousTierMax = 0

    for (const tier of dashTiers) {
      if (weight <= tier.maxWeight) {
        // If no per-pound charge, use flat rate
        if (tier.additionalPerPound === 0) {
          return tier.baseRate + tier.handlingFee
        }

        // Calculate weight over the previous tier's maximum
        const weightOverThreshold = weight - previousTierMax
        const additionalCost = weightOverThreshold * tier.additionalPerPound

        return tier.baseRate + additionalCost + tier.handlingFee
      }
      previousTierMax = tier.maxWeight
    }

    // Fallback (shouldn't happen with Infinity maxWeight)
    const lastTier = dashTiers[dashTiers.length - 1]
    const weightOverThreshold = weight - previousTierMax
    const additionalCost = weightOverThreshold * lastTier.additionalPerPound
    return lastTier.baseRate + additionalCost + lastTier.handlingFee
  }

  /**
   * Generate a tracking number
   */
  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SWC${timestamp}${random}`
  }
}
