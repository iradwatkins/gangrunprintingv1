import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProductConfigurations() {
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
      if (product.productPaperStockSets.length > 0) {
        const paperStockSet = product.productPaperStockSets[0].paperStockSet

        // Show details for each paper stock
        paperStockSet.paperStockItems.forEach((item, index) => {
          const paperStock = item.paperStock

          if (paperStock.paperStockCoatings.length > 0) {
            paperStock.paperStockCoatings.slice(0, 3).forEach((coating) => {
              console.log(
                `        • ${coating.coating.name} ${coating.isDefault ? '(Default)' : ''}`
              )
            })
            if (paperStock.paperStockCoatings.length > 3) {
            }
          }

          if (paperStock.paperStockSides.length > 0) {
            paperStock.paperStockSides.slice(0, 3).forEach((side) => {})
            if (paperStock.paperStockSides.length > 3) {
            }
          }
        })
      } else {
      }

      console.log('\n' + '─'.repeat(60) + '\n')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyProductConfigurations()
