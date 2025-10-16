import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Validation schema
const ShippingSettingsSchema = z.object({
  enabledServices: z.array(z.string()),
  intelligentPacking: z.boolean(),
  testMode: z.boolean(),
  markupPercentage: z.number().min(0).max(100),
})

// GET - Fetch current shipping settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    // In production, validate admin session here

    // Fetch settings from database
    const settings = await prisma.settings.findUnique({
      where: { key: 'shipping_settings' },
    })

    if (!settings || !settings.value) {
      // Return defaults - all services enabled
      return NextResponse.json({
        enabledServices: [
          // Express
          'FIRST_OVERNIGHT',
          'PRIORITY_OVERNIGHT',
          'STANDARD_OVERNIGHT',
          'FEDEX_2_DAY_AM',
          'FEDEX_2_DAY',
          'FEDEX_EXPRESS_SAVER',
          // Ground
          'FEDEX_GROUND',
          'GROUND_HOME_DELIVERY',
          'FEDEX_REGIONAL_ECONOMY',
          // SmartPost
          'SMART_POST',
          // Freight
          'FEDEX_1_DAY_FREIGHT',
          'FEDEX_2_DAY_FREIGHT',
          'FEDEX_3_DAY_FREIGHT',
          'FEDEX_FREIGHT_ECONOMY',
          'FEDEX_FREIGHT_PRIORITY',
          'FEDEX_NATIONAL_FREIGHT',
          // International
          'INTERNATIONAL_ECONOMY',
          'INTERNATIONAL_PRIORITY',
          'INTERNATIONAL_FIRST',
          'INTERNATIONAL_GROUND',
          'FEDEX_INTERNATIONAL_CONNECT_PLUS',
          'FEDEX_INTERNATIONAL_PRIORITY_EXPRESS',
          'INTERNATIONAL_ECONOMY_FREIGHT',
          'INTERNATIONAL_PRIORITY_FREIGHT',
        ],
        intelligentPacking: true,
        testMode: !process.env.FEDEX_API_KEY,
        markupPercentage: 0,
      })
    }

    // Parse the JSON string value
    const parsedSettings = JSON.parse(settings.value)
    return NextResponse.json(parsedSettings)
  } catch (error) {
    console.error('Error fetching shipping settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping settings' },
      { status: 500 }
    )
  }
}

// POST - Update shipping settings
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // In production, validate admin session here

    const body = await request.json()
    const validation = ShippingSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const settings = validation.data

    // Save to database
    await prisma.settings.upsert({
      where: { key: 'shipping_settings' },
      create: {
        key: 'shipping_settings',
        value: JSON.stringify(settings),
        category: 'shipping',
        description: 'FedEx Ultra-Integration shipping settings',
        isActive: true,
      },
      update: {
        value: JSON.stringify(settings),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Shipping settings saved successfully',
      settings,
    })
  } catch (error) {
    console.error('Error saving shipping settings:', error)
    return NextResponse.json(
      { error: 'Failed to save shipping settings' },
      { status: 500 }
    )
  }
}
