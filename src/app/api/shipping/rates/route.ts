import { type NextRequest, NextResponse } from 'next/server'
import { ShippingCalculator } from '@/lib/shipping/shipping-calculator'
import { type ShippingAddress, type ShippingPackage } from '@/lib/shipping/interfaces'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fromAddress,
      toAddress,
      packages,
    }: {
      fromAddress: ShippingAddress
      toAddress: ShippingAddress
      packages: ShippingPackage[]
    } = body

    // Validate required fields
    if (!fromAddress || !toAddress || !packages || packages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: fromAddress, toAddress, packages' },
        { status: 400 }
      )
    }

    const calculator = new ShippingCalculator()
    const rates = await calculator.getAllRates(fromAddress, toAddress, packages)

    return NextResponse.json({ rates })
  } catch (error) {
    console.error('Shipping rates API error:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping rates' }, { status: 500 })
  }
}
