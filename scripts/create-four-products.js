const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

async function createFourProducts() {
  console.log('==========================================')
  console.log('    CREATING FOUR PERMANENT PRODUCTS')
  console.log('==========================================')

  const products = [
    { name: 'Product one', sku: 'PROD001', price: 99.99, slug: 'product-one' },
    { name: 'Product two', sku: 'PROD002', price: 149.99, slug: 'product-two' },
    { name: 'Product three', sku: 'PROD003', price: 199.99, slug: 'product-three' },
    { name: 'Product four', sku: 'PROD004', price: 249.99, slug: 'product-four' }
  ]

  try {
    // First ensure we have a category
    let category = await prisma.productCategory.findFirst({
      where: { slug: 'business-cards' }
    })

    if (!category) {
      category = await prisma.productCategory.create({
        data: {
          id: uuidv4(),
          name: 'Business Cards',
          slug: 'business-cards',
          description: 'Professional business cards for your business',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Created category: Business Cards')
    }

    // Get or create an addon set
    let addonSet = await prisma.addOnSet.findFirst({
      where: { isActive: true }
    })

    if (!addonSet) {
      // Create an addon first
      const addon = await prisma.addOn.create({
        data: {
          id: uuidv4(),
          name: 'UV Coating',
          category: 'COATING',
          pricingType: 'FLAT',
          flatPrice: 25.00,
          description: 'Premium UV coating for extra shine and protection',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create addon set
      addonSet = await prisma.addOnSet.create({
        data: {
          id: uuidv4(),
          name: 'Standard Add-ons',
          description: 'Standard add-on options for products',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Link addon to set
      await prisma.addOnSetItem.create({
        data: {
          id: uuidv4(),
          addOnSetId: addonSet.id,
          addOnId: addon.id,
          displayPosition: 'IN_DROPDOWN',
          isDefault: false,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ Created add-on set with UV coating')
    }

    // Get or create turnaround time set
    let turnaroundSet = await prisma.turnaroundTimeSet.findFirst({
      where: { isActive: true }
    })

    if (!turnaroundSet) {
      // Create turnaround time
      const turnaround = await prisma.turnaroundTime.create({
        data: {
          id: uuidv4(),
          name: 'Standard Production',
          businessDays: 5,
          price: 0,
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create turnaround set
      turnaroundSet = await prisma.turnaroundTimeSet.create({
        data: {
          id: uuidv4(),
          name: 'Standard Turnaround Options',
          description: 'Standard production times',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Link turnaround to set
      await prisma.turnaroundTimeSetItem.create({
        data: {
          id: uuidv4(),
          turnaroundTimeSetId: turnaroundSet.id,
          turnaroundTimeId: turnaround.id,
          isDefault: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ Created turnaround time set')
    }

    // Now create the four products
    console.log('\n📦 Creating products...\n')

    for (const productData of products) {
      // Check if product already exists
      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: productData.slug },
            { sku: productData.sku }
          ]
        }
      })

      if (existing) {
        console.log(`⚠️  ${productData.name} already exists (${existing.sku})`)
        continue
      }

      // Create the product
      const product = await prisma.product.create({
        data: {
          id: uuidv4(),
          name: productData.name,
          slug: productData.slug,
          sku: productData.sku,
          description: `${productData.name} - High quality printing service with premium options. Perfect for businesses looking for professional printing solutions.`,
          shortDescription: `Premium ${productData.name} printing service`,
          basePrice: productData.price,
          isActive: true,
          isFeatured: productData.name === 'Product one', // Feature the first product
          categoryId: category.id,
          productionTime: 5,
          setupFee: 0,
          gangRunEligible: true,
          minGangQuantity: 100,
          maxGangQuantity: 5000,
          rushAvailable: true,
          rushDays: 2,
          rushFee: 50.00,
          metadata: {
            createdBy: 'System',
            createdAt: new Date().toISOString(),
            tags: ['business', 'professional', 'premium'],
            features: [
              'Full color printing',
              'Premium paper stock',
              'UV coating available',
              'Rush production available'
            ]
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`✅ Created: ${product.name}`)
      console.log(`   - SKU: ${product.sku}`)
      console.log(`   - Price: $${product.basePrice}`)
      console.log(`   - Slug: ${product.slug}`)

      // Add configurations to the product

      // Add addon set
      await prisma.productAddOnSet.create({
        data: {
          id: uuidv4(),
          productId: product.id,
          addOnSetId: addonSet.id,
          isDefault: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`   - Added add-on options`)

      // Add turnaround time set
      await prisma.productTurnaroundTimeSet.create({
        data: {
          id: uuidv4(),
          productId: product.id,
          turnaroundTimeSetId: turnaroundSet.id,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`   - Added turnaround options`)
      console.log('')
    }

    // Verify all products were created
    console.log('==========================================')
    console.log('    VERIFICATION')
    console.log('==========================================')

    const allProducts = await prisma.product.findMany({
      where: {
        name: {
          in: products.map(p => p.name)
        }
      },
      include: {
        productAddOnSets: true,
        productTurnaroundTimeSets: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`\n📊 Total products created: ${allProducts.length}`)
    console.log('\n📋 Product Details:\n')

    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   - ID: ${product.id}`)
      console.log(`   - SKU: ${product.sku}`)
      console.log(`   - Slug: ${product.slug}`)
      console.log(`   - Price: $${product.basePrice}`)
      console.log(`   - Active: ${product.isActive ? 'Yes' : 'No'}`)
      console.log(`   - Featured: ${product.isFeatured ? 'Yes' : 'No'}`)
      console.log(`   - Add-on Sets: ${product.productAddOnSets.length}`)
      console.log(`   - Turnaround Sets: ${product.productTurnaroundTimeSets.length}`)
      console.log('')
    })

    console.log('==========================================')
    console.log('  ✅ ALL FOUR PRODUCTS CREATED SUCCESSFULLY')
    console.log('==========================================')
    console.log('\n🎉 Products are now permanently in the database!')
    console.log('📍 Access them at:')
    console.log('   - Admin: https://gangrunprinting.com/admin/products')
    console.log('   - API: https://gangrunprinting.com/api/products')

  } catch (error) {
    console.error('❌ Error creating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the creation script
createFourProducts().catch(console.error)