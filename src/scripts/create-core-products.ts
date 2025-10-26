/**
 * CREATE CORE PRODUCTS
 *
 * Creates essential products for major categories:
 * - Business Cards
 * - Brochures
 * - Postcards
 * - Posters
 * - Banners
 * - Door Hangers
 *
 * Each product is fully configured with:
 * - Size Groups
 * - Quantity Groups
 * - Paper Stock Sets
 * - AddOn Sets
 * - Turnaround Time Sets
 * - Design Sets
 */

import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

interface ProductConfig {
  name: string
  slug: string
  sku: string
  description: string
  shortDescription: string
  categorySlug: string
  basePrice: number
  setupFee: number
  productionTime: number
  sizeGroupName: string
  quantityGroupName: string
  paperStockSetName: string
  addonSetNames: string[]
  turnaroundSetNames: string[]
  designSetName: string
}

const productConfigs: ProductConfig[] = [
  {
    name: 'Standard Business Cards',
    slug: 'standard-business-cards',
    sku: 'BC-STD-001',
    description:
      'Professional business cards with full-color printing on premium card stock. Perfect for networking and making a lasting impression.',
    shortDescription: 'Classic business cards for networking',
    categorySlug: 'business-card',
    basePrice: 0.15,
    setupFee: 0,
    productionTime: 3,
    sizeGroupName: 'Business Cards',
    quantityGroupName: 'Standard Size',
    paperStockSetName: '14pt Standard Cardstock',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
  {
    name: 'Tri-Fold Brochures',
    slug: 'tri-fold-brochures',
    sku: 'BRO-TRI-001',
    description:
      'Professional tri-fold brochures for detailed product or service information. High-quality printing on premium paper stock.',
    shortDescription: 'Classic tri-fold brochures',
    categorySlug: 'brochure',
    basePrice: 0.35,
    setupFee: 0,
    productionTime: 4,
    sizeGroupName: 'Brochure',
    quantityGroupName: 'Standard Size',
    paperStockSetName: '100 lb Gloss Text',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
  {
    name: 'Marketing Postcards',
    slug: 'marketing-postcards',
    sku: 'PC-MKT-001',
    description:
      'Direct mail postcards for targeted marketing campaigns. Full-color printing on premium cardstock.',
    shortDescription: 'Direct mail marketing postcards',
    categorySlug: 'postcard',
    basePrice: 0.18,
    setupFee: 0,
    productionTime: 3,
    sizeGroupName: 'Postcards',
    quantityGroupName: 'Standard Size',
    paperStockSetName: '14pt Standard Cardstock',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
  {
    name: 'Large Format Posters',
    slug: 'large-format-posters',
    sku: 'POS-LRG-001',
    description:
      'High-impact posters for displays, events, and advertising. Vivid colors on durable poster stock.',
    shortDescription: 'Eye-catching display posters',
    categorySlug: 'poster',
    basePrice: 0.5,
    setupFee: 0,
    productionTime: 2,
    sizeGroupName: 'Short Run Posters',
    quantityGroupName: 'Standard Size',
    paperStockSetName: '12pt Standard Cardstock',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
  {
    name: 'Vinyl Banners',
    slug: 'vinyl-banners',
    sku: 'BAN-VIN-001',
    description:
      'Durable vinyl banners for indoor and outdoor advertising. Weather-resistant with vibrant colors.',
    shortDescription: 'Weather-resistant vinyl banners',
    categorySlug: 'banner',
    basePrice: 2.5,
    setupFee: 0,
    productionTime: 3,
    sizeGroupName: 'Custom',
    quantityGroupName: 'Standard Size',
    paperStockSetName: 'Gangrun General paper stock',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
  {
    name: 'Marketing Door Hangers',
    slug: 'marketing-door-hangers',
    sku: 'DH-MKT-001',
    description:
      'Door hangers for local marketing and service promotions. Full-color printing with custom die-cut.',
    shortDescription: 'Local marketing door hangers',
    categorySlug: 'door-hanger',
    basePrice: 0.25,
    setupFee: 0,
    productionTime: 3,
    sizeGroupName: 'Door Hanger',
    quantityGroupName: 'Standard Size',
    paperStockSetName: '14pt Standard Cardstock',
    addonSetNames: ['Add-Ons'],
    turnaroundSetNames: ['Standard Turnaround Options'],
    designSetName: 'Standard Design Set',
  },
]

async function createProduct(config: ProductConfig) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Creating: ${config.name}`)
  console.log('='.repeat(60))

  try {
    // 1. Find category
    const category = await prisma.productCategory.findFirst({
      where: { slug: config.categorySlug },
    })

    if (!category) {
      console.log(`❌ Category not found: ${config.categorySlug}`)
      return null
    }
    console.log(`✅ Category: ${category.name}`)

    // 2. Create product
    const product = await prisma.product.upsert({
      where: { slug: config.slug },
      update: {
        name: config.name,
        description: config.description,
        shortDescription: config.shortDescription,
        basePrice: config.basePrice,
        setupFee: config.setupFee,
        productionTime: config.productionTime,
        isActive: true,
        categoryId: category.id,
        updatedAt: new Date(),
      },
      create: {
        id: createId(),
        slug: config.slug,
        sku: config.sku,
        name: config.name,
        description: config.description,
        shortDescription: config.shortDescription,
        basePrice: config.basePrice,
        setupFee: config.setupFee,
        productionTime: config.productionTime,
        isActive: true,
        categoryId: category.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log(`✅ Product: ${product.name}`)

    // 3. Link Size Group
    const sizeGroup = await prisma.sizeGroup.findFirst({
      where: { name: config.sizeGroupName },
    })

    if (sizeGroup) {
      await prisma.productSizeGroup.upsert({
        where: {
          productId_sizeGroupId: {
            productId: product.id,
            sizeGroupId: sizeGroup.id,
          },
        },
        update: { updatedAt: new Date() },
        create: {
          id: createId(),
          productId: product.id,
          sizeGroupId: sizeGroup.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Size Group: ${sizeGroup.name}`)
    } else {
      console.log(`⚠️  Size Group not found: ${config.sizeGroupName}`)
    }

    // 4. Link Quantity Group
    const quantityGroup = await prisma.quantityGroup.findFirst({
      where: { name: config.quantityGroupName },
    })

    if (quantityGroup) {
      await prisma.productQuantityGroup.upsert({
        where: {
          productId_quantityGroupId: {
            productId: product.id,
            quantityGroupId: quantityGroup.id,
          },
        },
        update: { updatedAt: new Date() },
        create: {
          id: createId(),
          productId: product.id,
          quantityGroupId: quantityGroup.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Quantity Group: ${quantityGroup.name}`)
    } else {
      console.log(`⚠️  Quantity Group not found: ${config.quantityGroupName}`)
    }

    // 5. Link Paper Stock Set
    const paperStockSet = await prisma.paperStockSet.findFirst({
      where: { name: config.paperStockSetName },
    })

    if (paperStockSet) {
      await prisma.productPaperStockSet.upsert({
        where: {
          productId_paperStockSetId: {
            productId: product.id,
            paperStockSetId: paperStockSet.id,
          },
        },
        update: { isDefault: true, updatedAt: new Date() },
        create: {
          id: createId(),
          productId: product.id,
          paperStockSetId: paperStockSet.id,
          isDefault: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Paper Stock Set: ${paperStockSet.name}`)
    } else {
      console.log(`⚠️  Paper Stock Set not found: ${config.paperStockSetName}`)
    }

    // 6. Link AddOn Sets
    for (const addonSetName of config.addonSetNames) {
      const addonSet = await prisma.addOnSet.findFirst({
        where: { name: addonSetName },
      })

      if (addonSet) {
        await prisma.productAddOnSet.upsert({
          where: {
            productId_addOnSetId: {
              productId: product.id,
              addOnSetId: addonSet.id,
            },
          },
          update: { isDefault: true, updatedAt: new Date() },
          create: {
            id: createId(),
            productId: product.id,
            addOnSetId: addonSet.id,
            isDefault: true,
            sortOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        console.log(`✅ AddOn Set: ${addonSet.name}`)
      } else {
        console.log(`⚠️  AddOn Set not found: ${addonSetName}`)
      }
    }

    // 7. Link Turnaround Time Sets
    for (const turnaroundSetName of config.turnaroundSetNames) {
      const turnaroundSet = await prisma.turnaroundTimeSet.findFirst({
        where: { name: turnaroundSetName },
      })

      if (turnaroundSet) {
        await prisma.productTurnaroundTimeSet.upsert({
          where: {
            productId_turnaroundTimeSetId: {
              productId: product.id,
              turnaroundTimeSetId: turnaroundSet.id,
            },
          },
          update: { isDefault: true, updatedAt: new Date() },
          create: {
            id: createId(),
            productId: product.id,
            turnaroundTimeSetId: turnaroundSet.id,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        console.log(`✅ Turnaround Time Set: ${turnaroundSet.name}`)
      } else {
        console.log(`⚠️  Turnaround Time Set not found: ${turnaroundSetName}`)
      }
    }

    // 8. Link Design Set
    const designSet = await prisma.designSet.findFirst({
      where: { name: config.designSetName },
    })

    if (designSet) {
      await prisma.productDesignSet.upsert({
        where: {
          productId_designSetId: {
            productId: product.id,
            designSetId: designSet.id,
          },
        },
        update: { isDefault: true, updatedAt: new Date() },
        create: {
          id: createId(),
          productId: product.id,
          designSetId: designSet.id,
          isDefault: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Design Set: ${designSet.name}`)
    } else {
      console.log(`⚠️  Design Set not found: ${config.designSetName}`)
    }

    console.log(`\n✅ SUCCESS: ${config.name} created!`)
    console.log(`   URL: https://gangrunprinting.com/products/${product.slug}`)
    console.log(`   ID: ${product.id}`)

    return product
  } catch (error) {
    console.error(`❌ Error creating ${config.name}:`, error)
    return null
  }
}

async function main() {
  console.log('\n🚀 CREATING CORE PRODUCTS\n')
  console.log('This script creates essential products for major categories.')
  console.log('Each product is fully configured with all required sets.\n')

  let successCount = 0
  let failureCount = 0

  for (const config of productConfigs) {
    const result = await createProduct(config)
    if (result) {
      successCount++
    } else {
      failureCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)
  console.log(`📦 Total: ${productConfigs.length}`)
  console.log('\nProducts created:')
  for (const config of productConfigs) {
    console.log(`  • ${config.name}`)
  }
  console.log('\n✨ Core products ready for customer orders!\n')
}

main()
  .catch((e) => {
    console.error('Error creating core products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
