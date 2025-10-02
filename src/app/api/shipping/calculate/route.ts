import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { shippingCalculator, type ShippingAddress, type ShippingPackage } from '@/lib/shipping'
import { prisma } from '@/lib/prisma'
import { calculateWeight } from '@/lib/shipping/weight-calculator'

const calculateRequestSchema = z.object({
  toAddress: z.object({
    street: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('US'),
    isResidential: z.boolean().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      quantity: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      paperStockId: z.string().optional(),
      paperStockWeight: z.number().optional(),
    })
  ),
  fromAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string().default('US'),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Shipping API] Request body:', JSON.stringify(body, null, 2))

    const validation = calculateRequestSchema.safeParse(body)

    if (!validation.success) {
      console.error('[Shipping API] Validation failed:', validation.error.flatten())
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { toAddress, items, fromAddress } = validation.data

    // Default from address (GangRun Printing warehouse)
    const shipFrom: ShippingAddress = fromAddress || {
      street: '1300 Basswood Road',
      city: 'Schaumburg',
      state: 'IL',
      zipCode: '60173',
      country: 'US',
      isResidential: false,
    }

    console.log('[Shipping API] Ship from:', shipFrom)
    console.log('[Shipping API] Ship to:', toAddress)

    // Calculate weight for each item
    const packages: ShippingPackage[] = []
    let totalWeight = 0

    for (const item of items) {
      let weight = 0

      // If paperStockWeight is provided directly, use it
      if (item.paperStockWeight) {
        weight = calculateWeight({
          paperStockWeight: item.paperStockWeight,
          width: item.width,
          height: item.height,
          quantity: item.quantity,
        })
        console.log('[Shipping API] Calculated weight from paperStockWeight:', weight, 'lbs')
      }
      // Otherwise, look up the paper stock
      else if (item.paperStockId) {
        const paperStock = await prisma.paperStock.findUnique({
          where: { id: item.paperStockId },
        })

        if (paperStock) {
          weight = calculateWeight({
            paperStockWeight: paperStock.weight,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
          })
          console.log('[Shipping API] Calculated weight from DB paperStock:', weight, 'lbs')
        }
      }
      // Default weight if no paper stock info (using typical 60lb offset = 0.0009)
      else {
        weight = calculateWeight({
          paperStockWeight: 0.0009, // Default: 60lb offset paper (~0.0009 lbs/sq in)
          width: item.width,
          height: item.height,
          quantity: item.quantity,
        })
        console.log('[Shipping API] Calculated weight from default (60lb offset):', weight, 'lbs')
      }

      totalWeight += weight
    }

    console.log('[Shipping API] Total weight:', totalWeight, 'lbs')

    // Send total weight as ONE package for FedEx rating
    // Note: We'll split into multiple boxes for actual shipping, but for pricing
    // FedEx rates based on total weight in one shipment
    const minWeight = Math.max(totalWeight, 1) // Minimum 1 lb

    packages.push({
      weight: minWeight,
      dimensions: {
        width: 12,
        height: 9,
        length: 16,
      },
    })
    console.log('[Shipping API] Total weight for rating:', minWeight, 'lbs')

    console.log('[Shipping API] Total packages:', packages.length)

    // Get rates from FedEx only
    const rates = await shippingCalculator.getCarrierRates('FEDEX', shipFrom, toAddress, packages)

    console.log('[Shipping API] FedEx rates received:', rates.length, 'rates')
    console.log('[Shipping API] Rates:', JSON.stringify(rates, null, 2))

    return NextResponse.json({
      success: true,
      rates,
      totalWeight: totalWeight.toFixed(2),
    })
  } catch (error) {
    console.error('[Shipping API] Error:', error)
    return NextResponse.json({
      error: 'Failed to calculate shipping rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
