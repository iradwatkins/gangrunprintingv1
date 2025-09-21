import axios, { AxiosInstance } from 'axios'
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
import { upsConfig, UPS_SERVICE_CODES, SERVICE_NAMES } from '../config'
import { roundWeight } from '../weight-calculator'

interface UPSAuthToken {
  access_token: string
  token_type: string
  expires_in: number
  issued_at: string
}

export class UPSProvider implements ShippingProvider {
  carrier = Carrier.UPS
  private client: AxiosInstance
  private authToken: UPSAuthToken | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    const baseURL = upsConfig.testMode
      ? 'https://wwwcie.ups.com/api'
      : process.env.UPS_API_ENDPOINT || 'https://onlinetools.ups.com/api'

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429
        )
      },
    })
  }

  /**
   * Get OAuth2 token for UPS API
   */
  private async authenticate(): Promise<void> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return // Token is still valid
    }

    try {
      const authString = Buffer.from(
        `${process.env.UPS_USERNAME}:${process.env.UPS_PASSWORD}`
      ).toString('base64')

      const response = await axios.post(
        `${this.client.defaults.baseURL}/security/v1/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${authString}`,
            'x-merchant-id': process.env.UPS_ACCESS_LICENSE_NUMBER || '',
          },
        }
      )

      this.authToken = response.data
      // Set token expiry with 5-minute buffer
      this.tokenExpiry = new Date(
        Date.now() + (this.authToken.expires_in - 300) * 1000
      )

      // Update default headers
      this.client.defaults.headers.common['Authorization'] =
        `Bearer ${this.authToken.access_token}`
    } catch (error) {
      console.error('UPS authentication failed:', error)
      throw new Error('Failed to authenticate with UPS API')
    }
  }

  /**
   * Get shipping rates from UPS
   */
  async getRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    await this.authenticate()

    try {
      const requestBody = {
        RateRequest: {
          Request: {
            TransactionReference: {
              CustomerContext: 'GangRun Printing Rate Request',
            },
          },
          Shipment: {
            Shipper: {
              Name: 'GangRun Printing',
              ShipperNumber: process.env.UPS_ACCESS_LICENSE_NUMBER,
              Address: this.formatAddress(fromAddress),
            },
            ShipTo: {
              Name: 'Customer',
              Address: this.formatAddress(toAddress),
            },
            ShipFrom: {
              Name: 'GangRun Printing',
              Address: this.formatAddress(fromAddress),
            },
            Package: packages.map((pkg) => ({
              PackagingType: {
                Code: '02', // Customer packaging
              },
              Dimensions: pkg.dimensions
                ? {
                    UnitOfMeasurement: {
                      Code: 'IN',
                    },
                    Length: Math.ceil(pkg.dimensions.length || 10).toString(),
                    Width: Math.ceil(pkg.dimensions.width).toString(),
                    Height: Math.ceil(pkg.dimensions.height).toString(),
                  }
                : undefined,
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'LBS',
                },
                Weight: roundWeight(pkg.weight).toString(),
              },
            })),
          },
        },
      }

      const response = await this.client.post('/rating/v2403/Rate', requestBody, {
        params: {
          additionalinfo: 'timeintransit',
        },
      })

      if (!response.data.RateResponse?.RatedShipment) {
        return []
      }

      const rates: ShippingRate[] = response.data.RateResponse.RatedShipment
        .filter((shipment: any) => shipment.Service.Code in SERVICE_NAMES)
        .map((shipment: any) => {
          const serviceCode = shipment.Service.Code
          const totalCharge = parseFloat(shipment.TotalCharges.MonetaryValue)
          const estimatedDays = this.getEstimatedDays(serviceCode)
          const markup = 1 + (upsConfig.markupPercentage || 0) / 100

          const timeInTransit = shipment.TimeInTransit
          let deliveryDate: Date | undefined
          if (timeInTransit?.ServiceSummary?.EstimatedArrival) {
            const arrival = timeInTransit.ServiceSummary.EstimatedArrival
            deliveryDate = new Date(`${arrival.Date}T${arrival.Time || '00:00:00'}`)
          }

          return {
            carrier: this.carrier,
            serviceCode,
            serviceName: SERVICE_NAMES[serviceCode as keyof typeof SERVICE_NAMES],
            rateAmount: roundWeight(totalCharge * markup, 2),
            currency: shipment.TotalCharges.CurrencyCode,
            estimatedDays,
            deliveryDate,
            isGuaranteed: shipment.GuaranteedDelivery?.BusinessDaysInTransit !== undefined,
          }
        })

      return rates
    } catch (error) {
      console.error('UPS rate request failed:', error)
      return []
    }
  }

  /**
   * Create a shipping label with UPS
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
        ShipmentRequest: {
          Request: {
            TransactionReference: {
              CustomerContext: 'GangRun Printing Shipment',
            },
          },
          Shipment: {
            Description: 'Print Products',
            Shipper: {
              Name: 'GangRun Printing',
              AttentionName: 'Shipping Department',
              ShipperNumber: process.env.UPS_ACCESS_LICENSE_NUMBER,
              Phone: {
                Number: '1234567890',
              },
              Address: this.formatAddress(fromAddress),
            },
            ShipTo: {
              Name: 'Customer',
              AttentionName: toAddress.street2 || 'Recipient',
              Phone: {
                Number: '1234567890',
              },
              Address: this.formatAddress(toAddress),
            },
            ShipFrom: {
              Name: 'GangRun Printing',
              AttentionName: 'Shipping Department',
              Phone: {
                Number: '1234567890',
              },
              Address: this.formatAddress(fromAddress),
            },
            PaymentInformation: {
              ShipmentCharge: {
                Type: '01', // Transportation
                BillShipper: {
                  AccountNumber: process.env.UPS_ACCESS_LICENSE_NUMBER,
                },
              },
            },
            Service: {
              Code: serviceCode,
            },
            Package: packages.map((pkg) => ({
              PackagingType: {
                Code: '02', // Customer packaging
              },
              Dimensions: pkg.dimensions
                ? {
                    UnitOfMeasurement: {
                      Code: 'IN',
                    },
                    Length: Math.ceil(pkg.dimensions.length || 10).toString(),
                    Width: Math.ceil(pkg.dimensions.width).toString(),
                    Height: Math.ceil(pkg.dimensions.height).toString(),
                  }
                : undefined,
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'LBS',
                },
                Weight: roundWeight(pkg.weight).toString(),
              },
            })),
            LabelSpecification: {
              LabelImageFormat: {
                Code: 'PDF',
              },
              LabelStockSize: {
                Height: '6',
                Width: '4',
              },
            },
          },
        },
      }

      const response = await this.client.post('/shipping/v2403/shipments', requestBody)

      const shipmentResult = response.data.ShipmentResponse.ShipmentResults
      const packageResult = shipmentResult.PackageResults[0]

      return {
        trackingNumber: packageResult.TrackingNumber,
        labelUrl: packageResult.ShippingLabel.GraphicImage,
        labelFormat: 'PDF',
        carrier: this.carrier,
      }
    } catch (error) {
      console.error('UPS label creation failed:', error)
      throw new Error('Failed to create UPS shipping label')
    }
  }

  /**
   * Track a UPS shipment
   */
  async track(trackingNumber: string): Promise<TrackingInfo> {
    await this.authenticate()

    try {
      const response = await this.client.get(`/track/v1/details/${trackingNumber}`, {
        params: {
          locale: 'en_US',
        },
      })

      const shipment = response.data.trackResponse.shipment[0]
      const package_ = shipment.package[0]

      const events: TrackingEvent[] = (package_.activity || []).map((activity: any) => ({
        timestamp: new Date(`${activity.date} ${activity.time}`),
        location: activity.location?.address
          ? `${activity.location.address.city}, ${activity.location.address.stateProvince}`
          : 'Unknown',
        status: activity.status.type,
        description: activity.status.description,
      }))

      const currentStatus = package_.currentStatus?.description
      const status = this.mapTrackingStatus(currentStatus)

      return {
        trackingNumber,
        carrier: this.carrier,
        status,
        currentLocation: package_.activity?.[0]?.location?.address?.city,
        estimatedDelivery: shipment.deliveryDate
          ? new Date(shipment.deliveryDate[0].date)
          : undefined,
        actualDelivery:
          status === 'delivered' && shipment.deliveryDate
            ? new Date(shipment.deliveryDate[0].date)
            : undefined,
        events,
      }
    } catch (error) {
      console.error('UPS tracking failed:', error)
      throw new Error('Failed to track UPS shipment')
    }
  }

  /**
   * Validate address with UPS
   */
  async validateAddress(address: ShippingAddress): Promise<boolean> {
    await this.authenticate()

    try {
      const requestBody = {
        XAVRequest: {
          AddressKeyFormat: {
            AddressLine: [address.street, address.street2].filter(Boolean),
            PoliticalDivision2: address.city,
            PoliticalDivision1: address.state,
            PostcodePrimaryLow: address.zipCode,
            CountryCode: address.country || 'US',
          },
        },
      }

      const response = await this.client.post('/addressvalidation/v1/1', requestBody, {
        params: {
          regionalrequestindicator: 'string',
        },
      })

      const result = response.data.XAVResponse
      return result.Response.ResponseStatus.Code === '1'
    } catch (error) {
      console.error('UPS address validation failed:', error)
      return false
    }
  }

  /**
   * Cancel a UPS shipment
   */
  async cancelShipment(trackingNumber: string): Promise<boolean> {
    await this.authenticate()

    try {
      await this.client.delete(`/shipping/v2403/shipments/cancel/${trackingNumber}`)
      return true
    } catch (error) {
      console.error('UPS shipment cancellation failed:', error)
      return false
    }
  }

  /**
   * Format address for UPS API
   */
  private formatAddress(address: ShippingAddress): any {
    return {
      AddressLine: [address.street, address.street2].filter(Boolean),
      City: address.city,
      StateProvinceCode: address.state,
      PostalCode: address.zipCode,
      CountryCode: address.country || 'US',
      ResidentialAddressIndicator: address.isResidential ? 'Y' : undefined,
    }
  }

  /**
   * Get estimated days for service code
   */
  private getEstimatedDays(serviceCode: string): number {
    const estimates: Record<string, number> = {
      '03': 5, // Ground
      '12': 3, // 3 Day Select
      '02': 2, // 2nd Day Air
      '01': 1, // Next Day Air
      '13': 1, // Next Day Air Saver
    }
    return estimates[serviceCode] || 3
  }

  /**
   * Map UPS tracking status to our status
   */
  private mapTrackingStatus(upsStatus: string): TrackingInfo['status'] {
    const lowerStatus = upsStatus?.toLowerCase() || ''
    if (lowerStatus.includes('delivered')) return 'delivered'
    if (lowerStatus.includes('transit')) return 'in_transit'
    if (lowerStatus.includes('exception')) return 'exception'
    return 'pending'
  }
}