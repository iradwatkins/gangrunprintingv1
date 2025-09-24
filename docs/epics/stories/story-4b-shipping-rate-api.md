# Story 4b: Shipping Rate Calculation API

## Story Title
Implement Real-time Shipping Rate Calculation for FedEx and Southwest DASH

## Story Type
Backend Implementation

## Story Points
2

## Priority
P1 - High (Required for accurate checkout pricing)

## Story Description

As a **system**, I need to calculate accurate shipping rates for FedEx and Southwest Cargo/DASH based on package weight and destination, so that customers see real prices and the business maintains proper margins.

## Background

This story implements the backend API for shipping rate calculations:
- Integration with FedEx rate API
- Integration with Southwest Cargo/DASH API
- Weight and distance-based calculations
- Caching for performance
- Error handling for API failures

## Acceptance Criteria

### Must Have
- [ ] API endpoint accepts weight, dimensions, and destination
- [ ] Returns rates for both FedEx and Southwest DASH
- [ ] Handles API failures gracefully with fallback rates
- [ ] Caches rates for 15 minutes to reduce API calls
- [ ] Validates address format before calculation
- [ ] Returns structured response with rates and delivery times
- [ ] Logs all rate calculations for auditing

### Should Have
- [ ] Support for different FedEx service levels
- [ ] Dimensional weight calculation
- [ ] Saturday delivery options
- [ ] Rate shopping (show savings between options)

## Technical Details

### API Implementation

```typescript
// /api/shipping/rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// Request validation schema
const RateRequestSchema = z.object({
  origin: z.object({
    zipCode: z.string(),
    state: z.string(),
    city: z.string()
  }).optional(), // Use default if not provided
  destination: z.object({
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    state: z.string().length(2),
    city: z.string(),
    countryCode: z.string().default('US')
  }),
  package: z.object({
    weight: z.number().min(0.1).max(150), // in pounds
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  }),
  shipDate: z.string().datetime().optional(),
  providers: z.array(z.enum(['fedex', 'southwest-dash'])).default(['fedex', 'southwest-dash'])
});

// Default origin (Gang Run Printing warehouse)
const DEFAULT_ORIGIN = {
  zipCode: '75001',
  state: 'TX',
  city: 'Dallas',
  countryCode: 'US'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = RateRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { origin = DEFAULT_ORIGIN, destination, package: pkg, providers } = validation.data;

    // Generate cache key
    const cacheKey = `shipping:rates:${JSON.stringify({
      from: origin.zipCode,
      to: destination.zipCode,
      weight: pkg.weight,
      providers: providers.sort()
    })}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Calculate rates for requested providers
    const ratePromises = providers.map(async (provider) => {
      switch (provider) {
        case 'fedex':
          return calculateFedExRate(origin, destination, pkg);
        case 'southwest-dash':
          return calculateSouthwestDashRate(origin, destination, pkg);
        default:
          return null;
      }
    });

    const rates = (await Promise.allSettled(ratePromises))
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    // Build response
    const response = {
      success: true,
      origin,
      destination,
      package: pkg,
      rates,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    // Cache response
    await redis.setex(cacheKey, 900, JSON.stringify(response)); // 15 minutes

    // Log for analytics
    await logRateCalculation({
      ...response,
      requestId: request.headers.get('x-request-id') || 'unknown'
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Shipping rate calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates', fallbackRates: getFallbackRates() },
      { status: 500 }
    );
  }
}

async function calculateFedExRate(origin: any, destination: any, pkg: any) {
  try {
    // FedEx API Integration
    const fedexResponse = await fetch('https://apis.fedex.com/rate/v1/rates/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getFedExToken()}`,
        'Content-Type': 'application/json',
        'X-locale': 'en_US'
      },
      body: JSON.stringify({
        accountNumber: {
          value: process.env.FEDEX_ACCOUNT_NUMBER
        },
        requestedShipment: {
          shipper: {
            address: {
              postalCode: origin.zipCode,
              countryCode: origin.countryCode || 'US'
            }
          },
          recipient: {
            address: {
              postalCode: destination.zipCode,
              countryCode: destination.countryCode
            }
          },
          shipDateStamp: new Date().toISOString().split('T')[0],
          serviceType: 'FEDEX_GROUND',
          packagingType: 'YOUR_PACKAGING',
          requestedPackageLineItems: [{
            weight: {
              units: 'LB',
              value: pkg.weight
            },
            dimensions: pkg.dimensions ? {
              length: pkg.dimensions.length,
              width: pkg.dimensions.width,
              height: pkg.dimensions.height,
              units: 'IN'
            } : undefined
          }],
          rateRequestType: ['ACCOUNT', 'LIST']
        }
      })
    });

    if (!fedexResponse.ok) {
      throw new Error('FedEx API error');
    }

    const fedexData = await fedexResponse.json();
    const rate = fedexData.output.rateReplyDetails[0];

    return {
      provider: 'fedex',
      providerName: 'FedEx Ground',
      serviceType: rate.serviceType,
      rate: {
        amount: parseFloat(rate.ratedShipmentDetails[0].totalNetCharge),
        currency: 'USD'
      },
      delivery: {
        estimatedDays: {
          min: 3,
          max: 5
        },
        guaranteedBy: rate.commit?.dateDetail?.dayFormat || null
      },
      surcharges: rate.ratedShipmentDetails[0].shipmentRateDetail.surCharges || [],
      rateId: rate.ratedShipmentDetails[0].rateType
    };

  } catch (error) {
    console.error('FedEx rate calculation failed:', error);
    // Return fallback rate
    return {
      provider: 'fedex',
      providerName: 'FedEx Ground',
      serviceType: 'FEDEX_GROUND',
      rate: {
        amount: calculateFallbackRate('fedex', pkg.weight, getDistance(origin, destination)),
        currency: 'USD'
      },
      delivery: {
        estimatedDays: { min: 3, max: 5 }
      },
      isFallback: true
    };
  }
}

async function calculateSouthwestDashRate(origin: any, destination: any, pkg: any) {
  try {
    // Southwest Cargo DASH API Integration
    const response = await fetch('https://api.swacargo.com/v2/dash/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SOUTHWEST_DASH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipment: {
          origin: {
            zip: origin.zipCode,
            city: origin.city,
            state: origin.state
          },
          destination: {
            zip: destination.zipCode,
            city: destination.city,
            state: destination.state
          },
          package: {
            weight_lbs: pkg.weight,
            length_in: pkg.dimensions?.length || 12,
            width_in: pkg.dimensions?.width || 12,
            height_in: pkg.dimensions?.height || 12
          },
          service: 'DASH', // Express service
          pickup_date: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error('Southwest DASH API error');
    }

    const data = await response.json();

    return {
      provider: 'southwest-dash',
      providerName: 'Southwest Cargo DASH',
      serviceType: 'EXPRESS',
      rate: {
        amount: data.total_charge,
        currency: 'USD'
      },
      delivery: {
        estimatedDays: {
          min: 1,
          max: 2
        },
        cutoffTime: '12:00 PM CST'
      },
      features: [
        'Priority handling',
        'Real-time tracking',
        'Up to $500 insurance included'
      ],
      rateId: data.quote_id
    };

  } catch (error) {
    console.error('Southwest DASH rate calculation failed:', error);
    // Return fallback rate
    return {
      provider: 'southwest-dash',
      providerName: 'Southwest Cargo DASH',
      serviceType: 'EXPRESS',
      rate: {
        amount: calculateFallbackRate('southwest-dash', pkg.weight, getDistance(origin, destination)),
        currency: 'USD'
      },
      delivery: {
        estimatedDays: { min: 1, max: 2 }
      },
      isFallback: true
    };
  }
}

// Fallback rate calculation
function calculateFallbackRate(provider: string, weight: number, distance: number): number {
  const baseRates = {
    'fedex': { base: 8.99, perPound: 0.45, perMile: 0.015 },
    'southwest-dash': { base: 24.99, perPound: 0.75, perMile: 0.025 }
  };

  const rates = baseRates[provider as keyof typeof baseRates];
  if (!rates) return 15.99; // Ultimate fallback

  const calculatedRate = rates.base + (weight * rates.perPound) + (distance * rates.perMile);
  return Math.round(calculatedRate * 100) / 100;
}

// Distance calculation helper (simplified)
function getDistance(origin: any, destination: any): number {
  // This would normally use a geocoding service
  // Simplified calculation based on zip code regions
  const originRegion = Math.floor(parseInt(origin.zipCode) / 10000);
  const destRegion = Math.floor(parseInt(destination.zipCode) / 10000);
  const regionDiff = Math.abs(originRegion - destRegion);

  // Approximate miles based on region difference
  return regionDiff * 250;
}

// Get FedEx OAuth token (cached)
async function getFedExToken(): Promise<string> {
  const cached = await redis.get('fedex:token');
  if (cached) return cached;

  const response = await fetch('https://apis.fedex.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.FEDEX_CLIENT_ID!,
      client_secret: process.env.FEDEX_CLIENT_SECRET!
    })
  });

  const data = await response.json();
  await redis.setex('fedex:token', data.expires_in - 60, data.access_token);
  return data.access_token;
}

// Fallback rates for when APIs fail
function getFallbackRates() {
  return [
    {
      provider: 'fedex',
      providerName: 'FedEx Ground',
      rate: { amount: 12.99, currency: 'USD' },
      delivery: { estimatedDays: { min: 3, max: 5 } },
      isFallback: true
    },
    {
      provider: 'southwest-dash',
      providerName: 'Southwest Cargo DASH',
      rate: { amount: 29.99, currency: 'USD' },
      delivery: { estimatedDays: { min: 1, max: 2 } },
      isFallback: true
    }
  ];
}

// Analytics logging
async function logRateCalculation(data: any) {
  // Send to analytics service or database
  await prisma.shippingRateLog.create({
    data: {
      requestId: data.requestId,
      origin: data.origin,
      destination: data.destination,
      package: data.package,
      rates: data.rates,
      timestamp: new Date()
    }
  });
}
```

## Testing Requirements

### Unit Tests
- [ ] Rate calculation with valid inputs
- [ ] Fallback rate calculation
- [ ] Distance estimation logic
- [ ] Cache key generation
- [ ] Response validation

### Integration Tests
- [ ] FedEx API integration (test environment)
- [ ] Southwest DASH API integration
- [ ] Redis caching functionality
- [ ] Error handling and fallbacks
- [ ] Concurrent rate requests

### Manual Testing Checklist
- [ ] Calculate rates for various zip codes
- [ ] Test with different package weights
- [ ] Verify cache is working (second request is instant)
- [ ] Test API failure scenarios
- [ ] Validate rate accuracy against provider websites
- [ ] Test with invalid addresses
- [ ] Check rate expiration timing

## Dependencies
- FedEx API credentials and documentation
- Southwest Cargo DASH API access
- Redis for caching
- Zod for validation
- Prisma for logging

## Definition of Done
- [ ] API endpoint returns rates for both providers
- [ ] Rates are cached for 15 minutes
- [ ] Fallback rates work when APIs fail
- [ ] All requests are logged
- [ ] Error handling is comprehensive
- [ ] API response time < 2 seconds
- [ ] Documentation updated
- [ ] Code reviewed

## Notes
- Store API credentials securely in environment variables
- Consider implementing webhook for rate updates
- Monitor API usage to stay within limits
- Fallback rates should be regularly updated
- Consider adding more FedEx service levels in future

## Estimation Breakdown
- API endpoint setup: 0.5 hours
- FedEx integration: 1 hour
- Southwest DASH integration: 1 hour
- Caching implementation: 0.5 hours
- Fallback rates: 0.5 hours
- Testing: 1 hour
- Total: ~4.5 hours (2 story points)