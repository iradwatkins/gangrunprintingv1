const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testResponse() {
  try {
    console.log('Testing API query response structure...')

    const paperStocks = await prisma.paperStock.findMany({
      take: 1, // Just get one for testing
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

    console.log('Raw Prisma response structure:')
    console.log(JSON.stringify(paperStocks[0], null, 2))

  } catch (error) {
    console.error('Error in query:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testResponse()