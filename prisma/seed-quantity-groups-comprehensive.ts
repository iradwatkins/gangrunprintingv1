import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding comprehensive quantity groups...')

  const quantityGroups = [
    {
      name: 'Business Card Quantities',
      description: 'Standard quantities for business cards',
      values: '100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '500',
      customMin: 100,
      customMax: 50000,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Postcard Quantities',
      description: 'Common postcard print runs',
      values: '50,100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 25,
      customMax: 25000,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Quantities',
      description: 'Standard flyer quantities',
      values: '25,50,100,250,500,1000,2500,5000,custom',
      defaultValue: '250',
      customMin: 25,
      customMax: 50000,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Brochure Quantities',
      description: 'Brochure print run options',
      values: '25,50,100,250,500,1000,2500,custom',
      defaultValue: '250',
      customMin: 25,
      customMax: 10000,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Poster Quantities',
      description: 'Large format poster quantities',
      values: '1,5,10,25,50,100,250,custom',
      defaultValue: '10',
      customMin: 1,
      customMax: 1000,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: 'Banner Quantities',
      description: 'Banner printing quantities',
      values: '1,2,5,10,25,50,custom',
      defaultValue: '1',
      customMin: 1,
      customMax: 100,
      sortOrder: 6,
      isActive: true,
    },
    {
      name: 'Sticker Sheet Quantities',
      description: 'Sticker sheet quantities',
      values: '25,50,100,250,500,1000,2500,custom',
      defaultValue: '100',
      customMin: 25,
      customMax: 10000,
      sortOrder: 7,
      isActive: true,
    },
    {
      name: 'Individual Sticker Quantities',
      description: 'Die-cut individual sticker quantities',
      values: '50,100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '250',
      customMin: 50,
      customMax: 100000,
      sortOrder: 8,
      isActive: true,
    },
    {
      name: 'Label Quantities',
      description: 'Label printing quantities',
      values: '100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '1000',
      customMin: 100,
      customMax: 100000,
      sortOrder: 9,
      isActive: true,
    },
    {
      name: 'Envelope Quantities',
      description: 'Envelope printing quantities',
      values: '50,100,250,500,1000,2500,custom',
      defaultValue: '500',
      customMin: 50,
      customMax: 10000,
      sortOrder: 10,
      isActive: true,
    },
    {
      name: 'Letterhead Quantities',
      description: 'Business letterhead quantities',
      values: '100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 100,
      customMax: 25000,
      sortOrder: 11,
      isActive: true,
    },
    {
      name: 'Greeting Card Quantities',
      description: 'Greeting card print runs',
      values: '25,50,100,250,500,1000,custom',
      defaultValue: '100',
      customMin: 25,
      customMax: 5000,
      sortOrder: 12,
      isActive: true,
    },
    {
      name: 'Bookmark Quantities',
      description: 'Bookmark printing quantities',
      values: '50,100,250,500,1000,2500,custom',
      defaultValue: '250',
      customMin: 50,
      customMax: 10000,
      sortOrder: 13,
      isActive: true,
    },
    {
      name: 'Rack Card Quantities',
      description: 'Rack card distribution quantities',
      values: '100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 100,
      customMax: 25000,
      sortOrder: 14,
      isActive: true,
    },
    {
      name: 'Door Hanger Quantities',
      description: 'Door hanger marketing quantities',
      values: '100,250,500,1000,2500,5000,custom',
      defaultValue: '1000',
      customMin: 100,
      customMax: 25000,
      sortOrder: 15,
      isActive: true,
    },
    {
      name: 'Presentation Folder Quantities',
      description: 'Pocket folder quantities',
      values: '25,50,100,250,500,1000,custom',
      defaultValue: '100',
      customMin: 25,
      customMax: 5000,
      sortOrder: 16,
      isActive: true,
    },
    {
      name: 'Gang Run Quantities',
      description: 'Optimized gang run production quantities',
      values: '250,500,1000,2500,5000',
      defaultValue: '1000',
      customMin: null,
      customMax: null,
      sortOrder: 17,
      isActive: true,
    },
    {
      name: 'Sample Pack Quantities',
      description: 'Sample pack options',
      values: '1,5,10,25',
      defaultValue: '1',
      customMin: null,
      customMax: null,
      sortOrder: 18,
      isActive: true,
    },
  ]

  let createdCount = 0
  for (const quantityGroup of quantityGroups) {
    try {
      await prisma.quantityGroup.upsert({
        where: { name: quantityGroup.name },
        update: quantityGroup,
        create: quantityGroup,
      })
      createdCount++
      console.log(`✓ Created/Updated quantity group: ${quantityGroup.name}`)
    } catch (error) {
      console.error(`✗ Error creating quantity group ${quantityGroup.name}:`, error)
    }
  }

  console.log(`\n✅ Successfully seeded ${createdCount} quantity groups!`)
}

main()
  .catch((e) => {
    console.error('Error seeding quantity groups:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
