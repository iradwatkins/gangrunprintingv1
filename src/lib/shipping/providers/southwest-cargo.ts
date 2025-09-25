import { Carrier } from '@prisma/client'
import {
  type ShippingAddress,
  type ShippingPackage,
  type ShippingRate,
  type ShippingLabel,
  type ShippingProvider,
  type TrackingInfo,
} from '../interfaces'
import { SOUTHWEST_CARGO_RATES, CARRIER_AVAILABILITY, southwestCargoConfig } from '../config'
import { roundWeight, ensureMinimumWeight } from '../weight-calculator'

export class SouthwestCargoProvider implements ShippingProvider {
  carrier = Carrier.SOUTHWEST_CARGO

  /**
   * Calculate shipping rates based on real Southwest Cargo pricing
   */
  async getRates(
    _fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    // Check if Southwest Cargo serves the destination state
    if (!this.isServiceAvailable(toAddress.state)) {
      return []
    }

    // Calculate total weight
    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)
    const billableWeight = ensureMinimumWeight(roundWeight(totalWeight))

    // Calculate pickup and dash rates
    const pickupRate = this.calculatePickupRate(billableWeight)
    const dashRate = this.calculateDashRate(billableWeight)

    // Apply markup if configured
    const markup = 1 + (southwestCargoConfig.markupPercentage || 0) / 100

    const rates: ShippingRate[] = [
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_PICKUP',
        serviceName: 'Southwest Cargo Pickup',
        rateAmount: roundWeight(pickupRate * markup, 2), // FIXED: Use pickup rate for pickup service
        currency: 'USD',
        estimatedDays: 3, // Standard pickup delivery time
        isGuaranteed: false,
      },
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_DASH',
        serviceName: 'Southwest Cargo Dash',
        rateAmount: roundWeight(dashRate * markup, 2), // FIXED: Use dash rate for dash service
        currency: 'USD',
        estimatedDays: 1, // Dash delivery (next available flight)
        isGuaranteed: true,
      },
    ]

    return rates
  }

  /**
   * Create a shipping label (manual process for Southwest Cargo)
   */
  async createLabel(
    _fromAddress: ShippingAddress,
    _toAddress: ShippingAddress,
    _packages: ShippingPackage[],
    _serviceCode: string
  ): Promise<ShippingLabel> {
    // Generate a mock tracking number for Southwest Cargo
    // In production, this would be obtained from Southwest's system
    const trackingNumber = this.generateTrackingNumber()

    // Southwest Cargo typically uses manual label creation
    // This would integrate with their system in production
    return {
      trackingNumber,
      labelUrl: `/api/shipping/label/southwest/${trackingNumber}`,
      labelFormat: 'PDF',
      carrier: this.carrier,
    }
  }

  /**
   * Track a shipment (manual process for Southwest Cargo)
   */
  async track(trackingNumber: string): Promise<TrackingInfo> {
    // Southwest Cargo tracking is typically manual
    // This would integrate with their system if available
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
   * Validate an address (basic validation for Southwest Cargo)
   */
  async validateAddress(address: ShippingAddress): Promise<boolean> {
    // Basic validation - check if state is in service area
    return this.isServiceAvailable(address.state)
  }

  /**
   * Check if Southwest Cargo serves a state
   */
  private isServiceAvailable(state: string): boolean {
    const serviceArea = CARRIER_AVAILABILITY[Carrier.SOUTHWEST_CARGO]
    return serviceArea.length === 0 || serviceArea.includes(state.toUpperCase())
  }

  /**
   * Calculate Southwest Cargo Pickup rate based on real pricing structure
   */
  private calculatePickupRate(weight: number): number {
    const pickupTiers = SOUTHWEST_CARGO_RATES.pickup.weightTiers

    for (const tier of pickupTiers) {
      if (weight <= tier.maxWeight) {
        // Pickup always has additional per-pound charge on total weight
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
   * Calculate Southwest Cargo Dash rate based on real pricing structure
   */
  private calculateDashRate(weight: number): number {
    const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers

    // Find the correct tier
    for (let i = 0; i < dashTiers.length; i++) {
      const tier = dashTiers[i]

      if (weight <= tier.maxWeight) {
        // Base rate + handling fee + any additional per-pound charges
        let additionalCost = 0

        // For the 101+ lb tier, charge additional only for weight over 100 lbs
        if (tier.additionalPerPound > 0 && i === dashTiers.length - 1 && weight > 100) {
          const overageWeight = weight - 100
          additionalCost = overageWeight * tier.additionalPerPound
        }

        return tier.baseRate + additionalCost + tier.handlingFee
      }
    }

    // Fallback (shouldn't happen)
    const lastTier = dashTiers[dashTiers.length - 1]
    const overageWeight = Math.max(0, weight - 100)
    const additionalCost = overageWeight * lastTier.additionalPerPound
    return lastTier.baseRate + additionalCost + lastTier.handlingFee
  }

  /**
   * Generate a tracking number for Southwest Cargo
   */
  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SWC${timestamp}${random}`
  }
}
