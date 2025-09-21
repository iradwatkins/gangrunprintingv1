const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMinimalAPI() {
  try {
    console.log('Testing minimal API logic...')

    // Step 1: Basic query
    console.log('Step 1: Basic query')
    const paperStocks = await prisma.paperStock.findMany({
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
    console.log(`✓ Found ${paperStocks.length} paper stocks`)

    // Step 2: Get additional data
    console.log('Step 2: Get additional data')
    const allCoatings = await prisma.coatingOption.findMany()
    const allSides = await prisma.sidesOption.findMany()
    console.log(`✓ Found ${allCoatings.length} coatings and ${allSides.length} sides`)

    // Step 3: Transform data (just first stock)
    console.log('Step 3: Transform first stock')
    const stock = paperStocks[0]

    const stockCoatingIds = stock.paperStockCoatings.map((sc) => sc.coatingId)
    console.log(`✓ Stock has ${stockCoatingIds.length} coatings`)

    const coatings = allCoatings.map((coating) => ({
      id: coating.id,
      label: coating.name,
      enabled: stockCoatingIds.includes(coating.id),
    }))
    console.log(`✓ Mapped ${coatings.length} coating options`)

    const stockSidesMap = new Map(stock.paperStockSides.map((ss) => [ss.sidesOptionId, ss]))
    console.log(`✓ Created sides map with ${stockSidesMap.size} entries`)

    const sidesOptions = allSides.map((side) => {
      const stockSide = stockSidesMap.get(side.id)
      return {
        id: side.id,
        label: side.name,
        enabled: stockSide?.isEnabled || false,
        multiplier: stockSide ? Number(stockSide.priceMultiplier) : 1.0,
      }
    })
    console.log(`✓ Mapped ${sidesOptions.length} sides options`)

    const defaultCoating =
      stock.paperStockCoatings.find((c) => c.isDefault)?.coatingId ||
      coatings.find((c) => c.enabled)?.id ||
      allCoatings[0]?.id ||
      ''
    console.log(`✓ Default coating: ${defaultCoating}`)

    const defaultSides =
      sidesOptions.find((s) => s.enabled)?.id ||
      allSides[0]?.id ||
      ''
    console.log(`✓ Default sides: ${defaultSides}`)

    const transformed = {
      id: stock.id,
      name: stock.name,
      weight: stock.weight,
      pricePerSqInch: stock.pricePerSqInch,
      tooltipText: stock.tooltipText,
      isActive: stock.isActive,
      paperStockCoatings: stock.paperStockCoatings.map(pc => ({
        ...pc,
        coating: pc.CoatingOption
      })),
      paperStockSides: stock.paperStockSides.map(ps => ({
        ...ps,
        sidesOption: ps.SidesOption
      })),
      productsCount: stock.paperStockSetItems.length,
    }

    console.log('✓ Transformation successful')
    console.log('Final result preview:', {
      id: transformed.id,
      name: transformed.name,
      coatingsCount: transformed.paperStockCoatings.length,
      sidesCount: transformed.paperStockSides.length,
      productsCount: transformed.productsCount
    })

  } catch (error) {
    console.error('Error in minimal API test:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testMinimalAPI()