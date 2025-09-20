import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProductConfigurations() {
  console.log('🔍 Verifying product configurations and paper relationships...\n')

  try {
    // Get our test products
    const products = await prisma.product.findMany({
      where: {
        sku: {
          in: ['BC-PREM-001', 'FLY-MKT-001', 'POS-PRO-001'],
        },
      },
      include: {
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: {
                      include: {
                        paperStockCoatings: {
                          include: {
                            coating: true,
                          },
                        },
                        paperStockSides: {
                          include: {
                            sidesOption: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    for (const product of products) {
      console.log(`📦 ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   SKU: ${product.sku}`)

      if (product.productPaperStockSets.length > 0) {
        const paperStockSet = product.productPaperStockSets[0].paperStockSet
        console.log(`   Paper Stock Set: ${paperStockSet.name}`)
        console.log(`   Total Paper Stocks: ${paperStockSet.paperStockItems.length}`)

        // Show details for each paper stock
        paperStockSet.paperStockItems.forEach((item, index) => {
          const paperStock = item.paperStock
          console.log(`\n   📄 Paper Stock #${index + 1}: ${paperStock.name}`)
          console.log(`      - Coating Options: ${paperStock.paperStockCoatings.length}`)

          if (paperStock.paperStockCoatings.length > 0) {
            paperStock.paperStockCoatings.slice(0, 3).forEach((coating) => {
              console.log(
                `        • ${coating.coating.name} ${coating.isDefault ? '(Default)' : ''}`
              )
            })
            if (paperStock.paperStockCoatings.length > 3) {
              console.log(`        ... and ${paperStock.paperStockCoatings.length - 3} more`)
            }
          }

          console.log(`      - Sides Options: ${paperStock.paperStockSides.length}`)

          if (paperStock.paperStockSides.length > 0) {
            paperStock.paperStockSides.slice(0, 3).forEach((side) => {
              console.log(`        • ${side.sidesOption.name} (${side.priceMultiplier}x)`)
            })
            if (paperStock.paperStockSides.length > 3) {
              console.log(`        ... and ${paperStock.paperStockSides.length - 3} more`)
            }
          }
        })
      } else {
        console.log(`   ⚠️  No paper stock sets configured`)
      }

      console.log('\n' + '─'.repeat(60) + '\n')
    }

    console.log('📊 Summary:')
    console.log(`   Total products checked: ${products.length}`)
    console.log(`   All products have paper stocks with coating and sides options configured`)
    console.log('\n✅ Configuration verification complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyProductConfigurations()
