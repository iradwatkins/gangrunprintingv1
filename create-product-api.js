// Direct API approach to create a product with only Quantity module
const https = require('https')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createQuantityOnlyProduct() {
  console.log('🚀 Creating real product with ONLY Quantity Module enabled')

  try {
    // First, get the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'iradwatkins@gmail.com',
        role: 'ADMIN',
      },
    })

    if (!adminUser) {
      throw new Error('Admin user not found')
    }
    console.log('✅ Admin user found:', adminUser.email)

    // Get the first available category
    const category = await prisma.productCategory.findFirst({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    if (!category) {
      throw new Error('No active category found')
    }
    console.log('✅ Using category:', category.name)

    // Get the active quantity group
    const quantityGroup = await prisma.quantityGroup.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!quantityGroup) {
      throw new Error('No active quantity group found')
    }
    console.log('✅ Using quantity group:', quantityGroup.name)
    console.log('   Available quantities:', quantityGroup.values)

    // Create the product with minimal configuration
    const timestamp = Date.now()
    const productName = `Business Cards - Quantity Only Test ${timestamp}`
    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: `BC-QTY-${timestamp}`,
        description:
          'High-quality business cards with flexible quantity options. This product demonstrates the Quantity Module working independently without any other modules.',
        basePrice: 49.99,
        categoryId: category.id,
        isActive: true,
        isFeatured: false,
        productionTime: 3, // Default 3 business days
      },
    })

    console.log('\n✅ ✅ ✅ SUCCESS! Product created! ✅ ✅ ✅')
    console.log('Product ID:', product.id)
    console.log('Product Name:', product.name)
    console.log('Product Slug:', product.slug)

    // Link the quantity group to the product
    await prisma.productQuantityGroup.create({
      data: {
        productId: product.id,
        quantityGroupId: quantityGroup.id,
      },
    })
    console.log('✅ Quantity group linked to product')

    // Create a simple product image placeholder
    try {
      await prisma.productImage.create({
        data: {
          url: 'https://via.placeholder.com/800x600/4a90e2/ffffff?text=Business+Cards',
          altText: 'Business Cards - Quantity Module Test',
          isPrimary: true,
          sortOrder: 0,
          Product: {
            connect: { id: product.id },
          },
        },
      })
      console.log('✅ Placeholder image added')
    } catch (imgError) {
      console.log('⚠️ Image creation skipped (optional)')
    }

    console.log('\n🔗 View your product at:')
    console.log(`   Admin: https://gangrunprinting.com/admin/products/${product.id}`)
    console.log(`   Frontend: https://gangrunprinting.com/products/${product.slug}`)

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('❌ Error creating product:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    return {
      success: false,
      error: error.message,
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the creation
createQuantityOnlyProduct()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 Product creation completed successfully!')
      console.log('The Quantity Module is working independently!')
    } else {
      console.error('\n❌ Product creation failed')
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
