import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBusinessCardsPaper() {
  console.log('🔧 Fixing Premium Business Cards paper stock configuration...\n')

  try {
    // Find the Premium Business Cards product
    const product = await prisma.product.findUnique({
      where: { sku: 'BC-PREM-001' }
    })

    if (!product) {
      console.log('❌ Product not found')
      return
    }

    console.log(`Found: ${product.name}`)

    // Find Standard Cardstock Set
    const paperStockSet = await prisma.paperStockSet.findFirst({
      where: { name: 'Standard Cardstock Set' }
    })

    if (!paperStockSet) {
      console.log('❌ Paper stock set not found')
      return
    }

    console.log(`Found paper stock set: ${paperStockSet.name}`)

    // Check if already linked
    const existing = await prisma.productPaperStockSet.findFirst({
      where: {
        productId: product.id,
        paperStockSetId: paperStockSet.id
      }
    })

    if (existing) {
      console.log('✅ Already linked!')
    } else {
      // Link the paper stock set to the product
      await prisma.productPaperStockSet.create({
        data: {
          productId: product.id,
          paperStockSetId: paperStockSet.id,
          isDefault: true
        }
      })
      console.log('✅ Successfully linked paper stock set to product!')
    }

    // Also fix the missing size group
    const sizeGroup = await prisma.sizeGroup.findFirst({
      where: { name: 'Business Card Sizes' }
    })

    if (sizeGroup) {
      const existingSize = await prisma.productSizeGroup.findFirst({
        where: {
          productId: product.id,
          sizeGroupId: sizeGroup.id
        }
      })

      if (!existingSize) {
        await prisma.productSizeGroup.create({
          data: {
            productId: product.id,
            sizeGroupId: sizeGroup.id
          }
        })
        console.log('✅ Also linked size group!')
      }
    }

    // Verify the configuration
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
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

    console.log('\n📊 Updated Configuration:')
    console.log(`   Paper Stock Sets: ${updatedProduct?.productPaperStockSets.length}`)
    console.log(`   Size Groups: ${updatedProduct?.productSizeGroups.length}`)
    console.log(`   Quantity Groups: ${updatedProduct?.productQuantityGroups.length}`)

    console.log('\n✅ Business Cards configuration fixed!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixBusinessCardsPaper()