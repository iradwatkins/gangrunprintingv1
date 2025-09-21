import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedQuantities() {

  const quantitiesData = [
    {
      name: '250',
      value: 250,
      isCustom: false,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: '500',
      value: 500,
      isCustom: false,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: '1000',
      value: 1000,
      isCustom: false,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: '2500',
      value: 2500,
      isCustom: false,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: '5000',
      value: 5000,
      isCustom: false,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: '10000',
      value: 10000,
      isCustom: false,
      sortOrder: 6,
      isActive: true,
    },
    {
      name: 'Custom...',
      value: null,
      isCustom: true,
      minValue: 100,
      maxValue: 100000,
      sortOrder: 7,
      isActive: true,
    },
  ]

  for (const quantity of quantitiesData) {
    try {
      await prisma.quantity.upsert({
        where: { name: quantity.name },
        update: quantity,
        create: quantity,
      })

    } catch (error) {
      console.error(`Error seeding quantity ${quantity.name}:`, error)
    }
  }

}

seedQuantities()
  .catch((e) => {
    console.error('Error seeding quantities:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
