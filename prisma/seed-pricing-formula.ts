import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedStandardSizes() {
  console.log('🌱 Seeding standard sizes with pre-calculated values...')

  const sizes = [
    // Business Card Sizes
    {
      name: '3.5x2',
      displayName: '3.5″ × 2″ (Standard Business Card)',
      width: 3.5,
      height: 2,
      preCalculatedValue: 7,
      sortOrder: 1,
    },
    {
      name: '2x2',
      displayName: '2″ × 2″ (Square Mini)',
      width: 2,
      height: 2,
      preCalculatedValue: 4,
      sortOrder: 2,
    },
    {
      name: '3.5x1',
      displayName: '3.5″ × 1″ (Slim)',
      width: 3.5,
      height: 1,
      preCalculatedValue: 3.5,
      sortOrder: 3,
    },

    // Postcard Sizes
    {
      name: '4x6',
      displayName: '4″ × 6″ (Standard Postcard)',
      width: 4,
      height: 6,
      preCalculatedValue: 24,
      sortOrder: 10,
    },
    {
      name: '5x7',
      displayName: '5″ × 7″',
      width: 5,
      height: 7,
      preCalculatedValue: 35,
      sortOrder: 11,
    },
    {
      name: '6x9',
      displayName: '6″ × 9″',
      width: 6,
      height: 9,
      preCalculatedValue: 54,
      sortOrder: 12,
    },
    {
      name: '6x11',
      displayName: '6″ × 11″',
      width: 6,
      height: 11,
      preCalculatedValue: 66,
      sortOrder: 13,
    },

    // Flyer Sizes
    {
      name: '5.5x8.5',
      displayName: '5.5″ × 8.5″ (Half Letter)',
      width: 5.5,
      height: 8.5,
      preCalculatedValue: 46.75,
      sortOrder: 20,
    },
    {
      name: '8.5x11',
      displayName: '8.5″ × 11″ (Letter)',
      width: 8.5,
      height: 11,
      preCalculatedValue: 93.5,
      sortOrder: 21,
    },
    {
      name: '11x17',
      displayName: '11″ × 17″ (Tabloid)',
      width: 11,
      height: 17,
      preCalculatedValue: 187,
      sortOrder: 22,
    },

    // Brochure Sizes
    {
      name: '8.5x14',
      displayName: '8.5″ × 14″ (Legal)',
      width: 8.5,
      height: 14,
      preCalculatedValue: 119,
      sortOrder: 30,
    },
    {
      name: '11x25.5',
      displayName: '11″ × 25.5″ (Tri-fold)',
      width: 11,
      height: 25.5,
      preCalculatedValue: 280.5,
      sortOrder: 31,
    },

    // Square Sizes
    {
      name: '4x4',
      displayName: '4″ × 4″ (Square)',
      width: 4,
      height: 4,
      preCalculatedValue: 16,
      sortOrder: 40,
    },
    {
      name: '5x5',
      displayName: '5″ × 5″ (Square)',
      width: 5,
      height: 5,
      preCalculatedValue: 25,
      sortOrder: 41,
    },
    {
      name: '6x6',
      displayName: '6″ × 6″ (Square)',
      width: 6,
      height: 6,
      preCalculatedValue: 36,
      sortOrder: 42,
    },
    {
      name: '8x8',
      displayName: '8″ × 8″ (Square)',
      width: 8,
      height: 8,
      preCalculatedValue: 64,
      sortOrder: 43,
    },

    // Large Format
    {
      name: '12x18',
      displayName: '12″ × 18″',
      width: 12,
      height: 18,
      preCalculatedValue: 216,
      sortOrder: 50,
    },
    {
      name: '18x24',
      displayName: '18″ × 24″',
      width: 18,
      height: 24,
      preCalculatedValue: 432,
      sortOrder: 51,
    },
    {
      name: '24x36',
      displayName: '24″ × 36″',
      width: 24,
      height: 36,
      preCalculatedValue: 864,
      sortOrder: 52,
    },
  ]

  for (const size of sizes) {
    await prisma.standardSize.upsert({
      where: { name: size.name },
      update: size,
      create: size,
    })
  }

  console.log(`✅ Created/updated ${sizes.length} standard sizes`)
}

async function seedStandardQuantities() {
  console.log('🌱 Seeding standard quantities with adjustments...')

  const quantities = [
    // Small quantities with adjustments (< 5000)
    { displayValue: 25, calculationValue: 50, sortOrder: 1 }, // 100% adjustment
    { displayValue: 50, calculationValue: 75, sortOrder: 2 }, // 50% adjustment
    { displayValue: 100, calculationValue: 125, sortOrder: 3 }, // 25% adjustment
    { displayValue: 150, calculationValue: 175, sortOrder: 4 }, // ~17% adjustment
    { displayValue: 200, calculationValue: 250, sortOrder: 5 }, // 25% adjustment
    { displayValue: 250, calculationValue: 300, sortOrder: 6 }, // 20% adjustment
    { displayValue: 300, calculationValue: 350, sortOrder: 7 }, // ~17% adjustment
    { displayValue: 400, calculationValue: 450, sortOrder: 8 }, // 12.5% adjustment
    { displayValue: 500, calculationValue: 550, sortOrder: 9 }, // 10% adjustment
    { displayValue: 750, calculationValue: 800, sortOrder: 10 }, // ~7% adjustment
    { displayValue: 1000, calculationValue: 1050, sortOrder: 11 }, // 5% adjustment
    { displayValue: 1500, calculationValue: 1550, sortOrder: 12 }, // ~3% adjustment
    { displayValue: 2000, calculationValue: 2050, sortOrder: 13 }, // 2.5% adjustment
    { displayValue: 2500, calculationValue: 2550, sortOrder: 14 }, // 2% adjustment
    { displayValue: 3000, calculationValue: 3050, sortOrder: 15 }, // ~1.7% adjustment
    { displayValue: 4000, calculationValue: 4050, sortOrder: 16 }, // 1.25% adjustment

    // Exact quantities (>= 5000, no adjustment)
    { displayValue: 5000, calculationValue: 5000, sortOrder: 20 },
    { displayValue: 7500, calculationValue: 7500, sortOrder: 21 },
    { displayValue: 10000, calculationValue: 10000, sortOrder: 22 },
    { displayValue: 15000, calculationValue: 15000, sortOrder: 23 },
    { displayValue: 20000, calculationValue: 20000, sortOrder: 24 },
    { displayValue: 25000, calculationValue: 25000, sortOrder: 25 },
    { displayValue: 30000, calculationValue: 30000, sortOrder: 26 },
    { displayValue: 40000, calculationValue: 40000, sortOrder: 27 },
    { displayValue: 50000, calculationValue: 50000, sortOrder: 28 },
    { displayValue: 75000, calculationValue: 75000, sortOrder: 29 },
    { displayValue: 100000, calculationValue: 100000, sortOrder: 30 },
  ]

  for (const qty of quantities) {
    await prisma.standardQuantity.upsert({
      where: { displayValue: qty.displayValue },
      update: qty,
      create: qty,
    })
  }

  console.log(`✅ Created/updated ${quantities.length} standard quantities`)
}

async function seedPaperExceptions() {
  console.log('🌱 Seeding paper exceptions for text papers...')

  // Find all text papers by category
  const textPapers = await prisma.paperStock.findMany({
    where: {
      OR: [
        { category: { contains: 'Text', mode: 'insensitive' } },
        { category: { contains: 'Uncoated', mode: 'insensitive' } },
        { name: { contains: 'Text', mode: 'insensitive' } },
        { weight: { contains: '70#', mode: 'insensitive' } }, // Common text weights
        { weight: { contains: '80#', mode: 'insensitive' } },
        { weight: { contains: '100# Text', mode: 'insensitive' } },
      ],
    },
  })

  for (const paper of textPapers) {
    await prisma.paperException.upsert({
      where: { paperStockId: paper.id },
      update: {
        exceptionType: 'TEXT_PAPER',
        doubleSidedMultiplier: 1.75,
        description: `Text paper exception: ${paper.name} uses 1.75x multiplier for double-sided printing`,
      },
      create: {
        paperStockId: paper.id,
        exceptionType: 'TEXT_PAPER',
        doubleSidedMultiplier: 1.75,
        description: `Text paper exception: ${paper.name} uses 1.75x multiplier for double-sided printing`,
      },
    })
  }

  console.log(`✅ Created/updated ${textPapers.length} paper exceptions`)

  // Also mark cardstock papers as normal (1.0 multiplier) - for clarity
  const cardstockPapers = await prisma.paperStock.findMany({
    where: {
      OR: [
        { category: { contains: 'Cardstock', mode: 'insensitive' } },
        { category: { contains: 'Cover', mode: 'insensitive' } },
        { name: { contains: 'Cardstock', mode: 'insensitive' } },
        { weight: { contains: '12pt', mode: 'insensitive' } },
        { weight: { contains: '14pt', mode: 'insensitive' } },
        { weight: { contains: '16pt', mode: 'insensitive' } },
        { weight: { contains: '100# Cover', mode: 'insensitive' } },
      ],
    },
  })

  console.log(
    `ℹ️ Found ${cardstockPapers.length} cardstock papers (no exception needed - default 1.0 multiplier)`
  )
}

async function seedProductPricingConfig() {
  console.log('🌱 Seeding product pricing configurations...')

  // Get all products
  const products = await prisma.product.findMany()

  for (const product of products) {
    // Default configuration - most products allow custom options
    const config = {
      productId: product.id,
      allowCustomSize: true, // Can be disabled per product
      allowCustomQuantity: true, // Can be disabled per product
      minCustomWidth: 1,
      maxCustomWidth: 48,
      minCustomHeight: 1,
      maxCustomHeight: 48,
      minCustomQuantity: 1,
      maxCustomQuantity: 1000000,
    }

    // Special cases - disable custom for certain products
    if (product.name.toLowerCase().includes('business card')) {
      config.allowCustomSize = false // Business cards typically have fixed sizes
      config.minCustomQuantity = 100
      config.maxCustomQuantity = 100000
    }

    if (product.gangRunEligible) {
      config.minCustomQuantity = product.minGangQuantity || 100
      config.maxCustomQuantity = product.maxGangQuantity || 10000
    }

    await prisma.productPricingConfig.upsert({
      where: { productId: product.id },
      update: config,
      create: config,
    })
  }

  console.log(`✅ Created/updated pricing config for ${products.length} products`)
}

async function linkProductsToSizesAndQuantities() {
  console.log('🌱 Linking products to standard sizes and quantities...')

  const products = await prisma.product.findMany()
  const sizes = await prisma.standardSize.findMany()
  const quantities = await prisma.standardQuantity.findMany()

  for (const product of products) {
    // Determine which sizes are appropriate for this product
    let relevantSizes: string[] = []
    const productName = product.name.toLowerCase()

    if (productName.includes('business card')) {
      relevantSizes = ['3.5x2', '2x2', '3.5x1']
    } else if (productName.includes('postcard')) {
      relevantSizes = ['4x6', '5x7', '6x9', '6x11']
    } else if (productName.includes('flyer')) {
      relevantSizes = ['5.5x8.5', '8.5x11', '11x17']
    } else if (productName.includes('brochure')) {
      relevantSizes = ['8.5x11', '8.5x14', '11x25.5']
    } else if (productName.includes('poster')) {
      relevantSizes = ['12x18', '18x24', '24x36']
    } else {
      // Default to common sizes
      relevantSizes = ['4x6', '5x7', '8.5x11', '11x17']
    }

    // Link sizes
    for (const sizeName of relevantSizes) {
      const size = sizes.find((s) => s.name === sizeName)
      if (size) {
        await prisma.productSize.upsert({
          where: {
            productId_standardSizeId: {
              productId: product.id,
              standardSizeId: size.id,
            },
          },
          update: {
            isActive: true,
            isDefault: sizeName === relevantSizes[0], // First size is default
          },
          create: {
            productId: product.id,
            standardSizeId: size.id,
            isDefault: sizeName === relevantSizes[0],
            isActive: true,
          },
        })
      }
    }

    // Determine which quantities are appropriate
    let relevantQuantities: number[] = []

    if (productName.includes('business card')) {
      relevantQuantities = [100, 250, 500, 1000, 2500, 5000, 10000]
    } else if (productName.includes('postcard')) {
      relevantQuantities = [50, 100, 250, 500, 1000, 2500, 5000]
    } else if (productName.includes('flyer') || productName.includes('brochure')) {
      relevantQuantities = [25, 50, 100, 250, 500, 1000, 2500, 5000]
    } else if (productName.includes('poster')) {
      relevantQuantities = [1, 5, 10, 25, 50, 100, 250]
    } else {
      // Default quantities
      relevantQuantities = [100, 250, 500, 1000, 2500, 5000]
    }

    // Link quantities
    for (const qtyValue of relevantQuantities) {
      const qty = quantities.find((q) => q.displayValue === qtyValue)
      if (qty) {
        await prisma.productQuantity.upsert({
          where: {
            productId_standardQuantityId: {
              productId: product.id,
              standardQuantityId: qty.id,
            },
          },
          update: {
            isActive: true,
            isDefault: qtyValue === relevantQuantities[0], // First quantity is default
          },
          create: {
            productId: product.id,
            standardQuantityId: qty.id,
            isDefault: qtyValue === relevantQuantities[0],
            isActive: true,
          },
        })
      }
    }
  }

  console.log(`✅ Linked products to sizes and quantities`)
}

async function main() {
  console.log('🚀 Starting pricing formula seed...')

  try {
    await seedStandardSizes()
    await seedStandardQuantities()
    await seedPaperExceptions()
    await seedProductPricingConfig()
    await linkProductsToSizesAndQuantities()

    console.log('✅ Pricing formula seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
