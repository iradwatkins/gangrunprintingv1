import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

/**
 * Create hidden category for SEO city products
 * This category won't appear in navigation but products are still searchable
 */

async function main() {
  console.log('🏷️  Creating hidden category for 200 Cities products...\n')

  // Step 1: Create hidden category
  const hiddenCategory = await prisma.productCategory.upsert({
    where: {
      slug: '200-cities-postcards',
    },
    update: {
      isHidden: true, // Make sure it's hidden
    },
    create: {
      id: createId(),
      name: '200 Cities - Postcards',
      slug: '200-cities-postcards',
      description:
        'Hidden category for city-specific postcard products. Not visible in navigation but products are SEO-friendly and searchable.',
      isActive: true,
      isHidden: true, // Hidden from navigation
      sortOrder: 9999, // Push to bottom if somehow it appears
      updatedAt: new Date(),
    },
  })

  console.log(`✅ Created hidden category: ${hiddenCategory.name}`)
  console.log(`   ID: ${hiddenCategory.id}`)
  console.log(`   Slug: ${hiddenCategory.slug}`)
  console.log(`   Hidden: ${hiddenCategory.isHidden}\n`)

  // Step 2: Update parent product to use this category
  const parentProduct = await prisma.product.findUnique({
    where: { slug: 'postcards-4x6-200-cities' },
  })

  if (parentProduct) {
    await prisma.product.update({
      where: { id: parentProduct.id },
      data: {
        categoryId: hiddenCategory.id,
      },
    })
    console.log(`✅ Updated parent product to use hidden category`)
  }

  // Step 3: Update all child products to use this category
  const childProducts = await prisma.product.findMany({
    where: {
      parentProductId: parentProduct?.id,
    },
  })

  console.log(`\n📦 Updating ${childProducts.length} city products...`)

  for (const product of childProducts) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        categoryId: hiddenCategory.id,
      },
    })
  }

  console.log(`✅ Updated ${childProducts.length} city products\n`)

  // Step 4: Verify
  const verifyCategory = await prisma.productCategory.findUnique({
    where: { id: hiddenCategory.id },
    include: {
      _count: {
        select: {
          Product: true,
        },
      },
    },
  })

  console.log('📊 Summary:')
  console.log(`   Category: ${verifyCategory?.name}`)
  console.log(`   Hidden: ${verifyCategory?.isHidden}`)
  console.log(`   Products: ${verifyCategory?._count.Product}`)
  console.log('\n✨ Hidden category setup complete!')
  console.log('\n📝 Notes:')
  console.log('   - Category will NOT appear in navigation/category lists')
  console.log('   - Products ARE searchable and SEO-friendly')
  console.log('   - Parent product controls pricing for all 200 cities')
  console.log('   - Update parent product to change pricing across all cities\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
