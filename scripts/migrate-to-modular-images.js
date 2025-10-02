const { PrismaClient } = require('@prisma/client')

async function migrateToModularImages() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Checking current ProductImage data...')

    // Check existing ProductImage records
    const existingImages = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "ProductImage"
    `

    console.log(`Found ${existingImages[0].count} existing ProductImage records`)

    if (existingImages[0].count > 0) {
      console.log('📊 Sample of existing data:')
      const sampleData = await prisma.$queryRaw`
        SELECT id, "productId", url, "thumbnailUrl", alt, "isPrimary", "sortOrder"
        FROM "ProductImage"
        LIMIT 5
      `
      console.table(sampleData)
    }

    console.log('✅ Data analysis complete. Ready for migration.')

    // Check for potential conflicts
    const duplicates = await prisma.$queryRaw`
      SELECT "productId", url, COUNT(*) as count
      FROM "ProductImage"
      GROUP BY "productId", url
      HAVING COUNT(*) > 1
    `

    if (duplicates.length > 0) {
      console.log('⚠️  Found potential duplicate images:')
      console.table(duplicates)
    } else {
      console.log('✅ No duplicate images found')
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToModularImages()