const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugAPI() {
  try {
    console.log('Testing paper stocks query...')

    // Try a simple query first
    console.log('1. Simple query without includes:')
    const simpleStocks = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
    })
    console.log(`Found ${simpleStocks.length} paper stocks`)

    // Try with includes one by one
    console.log('2. Query with paperStockCoatings:')
    const stocksWithCoatings = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: true,
      },
    })
    console.log(`Found ${stocksWithCoatings.length} paper stocks with coatings`)

    console.log('3. Query with paperStockCoatings nested:')
    const stocksWithCoatingsFull = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockCoatings: {
          include: {
            CoatingOption: true,
          },
        },
      },
    })
    console.log(`Found ${stocksWithCoatingsFull.length} paper stocks with coating details`)

    console.log('4. Query with paperStockSides:')
    const stocksWithSides = await prisma.paperStock.findMany({
      orderBy: { name: 'asc' },
      include: {
        paperStockSides: {
          include: {
            SidesOption: true,
          },
        },
      },
    })
    console.log(`Found ${stocksWithSides.length} paper stocks with sides`)

    console.log('5. Full query like in API:')
    const fullQuery = await prisma.paperStock.findMany({
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
    console.log(`Found ${fullQuery.length} paper stocks with full query`)
  } catch (error) {
    console.error('Error in query:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAPI()
