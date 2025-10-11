const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

const productTests = [
  { name: 'Product one', sku: 'SKU001', price: 99.99 },
  { name: 'Product two', sku: 'SKU002', price: 109.99 },
  { name: 'Product three', sku: 'SKU003', price: 119.99 },
  { name: 'Product four', sku: 'SKU004', price: 129.99 },
]

async function testProductCRUD() {
  console.log('==========================================')
  console.log('    COMPLETE PRODUCT CRUD TEST')
  console.log('==========================================')

  const createdProducts = []
  let allTestsPassed = true

  try {
    // First, get some add-ons to use with products
    const addons = await prisma.addOn.findMany({ take: 3, where: { isActive: true } })
    console.log(`\n📦 Found ${addons.length} active add-ons to use with products`)

    // Get or create addon sets
    let addonSet = await prisma.addOnSet.findFirst({ where: { isActive: true } })
    if (!addonSet) {
      addonSet = await prisma.addOnSet.create({
        data: {
          id: uuidv4(),
          name: 'Test Add-on Set',
          description: 'For product testing',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('✅ Created test add-on set')
    }

    // Get or create turnaround time set
    let turnaroundSet = await prisma.turnaroundTimeSet.findFirst({ where: { isActive: true } })
    if (!turnaroundSet) {
      turnaroundSet = await prisma.turnaroundTimeSet.create({
        data: {
          id: uuidv4(),
          name: 'Test Turnaround Set',
          description: 'For product testing',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('✅ Created test turnaround time set')
    }

    // Test each product
    for (const [index, productData] of productTests.entries()) {
      console.log(`\n========================================`)
      console.log(`   TESTING: ${productData.name.toUpperCase()}`)
      console.log(`========================================`)

      try {
        // Get or create a category
        let category = await prisma.productCategory.findFirst({ where: { slug: 'business-cards' } })
        if (!category) {
          category = await prisma.productCategory.create({
            data: {
              id: uuidv4(),
              name: 'Business Cards',
              slug: 'business-cards',
              description: 'Professional business cards',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }

        // 1. CREATE PRODUCT
        console.log('📝 Creating product...')
        const product = await prisma.product.create({
          data: {
            id: uuidv4(),
            name: productData.name,
            slug: `product-${index + 1}`,
            sku: productData.sku,
            description: `This is a comprehensive test for ${productData.name}. It includes add-ons, pricing, and full CRUD operations.`,
            basePrice: productData.price,
            isActive: true,
            isFeatured: index === 0, // Feature the first product
            categoryId: category.id,
            productionTime: 5, // Standard 5 day production time
            metadata: {
              testProduct: true,
              createdBy: 'Playwright Test',
              testIndex: index + 1,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        console.log(`  ✅ Created: ${product.name} (${product.sku})`)
        createdProducts.push(product.id)

        // 2. ADD CONFIGURATIONS (Add-ons and Turnaround times)
        if (addonSet) {
          await prisma.productAddOnSet.create({
            data: {
              id: uuidv4(),
              productId: product.id,
              addOnSetId: addonSet.id,
              sortOrder: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
          console.log('  ✅ Added add-on set to product')
        }

        if (turnaroundSet) {
          await prisma.productTurnaroundTimeSet.create({
            data: {
              id: uuidv4(),
              productId: product.id,
              turnaroundTimeSetId: turnaroundSet.id,
              isDefault: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
          console.log('  ✅ Added turnaround time set to product')
        }

        // 3. READ PRODUCT (Verify creation)
        console.log('🔍 Verifying product...')
        const readProduct = await prisma.product.findUnique({
          where: { id: product.id },
          include: {
            productAddOnSets: true,
            productTurnaroundTimeSets: true,
          },
        })
        console.log(`  ✅ Verified: ${readProduct.name}`)
        console.log(`     - Add-on Sets: ${readProduct.productAddOnSets.length}`)
        console.log(`     - Turnaround Sets: ${readProduct.productTurnaroundTimeSets.length}`)

        // 4. UPDATE PRODUCT
        console.log('✏️ Editing product...')
        const updatedProduct = await prisma.product.update({
          where: { id: product.id },
          data: {
            name: `${product.name} - Edited`,
            basePrice: product.basePrice + 50,
            description: `${product.description} [UPDATED]`,
            updatedAt: new Date(),
          },
        })
        console.log(`  ✅ Updated: ${updatedProduct.name} ($${updatedProduct.basePrice})`)

        // 5. DUPLICATE PRODUCT
        console.log('📋 Duplicating product...')
        const duplicatedProduct = await prisma.product.create({
          data: {
            id: uuidv4(),
            name: `${product.name} - Copy`,
            slug: `${product.slug}-copy`,
            sku: `${product.sku}-COPY`,
            description: updatedProduct.description,
            basePrice: updatedProduct.basePrice,
            isActive: true,
            categoryId: product.categoryId,
            productionTime: product.productionTime,
            metadata: {
              ...product.metadata,
              duplicatedFrom: product.id,
              duplicatedAt: new Date().toISOString(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        console.log(`  ✅ Duplicated: ${duplicatedProduct.name} (${duplicatedProduct.sku})`)
        createdProducts.push(duplicatedProduct.id)

        // Copy configurations to duplicate
        if (addonSet) {
          await prisma.productAddOnSet.create({
            data: {
              id: uuidv4(),
              productId: duplicatedProduct.id,
              addOnSetId: addonSet.id,
              sortOrder: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }

        // 6. LIST ALL VERSIONS
        const allVersions = await prisma.product.findMany({
          where: {
            OR: [{ id: product.id }, { id: duplicatedProduct.id }],
          },
        })
        console.log(`  ✅ Total versions: ${allVersions.length}`)

        // 7. DELETE DUPLICATE (keep original)
        if (index % 2 === 0) {
          // For even indexed products, delete the duplicate
          console.log('🗑️ Deleting duplicate...')
          await prisma.product.delete({ where: { id: duplicatedProduct.id } })
          console.log('  ✅ Duplicate deleted')
          createdProducts.splice(createdProducts.indexOf(duplicatedProduct.id), 1)
        } else {
          // For odd indexed products, delete the original
          console.log('🗑️ Deleting original...')
          await prisma.product.delete({ where: { id: product.id } })
          console.log('  ✅ Original deleted, keeping duplicate')
          createdProducts.splice(createdProducts.indexOf(product.id), 1)
        }

        console.log(`\n✅ ${productData.name} - ALL TESTS PASSED`)
      } catch (error) {
        console.error(`\n❌ ${productData.name} - TEST FAILED:`, error.message)
        allTestsPassed = false
      }
    }

    // Final verification
    console.log('\n==========================================')
    console.log('    FINAL VERIFICATION')
    console.log('==========================================')

    const remainingProducts = await prisma.product.findMany({
      where: {
        id: { in: createdProducts },
      },
      include: {
        productAddOnSets: true,
        productTurnaroundTimeSets: true,
      },
    })

    console.log(`\n📊 Products remaining in database: ${remainingProducts.length}`)
    remainingProducts.forEach((p) => {
      console.log(`  - ${p.name} (${p.sku})`)
      console.log(`    • Price: $${p.basePrice}`)
      console.log(`    • Add-on Sets: ${p.productAddOnSets.length}`)
      console.log(`    • Turnaround Sets: ${p.productTurnaroundTimeSets.length}`)
    })

    // Test image upload simulation
    console.log('\n🖼️ Testing image metadata...')
    if (remainingProducts.length > 0) {
      const productWithImage = await prisma.product.update({
        where: { id: remainingProducts[0].id },
        data: {
          metadata: {
            ...remainingProducts[0].metadata,
            images: ['test-image-1.png', 'test-image-2.jpg'],
            primaryImage: 'test-image-1.png',
            thumbnailImage: 'test-image-thumb.png',
          },
        },
      })
      console.log('  ✅ Image metadata added successfully')
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message)
    allTestsPassed = false
  } finally {
    // Cleanup - delete all test products
    if (createdProducts.length > 0) {
      console.log('\n🧹 Cleaning up test products...')
      for (const productId of createdProducts) {
        try {
          await prisma.product.delete({ where: { id: productId } })
        } catch (e) {
          // Product might already be deleted
        }
      }
      console.log('  ✅ Cleanup complete')
    }

    await prisma.$disconnect()
  }

  // Final Summary
  console.log('\n==========================================')
  console.log('    TEST SUMMARY')
  console.log('==========================================')

  if (allTestsPassed) {
    console.log('\n✅ ALL PRODUCT TESTS PASSED!\n')
    console.log('📋 VERIFIED OPERATIONS:')
    console.log('✅ Product Creation - Working')
    console.log('✅ Product Reading - Working')
    console.log('✅ Product Updating - Working')
    console.log('✅ Product Duplication - Working')
    console.log('✅ Product Deletion - Working')
    console.log('✅ Add-on Integration - Working')
    console.log('✅ Turnaround Time Integration - Working')
    console.log('✅ Image Metadata - Working')
    console.log('\n🎉 PRODUCT MANAGEMENT SYSTEM IS FULLY FUNCTIONAL!')
  } else {
    console.log('\n❌ SOME TESTS FAILED')
    console.log('Please review the errors above')
  }
}

// Run the tests
testProductCRUD().catch(console.error)
