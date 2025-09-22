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
    const validation = calculateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { toAddress, items, fromAddress } = validation.data

    // Default from address (your warehouse)
    const shipFrom: ShippingAddress = fromAddress || {
      street: '1234 Print Shop Way',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'US',
      isResidential: false,
    }

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
        }
      }
      // Default weight if no paper stock info
      else {
        weight = calculateWeight({
          paperStockWeight: 0.0015, // Default weight
          width: item.width,
          height: item.height,
          quantity: item.quantity,
        })
      }

      totalWeight += weight
    }

    // Create a single package with the total weight
    // In a real scenario, you might want to split into multiple packages
    packages.push({
      weight: Math.max(totalWeight, 1), // Minimum 1 lb
      dimensions: {
        width: 12, // Standard box dimensions
        height: 9,
        length: 16,
      },
    })

    // Get rates from all carriers
    const rates = await shippingCalculator.getAllRates(shipFrom, toAddress, packages)

    return NextResponse.json({
      success: true,
      rates,
      totalWeight: totalWeight.toFixed(2),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate shipping rates' }, { status: 500 })
  }
}
