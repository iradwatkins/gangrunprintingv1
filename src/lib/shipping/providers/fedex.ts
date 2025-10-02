import axios, { type AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { Carrier } from '@prisma/client'
import {
  type ShippingAddress,
  type ShippingPackage,
  type ShippingRate,
  type ShippingLabel,
  type ShippingProvider,
  type TrackingInfo,
  type TrackingEvent,
} from '../interfaces'
import { fedexConfig, FEDEX_SERVICE_CODES, SERVICE_NAMES } from '../config'
import { roundWeight } from '../weight-calculator'

interface FedExAuthToken {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export class FedExProvider implements ShippingProvider {
  carrier = Carrier.FEDEX
  private client: AxiosInstance
  private authToken: FedExAuthToken | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    const baseURL = fedexConfig.testMode
      ? 'https://apis-sandbox.fedex.com'
      : process.env.FEDEX_API_ENDPOINT || 'https://apis.fedex.com'

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add retry logic for failed requests
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429
      },
    })
  }

  /**
   * Get OAuth2 token for FedEx API
   */
  private async authenticate(): Promise<void> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return // Token is still valid
    }

    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.FEDEX_API_KEY || '',
          client_secret: process.env.FEDEX_SECRET_KEY || '',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      this.authToken = response.data
      // Set token expiry with 5-minute buffer
      this.tokenExpiry = new Date(Date.now() + (this.authToken.expires_in - 300) * 1000)

      // Update default headers with auth token
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken.access_token}`
    } catch (error) {
      throw new Error('Failed to authenticate with FedEx API')
    }
  }

  /**
   * Get shipping rates from FedEx
   */
  async getRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    // If no API key, return test/estimated rates
    if (!process.env.FEDEX_API_KEY) {
      return this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode)
    }

    await this.authenticate()

    try {
      const requestBody = {
        accountNumber: {
          value: process.env.FEDEX_ACCOUNT_NUMBER,
        },
        requestedShipment: {
          shipper: {
            address: this.formatAddress(fromAddress),
          },
          recipient: {
            address: this.formatAddress(toAddress),
          },
          shipDateStamp: new Date().toISOString().split('T')[0],
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          rateRequestType: ['LIST', 'ACCOUNT'],
          requestedPackageLineItems: packages.map((pkg, index) => ({
            sequenceNumber: index + 1,
            weight: {
              units: 'LB',
              value: roundWeight(pkg.weight),
            },
            dimensions: pkg.dimensions
              ? {
                  length: Math.ceil(pkg.dimensions.length || 10),
                  width: Math.ceil(pkg.dimensions.width),
                  height: Math.ceil(pkg.dimensions.height),
                  units: 'IN',
                }
              : undefined,
          })),
        },
      }

      const response = await this.client.post('/rate/v1/rates/quotes', requestBody)

      if (!response.data.output?.rateReplyDetails) {
        return []
      }

      const rates: ShippingRate[] = response.data.output.rateReplyDetails
        .filter((detail: Record<string, unknown>) => {
          // Only include services we actually use
          const allowedServices = Object.values(FEDEX_SERVICE_CODES)
          return allowedServices.includes(detail.serviceType)
        })
        .map((detail: Record<string, unknown>) => {
          const ratedShipmentDetail = detail.ratedShipmentDetails?.[0]
          const totalCharge =
            ratedShipmentDetail?.totalNetCharge || ratedShipmentDetail?.totalNetFedExCharge

          // Use Ground Home Delivery name for residential ground shipments
          const serviceCode = detail.serviceType
          let serviceName = SERVICE_NAMES[detail.serviceType as keyof typeof SERVICE_NAMES]

          if (detail.serviceType === 'FEDEX_GROUND' && toAddress.isResidential) {
            serviceName = 'FedEx Home Delivery'
          }

          // Calculate actual transit days from FedEx API response
          let estimatedDays = this.getEstimatedDays(
            detail.serviceType,
            fromAddress.zipCode,
            toAddress.zipCode
          )
          if (detail.deliveryTimestamp || detail.commit?.dateDetail) {
            const deliveryDate = detail.deliveryTimestamp
              ? new Date(detail.deliveryTimestamp)
              : detail.commit?.dateDetail?.dayOfWeek
                ? new Date(detail.commit.dateDetail.dayOfWeek)
                : null

            if (deliveryDate) {
              const today = new Date()
              const diffTime = deliveryDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              if (diffDays > 0) {
                estimatedDays = diffDays
              }
            }
          }

          const markup = 1 + (fedexConfig.markupPercentage || 0) / 100

          return {
            carrier: this.carrier,
            serviceCode,
            serviceName,
            rateAmount: roundWeight(totalCharge * markup, 2),
            currency: 'USD',
            estimatedDays,
            deliveryDate: detail.deliveryTimestamp ? new Date(detail.deliveryTimestamp) : undefined,
            isGuaranteed: detail.commit?.dateDetail?.dayOfWeek !== undefined,
          }
        })

      return rates
    } catch (error) {
      // If API call fails, return test rates with zip-based transit estimates
      return this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode)
    }
  }

  /**
   * Create a shipping label with FedEx
   */
  async createLabel(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[],
    serviceCode: string
  ): Promise<ShippingLabel> {
    await this.authenticate()

    try {
      const requestBody = {
        accountNumber: {
          value: process.env.FEDEX_ACCOUNT_NUMBER,
        },
        requestedShipment: {
          shipper: {
            address: this.formatAddress(fromAddress),
            contact: {
              personName: 'Shipping Department',
              phoneNumber: '1234567890',
              companyName: 'GangRun Printing',
            },
          },
          recipient: {
            address: this.formatAddress(toAddress),
            contact: {
              personName: toAddress.street2 || 'Recipient',
              phoneNumber: '1234567890',
            },
          },
          shipDateStamp: new Date().toISOString().split('T')[0],
          serviceType: serviceCode,
          packagingType: 'YOUR_PACKAGING',
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          blockInsightVisibility: false,
          labelSpecification: {
            labelFormatType: 'COMMON2D',
            imageType: 'PDF',
            labelStockType: 'PAPER_4X6',
          },
          requestedPackageLineItems: packages.map((pkg, index) => ({
            sequenceNumber: index + 1,
            weight: {
              units: 'LB',
              value: roundWeight(pkg.weight),
            },
            dimensions: pkg.dimensions
              ? {
                  length: Math.ceil(pkg.dimensions.length || 10),
                  width: Math.ceil(pkg.dimensions.width),
                  height: Math.ceil(pkg.dimensions.height),
                  units: 'IN',
                }
              : undefined,
          })),
        },
      }

      const response = await this.client.post('/ship/v1/shipments', requestBody)

      const output = response.data.output
      const completedPackage =
        output.transactionShipments[0].completedShipmentDetail.completedPackageDetails[0]

      return {
        trackingNumber: completedPackage.trackingIds[0].trackingNumber,
        labelUrl: completedPackage.label.url || '',
        labelFormat: 'PDF',
        carrier: this.carrier,
      }
    } catch (error) {
      throw new Error('Failed to create FedEx shipping label')
    }
  }

  /**
   * Track a FedEx shipment
   */
  async track(trackingNumber: string): Promise<TrackingInfo> {
    await this.authenticate()

    try {
      const requestBody = {
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber,
            },
          },
        ],
        includeDetailedScans: true,
      }

      const response = await this.client.post('/track/v1/trackingnumbers', requestBody)

      const trackResult = response.data.output.completeTrackResults[0].trackResults[0]

      const events: TrackingEvent[] = (trackResult.scanEvents || []).map((event: Record<string, unknown>) => ({
        timestamp: new Date(event.date),
        location: `${event.scanLocation.city}, ${event.scanLocation.stateOrProvinceCode}`,
        status: event.derivedStatus || event.eventType,
        description: event.eventDescription,
      }))

      const status = this.mapTrackingStatus(trackResult.latestStatusDetail?.code)

      return {
        trackingNumber,
        carrier: this.carrier,
        status,
        currentLocation: trackResult.latestStatusDetail?.scanLocation?.city,
        estimatedDelivery: trackResult.estimatedDeliveryTimestamp
          ? new Date(trackResult.estimatedDeliveryTimestamp)
          : undefined,
        actualDelivery: trackResult.actualDeliveryTimestamp
          ? new Date(trackResult.actualDeliveryTimestamp)
          : undefined,
        events,
      }
    } catch (error) {
      throw new Error('Failed to track FedEx shipment')
    }
  }

  /**
   * Validate address with FedEx
   */
  async validateAddress(address: ShippingAddress): Promise<boolean> {
    await this.authenticate()

    try {
      const requestBody = {
        addressesToValidate: [
          {
            address: this.formatAddress(address),
          },
        ],
      }

      const response = await this.client.post('/address/v1/addresses/resolve', requestBody)

      const result = response.data.output.resolvedAddresses[0]
      return result.classification === 'BUSINESS' || result.classification === 'RESIDENTIAL'
    } catch (error) {
      return false
    }
  }

  /**
   * Cancel a FedEx shipment
   */
  async cancelShipment(trackingNumber: string): Promise<boolean> {
    await this.authenticate()

    try {
      const requestBody = {
        accountNumber: {
          value: process.env.FEDEX_ACCOUNT_NUMBER,
        },
        trackingNumber,
      }

      await this.client.put('/ship/v1/shipments/cancel', requestBody)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Format address for FedEx API
   */
  private formatAddress(address: ShippingAddress): Record<string, unknown> {
    return {
      streetLines: [address.street, address.street2].filter(Boolean),
      city: address.city,
      stateOrProvinceCode: address.state,
      postalCode: address.zipCode,
      countryCode: address.country || 'US',
      residential: address.isResidential || false,
    }
  }

  /**
   * Calculate estimated transit days based on zip code distance
   * More accurate than hardcoded values for sandbox/test mode
   */
  private calculateTransitDays(
    fromZip: string,
    toZip: string,
    serviceType: string
  ): number {
    // Service-specific transit times
    if (serviceType === 'STANDARD_OVERNIGHT') return 1
    if (serviceType === 'FEDEX_2_DAY') return 2

    // Ground service: estimate based on zip code proximity
    const from = parseInt(fromZip.substring(0, 3))
    const to = parseInt(toZip.substring(0, 3))
    const zipDiff = Math.abs(from - to)

    // Ground delivery estimates based on zip code zones
    if (zipDiff <= 50) return 1 // Same region (e.g., IL 601xx to IN 463xx)
    if (zipDiff <= 150) return 2 // Adjacent regions
    if (zipDiff <= 300) return 3 // 2-3 states away
    if (zipDiff <= 500) return 4 // Cross-country partial
    return 5 // Coast-to-coast
  }

  /**
   * Get estimated days for service type
   * Fallback when API doesn't provide delivery dates
   */
  private getEstimatedDays(
    serviceType: string,
    fromZip?: string,
    toZip?: string
  ): number {
    // If we have zip codes, calculate based on distance
    if (fromZip && toZip) {
      return this.calculateTransitDays(fromZip, toZip, serviceType)
    }

    // Conservative fallback estimates
    const estimates: Record<string, number> = {
      FEDEX_GROUND: 3,
      GROUND_HOME_DELIVERY: 3,
      FEDEX_2_DAY: 2,
      STANDARD_OVERNIGHT: 1,
    }
    return estimates[serviceType] || 3
  }

  /**
   * Map FedEx tracking status to our status
   */
  private mapTrackingStatus(fedexStatus: string): TrackingInfo['status'] {
    const statusMap: Record<string, TrackingInfo['status']> = {
      PU: 'in_transit',
      OD: 'in_transit',
      DE: 'in_transit',
      DL: 'delivered',
      RS: 'exception',
      CA: 'exception',
    }
    return statusMap[fedexStatus] || 'pending'
  }

  /**
   * Get test/estimated rates when API is not configured
   */
  private getTestRates(
    packages: ShippingPackage[],
    fromZip?: string,
    toZip?: string
  ): ShippingRate[] {
    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)
    const markup = 1 + (fedexConfig.markupPercentage || 0) / 100

    // Estimated rates based on typical FedEx pricing
    const baseRates = [
      {
        serviceCode: FEDEX_SERVICE_CODES.FEDEX_GROUND,
        serviceName: SERVICE_NAMES.FEDEX_GROUND,
        baseRate: 12.0 + totalWeight * 0.85,
        serviceType: 'FEDEX_GROUND',
      },
      {
        serviceCode: FEDEX_SERVICE_CODES.FEDEX_2_DAY,
        serviceName: SERVICE_NAMES.FEDEX_2_DAY,
        baseRate: 25.0 + totalWeight * 1.5,
        serviceType: 'FEDEX_2_DAY',
      },
      {
        serviceCode: FEDEX_SERVICE_CODES.STANDARD_OVERNIGHT,
        serviceName: SERVICE_NAMES.STANDARD_OVERNIGHT,
        baseRate: 45.0 + totalWeight * 2.0,
        serviceType: 'STANDARD_OVERNIGHT',
      },
    ]

    return baseRates.map((rate) => ({
      carrier: this.carrier,
      serviceCode: rate.serviceCode,
      serviceName: rate.serviceName,
      rateAmount: roundWeight(rate.baseRate * markup, 2),
      currency: 'USD',
      estimatedDays: this.getEstimatedDays(rate.serviceType, fromZip, toZip),
      isGuaranteed: false,
    }))
  }
}
