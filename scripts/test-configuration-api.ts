import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConfigurationAPI() {
  try {
    // Find our test products
    const products = await prisma.product.findMany({
      where: {
        sku: {
          in: ['BC-PREM-001', 'FLY-MKT-001', 'POS-PRO-001'],
        },
      },
    })

    for (const product of products) {
      // Test the configuration API
      const apiUrl = `http://localhost:3002/api/products/${product.id}/configuration`

      try {
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (response.ok) {
          if (data.paperStocks && data.paperStocks.length > 0) {
            const firstPaper = data.paperStocks[0]

            // List coating options
            if (firstPaper.paperStockCoatings?.length > 0) {
              firstPaper.paperStockCoatings.slice(0, 3).forEach((coating: any) => {
                console.log(
                  `        • ${coating.coating.name} ${coating.isDefault ? '(Default)' : ''}`
                )
              })
            }

            // List sides options
            if (firstPaper.paperStockSides?.length > 0) {
              firstPaper.paperStockSides.slice(0, 3).forEach((side: any) => {})
            }
          }
        } else {
        }
      } catch (error) {}
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testConfigurationAPI()
