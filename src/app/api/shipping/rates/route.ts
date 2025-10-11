import { MAX_FILE_SIZE, TAX_RATE, DEFAULT_WAREHOUSE_ZIP } from '@/lib/constants'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateRequestId } from '@/lib/api-response'

// Request validation schema
const RateRequestSchema = z.object({
  destination: z.object({
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    state: z.string().length(2),
    city: z.string(),
    countryCode: z.string().default('US'),
  }),
  package: z.object({
    weight: z.number().min(0.1).max(150), // in pounds
    dimensions: z
      .object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
  }),
  providers: z.array(z.enum(['fedex', 'southwest-dash'])).default(['fedex', 'southwest-dash']),
})

// Default origin (Gang Run Printing warehouse in Dallas)
const DEFAULT_ORIGIN = {
  zipCode: DEFAULT_WAREHOUSE_ZIP,
  state: 'TX',
  city: 'Dallas',
  countryCode: 'US',
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

    const { destination, package: pkg, providers } = validation.data

    // Calculate rates for FedEx and Southwest DASH
    const rates = []

    if (providers.includes('fedex')) {
      rates.push({
        provider: 'fedex',
        providerName: 'FedEx Ground',
        serviceType: 'GROUND',
        rate: {
          amount: calculateFedExRate(pkg.weight),
          currency: 'USD',
        },
        delivery: {
          estimatedDays: { min: 3, max: 5 },
          text: '3-5 business days',
        },
      })
    }

    if (providers.includes('southwest-dash')) {
      rates.push({
        provider: 'southwest-dash',
        providerName: 'Southwest Cargo DASH',
        serviceType: 'EXPRESS',
        rate: {
          amount: calculateSouthwestRate(pkg.weight),
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
      rates,
      requestId,
    })
  } catch (error) {
    console.error('Shipping rate error:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping rates' }, { status: 500 })
  }
}

function calculateFedExRate(weight: number): number {
  // Simplified FedEx rate calculation
  const baseRate = 8.99
  const weightRate = weight * 0.45
  return Math.round((baseRate + weightRate) * 100) / 100
}

function calculateSouthwestRate(weight: number): number {
  // Simplified Southwest DASH rate calculation
  const baseRate = 24.99
  const weightRate = weight * 0.75
  return Math.round((baseRate + weightRate) * 100) / 100
}
