import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConfigurationAPI() {
  console.log('🧪 Testing Product Configuration API...\n')

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
      console.log(`📦 Testing: ${product.name}`)
      console.log(`   ID: ${product.id}`)

      // Test the configuration API
      const apiUrl = `http://localhost:3002/api/products/${product.id}/configuration`

      try {
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (response.ok) {
          console.log(`   ✅ API Response OK`)
          console.log(`   📊 Data Summary:`)
          console.log(`      - Quantities: ${data.quantities?.length || 0}`)
          console.log(`      - Sizes: ${data.sizes?.length || 0}`)
          console.log(`      - Paper Stocks: ${data.paperStocks?.length || 0}`)

          if (data.paperStocks && data.paperStocks.length > 0) {
            const firstPaper = data.paperStocks[0]
            console.log(`   📄 First Paper Stock: ${firstPaper.name}`)
            console.log(`      - Coatings: ${firstPaper.paperStockCoatings?.length || 0}`)
            console.log(`      - Sides: ${firstPaper.paperStockSides?.length || 0}`)

            // List coating options
            if (firstPaper.paperStockCoatings?.length > 0) {
              console.log(`      - Available Coatings:`)
              firstPaper.paperStockCoatings.slice(0, 3).forEach((coating: any) => {
                console.log(
                  `        • ${coating.coating.name} ${coating.isDefault ? '(Default)' : ''}`
                )
              })
            }

            // List sides options
            if (firstPaper.paperStockSides?.length > 0) {
              console.log(`      - Available Sides:`)
              firstPaper.paperStockSides.slice(0, 3).forEach((side: any) => {
                console.log(`        • ${side.sidesOption.name} (${side.priceMultiplier}x)`)
              })
            }
          }

          console.log(`   📍 Defaults:`)
          console.log(`      - Quantity: ${data.defaults?.quantity || 'None'}`)
          console.log(`      - Size: ${data.defaults?.size || 'None'}`)
          console.log(`      - Paper: ${data.defaults?.paper || 'None'}`)
          console.log(`      - Coating: ${data.defaults?.coating || 'None'}`)
          console.log(`      - Sides: ${data.defaults?.sides || 'None'}`)
        } else {
          console.log(`   ❌ API Error: ${data.error}`)
        }
      } catch (error) {
        console.log(`   ❌ Fetch Error:`, error)
      }

      console.log('')
    }

    console.log('✅ Configuration API test complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testConfigurationAPI()
