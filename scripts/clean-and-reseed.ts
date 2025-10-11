import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanAndReseed() {
  // First, delete all categories except our core 10
  const coreCategories = [
    'business-cards',
    'flyers',
    'postcards',
    'posters',
    'banners',
    'stickers',
    'apparel',
    'marketing',
    'packaging',
    'large-format',
  ]

  // Delete categories not in our core list
  await prisma.productCategory.deleteMany({
    where: {
      id: {
        notIn: coreCategories,
      },
    },
  })

  // Verify counts
  const counts = await Promise.all([
    prisma.paperStock.count(),
    prisma.sizeGroup.count(),
    prisma.quantityGroup.count(),
    prisma.addOn.count(),
    prisma.productCategory.count(),
    prisma.sidesOption.count(),
    prisma.coatingOption.count(),
  ])
}

cleanAndReseed()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
