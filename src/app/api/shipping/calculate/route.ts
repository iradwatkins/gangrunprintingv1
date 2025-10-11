import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { shippingCalculator, type ShippingAddress, type ShippingPackage } from '@/lib/shipping'
import { prisma } from '@/lib/prisma'
import { calculateWeight } from '@/lib/shipping/weight-calculator'
import { splitIntoBoxes, getBoxSplitSummary } from '@/lib/shipping/box-splitter'

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
  console.log('='.repeat(80))
  console.log('[Shipping API] 🚀 REQUEST RECEIVED at', new Date().toISOString())
  console.log('='.repeat(80))
  try {
    const rawBody = await request.text()
    console.log('[Shipping API] Raw body (first 500 chars):', rawBody.substring(0, 500))

    const body = JSON.parse(rawBody)
    console.log('[Shipping API] Parsed body:', JSON.stringify(body, null, 2))
    console.log('[Shipping API] toAddress exists?', !!body.toAddress)
    console.log('[Shipping API] items exists?', !!body.items)

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

    console.log('[Shipping API] Total product weight:', totalWeight, 'lbs')

    // Split into boxes using standard box dimensions and 36lb max weight
    const boxes = splitIntoBoxes(totalWeight)
    const boxSummary = getBoxSplitSummary(boxes)

    console.log('[Shipping API] Box split:', boxSummary)
    console.log('[Shipping API] Boxes created:', JSON.stringify(boxes, null, 2))

    // Use the split boxes for rating
    packages.push(...boxes)

    // Get rates from both FedEx and Southwest Cargo
    console.log('[Shipping API] Fetching rates from FedEx and Southwest Cargo...')

    const [fedexRates, southwestRates] = await Promise.all([
      shippingCalculator.getCarrierRates('FEDEX', shipFrom, toAddress, packages),
      shippingCalculator.getCarrierRates('SOUTHWEST_CARGO', shipFrom, toAddress, packages),
    ])

    console.log('[Shipping API] FedEx rates received:', fedexRates.length, 'rates')
    console.log('[Shipping API] Southwest Cargo rates received:', southwestRates.length, 'rates')

    const rates = [...fedexRates, ...southwestRates]
    console.log('[Shipping API] Combined rates:', JSON.stringify(rates, null, 2))

    return NextResponse.json({
      success: true,
      rates,
      totalWeight: totalWeight.toFixed(2),
      boxSummary,
      numBoxes: boxes.length,
    })
  } catch (error) {
    console.error('[Shipping API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate shipping rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
