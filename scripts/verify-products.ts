import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProducts() {
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
      if (product.rushAvailable) {
      }

      if (product.gangRunEligible) {
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
      }

      // Quantities
      if (product.productQuantityGroups.length > 0) {
        const quantityGroup = product.productQuantityGroups[0].quantityGroup
        const quantities = quantityGroup.values.split(',').slice(0, 3).join(', ')
      }
    } else {
    }
  }

  // Summary
  const allProducts = await prisma.product.count()
  const activeProducts = await prisma.product.count({
    where: { isActive: true },
  })

  await prisma.$disconnect()
}

verifyProducts()
