import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSizes() {
  console.log('🌱 Seeding print sizes...')

  const sizesData = [
    // Business Cards
    { name: '3.5" x 2"', width: 3.5, height: 2, displayName: 'Standard Business Card', category: 'Business Cards', sortOrder: 1 },
    { name: '2" x 3.5"', width: 2, height: 3.5, displayName: 'Vertical Business Card', category: 'Business Cards', sortOrder: 2 },
    
    // Postcards
    { name: '4" x 6"', width: 4, height: 6, displayName: 'Small Postcard', category: 'Postcards', sortOrder: 10 },
    { name: '5" x 7"', width: 5, height: 7, displayName: 'Medium Postcard', category: 'Postcards', sortOrder: 11 },
    { name: '6" x 9"', width: 6, height: 9, displayName: 'Large Postcard', category: 'Postcards', sortOrder: 12 },
    { name: '6" x 11"', width: 6, height: 11, displayName: 'EDDM Postcard', category: 'Postcards', sortOrder: 13 },
    
    // Flyers & Brochures
    { name: '8.5" x 11"', width: 8.5, height: 11, displayName: 'Letter', category: 'Flyers', sortOrder: 20 },
    { name: '8.5" x 5.5"', width: 8.5, height: 5.5, displayName: 'Half Sheet', category: 'Flyers', sortOrder: 21 },
    { name: '11" x 17"', width: 11, height: 17, displayName: 'Tabloid', category: 'Flyers', sortOrder: 22 },
    { name: '8.5" x 14"', width: 8.5, height: 14, displayName: 'Legal', category: 'Flyers', sortOrder: 23 },
    { name: '5.5" x 8.5"', width: 5.5, height: 8.5, displayName: 'Half Letter', category: 'Flyers', sortOrder: 24 },
    
    // Rack Cards
    { name: '4" x 9"', width: 4, height: 9, displayName: 'Rack Card', category: 'Rack Cards', sortOrder: 30 },
    { name: '3.5" x 8.5"', width: 3.5, height: 8.5, displayName: 'Slim Rack Card', category: 'Rack Cards', sortOrder: 31 },
    
    // Door Hangers
    { name: '4.25" x 11"', width: 4.25, height: 11, displayName: 'Door Hanger', category: 'Door Hangers', sortOrder: 40 },
    { name: '3.5" x 8.5"', width: 3.5, height: 8.5, displayName: 'Small Door Hanger', category: 'Door Hangers', sortOrder: 41 },
    
    // Posters
    { name: '11" x 17"', width: 11, height: 17, displayName: 'Small Poster', category: 'Posters', sortOrder: 50 },
    { name: '12" x 18"', width: 12, height: 18, displayName: 'Medium Poster', category: 'Posters', sortOrder: 51 },
    { name: '18" x 24"', width: 18, height: 24, displayName: 'Large Poster', category: 'Posters', sortOrder: 52 },
    { name: '24" x 36"', width: 24, height: 36, displayName: 'Extra Large Poster', category: 'Posters', sortOrder: 53 },
    
    // Banners
    { name: '2\' x 6\'', width: 24, height: 72, displayName: 'Small Banner', category: 'Banners', sortOrder: 60 },
    { name: '3\' x 8\'', width: 36, height: 96, displayName: 'Medium Banner', category: 'Banners', sortOrder: 61 },
    { name: '4\' x 10\'', width: 48, height: 120, displayName: 'Large Banner', category: 'Banners', sortOrder: 62 },
    
    // Stickers
    { name: '2" x 2"', width: 2, height: 2, displayName: 'Square Sticker', category: 'Stickers', sortOrder: 70 },
    { name: '3" x 3"', width: 3, height: 3, displayName: 'Medium Square Sticker', category: 'Stickers', sortOrder: 71 },
    { name: '4" x 4"', width: 4, height: 4, displayName: 'Large Square Sticker', category: 'Stickers', sortOrder: 72 },
    { name: '2" x 3"', width: 2, height: 3, displayName: 'Rectangle Sticker', category: 'Stickers', sortOrder: 73 },
    { name: '3" Circle', width: 3, height: 3, displayName: 'Circle Sticker', category: 'Stickers', sortOrder: 74 },
    
    // Booklets
    { name: '8.5" x 11"', width: 8.5, height: 11, displayName: 'Letter Booklet', category: 'Booklets', sortOrder: 80 },
    { name: '5.5" x 8.5"', width: 5.5, height: 8.5, displayName: 'Half Letter Booklet', category: 'Booklets', sortOrder: 81 },
    { name: '6" x 9"', width: 6, height: 9, displayName: 'Digest Booklet', category: 'Booklets', sortOrder: 82 },
    
    // Folders
    { name: '9" x 12"', width: 9, height: 12, displayName: 'Presentation Folder', category: 'Folders', sortOrder: 90 },
    { name: '9" x 14.5"', width: 9, height: 14.5, displayName: 'Legal Folder', category: 'Folders', sortOrder: 91 },
    
    // Custom Size Option (always last)
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
      sortOrder: 999 
    }
  ]

  for (const sizeData of sizesData) {
    try {
      const { category, ...size } = sizeData
      
      await prisma.size.upsert({
        where: { name: size.name },
        update: {
          width: size.width,
          height: size.height,
          displayName: size.displayName,
          sortOrder: size.sortOrder,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          name: size.name,
          width: size.width,
          height: size.height,
          displayName: size.displayName,
          isCustom: size.isCustom || false,
          minWidth: size.minWidth || null,
          maxWidth: size.maxWidth || null,
          minHeight: size.minHeight || null,
          maxHeight: size.maxHeight || null,
          unit: 'inch',
          sortOrder: size.sortOrder,
          isActive: true
        }
      })
      
      console.log(`✓ Seeded size: ${size.name} (${size.displayName})`)
    } catch (error) {
      console.error(`Error seeding size ${sizeData.name}:`, error)
    }
  }

  console.log('✨ Print sizes seeded successfully!')
}

seedSizes()
  .catch((e) => {
    console.error('Error seeding sizes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })