import { MAX_FILE_SIZE, TAX_RATE, DEFAULT_WAREHOUSE_ZIP } from '@/lib/constants'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateRequestId } from '@/lib/api-response'
import { FedExProviderEnhanced } from '@/lib/shipping/providers/fedex'

// Request validation schema
const RateRequestSchema = z.object({
  destination: z.object({
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    state: z.string().length(2),
    city: z.string(),
    street: z.string().optional(),
    countryCode: z.string().default('US'),
    isResidential: z.boolean().optional().default(true),
  }),
  package: z.object({
    weight: z.number().min(0.1).max(500), // increased to support freight
    dimensions: z
      .object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
  }),
  packages: z
    .array(
      z.object({
        weight: z.number().min(0.1),
        dimensions: z
          .object({
            length: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .optional(),
      })
    )
    .optional(),
  providers: z.array(z.enum(['fedex', 'southwest-dash'])).default(['fedex', 'southwest-dash']),
})

// Default origin (Gang Run Printing warehouse)
const DEFAULT_ORIGIN = {
  street: '1300 Basswood Road',
  city: 'Schaumburg',
  state: 'IL',
  zipCode: '60173',
  country: 'US',
  isResidential: false,
}

// Initialize FedEx Enhanced Provider (singleton)
let fedexProvider: FedExProviderEnhanced | null = null

function getFedExProvider(): FedExProviderEnhanced {
  if (!fedexProvider) {
    fedexProvider = new FedExProviderEnhanced({
      clientId: process.env.FEDEX_API_KEY || '',
      clientSecret: process.env.FEDEX_SECRET_KEY || '',
      accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
      testMode: process.env.FEDEX_TEST_MODE === 'true' || !process.env.FEDEX_API_KEY,
      markupPercentage: 0, // No markup
      useIntelligentPacking: true, // Enable 15-30% savings
    })
  }
  return fedexProvider
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const body = await request.json()
    const validation = RateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
          requestId,
        },
        { status: 400 }
      )
    }

    const { destination, package: pkg, packages, providers } = validation.data

    // Build packages array (support single package or multiple)
    const packagesToShip = packages || [pkg]

    // All rates collected here
    const allRates = []

    // FedEx rates (using enhanced provider)
    if (providers.includes('fedex')) {
      try {
        const fedex = getFedExProvider()

        const fedexRates = await fedex.getRates(
          DEFAULT_ORIGIN,
          {
            street: destination.street || '123 Main St',
            city: destination.city,
            state: destination.state,
            zipCode: destination.zipCode,
            country: destination.countryCode,
            isResidential: destination.isResidential,
          },
          packagesToShip.map((p) => ({
            weight: p.weight,
            dimensions: p.dimensions,
          }))
        )

        // Transform to API response format
        fedexRates.forEach((rate) => {
          allRates.push({
            provider: 'fedex',
            providerName: rate.serviceName,
            serviceType: rate.serviceCode,
            serviceCode: rate.serviceCode,
            rate: {
              amount: rate.rateAmount,
              currency: rate.currency,
            },
            delivery: {
              estimatedDays: {
                min: rate.estimatedDays,
                max: rate.estimatedDays,
              },
              text: `${rate.estimatedDays} business day${rate.estimatedDays > 1 ? 's' : ''}`,
              guaranteed: rate.isGuaranteed,
              date: rate.deliveryDate?.toISOString(),
            },
          })
        })
      } catch (error) {
        console.error('[FedEx API Error]', error)
        // Don't fail entire request if FedEx fails
        // Fallback to test rates handled by provider
      }
    }

    // Southwest DASH rates (legacy simple calculation)
    if (providers.includes('southwest-dash')) {
      const totalWeight = packagesToShip.reduce((sum, p) => sum + p.weight, 0)
      allRates.push({
        provider: 'southwest-dash',
        providerName: 'Southwest Cargo DASH',
        serviceType: 'EXPRESS',
        rate: {
          amount: calculateSouthwestRate(totalWeight),
          currency: 'USD',
        },
        delivery: {
          estimatedDays: { min: 1, max: 2 },
          text: '1-2 business days',
        },
      })
    }

    return NextResponse.json({
      success: true,
      rates: allRates,
      requestId,
      metadata: {
        origin: DEFAULT_ORIGIN,
        packagesCount: packagesToShip.length,
        totalWeight: packagesToShip.reduce((sum, p) => sum + p.weight, 0),
        fedexEnhanced: providers.includes('fedex'),
      },
    })
  } catch (error) {
    console.error('Shipping rate error:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate shipping rates',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    )
  }
}

function calculateSouthwestRate(weight: number): number {
  // Southwest DASH rate calculation
  const baseRate = 24.99
  const weightRate = weight * 0.75
  return Math.round((baseRate + weightRate) * 100) / 100
}
