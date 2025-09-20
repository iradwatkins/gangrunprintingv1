import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding comprehensive size groups...')

  const sizeGroups = [
    {
      name: 'Business Card Sizes',
      description: 'Standard and custom sizes for business cards',
      values: '2x3.5,2.125x3.375,2.5x2.5,1.75x3.5,custom',
      defaultValue: '2x3.5',
      customMinWidth: 1.5,
      customMaxWidth: 3.5,
      customMinHeight: 1.5,
      customMaxHeight: 3.5,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Postcard Sizes',
      description: 'Common postcard and mailer sizes',
      values: '4x6,5x7,5.5x8.5,6x9,6x11,8.5x11,custom',
      defaultValue: '4x6',
      customMinWidth: 3.5,
      customMaxWidth: 11,
      customMinHeight: 3.5,
      customMaxHeight: 11,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Sizes',
      description: 'Standard flyer and handout sizes',
      values: '4x6,5.5x8.5,8.5x11,8.5x14,11x17,custom',
      defaultValue: '8.5x11',
      customMinWidth: 4,
      customMaxWidth: 17,
      customMinHeight: 4,
      customMaxHeight: 17,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Brochure Sizes',
      description: 'Tri-fold and bi-fold brochure sizes',
      values: '8.5x11,8.5x14,11x17,11x25.5,custom',
      defaultValue: '8.5x11',
      customMinWidth: 8,
      customMaxWidth: 25.5,
      customMinHeight: 8,
      customMaxHeight: 17,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Poster Sizes',
      description: 'Large format poster sizes',
      values: '11x17,12x18,16x20,18x24,20x30,24x36,27x40,custom',
      defaultValue: '18x24',
      customMinWidth: 11,
      customMaxWidth: 48,
      customMinHeight: 11,
      customMaxHeight: 96,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: 'Banner Sizes',
      description: 'Indoor and outdoor banner sizes',
      values: '2x6,2x8,3x6,3x8,4x8,4x10,custom',
      defaultValue: '3x6',
      customMinWidth: 2,
      customMaxWidth: 10,
      customMinHeight: 2,
      customMaxHeight: 50,
      sortOrder: 6,
      isActive: true,
    },
    {
      name: 'Sticker Sizes',
      description: 'Common sticker and label sizes',
      values: '2x2,2x3,3x3,3x4,4x4,4x6,custom',
      defaultValue: '3x3',
      customMinWidth: 0.5,
      customMaxWidth: 12,
      customMinHeight: 0.5,
      customMaxHeight: 12,
      sortOrder: 7,
      isActive: true,
    },
    {
      name: 'Label Sizes',
      description: 'Product and shipping label sizes',
      values: '1x2.625,2x4,2.625x1,3.33x4,4x6,custom',
      defaultValue: '2x4',
      customMinWidth: 1,
      customMaxWidth: 8.5,
      customMinHeight: 0.5,
      customMaxHeight: 11,
      sortOrder: 8,
      isActive: true,
    },
    {
      name: 'Envelope Sizes',
      description: 'Standard envelope sizes',
      values: '4.125x9.5,5.5x8.5,6x9,9x12,10x13,custom',
      defaultValue: '4.125x9.5',
      customMinWidth: 3.5,
      customMaxWidth: 13,
      customMinHeight: 3.5,
      customMaxHeight: 13,
      sortOrder: 9,
      isActive: true,
    },
    {
      name: 'Letterhead Sizes',
      description: 'Business letterhead sizes',
      values: '8.5x11,8.5x14,A4,custom',
      defaultValue: '8.5x11',
      customMinWidth: 8,
      customMaxWidth: 14,
      customMinHeight: 8,
      customMaxHeight: 14,
      sortOrder: 10,
      isActive: true,
    },
    {
      name: 'Greeting Card Sizes',
      description: 'Folded greeting card sizes (flat dimensions)',
      values: '8.5x5.5,10x7,11x8.5,custom',
      defaultValue: '10x7',
      customMinWidth: 7,
      customMaxWidth: 14,
      customMinHeight: 5,
      customMaxHeight: 11,
      sortOrder: 11,
      isActive: true,
    },
    {
      name: 'Bookmark Sizes',
      description: 'Standard bookmark dimensions',
      values: '2x6,2x7,2.5x8,custom',
      defaultValue: '2x6',
      customMinWidth: 1.5,
      customMaxWidth: 3,
      customMinHeight: 4,
      customMaxHeight: 10,
      sortOrder: 12,
      isActive: true,
    },
    {
      name: 'Rack Card Sizes',
      description: 'Display rack card sizes',
      values: '3.5x8.5,4x9,custom',
      defaultValue: '4x9',
      customMinWidth: 3.5,
      customMaxWidth: 4.25,
      customMinHeight: 8,
      customMaxHeight: 11,
      sortOrder: 13,
      isActive: true,
    },
    {
      name: 'Door Hanger Sizes',
      description: 'Door hanger marketing materials',
      values: '3.5x8.5,4x11,4.25x11,custom',
      defaultValue: '4.25x11',
      customMinWidth: 3.5,
      customMaxWidth: 5,
      customMinHeight: 8,
      customMaxHeight: 14,
      sortOrder: 14,
      isActive: true,
    },
    {
      name: 'Presentation Folder Sizes',
      description: 'Pocket folder sizes (flat dimensions)',
      values: '9x12,9x14.5,12x18,custom',
      defaultValue: '9x12',
      customMinWidth: 9,
      customMaxWidth: 18,
      customMinHeight: 12,
      customMaxHeight: 18,
      sortOrder: 15,
      isActive: true,
    },
  ]

  let createdCount = 0
  for (const sizeGroup of sizeGroups) {
    try {
      await prisma.sizeGroup.upsert({
        where: { name: sizeGroup.name },
        update: sizeGroup,
        create: sizeGroup,
      })
      createdCount++
      console.log(`✓ Created/Updated size group: ${sizeGroup.name}`)
    } catch (error) {
      console.error(`✗ Error creating size group ${sizeGroup.name}:`, error)
    }
  }

  console.log(`\n✅ Successfully seeded ${createdCount} size groups!`)
}

main()
  .catch((e) => {
    console.error('Error seeding size groups:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
