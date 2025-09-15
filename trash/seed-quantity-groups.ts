import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting quantity groups seed...')

  // First, create some sample quantities if they don't exist
  const quantities = [
    // Small quantities
    { name: '25', value: 25, isCustom: false, sortOrder: 1 },
    { name: '50', value: 50, isCustom: false, sortOrder: 2 },
    { name: '100', value: 100, isCustom: false, sortOrder: 3 },
    { name: '250', value: 250, isCustom: false, sortOrder: 4 },
    { name: '500', value: 500, isCustom: false, sortOrder: 5 },
    // Medium quantities
    { name: '1,000', value: 1000, isCustom: false, sortOrder: 6 },
    { name: '2,500', value: 2500, isCustom: false, sortOrder: 7 },
    { name: '5,000', value: 5000, isCustom: false, sortOrder: 8 },
    { name: '7,500', value: 7500, isCustom: false, sortOrder: 9 },
    { name: '10,000', value: 10000, isCustom: false, sortOrder: 10 },
    // Large quantities
    { name: '15,000', value: 15000, isCustom: false, sortOrder: 11 },
    { name: '20,000', value: 20000, isCustom: false, sortOrder: 12 },
    { name: '25,000', value: 25000, isCustom: false, sortOrder: 13 },
    { name: '30,000', value: 30000, isCustom: false, sortOrder: 14 },
    { name: '50,000', value: 50000, isCustom: false, sortOrder: 15 },
    { name: '75,000', value: 75000, isCustom: false, sortOrder: 16 },
    { name: '100,000', value: 100000, isCustom: false, sortOrder: 17 },
    // Custom option
    { name: 'Custom...', value: null, isCustom: true, minValue: 25, maxValue: 1000000, sortOrder: 18 },
    // Poster quantities (small)
    { name: '1', value: 1, isCustom: false, sortOrder: 0 },
    { name: '2', value: 2, isCustom: false, sortOrder: 0 },
    { name: '3', value: 3, isCustom: false, sortOrder: 0 },
    { name: '4', value: 4, isCustom: false, sortOrder: 0 },
    { name: '5', value: 5, isCustom: false, sortOrder: 0 },
    { name: '10', value: 10, isCustom: false, sortOrder: 0 },
  ]

  // Create quantities
  for (const quantity of quantities) {
    await prisma.quantity.upsert({
      where: { name: quantity.name },
      update: quantity,
      create: quantity
    })
  }

  console.log('✓ Quantities created')

  // Create quantity groups
  const groups = [
    {
      name: 'Business Card Quantities',
      description: 'Standard quantities for business cards',
      sortOrder: 1,
      quantities: ['250', '500', '1,000', '2,500', '5,000', '10,000', 'Custom...']
    },
    {
      name: 'Flyer Quantities',
      description: 'Common quantities for flyers and handouts',
      sortOrder: 2,
      quantities: ['25', '50', '100', '250', '500', '1,000', '2,500', '5,000', 'Custom...']
    },
    {
      name: 'Poster Quantities',
      description: 'Small quantities for posters and large format prints',
      sortOrder: 3,
      quantities: ['1', '2', '3', '4', '5', '10', '25', '50', '100', 'Custom...']
    },
    {
      name: 'Large Format Quantities',
      description: 'High volume quantities for offset printing',
      sortOrder: 4,
      quantities: ['1,000', '5,000', '10,000', '25,000', '50,000', '100,000', 'Custom...']
    },
    {
      name: 'Brochure Quantities',
      description: 'Standard quantities for brochures and catalogs',
      sortOrder: 5,
      quantities: ['100', '250', '500', '1,000', '2,500', '5,000', '10,000', 'Custom...']
    }
  ]

  for (const groupData of groups) {
    // Find the quantity IDs
    const quantityRecords = await prisma.quantity.findMany({
      where: {
        name: {
          in: groupData.quantities
        }
      }
    })

    // Create the group with its quantities
    const group = await prisma.quantityGroup.create({
      data: {
        name: groupData.name,
        description: groupData.description,
        sortOrder: groupData.sortOrder,
        isActive: true,
        quantities: {
          create: groupData.quantities.map((qName, index) => {
            const quantity = quantityRecords.find(q => q.name === qName)
            if (!quantity) {
              throw new Error(`Quantity "${qName}" not found`)
            }
            return {
              quantityId: quantity.id,
              sortOrder: index
            }
          })
        }
      },
      include: {
        quantities: {
          include: {
            quantity: true
          }
        }
      }
    })

    console.log(`✓ Created group: ${group.name} with ${group.quantities.length} quantities`)
  }

  console.log('✅ Quantity groups seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding quantity groups:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })