const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPaperStockSetsAPI() {
  try {
    console.log('Testing paper stock sets API query...')

    // Test the exact query from the API
    const groups = await prisma.paperStockSet.findMany({
      include: {
        PaperStockSetItem: {
          include: {
            PaperStock: {
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
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    console.log(`✓ Found ${groups.length} paper stock sets`)

    if (groups.length > 0) {
      console.log('First set:', {
        id: groups[0].id,
        name: groups[0].name,
        itemsCount: groups[0].PaperStockSetItem ? groups[0].PaperStockSetItem.length : 0
      })
    }

  } catch (error) {
    console.error('Error in paper stock sets query:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPaperStockSetsAPI()