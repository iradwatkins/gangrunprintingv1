import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding paper stock options...')

  // Create coating options
  const coatings = [
    { name: 'High Gloss UV', description: 'Ultra-shiny finish with UV coating' },
    { name: 'High Gloss UV (One Side)', description: 'UV coating on one side only' },
    { name: 'Gloss Aqueous', description: 'Water-based glossy coating' },
    { name: 'Matte Aqueous', description: 'Water-based matte coating' },
    { name: 'No Coating', description: 'Uncoated paper' },
  ]

  for (const coating of coatings) {
    await prisma.coatingOption.upsert({
      where: { name: coating.name },
      update: {},
      create: coating
    })
  }

  // Create sides options
  const sidesOptions = [
    { 
      name: 'Same image, both sides', 
      code: '4/4-same',
      description: 'Full color on both sides, same image'
    },
    { 
      name: 'Different image, both sides', 
      code: '4/4-diff',
      description: 'Full color on both sides, different images'
    },
    { 
      name: 'Your Image Front / Ours Back', 
      code: '4/4-template',
      description: 'Your design front, our template back'
    },
    { 
      name: 'Image one side only', 
      code: '4/0',
      description: 'Full color on front only'
    },
  ]

  for (const sides of sidesOptions) {
    await prisma.sidesOption.upsert({
      where: { code: sides.code },
      update: {},
      create: sides
    })
  }

  // Create sample paper stocks
  const paperStocks = [
    {
      name: '12pt Card Stock',
      basePricePerUnit: 0.00001234,
      shippingWeight: 0.5,
      isActive: true
    },
    {
      name: '100lb Text Paper',
      basePricePerUnit: 0.00001000,
      shippingWeight: 0.4,
      isActive: true
    },
    {
      name: '16pt Card Stock',
      basePricePerUnit: 0.00001500,
      shippingWeight: 0.6,
      isActive: true
    }
  ]

  const allCoatings = await prisma.coatingOption.findMany()
  const allSides = await prisma.sidesOption.findMany()

  for (const stock of paperStocks) {
    const created = await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: {},
      create: {
        ...stock,
        paperStockCoatings: {
          create: allCoatings.map((coating, index) => ({
            coatingId: coating.id,
            isDefault: index === 0
          }))
        },
        paperStockSides: {
          create: allSides.map((sides) => ({
            sidesOptionId: sides.id,
            priceMultiplier: sides.code === '4/4-diff' ? 1.75 : 1.0,
            isEnabled: true
          }))
        }
      }
    })
    console.log(`Created paper stock: ${created.name}`)
  }

  console.log('✅ Paper stock options seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding paper stocks:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })