import { Carrier } from '@prisma/client'
import {
  type ShippingAddress,
  type ShippingPackage,
  type ShippingRate,
  type ShippingLabel,
  type ShippingProvider,
  type TrackingInfo,
} from '../interfaces'
import {
  SOUTHWEST_CARGO_RATES,
  CARRIER_AVAILABILITY,
  southwestCargoConfig,
} from '../config'
import { roundWeight, ensureMinimumWeight } from '../weight-calculator'

export class SouthwestCargoProvider implements ShippingProvider {
  carrier = Carrier.SOUTHWEST_CARGO

  /**
   * Calculate shipping rates based on weight
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

    // Calculate standard rate
    const standardRate = this.calculateRate(billableWeight)
    const expressRate = standardRate * SOUTHWEST_CARGO_RATES.expressMultiplier

    // Apply markup if configured
    const markup = 1 + (southwestCargoConfig.markupPercentage || 0) / 100

    const rates: ShippingRate[] = [
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_STANDARD',
        serviceName: 'Southwest Cargo Standard',
        rateAmount: roundWeight(standardRate * markup, 2),
        currency: 'USD',
        estimatedDays: 3, // Standard delivery time
        isGuaranteed: false,
      },
      {
        carrier: this.carrier,
        serviceCode: 'SOUTHWEST_CARGO_EXPRESS',
        serviceName: 'Southwest Cargo Express',
        rateAmount: roundWeight(expressRate * markup, 2),
        currency: 'USD',
        estimatedDays: 1, // Express delivery
        isGuaranteed: true,
      },
    ]

    return rates
  }

  /**
   * Create a shipping label (manual process for Southwest Cargo)
   */
  async createLabel(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[],
    serviceCode: string
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
   * Calculate rate based on weight breaks
   */
  private calculateRate(weight: number): number {
    // Find the appropriate rate tier
    const rateTier = SOUTHWEST_CARGO_RATES.weightBreaks.find(
      (tier) => weight <= tier.upTo
    )

    if (!rateTier) {
      // Use the last tier for weights above all breaks
      const lastTier = SOUTHWEST_CARGO_RATES.weightBreaks[
        SOUTHWEST_CARGO_RATES.weightBreaks.length - 1
      ]
      return Math.max(
        weight * lastTier.ratePerPound,
        SOUTHWEST_CARGO_RATES.minimumCharge
      )
    }

    const calculatedRate = weight * rateTier.ratePerPound
    return Math.max(calculatedRate, SOUTHWEST_CARGO_RATES.minimumCharge)
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