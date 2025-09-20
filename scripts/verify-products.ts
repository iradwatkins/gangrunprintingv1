import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProducts() {
  console.log('🔍 Verifying created products...\n')

  const productSkus = ['BC-PREM-001', 'FLY-MKT-001', 'POS-PRO-001']

  for (const sku of productSkus) {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        ProductCategory: true,
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: true,
                  },
                },
              },
            },
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

    if (product) {
      console.log(`✅ ${product.name}`)
      console.log(`   SKU: ${product.sku}`)
      console.log(`   Category: ${product.ProductCategory?.name || 'None'}`)
      console.log(`   Base Price: $${product.basePrice}`)
      console.log(`   Production Time: ${product.productionTime} days`)

      if (product.rushAvailable) {
        console.log(`   Rush Available: Yes (${product.rushDays} days, +$${product.rushFee})`)
      }

      if (product.gangRunEligible) {
        console.log(`   Gang Run: ${product.minGangQuantity} - ${product.maxGangQuantity} units`)
      }

      // Paper stocks
      if (product.productPaperStockSets.length > 0) {
        const paperStockSet = product.productPaperStockSets[0].paperStockSet
        console.log(
          `   Paper Stock Set: ${paperStockSet.name} (${paperStockSet.paperStockItems.length} options)`
        )
      }

      // Sizes
      if (product.productSizeGroups.length > 0) {
        const sizeGroup = product.productSizeGroups[0].sizeGroup
        const sizes = sizeGroup.values.split(',').slice(0, 3).join(', ')
        console.log(`   Sizes: ${sizes}...`)
      }

      // Quantities
      if (product.productQuantityGroups.length > 0) {
        const quantityGroup = product.productQuantityGroups[0].quantityGroup
        const quantities = quantityGroup.values.split(',').slice(0, 3).join(', ')
        console.log(`   Quantities: ${quantities}...`)
      }

      console.log(`   Status: ${product.isActive ? 'Active' : 'Inactive'}`)
      console.log(`   URL: http://localhost:3002/products/${product.slug}`)
      console.log('')
    } else {
      console.log(`❌ Product not found: ${sku}\n`)
    }
  }

  // Summary
  const allProducts = await prisma.product.count()
  const activeProducts = await prisma.product.count({
    where: { isActive: true },
  })

  console.log('📊 Summary:')
  console.log(`   Total Products: ${allProducts}`)
  console.log(`   Active Products: ${activeProducts}`)

  await prisma.$disconnect()
}

verifyProducts()
