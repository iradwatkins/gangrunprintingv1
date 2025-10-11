#!/usr/bin/env tsx
/**
 * Create City-Specific Products (PROPER WAY)
 *
 * This creates:
 * 1. Parent Product: "4x6 Postcards - 200 Cities" (folder/category)
 * 2. 50 Child Products: "4x6 Postcards - New York, NY" (individual products with own pricing)
 *
 * Each city product is a REAL product that can be:
 * - Added to cart
 * - Has its own price
 * - Has its own inventory
 * - Appears in product list under parent folder
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Creating city-specific products (proper hierarchy)...\n')

  // Step 1: Find or create the Postcard category
  const postcardCategory = await prisma.productCategory.findUnique({
    where: { slug: 'postcard' },
  })

  if (!postcardCategory) {
    throw new Error('Postcard category not found!')
  }

  // Step 2: Create PARENT product ("4x6 Postcards - 200 Cities" folder)
  console.log('📁 Creating parent product: "4x6 Postcards - 200 Cities"...')

  const parentProduct = await prisma.product.upsert({
    where: { slug: 'postcards-4x6-200-cities' },
    update: {},
    create: {
      id: 'prod_postcards_4x6_200cities',
      name: '4x6 Postcards - 200 Cities',
      slug: 'postcards-4x6-200-cities',
      sku: 'POSTCARD-4X6-200CITIES',
      description:
        'City-specific 4x6 postcard products optimized for local SEO. Each city has its own product page with custom pricing and content.',
      shortDescription: 'Location-specific 4x6 postcards for 200 US cities',
      categoryId: postcardCategory.id,
      basePrice: 0.15,
      setupFee: 0,
      productionTime: 2,
      isActive: true,
      isFeatured: true,
      gangRunEligible: false, // Parent product is not orderable
      rushAvailable: false,
      updatedAt: new Date(),
      parentProductId: null, // This IS the parent
      cityId: null, // Not tied to specific city
    },
  })

  console.log(`  ✅ Parent product created: ${parentProduct.name}`)
  console.log(`  📂 Folder URL: /products/${parentProduct.slug}\n`)

  // Step 3: Get all cities
  const cities = await prisma.city.findMany({
    orderBy: { rank: 'asc' },
  })

  console.log(`📍 Creating ${cities.length} city-specific child products...\n`)

  // Step 4: Create child product for each city
  let created = 0
  for (const city of cities) {
    const productName = `4x6 Postcards - ${city.name}, ${city.stateCode}`
    const slug = `postcards-4x6-${city.name.toLowerCase().replace(/\s+/g, '-')}-${city.stateCode.toLowerCase()}`
    const sku = `POSTCARD-4X6-${city.stateCode}-${city.name.toUpperCase().replace(/\s+/g, '')}`

    // City-specific pricing logic (example: bigger cities cost slightly more)
    const basePriceByRank =
      city.rank <= 10
        ? 0.18 // Top 10 cities
        : city.rank <= 25
          ? 0.16 // Top 25 cities
          : 0.15 // All other cities

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        id: `prod_postcard_4x6_${city.stateCode.toLowerCase()}_${city.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: productName,
        slug,
        sku,
        description: `Professional 4x6 postcards for ${city.name}, ${city.state}. High-quality printing with fast delivery to the ${city.name} area. Perfect for local businesses, events, and direct mail campaigns.`,
        shortDescription: `Premium 4x6 postcards serving ${city.name}, ${city.stateCode}`,
        categoryId: postcardCategory.id,
        basePrice: basePriceByRank,
        setupFee: 0,
        productionTime: 2,
        isActive: true,
        isFeatured: city.rank <= 25, // Feature top 25 cities
        gangRunEligible: true,
        rushAvailable: true,
        rushDays: 1,
        rushFee: 50.0,
        updatedAt: new Date(),
        parentProductId: parentProduct.id, // Link to parent
        cityId: city.id, // Link to city
      },
    })

    created++
    if (created % 10 === 0) {
      console.log(`  ✅ Created ${created}/${cities.length} products...`)
    }
  }

  console.log(`\n🎉 SUCCESS!`)
  console.log(`  📁 Parent product: ${parentProduct.name}`)
  console.log(`  📍 City products created: ${created}`)
  console.log(`\n🌐 Example Product URLs:`)
  console.log(`  Parent: https://gangrunprinting.com/products/postcards-4x6-200-cities`)
  console.log(`  Child:  https://gangrunprinting.com/products/postcards-4x6-new-york-ny`)
  console.log(`  Child:  https://gangrunprinting.com/products/postcards-4x6-los-angeles-ca`)
  console.log(`  Child:  https://gangrunprinting.com/products/postcards-4x6-chicago-il`)
  console.log(`\n💰 Pricing by City Tier:`)
  console.log(`  Top 10 cities: $0.18/piece (New York, LA, Chicago, etc.)`)
  console.log(`  Top 25 cities: $0.16/piece (Boston, Seattle, Denver, etc.)`)
  console.log(`  All others: $0.15/piece`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
