import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  // Create Quantity Groups
  const quantityGroups = [
    {
      name: 'Business Card Quantities',
      description: 'Standard quantities for business cards',
      values: '100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 100,
      customMax: 100000,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Flyer Quantities',
      description: 'Common quantities for flyers and handouts',
      values: '25,50,100,250,500,1000,2500,custom',
      defaultValue: '250',
      customMin: 25,
      customMax: 50000,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Poster Quantities',
      description: 'Typical quantities for posters',
      values: '1,5,10,25,50,100,250,custom',
      defaultValue: '10',
      customMin: 1,
      customMax: 5000,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Brochure Quantities',
      description: 'Standard brochure print runs',
      values: '50,100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 50,
      customMax: 50000,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Sticker Quantities',
      description: 'Common sticker order quantities',
      values: '25,50,100,250,500,1000,custom',
      defaultValue: '100',
      customMin: 25,
      customMax: 10000,
      sortOrder: 5,
      isActive: true,
    },
  ]

  for (const group of quantityGroups) {
    const created = await prisma.quantityGroup.upsert({
      where: { name: group.name },
      update: group,
      create: group,
    })

  }

  // Create Size Groups
  const sizeGroups = [
    {
      name: 'Business Card Sizes',
      description: 'Standard business card dimensions',
      values: '2x3.5,3.5x2,2.5x2.5,custom',
      defaultValue: '2x3.5',
      customMinWidth: 2.0,
      customMaxWidth: 4.0,
      customMinHeight: 2.0,
      customMaxHeight: 4.0,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Postcard Sizes',
      description: 'Common postcard sizes',
      values: '4x6,5x7,6x4,6x9,custom',
      defaultValue: '4x6',
      customMinWidth: 3.0,
      customMaxWidth: 8.0,
      customMinHeight: 3.0,
      customMaxHeight: 12.0,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Sizes',
      description: 'Standard flyer and handout sizes',
      values: '4x6,5.5x8.5,8.5x11,11x17,custom',
      defaultValue: '8.5x11',
      customMinWidth: 4.0,
      customMaxWidth: 18.0,
      customMinHeight: 4.0,
      customMaxHeight: 24.0,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Poster Sizes',
      description: 'Large format poster sizes',
      values: '11x17,12x18,16x20,18x24,24x36,custom',
      defaultValue: '18x24',
      customMinWidth: 8.0,
      customMaxWidth: 48.0,
      customMinHeight: 8.0,
      customMaxHeight: 96.0,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Brochure Sizes',
      description: 'Standard brochure dimensions',
      values: '8.5x11,11x8.5,8.5x14,11x17,custom',
      defaultValue: '8.5x11',
      customMinWidth: 6.0,
      customMaxWidth: 18.0,
      customMinHeight: 6.0,
      customMaxHeight: 24.0,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: 'Banner Sizes',
      description: 'Banner and large display sizes',
      values: '24x36,24x48,36x48,48x72,custom',
      defaultValue: '24x36',
      customMinWidth: 12.0,
      customMaxWidth: 120.0,
      customMinHeight: 12.0,
      customMaxHeight: 120.0,
      sortOrder: 6,
      isActive: true,
    },
    {
      name: 'Sticker Sizes',
      description: 'Common sticker and label sizes',
      values: '2x2,3x3,4x4,4x6,custom',
      defaultValue: '3x3',
      customMinWidth: 1.0,
      customMaxWidth: 12.0,
      customMinHeight: 1.0,
      customMaxHeight: 12.0,
      sortOrder: 7,
      isActive: true,
    },
  ]

  for (const group of sizeGroups) {
    const created = await prisma.sizeGroup.upsert({
      where: { name: group.name },
      update: group,
      create: group,
    })

  }

}

main()
  .catch((e) => {
    console.error('Error seeding groups:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
