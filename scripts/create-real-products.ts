import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createRealProducts() {
  console.log('🚀 Creating real commercial printing products...')

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

    console.log('📋 Available mappings:')
    console.log('Categories:', Object.keys(categoryMap))
    console.log('Paper Stock Sets:', Object.keys(paperStockSetMap))
    console.log('Size Groups:', Object.keys(sizeGroupMap))
    console.log('Quantity Groups:', Object.keys(quantityGroupMap))

    // Define real products based on industry research
    const products = [
      {
        name: 'Premium Business Cards',
        slug: 'premium-business-cards',
        sku: 'BC-PREM-001',
        description: 'Professional business cards with full-color printing on premium 16pt card stock. Features silk lamination for a smooth, luxurious feel that resists water, smudges, and daily wear. Perfect for making a lasting impression at networking events and meetings.',
        shortDescription: 'Premium 16pt business cards with silk lamination',
        categoryId: categoryMap['Business Cards'] || null,
        basePrice: 24.99,
        setupFee: 0,
        productionTime: 3,
        gangRunEligible: true,
        minGangQuantity: 100,
        maxGangQuantity: 5000,
        rushAvailable: true,
        rushDays: 1,
        rushFee: 35.00,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Marketing Flyers',
        slug: 'marketing-flyers',
        sku: 'FLY-MKT-001',
        description: 'High-quality marketing flyers printed on 100lb gloss text paper with vibrant full-color printing. Perfect for promotional campaigns, event announcements, and direct mail marketing. Features aqueous coating for enhanced durability and color pop.',
        shortDescription: 'Full-color flyers on 100lb gloss text',
        categoryId: categoryMap['Flyers & Brochures'] || null,
        basePrice: 39.99,
        setupFee: 0,
        productionTime: 2,
        gangRunEligible: true,
        minGangQuantity: 25,
        maxGangQuantity: 10000,
        rushAvailable: true,
        rushDays: 1,
        rushFee: 45.00,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Large Format Posters',
        slug: 'large-format-posters',
        sku: 'POS-LRG-001',
        description: 'Eye-catching large format posters printed on heavy 14pt C2S poster stock with semi-gloss finish. Ideal for trade shows, retail displays, and event promotions. Suitable for both indoor and outdoor use with optional lamination for extended durability.',
        shortDescription: '18" x 24" posters on 14pt stock',
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
    ]

    // Create products
    for (const productData of products) {
      try {
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: { sku: productData.sku }
        })

        if (existing) {
          console.log(`⚠️  Product already exists: ${productData.name}`)
          continue
        }

        // Create the product
        const product = await prisma.product.create({
          data: productData
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
          console.log(`   📎 Linked paper stock set`)
        }

        // Add size group association
        let sizeGroupId = null
        if (product.name.includes('Business Cards') && sizeGroupMap['Business Card Sizes']) {
          sizeGroupId = sizeGroupMap['Business Card Sizes']
        } else if (product.name.includes('Flyers') && sizeGroupMap['Flyer Sizes']) {
          sizeGroupId = sizeGroupMap['Flyer Sizes']
        } else if (product.name.includes('Posters') && sizeGroupMap['Poster Sizes']) {
          sizeGroupId = sizeGroupMap['Poster Sizes']
        }

        if (sizeGroupId) {
          await prisma.productSizeGroup.create({
            data: {
              productId: product.id,
              sizeGroupId: sizeGroupId
            }
          })
          console.log(`   📐 Linked size group`)
        }

        // Add quantity group association
        let quantityGroupId = null
        if (product.name.includes('Business Cards') && quantityGroupMap['Business Card Quantities']) {
          quantityGroupId = quantityGroupMap['Business Card Quantities']
        } else if (quantityGroupMap['Basic Gangrun Price']) {
          quantityGroupId = quantityGroupMap['Basic Gangrun Price']
        }

        if (quantityGroupId) {
          await prisma.productQuantityGroup.create({
            data: {
              productId: product.id,
              quantityGroupId: quantityGroupId
            }
          })
          console.log(`   🔢 Linked quantity group`)
        }

        console.log(`   ✨ Product setup complete: ${product.name}`)

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}:`, error)
      }
    }

    // Verify products were created
    const createdProducts = await prisma.product.findMany({
      where: {
        sku: {
          in: ['BC-PREM-001', 'FLY-MKT-001', 'POS-LRG-001']
        }
      },
      include: {
        ProductCategory: true,
        productPaperStockSets: true,
        productSizeGroups: true,
        productQuantityGroups: true
      }
    })

    console.log('\n📊 Summary of created products:')
    createdProducts.forEach(product => {
      console.log(`\n${product.name}:`)
      console.log(`  - SKU: ${product.sku}`)
      console.log(`  - Category: ${product.ProductCategory?.name || 'None'}`)
      console.log(`  - Base Price: $${product.basePrice}`)
      console.log(`  - Paper Stock Sets: ${product.productPaperStockSets.length}`)
      console.log(`  - Size Groups: ${product.productSizeGroups.length}`)
      console.log(`  - Quantity Groups: ${product.productQuantityGroups.length}`)
      console.log(`  - URL: http://localhost:3002/products/${product.slug}`)
    })

  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createRealProducts()