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
    console.log('🛫 [Southwest Cargo] getRates called for 82 airports network')
    console.log('   - Destination state:', toAddress.state)
    console.log('   - Packages:', packages.length, 'packages')

    // Check if destination has Southwest Cargo airport (from 82 airports)
    const hasAirport = await isStateAvailable(toAddress.state)

    if (!hasAirport) {
      console.log('❌ [Southwest Cargo] No airport available in state:', toAddress.state)
      return []
    }

    console.log('✅ [Southwest Cargo] Airport available in', toAddress.state)

    // Calculate total weight
    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)
    const billableWeight = ensureMinimumWeight(roundWeight(totalWeight))

    console.log('📦 [Southwest Cargo] Weight calculation:')
    console.log('   - Total weight:', totalWeight, 'lbs')
    console.log('   - Billable weight:', billableWeight, 'lbs')

    // Calculate pickup and dash rates
    const pickupRate = this.calculatePickupRate(billableWeight)
    const dashRate = this.calculateDashRate(billableWeight)

    console.log('💰 [Southwest Cargo] Rate calculation:')
    console.log('   - Pickup rate (before markup):', pickupRate)
    console.log('   - Dash rate (before markup):', dashRate)

    // Apply markup if configured
    const markup = 1 + (SOUTHWEST_CARGO_CONFIG.markupPercentage || 0) / 100
    console.log('   - Markup percentage:', SOUTHWEST_CARGO_CONFIG.markupPercentage, '%')
    console.log('   - Markup multiplier:', markup)

    const rates: ShippingRate[] = [
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_PICKUP',
        serviceName: 'Southwest Cargo Pickup',
        rateAmount: roundWeight(pickupRate * markup, 2),
        currency: 'USD',
        estimatedDays: 3, // Standard pickup delivery time
        isGuaranteed: false,
      },
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_DASH',
        serviceName: 'Southwest Cargo Dash',
        rateAmount: roundWeight(dashRate * markup, 2),
        currency: 'USD',
        estimatedDays: 1, // Dash delivery (next available flight)
        isGuaranteed: true,
      },
    ]

    console.log('✅ [Southwest Cargo] Returning', rates.length, 'rates:')
    rates.forEach((rate, index) => {
      console.log(
        `   ${index + 1}. ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`
      )
    })

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
   * Calculate Southwest Cargo Pickup rate
   * Formula: baseRate + (weight × additionalPerPound) + handlingFee
   */
  private calculatePickupRate(weight: number): number {
    const pickupTiers = SOUTHWEST_CARGO_RATES.pickup.weightTiers

    for (const tier of pickupTiers) {
      if (weight <= tier.maxWeight) {
        const additionalCost = weight * tier.additionalPerPound
        return tier.baseRate + additionalCost + tier.handlingFee
      }
    }

    // Fallback (shouldn't happen with Infinity maxWeight)
    const lastTier = pickupTiers[pickupTiers.length - 1]
    const additionalCost = weight * lastTier.additionalPerPound
    return lastTier.baseRate + additionalCost + lastTier.handlingFee
  }

  /**
   * Calculate Southwest Cargo Dash rate
   * Formula: baseRate + (weight × additionalPerPound) + handlingFee
   */
  private calculateDashRate(weight: number): number {
    const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers

    for (const tier of dashTiers) {
      if (weight <= tier.maxWeight) {
        const additionalCost = weight * tier.additionalPerPound
        return tier.baseRate + additionalCost + tier.handlingFee
      }
    }

    // Fallback (shouldn't happen with Infinity maxWeight)
    const lastTier = dashTiers[dashTiers.length - 1]
    const additionalCost = weight * lastTier.additionalPerPound
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
