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

    // Check if any product has free shipping
    let hasFreeShipping = false
    for (const item of items) {
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { metadata: true },
        })

        if (product?.metadata && typeof product.metadata === 'object') {
          const metadata = product.metadata as { freeShipping?: boolean }
          if (metadata.freeShipping === true) {
            hasFreeShipping = true
            console.log('[Shipping API] ✅ Product has FREE SHIPPING:', item.productId)
            break
          }
        }
      }
    }

    // If free shipping, return immediately with $0 rate
    if (hasFreeShipping) {
      console.log('[Shipping API] 🎉 FREE SHIPPING APPLIED - Returning $0 rate')
      return NextResponse.json({
        success: true,
        rates: [
          {
            carrier: 'FEDEX',
            service: 'FREE_SHIPPING',
            cost: 0,
            deliveryDays: 5,
            description: 'Free Standard Shipping',
          },
        ],
        totalWeight: '0',
        boxSummary: 'Free Shipping - No weight calculated',
        numBoxes: 0,
      })
    }

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

    // Get rates from both FedEx and Southwest Cargo with timeout protection
    console.log('[Shipping API] Fetching rates from FedEx and Southwest Cargo...')

    // Create timeout promise (10 seconds)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Shipping rate calculation timed out')), 10000)
    )

    let rates: unknown[] = []

    try {
      console.log('[Shipping API] 📍 Fetching rates for destination:', toAddress.state, toAddress.zipCode)

      const [fedexRates, southwestRates] = await Promise.race([
        Promise.all([
          shippingCalculator.getCarrierRates('FEDEX', shipFrom, toAddress, packages).catch((err) => {
            console.error('[Shipping API] ❌ FedEx error:', err.message || err)
            console.error('[Shipping API] FedEx error stack:', err.stack)
            return []
          }),
          shippingCalculator.getCarrierRates('SOUTHWEST_CARGO', shipFrom, toAddress, packages).catch((err) => {
            console.error('[Shipping API] ❌ Southwest Cargo error:', err.message || err)
            console.error('[Shipping API] Southwest Cargo error stack:', err.stack)
            return []
          }),
        ]),
        timeout,
      ])

      console.log('[Shipping API] ✅ FedEx rates received:', fedexRates.length, 'rates')
      if (fedexRates.length > 0) {
        console.log('[Shipping API] FedEx rates:', JSON.stringify(fedexRates, null, 2))
      }

      console.log('[Shipping API] ✅ Southwest Cargo rates received:', southwestRates.length, 'rates')
      if (southwestRates.length > 0) {
        console.log('[Shipping API] Southwest Cargo rates:', JSON.stringify(southwestRates, null, 2))
      } else {
        console.log('[Shipping API] ⚠️ Southwest Cargo returned NO rates - check provider logs above')
      }

      rates = [...fedexRates, ...southwestRates]
      console.log('[Shipping API] 📊 Combined total rates:', rates.length)
      console.log('[Shipping API] Combined rates:', JSON.stringify(rates, null, 2))
    } catch (timeoutError) {
      console.error('[Shipping API] ❌ Timeout error:', timeoutError)
      // Empty rates array on timeout - UI will show "no shipping available"
      rates = []
    }

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
