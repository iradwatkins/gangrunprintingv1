import { type NextRequest, NextResponse } from 'next/server'

// Simple static configuration for testing
const SIMPLE_CONFIG = {
  quantities: [
    { id: 'qty_0', value: 25, label: '25' },
    { id: 'qty_1', value: 50, label: '50' },
    { id: 'qty_2', value: 100, label: '100' },
    { id: 'qty_3', value: 250, label: '250' },
    { id: 'qty_4', value: 500, label: '500' },
    { id: 'qty_5', value: 1000, label: '1000' },
  ],
  sizes: [
    {
      id: 'size_0',
      name: '11x17',
      displayName: '11″ × 17″',
      width: 11,
      height: 17,
      squareInches: 187,
      priceMultiplier: 1.0,
      isDefault: false
    },
    {
      id: 'size_1',
      name: '12x18',
      displayName: '12″ × 18″',
      width: 12,
      height: 18,
      squareInches: 216,
      priceMultiplier: 1.15,
      isDefault: false
    },
    {
      id: 'size_2',
      name: '18x24',
      displayName: '18″ × 24″',
      width: 18,
      height: 24,
      squareInches: 432,
      priceMultiplier: 2.3,
      isDefault: true
    },
    {
      id: 'size_3',
      name: '24x36',
      displayName: '24″ × 36″',
      width: 24,
      height: 36,
      squareInches: 864,
      priceMultiplier: 4.6,
      isDefault: false
    },
    {
      id: 'size_4',
      name: '36x48',
      displayName: '36″ × 48″',
      width: 36,
      height: 48,
      squareInches: 1728,
      priceMultiplier: 9.2,
      isDefault: false
    },
  ],
  paperStocks: [
    {
      id: 'paper_1',
      name: '14pt C2S Poster Stock',
      description: 'Heavy coated stock with semi-gloss finish',
      pricePerUnit: 0.05,
      coatings: [
        { id: 'coating_1', name: 'High Gloss UV', priceMultiplier: 1.0, isDefault: true },
        { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 0.95, isDefault: false },
        { id: 'coating_3', name: 'Satin Finish', priceMultiplier: 1.05, isDefault: false },
      ],
      sides: [
        { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
        { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
      ]
    },
    {
      id: 'paper_2',
      name: '100lb Gloss Text',
      description: 'Premium glossy finish for vibrant colors',
      pricePerUnit: 0.04,
      coatings: [
        { id: 'coating_1', name: 'High Gloss UV', priceMultiplier: 1.0, isDefault: true },
        { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 0.95, isDefault: false },
      ],
      sides: [
        { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
        { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
      ]
    },
    {
      id: 'paper_3',
      name: '80lb Matte Text',
      description: 'Smooth matte finish, no glare',
      pricePerUnit: 0.03,
      coatings: [
        { id: 'coating_2', name: 'Matte Finish', priceMultiplier: 1.0, isDefault: true },
        { id: 'coating_4', name: 'No Coating', priceMultiplier: 0.9, isDefault: false },
      ],
      sides: [
        { id: 'sides_1', name: 'Front Only', priceMultiplier: 1.0, isDefault: true },
        { id: 'sides_2', name: 'Both Sides', priceMultiplier: 1.8, isDefault: false },
      ]
    },
  ],
  defaults: {
    quantity: 'qty_2',
    size: 'size_2',
    paper: 'paper_1',
    coating: 'coating_1',
    sides: 'sides_1'
  }
}

// GET /api/products/[id]/configuration - Simplified version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // For now, return static configuration
    // This ensures we always get a response without database issues
    console.log(`[Simplified Config API] Returning config for product: ${productId}`)

    return NextResponse.json(SIMPLE_CONFIG, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-API-Version': 'simplified-v1',
        'X-Product-Id': productId
      }
    })
  } catch (error) {
    console.error('[Simplified Config API] Error:', error)

    // Even on error, return the static config
    return NextResponse.json(SIMPLE_CONFIG, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'simplified-v1-fallback'
      }
    })
  }
}