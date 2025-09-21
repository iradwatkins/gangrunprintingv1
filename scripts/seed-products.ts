#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'

async function seedProducts() {

  try {
    // Verify no products exist yet
    const existingCount = await prisma.product.count()
    if (existingCount > 0) {

      return
    }

    // Get existing data
    const categories = await prisma.productCategory.findMany({ where: { isActive: true } })
    const paperStocks = await prisma.paperStock.findMany({ where: { isActive: true } })
    const quantityGroups = await prisma.quantityGroup.findMany({ where: { isActive: true } })
    const sizeGroups = await prisma.sizeGroup.findMany({ where: { isActive: true } })
    const addOns = await prisma.addOn.findMany({ where: { isActive: true } })

    // Define the 5 products to create
    const productsToCreate = [
      {
        name: 'Premium Business Cards',
        sku: 'BC-PREM-001',
        slug: 'premium-business-cards',
        description:
          'High-quality business cards printed on premium cardstock with your choice of finishes. Perfect for making a professional first impression. Available in multiple paper stocks and sizes.',
        shortDescription: 'Premium business cards with professional finish options',
        categoryId: categories.find((c) => c.id === 'business-cards')?.id || categories[0]?.id,
        basePrice: 29.99,
        setupFee: 15.0,
        productionTime: 3,
        isActive: true,
        isFeatured: true,
        gangRunEligible: true,
        rushAvailable: true,
        rushDays: 1,
        rushFee: 25.0,
        paperStocks: [
          paperStocks.find((p) => p.name.includes('16pt C2S'))?.id,
          paperStocks.find((p) => p.name.includes('14pt C2S'))?.id,
          paperStocks.find((p) => p.name.includes('12pt C2S'))?.id,
        ].filter(Boolean),
        defaultPaperStock: paperStocks.find((p) => p.name.includes('16pt C2S'))?.id,
        quantityGroup: quantityGroups.find((q) => q.name.includes('Business Card'))?.id,
        sizeGroup: sizeGroups.find((s) => s.name.includes('Business Card'))?.id,
        addOns: [
          addOns.find((a) => a.name.includes('Rounded Corners'))?.id,
          addOns.find((a) => a.name.includes('Spot UV'))?.id,
        ].filter(Boolean),
      },
      {
        name: 'Full Color Flyers',
        sku: 'FLY-COLOR-001',
        slug: 'full-color-flyers',
        description:
          'Eye-catching full-color flyers perfect for promotions, events, and marketing campaigns. High-quality printing on various paper stocks with multiple size options.',
        shortDescription: 'Professional full-color flyers for marketing and promotions',
        categoryId: categories.find((c) => c.id === 'flyers')?.id || categories[1]?.id,
        basePrice: 45.99,
        setupFee: 20.0,
        productionTime: 2,
        isActive: true,
        isFeatured: true,
        gangRunEligible: true,
        rushAvailable: true,
        rushDays: 1,
        rushFee: 30.0,
        paperStocks: [
          paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id,
          paperStocks.find((p) => p.name.includes('100 lb Uncoated'))?.id,
        ].filter(Boolean),
        defaultPaperStock: paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id,
        quantityGroup: quantityGroups.find((q) => q.name.includes('Basic Gangrun'))?.id,
        sizeGroup: sizeGroups.find((s) => s.name.includes('Flyer'))?.id,
        addOns: [
          addOns.find((a) => a.name.includes('Foil Stamping'))?.id,
          addOns.find((a) => a.name.includes('Spot UV'))?.id,
        ].filter(Boolean),
      },
      {
        name: 'Glossy Postcards',
        sku: 'PC-GLOSS-001',
        slug: 'glossy-postcards',
        description:
          'Professional glossy postcards ideal for direct mail campaigns, promotional mailings, and announcements. High-impact printing with vibrant colors.',
        shortDescription: 'High-quality glossy postcards for direct mail and promotions',
        categoryId: categories.find((c) => c.id === 'postcards')?.id || categories[2]?.id,
        basePrice: 35.99,
        setupFee: 12.0,
        productionTime: 3,
        isActive: true,
        isFeatured: false,
        gangRunEligible: true,
        rushAvailable: true,
        rushDays: 2,
        rushFee: 20.0,
        paperStocks: [
          paperStocks.find((p) => p.name.includes('14pt C2S'))?.id,
          paperStocks.find((p) => p.name.includes('16pt C2S'))?.id,
        ].filter(Boolean),
        defaultPaperStock: paperStocks.find((p) => p.name.includes('14pt C2S'))?.id,
        quantityGroup: quantityGroups.find((q) => q.name.includes('Basic Gangrun'))?.id,
        sizeGroup: sizeGroups.find((s) => s.name.includes('Postcard'))?.id,
        addOns: [addOns.find((a) => a.name.includes('Rounded Corners'))?.id].filter(Boolean),
      },
      {
        name: 'Large Format Posters',
        sku: 'POS-LARGE-001',
        slug: 'large-format-posters',
        description:
          'High-impact large format posters perfect for events, trade shows, retail displays, and advertising. Professional quality printing with vibrant colors and sharp details.',
        shortDescription: 'Professional large format posters for events and displays',
        categoryId: categories.find((c) => c.id === 'posters')?.id || categories[3]?.id,
        basePrice: 89.99,
        setupFee: 25.0,
        productionTime: 5,
        isActive: true,
        isFeatured: true,
        gangRunEligible: false,
        rushAvailable: true,
        rushDays: 2,
        rushFee: 45.0,
        paperStocks: [
          paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id,
          paperStocks.find((p) => p.name.includes('100 lb Uncoated'))?.id,
        ].filter(Boolean),
        defaultPaperStock: paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id,
        quantityGroup: quantityGroups.find((q) => q.name.includes('Basic Gangrun'))?.id,
        sizeGroup: sizeGroups.find((s) => s.name.includes('Poster'))?.id,
        addOns: [
          addOns.find((a) => a.name.includes('Hole Drilling'))?.id,
          addOns.find((a) => a.name.includes('Foil Stamping'))?.id,
        ].filter(Boolean),
      },
      {
        name: 'Die Cut Stickers',
        sku: 'STK-DIECUT-001',
        slug: 'die-cut-stickers',
        description:
          'Custom die-cut stickers with precise cutting and vibrant colors. Perfect for branding, promotions, and personal use. Durable vinyl material with strong adhesive.',
        shortDescription: 'Custom die-cut stickers with durable vinyl material',
        categoryId: categories.find((c) => c.id === 'stickers')?.id || categories[4]?.id,
        basePrice: 55.99,
        setupFee: 35.0,
        productionTime: 4,
        isActive: true,
        isFeatured: false,
        gangRunEligible: true,
        rushAvailable: false,
        rushDays: null,
        rushFee: null,
        paperStocks: [paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id].filter(Boolean),
        defaultPaperStock: paperStocks.find((p) => p.name.includes('100 lb Gloss'))?.id,
        quantityGroup: quantityGroups.find((q) => q.name.includes('Basic Gangrun'))?.id,
        sizeGroup: sizeGroups.find((s) => s.name.includes('Sticker'))?.id,
        addOns: [
          addOns.find((a) => a.name.includes('Rounded Corners'))?.id,
          addOns.find((a) => a.name.includes('Embossing'))?.id,
        ].filter(Boolean),
      },
    ]

    for (const productData of productsToCreate) {

      // Create the product with all relationships
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          sku: productData.sku,
          slug: productData.slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          categoryId: productData.categoryId!,
          basePrice: productData.basePrice,
          setupFee: productData.setupFee,
          productionTime: productData.productionTime,
          isActive: productData.isActive,
          isFeatured: productData.isFeatured,
          gangRunEligible: productData.gangRunEligible,
          rushAvailable: productData.rushAvailable,
          rushDays: productData.rushDays,
          rushFee: productData.rushFee,

          // Create paper stock associations
          productPaperStocks: {
            create: productData.paperStocks.map((stockId, index) => ({
              paperStockId: stockId,
              isDefault: stockId === productData.defaultPaperStock,
              additionalCost: 0,
            })),
          },

          // Create quantity group association
          productQuantityGroups: productData.quantityGroup
            ? {
                create: {
                  quantityGroupId: productData.quantityGroup,
                },
              }
            : undefined,

          // Create size group association
          productSizeGroups: productData.sizeGroup
            ? {
                create: {
                  sizeGroupId: productData.sizeGroup,
                },
              }
            : undefined,

          // Create add-on associations
          productAddOns: {
            create: productData.addOns.map((addOnId) => ({
              addOnId,
              isMandatory: false,
            })),
          },
        },
        include: {
          ProductCategory: true,
          productPaperStocks: {
            include: {
              paperStock: true,
            },
          },
          productQuantityGroups: {
            include: {
              quantityGroup: true,
            },
          },
          productSizeGroups: {
            include: {
              sizeGroup: true,
            },
          },
          productAddOns: {
            include: {
              addOn: true,
            },
          },
        },
      })

    }

    // Display summary
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({ where: { isActive: true } })
    const featuredProducts = await prisma.product.count({ where: { isFeatured: true } })
    const gangRunProducts = await prisma.product.count({ where: { gangRunEligible: true } })

  } catch (error) {
    console.error('❌ Error seeding products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedProducts()
    .then(() => {

      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export { seedProducts }
