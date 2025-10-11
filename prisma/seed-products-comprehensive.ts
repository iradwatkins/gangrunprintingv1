import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get references to existing data
  const categories = await prisma.productCategory.findMany()
  const paperStocks = await prisma.paperStock.findMany()
  const sizeGroups = await prisma.sizeGroup.findMany()
  const quantityGroups = await prisma.quantityGroup.findMany()
  const addOns = await prisma.addOn.findMany()

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]))
  const sizeGroupMap = Object.fromEntries(sizeGroups.map((s) => [s.name, s.id]))
  const quantityGroupMap = Object.fromEntries(quantityGroups.map((q) => [q.name, q.id]))

  const products = [
    // Business Cards
    {
      name: 'Standard Business Cards',
      slug: 'standard-business-cards',
      sku: 'BC-STD-001',
      description: 'Professional business cards with full-color printing on premium card stock',
      shortDescription: 'Classic business cards for networking',
      categoryId: categoryMap['Business Card'],
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 250,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 25.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Business Card Sizes'],
      quantityGroupId: quantityGroupMap['Business Card Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', '16pt Premium Cover'],
      availableAddOns: ['Rounded Corners', 'Spot UV', 'Foil Stamping'],
    },
    {
      name: 'Premium Suede Business Cards',
      slug: 'premium-suede-business-cards',
      sku: 'BC-SUEDE-001',
      description:
        'Luxury business cards with velvet-like suede finish for an unforgettable first impression',
      shortDescription: 'Ultra-premium suede finish cards',
      categoryId: categoryMap['Business Card'],
      basePrice: 89.99,
      setupFee: 0,
      productionTime: 5,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 50.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Business Card Sizes'],
      quantityGroupId: quantityGroupMap['Business Card Quantities'],
      defaultPaperStocks: ['32pt Suede'],
      availableAddOns: ['Foil Stamping', 'Spot UV', 'Colored Edges'],
    },

    // Flyers
    {
      name: 'Full Color Flyers',
      slug: 'full-color-flyers',
      sku: 'FLY-STD-001',
      description: 'Eye-catching flyers perfect for promotions, events, and marketing campaigns',
      shortDescription: 'Vibrant promotional flyers',
      categoryId: categoryMap['Custom Flyers'],
      basePrice: 29.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 35.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Flyer Sizes'],
      quantityGroupId: quantityGroupMap['Flyer Quantities'],
      defaultPaperStocks: ['100lb Gloss Text', '100lb Matte Text', '80lb Gloss Cover'],
      availableAddOns: ['Folding', 'Perforation', 'Die Cutting'],
    },

    // Postcards
    {
      name: 'Marketing Postcards',
      slug: 'marketing-postcards',
      sku: 'PC-STD-001',
      description: 'Direct mail postcards for targeted marketing campaigns',
      shortDescription: 'Direct mail marketing postcards',
      categoryId: categoryMap['Postcard'],
      basePrice: 24.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 30.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Postcard Sizes'],
      quantityGroupId: quantityGroupMap['Postcard Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', '16pt Premium Cover'],
      availableAddOns: ['Variable Data Printing', 'Mailing Services', 'Perforation'],
    },

    // Brochures
    {
      name: 'Tri-Fold Brochures',
      slug: 'tri-fold-brochures',
      sku: 'BRO-TRI-001',
      description: 'Professional tri-fold brochures for detailed product or service information',
      shortDescription: 'Classic tri-fold brochures',
      categoryId: categoryMap['Brochure'],
      basePrice: 49.99,
      setupFee: 0,
      productionTime: 4,
      gangRunEligible: true,
      minGangQuantity: 50,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 40.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Brochure Sizes'],
      quantityGroupId: quantityGroupMap['Brochure Quantities'],
      defaultPaperStocks: ['100lb Gloss Text', '100lb Matte Text', '80lb Gloss Cover'],
      availableAddOns: ['Folding', 'Scoring', 'Aqueous Coating'],
    },

    // Posters
    {
      name: 'Large Format Posters',
      slug: 'large-format-posters',
      sku: 'POS-LRG-001',
      description: 'High-impact posters for displays, events, and advertising',
      shortDescription: 'Eye-catching display posters',
      categoryId: categoryMap['Poster'],
      basePrice: 14.99,
      setupFee: 0,
      productionTime: 2,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 20.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Poster Sizes'],
      quantityGroupId: quantityGroupMap['Poster Quantities'],
      defaultPaperStocks: ['12pt C2S Poster', '24pt Styrene'],
      availableAddOns: ['Mounting', 'Lamination', 'Grommets'],
    },

    // Banners
    {
      name: 'Vinyl Banners',
      slug: 'vinyl-banners',
      sku: 'BAN-VIN-001',
      description: 'Durable vinyl banners for indoor and outdoor advertising',
      shortDescription: 'Weather-resistant vinyl banners',
      categoryId: categoryMap['Banner'],
      basePrice: 39.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 45.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Banner Sizes'],
      quantityGroupId: quantityGroupMap['Banner Quantities'],
      defaultPaperStocks: ['White Vinyl Adhesive'],
      availableAddOns: ['Grommets', 'Pole Pockets', 'Wind Slits'],
    },

    // Stickers
    {
      name: 'Die-Cut Stickers',
      slug: 'die-cut-stickers',
      sku: 'STK-DIE-001',
      description: 'Custom die-cut stickers in any shape with waterproof vinyl',
      shortDescription: 'Custom shape vinyl stickers',
      categoryId: categoryMap['Sticker'],
      basePrice: 34.99,
      setupFee: 25.0,
      productionTime: 5,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 35.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Sticker Sizes'],
      quantityGroupId: quantityGroupMap['Individual Sticker Quantities'],
      defaultPaperStocks: ['White Vinyl Adhesive', 'Clear Vinyl Adhesive'],
      availableAddOns: ['Lamination', 'Special Shape Die Cut'],
    },
    {
      name: 'Sheet Labels',
      slug: 'sheet-labels',
      sku: 'LBL-SHT-001',
      description: 'Sheet labels for products, mailing, and organization',
      shortDescription: 'Multi-purpose sheet labels',
      categoryId: categoryMap['Role Sticker'],
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 25.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Label Sizes'],
      quantityGroupId: quantityGroupMap['Label Quantities'],
      defaultPaperStocks: ['Paper Matte Labels', 'White Vinyl Adhesive'],
      availableAddOns: ['Lamination', 'Perforation'],
    },

    // Letterheads
    {
      name: 'Business Letterheads',
      slug: 'business-letterheads',
      sku: 'LTR-BUS-001',
      description: 'Professional letterheads for official business correspondence',
      shortDescription: 'Corporate letterhead printing',
      categoryId: categoryMap['Letterhead'],
      basePrice: 39.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 30.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Letterhead Sizes'],
      quantityGroupId: quantityGroupMap['Letterhead Quantities'],
      defaultPaperStocks: ['100lb Gloss Text', '100lb Matte Text'],
      availableAddOns: ['Embossing', 'Foil Stamping'],
    },

    // Envelopes
    {
      name: 'Custom Envelopes',
      slug: 'custom-envelopes',
      sku: 'ENV-CUS-001',
      description: 'Branded envelopes for professional correspondence',
      shortDescription: 'Custom printed envelopes',
      categoryId: categoryMap['Envelope'],
      basePrice: 44.99,
      setupFee: 0,
      productionTime: 4,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: false,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Envelope Sizes'],
      quantityGroupId: quantityGroupMap['Envelope Quantities'],
      defaultPaperStocks: ['100lb Gloss Text', '100lb Matte Text'],
      availableAddOns: ['Window Cut-Out', 'Security Tint'],
    },

    // Greeting Cards
    {
      name: 'Folded Greeting Cards',
      slug: 'folded-greeting-cards',
      sku: 'GRC-FLD-001',
      description: 'Custom greeting cards for special occasions and holidays',
      shortDescription: 'Personalized greeting cards',
      categoryId: categoryMap['Greeting Card'],
      basePrice: 29.99,
      setupFee: 0,
      productionTime: 4,
      gangRunEligible: true,
      minGangQuantity: 25,
      maxGangQuantity: 2500,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 35.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Greeting Card Sizes'],
      quantityGroupId: quantityGroupMap['Greeting Card Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', 'Kraft Brown'],
      availableAddOns: ['Foil Stamping', 'Embossing', 'Envelope Printing'],
    },

    // Presentation Folders
    {
      name: 'Pocket Presentation Folders',
      slug: 'pocket-presentation-folders',
      sku: 'FOL-PCK-001',
      description: 'Professional folders with pockets for presentations and proposals',
      shortDescription: 'Corporate presentation folders',
      categoryId: categoryMap['Pocket Folder'],
      basePrice: 99.99,
      setupFee: 50.0,
      productionTime: 5,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 75.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Presentation Folder Sizes'],
      quantityGroupId: quantityGroupMap['Presentation Folder Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', '16pt Premium Cover'],
      availableAddOns: ['Business Card Slits', 'Spot UV', 'Foil Stamping'],
    },

    // Bookmarks
    {
      name: 'Custom Bookmarks',
      slug: 'custom-bookmarks',
      sku: 'BMK-CUS-001',
      description: 'Promotional bookmarks for marketing and giveaways',
      shortDescription: 'Promotional bookmarks',
      categoryId: categoryMap['Bookmark'],
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 20.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Bookmark Sizes'],
      quantityGroupId: quantityGroupMap['Bookmark Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', '16pt Premium Cover'],
      availableAddOns: ['Lamination', 'Rounded Corners', 'Hole Punch with Ribbon'],
    },

    // Door Hangers
    {
      name: 'Marketing Door Hangers',
      slug: 'marketing-door-hangers',
      sku: 'DH-MKT-001',
      description: 'Door hangers for local marketing and service promotions',
      shortDescription: 'Local marketing door hangers',
      categoryId: categoryMap['Door Hanger'],
      basePrice: 39.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 35.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Door Hanger Sizes'],
      quantityGroupId: quantityGroupMap['Door Hanger Quantities'],
      defaultPaperStocks: ['14pt Gloss Cover', '14pt Matte Cover', '16pt Premium Cover'],
      availableAddOns: ['Die Cutting', 'Perforation', 'Variable Data'],
    },
  ]

  let createdCount = 0
  for (const productData of products) {
    try {
      const { defaultPaperStocks, availableAddOns, sizeGroupId, quantityGroupId, ...productInfo } =
        productData

      // Create the product
      const product = await prisma.product.upsert({
        where: { slug: productInfo.slug },
        update: productInfo,
        create: {
          ...productInfo,
          isActive: true,
          metadata: {},
        },
      })

      // Link size group if provided
      if (sizeGroupId) {
        await prisma.productSizeGroup.upsert({
          where: {
            productId_sizeGroupId: {
              productId: product.id,
              sizeGroupId: sizeGroupId,
            },
          },
          update: {},
          create: {
            productId: product.id,
            sizeGroupId: sizeGroupId,
          },
        })
      }

      // Link quantity group if provided
      if (quantityGroupId) {
        await prisma.productQuantityGroup.upsert({
          where: {
            productId_quantityGroupId: {
              productId: product.id,
              quantityGroupId: quantityGroupId,
            },
          },
          update: {},
          create: {
            productId: product.id,
            quantityGroupId: quantityGroupId,
          },
        })
      }

      // Link paper stocks
      if (defaultPaperStocks && defaultPaperStocks.length > 0) {
        for (let i = 0; i < defaultPaperStocks.length; i++) {
          const paperStock = paperStocks.find((ps) => ps.name === defaultPaperStocks[i])
          if (paperStock) {
            await prisma.productPaperStock.upsert({
              where: {
                productId_paperStockId: {
                  productId: product.id,
                  paperStockId: paperStock.id,
                },
              },
              update: {
                isDefault: i === 0,
                additionalCost: 0,
              },
              create: {
                productId: product.id,
                paperStockId: paperStock.id,
                isDefault: i === 0,
                additionalCost: 0,
              },
            })
          }
        }
      }

      // Link add-ons
      if (availableAddOns && availableAddOns.length > 0) {
        for (const addOnName of availableAddOns) {
          const addOn = addOns.find((a) => a.name === addOnName)
          if (addOn) {
            await prisma.productAddOn.upsert({
              where: {
                productId_addOnId: {
                  productId: product.id,
                  addOnId: addOn.id,
                },
              },
              update: {},
              create: {
                productId: product.id,
                addOnId: addOn.id,
                isMandatory: false,
              },
            })
          }
        }
      }

      // Create pricing tiers
      const pricingTiers = [
        { minQuantity: 1, maxQuantity: 99, unitPrice: productInfo.basePrice * 1.5 },
        { minQuantity: 100, maxQuantity: 249, unitPrice: productInfo.basePrice * 1.3 },
        { minQuantity: 250, maxQuantity: 499, unitPrice: productInfo.basePrice * 1.1 },
        { minQuantity: 500, maxQuantity: 999, unitPrice: productInfo.basePrice },
        { minQuantity: 1000, maxQuantity: 2499, unitPrice: productInfo.basePrice * 0.9 },
        { minQuantity: 2500, maxQuantity: 4999, unitPrice: productInfo.basePrice * 0.8 },
        { minQuantity: 5000, maxQuantity: null, unitPrice: productInfo.basePrice * 0.7 },
      ]

      for (const tier of pricingTiers) {
        const tierId = `${product.id}-${tier.minQuantity}`
        const now = new Date()
        await prisma.pricingTier.upsert({
          where: {
            productId_minQuantity: {
              productId: product.id,
              minQuantity: tier.minQuantity,
            },
          },
          update: {
            ...tier,
            updatedAt: now,
          },
          create: {
            id: tierId,
            ...tier,
            productId: product.id,
            setupFee: productInfo.setupFee || 0,
            createdAt: now,
            updatedAt: now,
          },
        })
      }

      createdCount++
    } catch (error) {
      console.error(`✗ Error creating product ${productData.name}:`, error)
    }
  }
}

main()
  .catch((e) => {
    console.error('Error seeding products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
