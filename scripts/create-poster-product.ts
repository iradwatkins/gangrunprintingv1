import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createPosterProduct() {
  console.log('🎨 Creating Large Format Poster product...')

  try {
    // Get existing data IDs
    const categories = await prisma.productCategory.findMany()
    const paperStockSets = await prisma.paperStockSet.findMany()
    const sizeGroups = await prisma.sizeGroup.findMany()
    const quantityGroups = await prisma.quantityGroup.findMany()

    const categoryMap = Object.fromEntries(categories.map(c => [c.name, c.id]))
    const paperStockSetMap = Object.fromEntries(paperStockSets.map(p => [p.name, p.id]))
    const sizeGroupMap = Object.fromEntries(sizeGroups.map(s => [s.name, s.id]))
    const quantityGroupMap = Object.fromEntries(quantityGroups.map(q => [q.name, q.id]))

    // Define the poster product with unique slug
    const posterProduct = {
      name: 'Professional Large Format Posters',
      slug: 'professional-large-format-posters',
      sku: 'POS-PRO-001',
      description: 'Eye-catching large format posters printed on heavy 14pt C2S poster stock with semi-gloss finish. Ideal for trade shows, retail displays, and event promotions. Our 18" x 24" posters are perfect for maximum visual impact. Suitable for both indoor and outdoor use with optional lamination for extended durability. Same-day production available for rush orders.',
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
      rushFee: 25.00,
      isFeatured: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { sku: posterProduct.sku }
    })

    if (existing) {
      console.log(`⚠️  Product already exists: ${posterProduct.name}`)
      return
    }

    // Create the product
    const product = await prisma.product.create({
      data: posterProduct
    })

    console.log(`✅ Created product: ${product.name}`)

    // Add paper stock set association
    if (paperStockSetMap['Standard Cardstock Set']) {
      await prisma.productPaperStockSet.create({
        data: {
          productId: product.id,
          paperStockSetId: paperStockSetMap['Standard Cardstock Set'],
          isDefault: true
        }
      })
      console.log(`   📎 Linked paper stock set: Standard Cardstock Set`)
    }

    // Add size group association
    if (sizeGroupMap['Poster Sizes']) {
      await prisma.productSizeGroup.create({
        data: {
          productId: product.id,
          sizeGroupId: sizeGroupMap['Poster Sizes']
        }
      })
      console.log(`   📐 Linked size group: Poster Sizes`)
    }

    // Add quantity group association
    if (quantityGroupMap['Basic Gangrun Price']) {
      await prisma.productQuantityGroup.create({
        data: {
          productId: product.id,
          quantityGroupId: quantityGroupMap['Basic Gangrun Price']
        }
      })
      console.log(`   🔢 Linked quantity group: Basic Gangrun Price`)
    }

    console.log(`   ✨ Product setup complete!`)

    // Verify the product was created with all associations
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        ProductCategory: true,
        productPaperStockSets: {
          include: {
            paperStockSet: true
          }
        },
        productSizeGroups: {
          include: {
            sizeGroup: true
          }
        },
        productQuantityGroups: {
          include: {
            quantityGroup: true
          }
        }
      }
    })

    console.log('\n📊 Product Details:')
    console.log(`  Name: ${createdProduct?.name}`)
    console.log(`  SKU: ${createdProduct?.sku}`)
    console.log(`  Category: ${createdProduct?.ProductCategory?.name}`)
    console.log(`  Base Price: $${createdProduct?.basePrice}`)
    console.log(`  Paper Stock Set: ${createdProduct?.productPaperStockSets[0]?.paperStockSet?.name || 'None'}`)
    console.log(`  Size Group: ${createdProduct?.productSizeGroups[0]?.sizeGroup?.name || 'None'}`)
    console.log(`  Quantity Group: ${createdProduct?.productQuantityGroups[0]?.quantityGroup?.name || 'None'}`)
    console.log(`  URL: http://localhost:3002/products/${createdProduct?.slug}`)

  } catch (error) {
    console.error('❌ Error creating poster product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createPosterProduct()