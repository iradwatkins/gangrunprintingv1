import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting size groups seed...')

  // First, create all the sizes if they don't exist
  const sizes = [
    // Business Card Sizes
    { name: '2x3.5', width: 2, height: 3.5, displayName: 'Standard Business Card', unit: 'inch', sortOrder: 1 },
    { name: '2.5x2.5', width: 2.5, height: 2.5, displayName: 'Square Mini', unit: 'inch', sortOrder: 2 },
    { name: '3.5x2', width: 3.5, height: 2, displayName: 'Business Card (Landscape)', unit: 'inch', sortOrder: 3 },
    
    // Small Format Sizes
    { name: '3x3', width: 3, height: 3, displayName: 'Square Small', unit: 'inch', sortOrder: 4 },
    { name: '3x4', width: 3, height: 4, displayName: null, unit: 'inch', sortOrder: 5 },
    { name: '3x5', width: 3, height: 5, displayName: 'Index Card', unit: 'inch', sortOrder: 6 },
    { name: '3x6', width: 3, height: 6, displayName: null, unit: 'inch', sortOrder: 7 },
    { name: '3x8', width: 3, height: 8, displayName: null, unit: 'inch', sortOrder: 8 },
    { name: '4x3', width: 4, height: 3, displayName: null, unit: 'inch', sortOrder: 9 },
    { name: '4x4', width: 4, height: 4, displayName: 'Square', unit: 'inch', sortOrder: 10 },
    { name: '4x6', width: 4, height: 6, displayName: 'Postcard', unit: 'inch', sortOrder: 11 },
    { name: '4x9', width: 4, height: 9, displayName: 'Rack Card', unit: 'inch', sortOrder: 12 },
    { name: '4x12', width: 4, height: 12, displayName: null, unit: 'inch', sortOrder: 13 },
    
    // Flyer/Document Sizes
    { name: '4.25x5.5', width: 4.25, height: 5.5, displayName: 'Half Sheet', unit: 'inch', sortOrder: 14 },
    { name: '4.875x4.875', width: 4.875, height: 4.875, displayName: 'CD Cover', unit: 'inch', sortOrder: 15 },
    { name: '5x3', width: 5, height: 3, displayName: null, unit: 'inch', sortOrder: 16 },
    { name: '5x7', width: 5, height: 7, displayName: 'Invitation', unit: 'inch', sortOrder: 17 },
    { name: '5.5x4.25', width: 5.5, height: 4.25, displayName: 'Half Sheet (Landscape)', unit: 'inch', sortOrder: 18 },
    { name: '5.5x8.5', width: 5.5, height: 8.5, displayName: 'Half Letter', unit: 'inch', sortOrder: 19 },
    { name: '6x2', width: 6, height: 2, displayName: 'Bookmark', unit: 'inch', sortOrder: 20 },
    { name: '6x3', width: 6, height: 3, displayName: null, unit: 'inch', sortOrder: 21 },
    { name: '6x4', width: 6, height: 4, displayName: 'Postcard (Large)', unit: 'inch', sortOrder: 22 },
    { name: '6x6', width: 6, height: 6, displayName: 'Square Medium', unit: 'inch', sortOrder: 23 },
    { name: '6x8', width: 6, height: 8, displayName: null, unit: 'inch', sortOrder: 24 },
    { name: '6x9', width: 6, height: 9, displayName: 'Booklet', unit: 'inch', sortOrder: 25 },
    { name: '7x5', width: 7, height: 5, displayName: 'Invitation (Landscape)', unit: 'inch', sortOrder: 26 },
    { name: '8x3', width: 8, height: 3, displayName: null, unit: 'inch', sortOrder: 27 },
    { name: '8x6', width: 8, height: 6, displayName: null, unit: 'inch', sortOrder: 28 },
    
    // Standard Document Sizes
    { name: '8.5x5.5', width: 8.5, height: 5.5, displayName: 'Statement', unit: 'inch', sortOrder: 29 },
    { name: '8.5x11', width: 8.5, height: 11, displayName: 'Letter', unit: 'inch', sortOrder: 30 },
    { name: '9x4', width: 9, height: 4, displayName: null, unit: 'inch', sortOrder: 31 },
    { name: '11x8.5', width: 11, height: 8.5, displayName: 'Letter (Landscape)', unit: 'inch', sortOrder: 32 },
    { name: '11x17', width: 11, height: 17, displayName: 'Tabloid', unit: 'inch', sortOrder: 33 },
    
    // Large Format Sizes
    { name: '12x4', width: 12, height: 4, displayName: null, unit: 'inch', sortOrder: 34 },
    { name: '12x12', width: 12, height: 12, displayName: 'Square Large', unit: 'inch', sortOrder: 35 },
    { name: '12x18', width: 12, height: 18, displayName: 'Architectural B', unit: 'inch', sortOrder: 36 },
    { name: '12x24', width: 12, height: 24, displayName: null, unit: 'inch', sortOrder: 37 },
    { name: '13x19', width: 13, height: 19, displayName: 'Super B', unit: 'inch', sortOrder: 38 },
    { name: '16x20', width: 16, height: 20, displayName: 'Poster Small', unit: 'inch', sortOrder: 39 },
    { name: '18x12', width: 18, height: 12, displayName: 'Architectural B (Landscape)', unit: 'inch', sortOrder: 40 },
    { name: '18x24', width: 18, height: 24, displayName: 'Architectural C', unit: 'inch', sortOrder: 41 },
    { name: '20x30', width: 20, height: 30, displayName: 'Poster Medium', unit: 'inch', sortOrder: 42 },
    { name: '24x18', width: 24, height: 18, displayName: 'Architectural C (Landscape)', unit: 'inch', sortOrder: 43 },
    { name: '24x36', width: 24, height: 36, displayName: 'Architectural D', unit: 'inch', sortOrder: 44 },
    { name: '27x39', width: 27, height: 39, displayName: 'Movie Poster', unit: 'inch', sortOrder: 45 },
    { name: '36x24', width: 36, height: 24, displayName: 'Architectural D (Landscape)', unit: 'inch', sortOrder: 46 },
    
    // Custom option
    { 
      name: 'Custom...', 
      width: null, 
      height: null, 
      displayName: 'Custom Size', 
      isCustom: true, 
      minWidth: 1, 
      maxWidth: 96, 
      minHeight: 1, 
      maxHeight: 96, 
      unit: 'inch', 
      sortOrder: 100 
    },
  ]

  // Create sizes
  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: size,
      create: {
        ...size,
        isActive: true,
        isCustom: size.isCustom || false,
        minWidth: size.minWidth || null,
        maxWidth: size.maxWidth || null,
        minHeight: size.minHeight || null,
        maxHeight: size.maxHeight || null,
      }
    })
  }

  console.log('✓ Sizes created')

  // Create size groups
  const groups = [
    {
      name: 'Business Card Sizes',
      description: 'Standard sizes for business cards',
      sortOrder: 1,
      sizes: ['2x3.5', '3.5x2', '2.5x2.5', 'Custom...']
    },
    {
      name: 'Postcard & Flyer Sizes',
      description: 'Common sizes for postcards and flyers',
      sortOrder: 2,
      sizes: ['4x6', '5x7', '5.5x8.5', '6x9', '8.5x11', '11x8.5', 'Custom...']
    },
    {
      name: 'Brochure Sizes',
      description: 'Standard brochure and folded document sizes',
      sortOrder: 3,
      sizes: ['8.5x11', '11x8.5', '8.5x5.5', '11x17', '9x4', '4x9', 'Custom...']
    },
    {
      name: 'Poster Sizes',
      description: 'Large format poster sizes',
      sortOrder: 4,
      sizes: ['11x17', '12x18', '16x20', '18x24', '20x30', '24x36', '27x39', 'Custom...']
    },
    {
      name: 'Small Format Sizes',
      description: 'Small promotional items and cards',
      sortOrder: 5,
      sizes: ['2x3.5', '3x3', '3x5', '4x4', '4x6', '5x7', '6x6', 'Custom...']
    },
    {
      name: 'Banner & Sign Sizes',
      description: 'Standard banner and yard sign sizes',
      sortOrder: 6,
      sizes: ['12x18', '18x24', '24x18', '24x36', '36x24', 'Custom...']
    },
    {
      name: 'Label & Sticker Sizes',
      description: 'Common label and sticker sizes',
      sortOrder: 7,
      sizes: ['2x3.5', '3x3', '4x4', '4x6', '6x6', 'Custom...']
    },
    {
      name: 'Bookmark Sizes',
      description: 'Standard bookmark dimensions',
      sortOrder: 8,
      sizes: ['2x6', '6x2', '2x3.5', '3x8', 'Custom...']
    },
    {
      name: 'All Sizes',
      description: 'Complete list of all available sizes',
      sortOrder: 99,
      sizes: sizes.map(s => s.name)
    }
  ]

  for (const groupData of groups) {
    // Find the size IDs
    const sizeRecords = await prisma.size.findMany({
      where: {
        name: {
          in: groupData.sizes
        }
      }
    })

    // Create the group with its sizes
    const group = await prisma.sizeGroup.create({
      data: {
        name: groupData.name,
        description: groupData.description,
        sortOrder: groupData.sortOrder,
        isActive: true,
        sizes: {
          create: groupData.sizes
            .map((sizeName, index) => {
              const size = sizeRecords.find(s => s.name === sizeName)
              if (!size) {
                console.warn(`Size "${sizeName}" not found, skipping...`)
                return null
              }
              return {
                sizeId: size.id,
                sortOrder: index
              }
            })
            .filter(item => item !== null) as any[]
        }
      },
      include: {
        sizes: {
          include: {
            size: true
          }
        }
      }
    })

    console.log(`✓ Created group: ${group.name} with ${group.sizes.length} sizes`)
  }

  console.log('✅ Size groups seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding size groups:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })