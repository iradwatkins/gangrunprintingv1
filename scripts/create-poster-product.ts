import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createPosterProduct() {
  try {
    // Get existing data IDs
    const categories = await prisma.productCategory.findMany()
    const paperStockSets = await prisma.paperStockSet.findMany()
    const sizeGroups = await prisma.sizeGroup.findMany()
    const quantityGroups = await prisma.quantityGroup.findMany()

    const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]))
    const paperStockSetMap = Object.fromEntries(paperStockSets.map((p) => [p.name, p.id]))
    const sizeGroupMap = Object.fromEntries(sizeGroups.map((s) => [s.name, s.id]))
    const quantityGroupMap = Object.fromEntries(quantityGroups.map((q) => [q.name, q.id]))

    // Define the poster product with unique slug
    const posterProduct = {
      name: 'Professional Large Format Posters',
      slug: 'professional-large-format-posters',
      sku: 'POS-PRO-001',
      description:
        'Eye-catching large format posters printed on heavy 14pt C2S poster stock with semi-gloss finish. Ideal for trade shows, retail displays, and event promotions. Our 18" x 24" posters are perfect for maximum visual impact. Suitable for both indoor and outdoor use with optional lamination for extended durability. Same-day production available for rush orders.',
      shortDescription: 'Professional 18" x 24" posters on premium 14pt stock',
      categoryId: categoryMap['Posters'] || null,
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 1,
      gangRunEligible: false,
      minGangQuantity: null,
      maxGangQuantity: null,
      rushAvailable: true,
      rushDays: 0, // Same day
      rushFee: 25.0,
      isFeatured: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { sku: posterProduct.sku },
    })

    if (existing) {
      return
    }

    // Create the product
    const product = await prisma.product.create({
      data: posterProduct,
    })

    // Add paper stock set association
    if (paperStockSetMap['Standard Cardstock Set']) {
      await prisma.productPaperStockSet.create({
        data: {
          productId: product.id,
          paperStockSetId: paperStockSetMap['Standard Cardstock Set'],
          isDefault: true,
        },
      })
    }

    // Add size group association
    if (sizeGroupMap['Poster Sizes']) {
      await prisma.productSizeGroup.create({
        data: {
          productId: product.id,
          sizeGroupId: sizeGroupMap['Poster Sizes'],
        },
      })
    }

    // Add quantity group association
    if (quantityGroupMap['Basic Gangrun Price']) {
      await prisma.productQuantityGroup.create({
        data: {
          productId: product.id,
          quantityGroupId: quantityGroupMap['Basic Gangrun Price'],
        },
      })
    }

    // Verify the product was created with all associations
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        ProductCategory: true,
        productPaperStockSets: {
          include: {
            paperStockSet: true,
          },
        },
        productSizeGroups: {
          include: {
            sizeGroup: true,
          },
        },
        productQuantityGroups: {
          include: {
            quantityGroup: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('❌ Error creating poster product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createPosterProduct()
