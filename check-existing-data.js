const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkExistingData() {
  try {
    console.log('Checking existing data in database...')

    const paperStocksCount = await prisma.paperStock.count()
    const paperStockSetsCount = await prisma.paperStockSet.count()
    const coatingOptionsCount = await prisma.coatingOption.count()
    const sidesOptionsCount = await prisma.sidesOption.count()

    console.log(`Paper Stocks: ${paperStocksCount}`)
    console.log(`Paper Stock Sets: ${paperStockSetsCount}`)
    console.log(`Coating Options: ${coatingOptionsCount}`)
    console.log(`Sides Options: ${sidesOptionsCount}`)

    if (paperStocksCount > 0) {
      console.log('\nExisting Paper Stocks:')
      const stocks = await prisma.paperStock.findMany({
        select: { id: true, name: true, isActive: true }
      })
      stocks.forEach(stock => console.log(`- ${stock.name} (${stock.id}) - Active: ${stock.isActive}`))
    }

    if (paperStockSetsCount > 0) {
      console.log('\nExisting Paper Stock Sets:')
      const sets = await prisma.paperStockSet.findMany({
        select: { id: true, name: true, isActive: true }
      })
      sets.forEach(set => console.log(`- ${set.name} (${set.id}) - Active: ${set.isActive}`))
    }

    if (coatingOptionsCount > 0) {
      console.log('\nExisting Coating Options:')
      const coatings = await prisma.coatingOption.findMany({
        select: { id: true, name: true }
      })
      coatings.forEach(coating => console.log(`- ${coating.name} (${coating.id})`))
    }

    if (sidesOptionsCount > 0) {
      console.log('\nExisting Sides Options:')
      const sides = await prisma.sidesOption.findMany({
        select: { id: true, name: true, code: true }
      })
      sides.forEach(side => console.log(`- ${side.name} (${side.code}) (${side.id})`))
    }

  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingData()