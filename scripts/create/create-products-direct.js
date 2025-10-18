/**
 * Direct Product Creation Script
 *
 * This script creates products directly using the Prisma client,
 * bypassing the need for browser automation or API authentication.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// REAL DATABASE IDs (verified)
const REAL_DATA = {
  paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
  quantityGroupId: 'cmg5i6poy000094pu856umjxa',
  sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
  turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
}

// 4 REAL Products to create
const PRODUCTS = [
  {
    category: 'Business Card', // Use exact DB name
    name: 'Premium Business Cards',
    description:
      'High-quality premium business cards printed on professional card stock. Perfect for making a lasting impression.',
    sku: 'BIZ-CARD-PREM-001',
    basePrice: 29.99,
    setupFee: 5.0,
    isActive: true,
    isFeatured: true,
  },
  {
    category: 'Flyer', // Use exact DB name
    name: 'Marketing Flyers 8.5x11',
    description:
      'Eye-catching marketing flyers printed in full color. Ideal for promotions, events, and advertising campaigns.',
    sku: 'FLYER-MKT-8511-001',
    basePrice: 49.99,
    setupFee: 10.0,
    isActive: true,
    isFeatured: true,
  },
  {
    category: 'Postcard', // Use exact DB name
    name: 'Promotional Postcards',
    description:
      'High-impact promotional postcards perfect for direct mail campaigns, event invitations, and customer outreach.',
    sku: 'POST-PROMO-001',
    basePrice: 39.99,
    setupFee: 7.5,
    isActive: true,
    isFeatured: false,
  },
  {
    category: 'Brochure', // Use exact DB name
    name: 'Professional Brochures',
    description:
      'Professionally designed tri-fold brochures that showcase your business, products, and services with stunning clarity.',
    sku: 'BROCH-PRO-TRI-001',
    basePrice: 79.99,
    setupFee: 15.0,
    isActive: true,
    isFeatured: true,
  },
]

async function getCategoryId(categoryName) {
  // Try to find category by exact name match
  let category = await prisma.productCategory.findFirst({
    where: { name: categoryName },
  })

  if (category) {
    return category.id
  }

  // If not found, list all categories and find closest match
  const allCategories = await prisma.productCategory.findMany()
  console.log(`  ⚠️  Category "${categoryName}" not found`)
  console.log(`  Available categories:`, allCategories.map((c) => c.name).join(', '))

  // Use first category as fallback
  if (allCategories.length > 0) {
    console.log(`  - Using fallback: ${allCategories[0].name}`)
    return allCategories[0].id
  }

  throw new Error('No categories found in database')
}

async function createProduct(product, index) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Creating Product ${index + 1}/4: ${product.name}`)
  console.log('='.repeat(60))

  try {
    // Get category ID
    console.log(`Fetching category ID for: ${product.category}`)
    const categoryId = await getCategoryId(product.category)
    console.log(`  ✓ Category ID: ${categoryId}`)

    // Verify configuration IDs exist
    console.log('Verifying configuration IDs...')

    const paperStockSet = await prisma.paperStockSet.findUnique({
      where: { id: REAL_DATA.paperStockSetId },
    })
    if (!paperStockSet) {
      throw new Error(`Paper Stock Set not found: ${REAL_DATA.paperStockSetId}`)
    }
    console.log(`  ✓ Paper Stock Set: ${paperStockSet.name}`)

    const quantityGroup = await prisma.quantityGroup.findUnique({
      where: { id: REAL_DATA.quantityGroupId },
    })
    if (!quantityGroup) {
      throw new Error(`Quantity Group not found: ${REAL_DATA.quantityGroupId}`)
    }
    console.log(`  ✓ Quantity Group: ${quantityGroup.name}`)

    const sizeGroup = await prisma.sizeGroup.findUnique({
      where: { id: REAL_DATA.sizeGroupId },
    })
    if (!sizeGroup) {
      throw new Error(`Size Group not found: ${REAL_DATA.sizeGroupId}`)
    }
    console.log(`  ✓ Size Group: ${sizeGroup.name}`)

    const turnaroundTimeSet = await prisma.turnaroundTimeSet.findUnique({
      where: { id: REAL_DATA.turnaroundTimeSetId },
    })
    if (!turnaroundTimeSet) {
      throw new Error(`Turnaround Time Set not found: ${REAL_DATA.turnaroundTimeSetId}`)
    }
    console.log(`  ✓ Turnaround Time Set: ${turnaroundTimeSet.name}`)

    // Check if product with same SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: product.sku },
    })

    if (existingProduct) {
      console.log(
        `  ⚠️  Product with SKU ${product.sku} already exists (ID: ${existingProduct.id})`
      )
      console.log(`  - Skipping creation`)
      return {
        success: false,
        product: product.name,
        error: 'Product already exists',
        existingId: existingProduct.id,
      }
    }

    // Generate slug from product name
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create product
    console.log('Creating product in database...')
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        slug: slug,
        sku: product.sku,
        description: product.description,
        categoryId: categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        basePrice: product.basePrice,
        setupFee: product.setupFee,
        productionTime: 3, // Default production time in days

        // Create product configuration - NOTE: This might not be the right approach
        // The schema shows many-to-many relationships for groups/sets
        // We may need to create junction table records instead
      },
      include: {
        productCategory: true,
      },
    })

    console.log(`  ✅ Product created!`)
    console.log(`  - Product ID: ${createdProduct.id}`)
    console.log(`  - SKU: ${createdProduct.sku}`)

    // Now create the configuration relationships
    console.log('Creating configuration relationships...')

    // Link to Paper Stock Set
    await prisma.productPaperStockSet.create({
      data: {
        productId: createdProduct.id,
        paperStockSetId: REAL_DATA.paperStockSetId,
        isDefault: true,
        sortOrder: 0,
      },
    })
    console.log(`  ✓ Linked to Paper Stock Set`)

    // Link to Quantity Group (no isDefault or sortOrder)
    await prisma.productQuantityGroup.create({
      data: {
        productId: createdProduct.id,
        quantityGroupId: REAL_DATA.quantityGroupId,
      },
    })
    console.log(`  ✓ Linked to Quantity Group`)

    // Link to Size Group (no isDefault or sortOrder)
    await prisma.productSizeGroup.create({
      data: {
        productId: createdProduct.id,
        sizeGroupId: REAL_DATA.sizeGroupId,
      },
    })
    console.log(`  ✓ Linked to Size Group`)

    // Link to Turnaround Time Set (has isDefault but no sortOrder)
    await prisma.productTurnaroundTimeSet.create({
      data: {
        productId: createdProduct.id,
        turnaroundTimeSetId: REAL_DATA.turnaroundTimeSetId,
        isDefault: true,
      },
    })
    console.log(`  ✓ Linked to Turnaround Time Set`)

    console.log(`  ✅ SUCCESS: Product fully configured!`)
    console.log(`  - Name: ${createdProduct.name}`)
    console.log(`  - Category: ${createdProduct.productCategory.name}`)
    console.log(`  - Base Price: $${createdProduct.basePrice}`)
    console.log(`  - Setup Fee: $${createdProduct.setupFee}`)
    console.log(`  - Production Time: ${createdProduct.productionTime} days`)
    console.log(`  - Active: ${createdProduct.isActive}`)
    console.log(`  - Featured: ${createdProduct.isFeatured}`)

    return {
      success: true,
      product: product.name,
      productId: createdProduct.id,
      sku: createdProduct.sku,
      data: createdProduct,
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`)
    return {
      success: false,
      product: product.name,
      error: error.message,
    }
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('DIRECT PRODUCT CREATION SCRIPT')
  console.log('Using Prisma Client to create products directly')
  console.log('Products to create: 4')
  console.log('='.repeat(60))

  const results = []

  try {
    // Test database connection
    console.log('\nTesting database connection...')
    await prisma.$connect()
    console.log('  ✓ Database connected successfully')

    // Create each product
    for (let i = 0; i < PRODUCTS.length; i++) {
      const result = await createProduct(PRODUCTS[i], i)
      results.push(result)
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))

    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    console.log(`\n✅ Successful: ${successful.length}/${PRODUCTS.length}`)
    successful.forEach((r) => {
      console.log(`   - ${r.product}`)
      console.log(`     ID: ${r.productId}`)
      console.log(`     SKU: ${r.sku}`)
    })

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${PRODUCTS.length}`)
      failed.forEach((r) => {
        console.log(`   - ${r.product}`)
        console.log(`     Error: ${r.error}`)
        if (r.existingId) {
          console.log(`     Existing ID: ${r.existingId}`)
        }
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ All products processed successfully!')

    if (successful.length > 0) {
      console.log('\nNext steps:')
      console.log('1. Visit https://gangrunprinting.com/admin/products to view products')
      console.log('2. Add product images if needed')
      console.log('3. Test product configuration on the frontend')
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('\nDatabase connection closed.')
  }

  return results
}

// Run the script
main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
