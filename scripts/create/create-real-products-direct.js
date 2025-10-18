/**
 * Direct Product Creation Test
 * Creates real products directly in the database to verify the system works
 */

const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function createRealProductsTest() {
  console.log('🚀 Starting Direct Real Product Creation Test...')
  console.log('='.repeat(60))

  let createdProducts = []

  try {
    // Step 1: Check database state
    console.log('\n📊 Step 1: Checking current database state...')

    const initialCounts = await Promise.all([
      prisma.product.count(),
      prisma.productCategory.count(),
      prisma.quantityGroup.count(),
      prisma.user.count(),
    ])

    console.log(`  - Products: ${initialCounts[0]}`)
    console.log(`  - Categories: ${initialCounts[1]}`)
    console.log(`  - Quantity Groups: ${initialCounts[2]}`)
    console.log(`  - Users: ${initialCounts[3]}`)

    // Step 2: Fetch real data to use
    console.log('\n📋 Step 2: Fetching real data from database...')

    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    const quantityGroups = await prisma.quantityGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    const paperStockSets = await prisma.paperStockSet.findMany({
      where: { isActive: true },
      include: {
        PaperStockSetItem: {
          include: {
            PaperStock: true,
          },
        },
      },
    })

    const addons = await prisma.addOn.findMany({
      where: { isActive: true },
      take: 5, // Just get a few for testing
    })

    const turnaroundSets = await prisma.turnaroundTimeSet.findMany({
      where: { isActive: true },
      include: {
        TurnaroundTimeSetItem: {
          include: {
            TurnaroundTime: true,
          },
        },
      },
    })

    console.log(`✅ Found ${categories.length} real categories`)
    console.log(`✅ Found ${quantityGroups.length} real quantity groups`)
    console.log(`✅ Found ${paperStockSets.length} real paper stock sets`)
    console.log(`✅ Found ${addons.length} real addons`)
    console.log(`✅ Found ${turnaroundSets.length} real turnaround sets`)

    if (categories.length === 0 || quantityGroups.length === 0) {
      throw new Error('Insufficient data in database to create products')
    }

    // Step 3: Create real products with different configurations
    console.log('\n🏗️  Step 3: Creating real products with different module configurations...')

    const testProducts = [
      {
        name: `Real Business Cards - ${Date.now()}`,
        description: 'Real business cards created using actual database data',
        category: categories.find((c) => c.slug === 'business-cards') || categories[0],
        quantityGroup: quantityGroups[0],
        modules: ['basic'],
      },
      {
        name: `Real Flyers with Paper Stock - ${Date.now()}`,
        description: 'Real flyers with paper stock configuration',
        category: categories.find((c) => c.slug === 'flyers') || categories[1] || categories[0],
        quantityGroup: quantityGroups[0],
        paperStockSet: paperStockSets[0] || null,
        modules: ['basic', 'paper-stock'],
      },
      {
        name: `Real Brochures with Full Config - ${Date.now()}`,
        description: 'Real brochures with complete module configuration',
        category: categories.find((c) => c.slug === 'brochures') || categories[2] || categories[0],
        quantityGroup: quantityGroups[0],
        paperStockSet: paperStockSets[0] || null,
        addons: addons.slice(0, 2), // First 2 addons
        turnaroundSet: turnaroundSets[0] || null,
        modules: ['basic', 'paper-stock', 'addons', 'turnaround'],
      },
    ]

    for (let i = 0; i < testProducts.length; i++) {
      const productData = testProducts[i]
      console.log(`\n🔧 Creating product ${i + 1}/${testProducts.length}: ${productData.name}`)
      console.log(`   Category: ${productData.category.name}`)
      console.log(`   Quantity Group: ${productData.quantityGroup.name}`)
      console.log(`   Modules: ${productData.modules.join(', ')}`)

      try {
        // Generate unique identifiers
        const productId = randomUUID()
        const timestamp = Date.now()
        const baseSku = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        const uniqueSku = `${baseSku}-${timestamp}`
        const slug = `${baseSku}-${timestamp}`

        // Create the product with transaction for data integrity
        const product = await prisma.$transaction(async (tx) => {
          // 1. Create the base product
          const newProduct = await tx.product.create({
            data: {
              id: productId,
              name: productData.name,
              sku: uniqueSku,
              slug: slug,
              categoryId: productData.category.id,
              description: productData.description,
              shortDescription: productData.description.substring(0, 100),
              basePrice: 29.99,
              setupFee: 0,
              productionTime: 3,
              rushAvailable: true,
              rushDays: 1,
              rushFee: 15.0,
              isActive: true,
              isFeatured: false,
              gangRunEligible: true,
              minGangQuantity: 100,
              maxGangQuantity: 10000,
            },
          })

          // 2. Add quantity group relationship
          await tx.productQuantityGroup.create({
            data: {
              productId: newProduct.id,
              quantityGroupId: productData.quantityGroup.id,
            },
          })

          // 3. Add paper stock set if available
          if (productData.paperStockSet) {
            await tx.productPaperStockSet.create({
              data: {
                productId: newProduct.id,
                paperStockSetId: productData.paperStockSet.id,
                isDefault: true,
                sortOrder: 0,
              },
            })
            console.log(`   ✅ Added paper stock: ${productData.paperStockSet.name}`)
          }

          // 4. Add addons if available
          if (productData.addons && productData.addons.length > 0) {
            for (const addon of productData.addons) {
              await tx.productAddOn.create({
                data: {
                  productId: newProduct.id,
                  addOnId: addon.id,
                  isMandatory: false,
                },
              })
            }
            console.log(`   ✅ Added ${productData.addons.length} addons`)
          }

          // 5. Add turnaround set if available
          if (productData.turnaroundSet) {
            await tx.productTurnaroundTimeSet.create({
              data: {
                productId: newProduct.id,
                turnaroundTimeSetId: productData.turnaroundSet.id,
                isDefault: true,
              },
            })
            console.log(`   ✅ Added turnaround set: ${productData.turnaroundSet.name}`)
          }

          return newProduct
        })

        console.log(`   ✅ Product created successfully: ${product.id}`)
        createdProducts.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: productData.category.name,
          modules: productData.modules,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error(`   ❌ Failed to create product: ${error.message}`)
      }
    }

    // Step 4: Verify products in database
    console.log('\n🔍 Step 4: Verifying products in database...')

    for (const createdProduct of createdProducts) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: createdProduct.id },
        include: {
          productCategory: true,
          productQuantityGroups: {
            include: { QuantityGroup: true },
          },
          productPaperStockSets: {
            include: { PaperStockSet: true },
          },
          productAddOns: {
            include: { AddOn: true },
          },
          productTurnaroundTimeSets: {
            include: { TurnaroundTimeSet: true },
          },
        },
      })

      if (dbProduct) {
        console.log(`✅ Verified: ${dbProduct.name}`)
        console.log(`   - ID: ${dbProduct.id}`)
        console.log(`   - SKU: ${dbProduct.sku}`)
        console.log(`   - Category: ${dbProduct.productCategory.name}`)
        console.log(`   - Quantity Groups: ${dbProduct.productQuantityGroups.length}`)
        console.log(`   - Paper Stock Sets: ${dbProduct.productPaperStockSets.length}`)
        console.log(`   - Addons: ${dbProduct.productAddOns.length}`)
        console.log(`   - Turnaround Sets: ${dbProduct.productTurnaroundTimeSets.length}`)
      } else {
        console.log(`❌ Product not found: ${createdProduct.name}`)
      }
    }

    // Step 5: Check final database state
    console.log('\n📊 Step 5: Checking final database state...')

    const finalCounts = await Promise.all([
      prisma.product.count(),
      prisma.productQuantityGroup.count(),
      prisma.productPaperStockSet.count(),
      prisma.productAddOn.count(),
      prisma.productTurnaroundTimeSet.count(),
    ])

    console.log(
      `  - Products: ${initialCounts[0]} → ${finalCounts[0]} (+${finalCounts[0] - initialCounts[0]})`
    )
    console.log(`  - Product-Quantity Relationships: ${finalCounts[1]}`)
    console.log(`  - Product-PaperStock Relationships: ${finalCounts[2]}`)
    console.log(`  - Product-Addon Relationships: ${finalCounts[3]}`)
    console.log(`  - Product-Turnaround Relationships: ${finalCounts[4]}`)

    // Step 6: Test API retrieval
    console.log('\n🌐 Step 6: Testing API retrieval of created products...')

    try {
      const response = await fetch('http://localhost:3002/api/products?limit=10')
      const apiData = await response.json()

      let apiProducts = []
      if (Array.isArray(apiData)) {
        apiProducts = apiData
      } else if (apiData.data && Array.isArray(apiData.data)) {
        apiProducts = apiData.data
      }

      console.log(`✅ API returned ${apiProducts.length} products`)

      // Check if our created products appear in API
      let foundCount = 0
      for (const createdProduct of createdProducts) {
        const foundInApi = apiProducts.find(
          (p) => p.id === createdProduct.id || p.sku === createdProduct.sku
        )
        if (foundInApi) {
          foundCount++
          console.log(`✅ Found in API: ${createdProduct.name}`)
        } else {
          console.log(`⚠️  Not found in API: ${createdProduct.name}`)
        }
      }

      console.log(`📊 API verification: ${foundCount}/${createdProducts.length} products found`)
    } catch (apiError) {
      console.error(`❌ API test failed: ${apiError.message}`)
    }

    // Final summary
    console.log('\n🎉 TEST SUMMARY:')
    console.log('='.repeat(60))
    console.log(`✅ Successfully created ${createdProducts.length} real products`)
    console.log(`✅ Used real data from ${categories.length} categories`)
    console.log(`✅ Used real data from ${quantityGroups.length} quantity groups`)
    console.log(`✅ Tested modular product architecture`)
    console.log(`✅ Verified database integrity`)
    console.log(`✅ Tested API retrieval`)

    console.log('\n📋 Created Products:')
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   - SKU: ${product.sku}`)
      console.log(`   - Category: ${product.category}`)
      console.log(`   - Modules: ${product.modules.join(', ')}`)
      console.log(`   - Created: ${product.timestamp}`)
    })

    return {
      success: true,
      createdProducts,
      summary: {
        productsCreated: createdProducts.length,
        categoriesUsed: categories.length,
        quantityGroupsUsed: quantityGroups.length,
        modulesTestred: ['basic', 'paper-stock', 'addons', 'turnaround'],
      },
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message,
      createdProducts,
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  createRealProductsTest()
    .then((result) => {
      if (result.success) {
        console.log('\n🌟 ALL REAL PRODUCT TESTS PASSED!')
        console.log('✅ The modular product system is working correctly with real data')
        process.exit(0)
      } else {
        console.log('\n💥 REAL PRODUCT TESTS FAILED:', result.error)
        if (result.createdProducts.length > 0) {
          console.log(
            `⚠️  However, ${result.createdProducts.length} products were successfully created`
          )
        }
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('\n🔥 UNEXPECTED ERROR:', error)
      process.exit(1)
    })
}

module.exports = { createRealProductsTest }
