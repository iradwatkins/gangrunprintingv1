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
    console.log('🛫 [Southwest Cargo] getRates called')
    console.log('   - Destination state:', toAddress.state)
    console.log('   - Packages:', packages.length, 'packages')

    // Check if Southwest Cargo serves the destination state
    if (!this.isServiceAvailable(toAddress.state)) {
      console.log('❌ [Southwest Cargo] Service NOT available for state:', toAddress.state)
      console.log('   - Available states:', CARRIER_AVAILABILITY[Carrier.SOUTHWEST_CARGO].join(', '))
      return []
    }

    console.log('✅ [Southwest Cargo] Service available for', toAddress.state)

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
    const markup = 1 + (southwestCargoConfig.markupPercentage || 0) / 100
    console.log('   - Markup percentage:', southwestCargoConfig.markupPercentage, '%')
    console.log('   - Markup multiplier:', markup)

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

    console.log('✅ [Southwest Cargo] Returning', rates.length, 'rates:')
    rates.forEach((rate, index) => {
      console.log(`   ${index + 1}. ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`)
    })

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
   * Calculate Southwest Cargo Dash rate based on real pricing structure
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
   * Generate a tracking number for Southwest Cargo
   */
  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SWC${timestamp}${random}`
  }
}
