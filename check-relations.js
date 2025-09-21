const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRelations() {
  try {
    console.log('Checking relations...')

    // Check all paper stocks
    const allStocks = await prisma.paperStock.findMany()
    console.log(`Total paper stocks: ${allStocks.length}`)

    // Check each stock's relations
    for (const stock of allStocks) {
      console.log(`\nStock: ${stock.name} (${stock.id})`)

      const coatings = await prisma.paperStockCoating.findMany({
        where: { paperStockId: stock.id }
      })
      console.log(`  Coatings: ${coatings.length}`)

      const sides = await prisma.paperStockSides.findMany({
        where: { paperStockId: stock.id }
      })
      console.log(`  Sides: ${sides.length}`)

      const setItems = await prisma.paperStockSetItem.findMany({
        where: { paperStockId: stock.id }
      })
      console.log(`  Set items: ${setItems.length}`)
    }

    // Try query without includes
    console.log('\nTesting query without includes:')
    const stocksNoIncludes = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' }
    })
    console.log(`Found ${stocksNoIncludes.length} stocks without includes`)

    // Try query with one include at a time
    console.log('\nTesting with coating includes only:')
    const stocksWithCoatings = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: true
      }
    })
    console.log(`Found ${stocksWithCoatings.length} stocks with coatings`)

    console.log('\nTesting with coating includes nested:')
    const stocksWithCoatingsNested = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: {
          include: {
            CoatingOption: true,
          },
        }
      }
    })
    console.log(`Found ${stocksWithCoatingsNested.length} stocks with nested coatings`)

    // Test the full include that was failing
    console.log('\nTesting full include:')
    const stocksFull = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: {
          include: {
            CoatingOption: true,
          },
        },
        paperStockSides: {
          include: {
            SidesOption: true,
          },
        },
        paperStockSetItems: true,
      },
    })
    console.log(`Found ${stocksFull.length} stocks with full include`)

  } catch (error) {
    console.error('Error checking relations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRelations()