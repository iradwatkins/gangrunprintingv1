const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTurnaroundTimes() {
  const turnaroundTimes = [
    {
      name: 'Economy',
      displayName: 'Economy (2-4 Days)',
      description: 'Standard processing time',
      daysMin: 2,
      daysMax: 4,
      pricingModel: 'FLAT',
      basePrice: 0,
      priceMultiplier: 1.0,
      requiresNoCoating: false,
      restrictedCoatings: [],
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Fast',
      displayName: 'Fast (1-2 Days)',
      description: 'Expedited processing',
      daysMin: 1,
      daysMax: 2,
      pricingModel: 'PERCENTAGE',
      basePrice: 0,
      priceMultiplier: 1.25,
      requiresNoCoating: false,
      restrictedCoatings: [],
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Faster',
      displayName: 'Faster (Tomorrow)',
      description: 'Next day delivery',
      daysMin: 1,
      daysMax: 1,
      pricingModel: 'PERCENTAGE',
      basePrice: 0,
      priceMultiplier: 1.54,
      requiresNoCoating: false,
      restrictedCoatings: [],
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Fastest',
      displayName: 'Fastest WITH NO COATING (Today)',
      description: 'Same day processing without coating',
      daysMin: 0,
      daysMax: 0,
      pricingModel: 'PERCENTAGE',
      basePrice: 0,
      priceMultiplier: 4.98,
      requiresNoCoating: true,
      restrictedCoatings: ['coating_1', 'coating_3'],
      sortOrder: 4,
      isActive: true,
    },
  ]

  for (const turnaroundTime of turnaroundTimes) {
    const existing = await prisma.turnaroundTime.findFirst({
      where: { name: turnaroundTime.name },
    })

    if (existing) {
      continue
    }

    await prisma.turnaroundTime.create({
      data: turnaroundTime,
    })
  }
}

seedTurnaroundTimes()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
