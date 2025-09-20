// Static fallback configuration for when database is unavailable
// This ensures the product page always loads, even during database outages

export const FALLBACK_CONFIG = {
  quantities: [
    { id: 'qty_0', displayValue: 25, calculationValue: 25 },
    { id: 'qty_1', displayValue: 50, calculationValue: 50 },
    { id: 'qty_2', displayValue: 100, calculationValue: 100 },
    { id: 'qty_3', displayValue: 250, calculationValue: 250 },
    { id: 'qty_4', displayValue: 500, calculationValue: 500 },
    { id: 'qty_5', displayValue: 1000, calculationValue: 1000 },
  ],
  sizes: [
    {
      id: 'size_0',
      name: '11x17',
      displayName: '11″ × 17″',
      width: 11,
      height: 17,
      preCalculatedValue: 187,
    },
    {
      id: 'size_1',
      name: '12x18',
      displayName: '12″ × 18″',
      width: 12,
      height: 18,
      preCalculatedValue: 216,
    },
    {
      id: 'size_2',
      name: '18x24',
      displayName: '18″ × 24″',
      width: 18,
      height: 24,
      preCalculatedValue: 432,
    },
    {
      id: 'size_3',
      name: '24x36',
      displayName: '24″ × 36″',
      width: 24,
      height: 36,
      preCalculatedValue: 864,
    },
  ],
  paperStocks: [
    {
      id: 'fallback_paper_1',
      name: '14pt C2S Cardstock',
      weight: 0.0015,
      pricePerSqInch: 0.0019,
      tooltipText: 'Durable coated cardstock',
      paperStockCoatings: [
        {
          coatingId: 'coating_1',
          isDefault: true,
          coating: {
            id: 'coating_1',
            name: 'High Gloss UV',
          },
        },
        {
          coatingId: 'coating_2',
          isDefault: false,
          coating: {
            id: 'coating_2',
            name: 'Matte',
          },
        },
      ],
      paperStockSides: [
        {
          sidesOptionId: 'sides_1',
          priceMultiplier: 1,
          isEnabled: true,
          sidesOption: {
            id: 'sides_1',
            name: 'Front Only',
          },
        },
        {
          sidesOptionId: 'sides_2',
          priceMultiplier: 1.5,
          isEnabled: true,
          sidesOption: {
            id: 'sides_2',
            name: 'Both Sides',
          },
        },
      ],
    },
  ],
  defaults: {
    quantity: 'qty_2',
    size: 'size_0',
    paper: 'fallback_paper_1',
    coating: 'coating_1',
    sides: 'sides_1',
  },
}

// Product-specific fallback configurations
const POSTER_CONFIG = {
  quantities: [
    { id: 'qty_0', displayValue: 25, calculationValue: 25 },
    { id: 'qty_1', displayValue: 50, calculationValue: 50 },
    { id: 'qty_2', displayValue: 100, calculationValue: 100 },
    { id: 'qty_3', displayValue: 250, calculationValue: 250 },
    { id: 'qty_4', displayValue: 500, calculationValue: 500 },
    { id: 'qty_5', displayValue: 1000, calculationValue: 1000 },
  ],
  sizes: [
    {
      id: 'size_0',
      name: '18x24',
      displayName: '18″ × 24″',
      width: 18,
      height: 24,
      preCalculatedValue: 432,
    },
    {
      id: 'size_1',
      name: '24x36',
      displayName: '24″ × 36″',
      width: 24,
      height: 36,
      preCalculatedValue: 864,
    },
    {
      id: 'size_2',
      name: '36x48',
      displayName: '36″ × 48″',
      width: 36,
      height: 48,
      preCalculatedValue: 1728,
    },
    {
      id: 'size_3',
      name: '48x60',
      displayName: '48″ × 60″',
      width: 48,
      height: 60,
      preCalculatedValue: 2880,
    },
  ],
  paperStocks: [
    {
      id: 'fallback_paper_poster',
      name: '14pt C2S Poster Stock',
      weight: 0.0015,
      pricePerSqInch: 0.0025,
      tooltipText: 'Heavy poster stock with semi-gloss finish',
      paperStockCoatings: [
        {
          coatingId: 'coating_gloss',
          isDefault: true,
          coating: {
            id: 'coating_gloss',
            name: 'Semi-Gloss',
          },
        },
        {
          coatingId: 'coating_matte',
          isDefault: false,
          coating: {
            id: 'coating_matte',
            name: 'Matte Finish',
          },
        },
      ],
      paperStockSides: [
        {
          sidesOptionId: 'sides_front',
          priceMultiplier: 1,
          isEnabled: true,
          sidesOption: {
            id: 'sides_front',
            name: 'Front Only',
          },
        },
      ],
    },
  ],
  defaults: {
    quantity: 'qty_2',
    size: 'size_0',
    paper: 'fallback_paper_poster',
    coating: 'coating_gloss',
    sides: 'sides_front',
  },
}

// Get fallback config with product-specific overrides if needed
export function getFallbackConfig(productId: string) {
  // Check if this is a poster product based on ID patterns
  const isPosterProduct =
    productId.toLowerCase().includes('poster') || productId.includes('cmfqxnjz80001ul2lpacblzuf') // specific poster product ID

  const config = isPosterProduct ? POSTER_CONFIG : FALLBACK_CONFIG

  return {
    ...config,
    _isFallback: true,
    _message: 'Using optimized configuration. Full options will load when available.',
  }
}
