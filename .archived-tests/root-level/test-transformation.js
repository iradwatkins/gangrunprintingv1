const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTransformation() {
  try {
    console.log('Testing API transformation...')

    const paperStocks = await prisma.paperStock.findMany({
      take: 1,
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

    // Get all coating and sides options for comparison
    const allCoatings = await prisma.coatingOption.findMany()
    const allSides = await prisma.sidesOption.findMany()

    // Transform to match the frontend structure
    const transformed = paperStocks.map((stock) => {
      // Map coatings
      const stockCoatingIds = stock.paperStockCoatings.map((sc) => sc.coatingId)
      const coatings = allCoatings.map((coating) => ({
        id: coating.id,
        label: coating.name,
        enabled: stockCoatingIds.includes(coating.id),
      }))

      // Map sides options
      const stockSidesMap = new Map(stock.paperStockSides.map((ss) => [ss.sidesOptionId, ss]))
      const sidesOptions = allSides.map((side) => {
        const stockSide = stockSidesMap.get(side.id)
        return {
          id: side.id,
          label: side.name,
          enabled: stockSide?.isEnabled || false,
          multiplier: stockSide ? Number(stockSide.priceMultiplier) : 1.0,
        }
      })

      // Find defaults
      const defaultCoating =
        stock.paperStockCoatings.find((c) => c.isDefault)?.coatingId ||
        coatings.find((c) => c.enabled)?.id ||
        allCoatings[0]?.id ||
        ''

      const defaultSides =
        allSides.find((s) => s.isDefault)?.id ||
        sidesOptions.find((s) => s.enabled)?.id ||
        allSides[0]?.id ||
        ''

      return {
        id: stock.id,
        name: stock.name,
        weight: stock.weight,
        pricePerSqInch: stock.pricePerSqInch,
        tooltipText: stock.tooltipText,
        isActive: stock.isActive,
        paperStockCoatings: stock.paperStockCoatings.map((pc) => ({
          ...pc,
          coating: pc.CoatingOption, // Transform PascalCase to camelCase for frontend
        })),
        paperStockSides: stock.paperStockSides.map((ps) => ({
          ...ps,
          sidesOption: ps.SidesOption, // Transform PascalCase to camelCase for frontend
        })),
        productsCount: stock.paperStockSetItems.length,
      }
    })

    console.log('Transformed result:')
    console.log(JSON.stringify(transformed[0], null, 2))
  } catch (error) {
    console.error('Error in transformation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTransformation()
