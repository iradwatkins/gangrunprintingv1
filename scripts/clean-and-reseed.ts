import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanAndReseed() {
  console.log('🧹 Cleaning duplicate categories...')

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

  console.log('✅ Cleaned up categories')

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

  console.log('\n📊 Current Database Status:')
  console.log(`  Paper Stocks: ${counts[0]}`)
  console.log(`  Size Groups: ${counts[1]}`)
  console.log(`  Quantity Groups: ${counts[2]}`)
  console.log(`  Add-ons: ${counts[3]}`)
  console.log(`  Product Categories: ${counts[4]}`)
  console.log(`  Sides Options: ${counts[5]}`)
  console.log(`  Coating Options: ${counts[6]}`)

  console.log('\n✨ Database is ready with all real data!')
}

cleanAndReseed()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
