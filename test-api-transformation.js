const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPITransformation() {
  try {
    console.log('Testing API transformation logic...')

    // Get the data the same way the API does
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

    console.log(`Found ${groups.length} groups`)

    // Apply the same transformation as the API
    const transformedGroups = groups.map(group => ({
      ...group,
      paperStockSetItems: group.PaperStockSetItem?.map(item => ({
        ...item,
        paperStock: item.PaperStock ? {
          ...item.PaperStock,
          paperStockCoatings: item.PaperStock.paperStockCoatings?.map(pc => ({
            ...pc,
            coating: pc.CoatingOption
          })) || [],
          paperStockSides: item.PaperStock.paperStockSides?.map(ps => ({
            ...ps,
            sidesOption: ps.SidesOption
          })) || []
        } : null
      })) || []
    }))

    console.log('Transformation completed successfully')
    console.log('First group:', {
      id: transformedGroups[0].id,
      name: transformedGroups[0].name,
      itemsCount: transformedGroups[0].paperStockSetItems.length
    })

  } catch (error) {
    console.error('Error in transformation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPITransformation()