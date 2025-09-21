import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBusinessCardsPaper() {

  try {
    // Find the Premium Business Cards product
    const product = await prisma.product.findUnique({
      where: { sku: 'BC-PREM-001' },
    })

    if (!product) {

      return
    }

    // Find Standard Cardstock Set
    const paperStockSet = await prisma.paperStockSet.findFirst({
      where: { name: 'Standard Cardstock Set' },
    })

    if (!paperStockSet) {

      return
    }

    // Check if already linked
    const existing = await prisma.productPaperStockSet.findFirst({
      where: {
        productId: product.id,
        paperStockSetId: paperStockSet.id,
      },
    })

    if (existing) {

    } else {
      // Link the paper stock set to the product
      await prisma.productPaperStockSet.create({
        data: {
          productId: product.id,
          paperStockSetId: paperStockSet.id,
          isDefault: true,
        },
      })

    }

    // Also fix the missing size group
    const sizeGroup = await prisma.sizeGroup.findFirst({
      where: { name: 'Business Card Sizes' },
    })

    if (sizeGroup) {
      const existingSize = await prisma.productSizeGroup.findFirst({
        where: {
          productId: product.id,
          sizeGroupId: sizeGroup.id,
        },
      })

      if (!existingSize) {
        await prisma.productSizeGroup.create({
          data: {
            productId: product.id,
            sizeGroupId: sizeGroup.id,
          },
        })

      }
    }

    // Verify the configuration
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
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
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixBusinessCardsPaper()
