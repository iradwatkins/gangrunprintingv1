/**
 * CREATE 4x6 FLYERS - 9PT CARD STOCK PRODUCT
 *
 * Specifications:
 * - Product: 4x6 Flyers
 * - Paper Stock: 9pt C2S Cardstock
 * - Size: 4x6 inches
 * - Quantities: Including 5000
 * - Addons: UV coating, sides, design options
 * - Ready for Southwest Cargo shipping testing
 */

import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Creating 4x6 Flyers - 9pt Card Stock Product...\n')

  try {
    // 1. Find or create Flyers category
    const category = await prisma.productCategory.upsert({
      where: { slug: 'flyers' },
      update: {
        name: 'Flyers',
        description: 'Marketing flyers and promotional materials',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        id: createId(),
        name: 'Flyers',
        slug: 'flyers',
        description: 'Marketing flyers and promotional materials',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log('✅ Category ready: Flyers')

    // 2. Create the product
    const product = await prisma.product.upsert({
      where: { slug: '4x6-flyers-9pt-card-stock' },
      update: {
        name: '4x6 Flyers - 9pt Card Stock',
        description:
          'High-quality 4x6 flyers printed on 9pt card stock. Perfect for promotions, events, and marketing campaigns.',
        shortDescription: '4x6 flyers on premium 9pt card stock with UV coating options',
        basePrice: 0.1, // Will be calculated based on configuration
        setupFee: 0,
        productionTime: 3,
        isActive: true,
        categoryId: category.id,
        updatedAt: new Date(),
      },
      create: {
        id: createId(),
        slug: '4x6-flyers-9pt-card-stock',
        sku: 'FLY-4X6-9PT',
        name: '4x6 Flyers - 9pt Card Stock',
        description:
          'High-quality 4x6 flyers printed on 9pt card stock. Perfect for promotions, events, and marketing campaigns.',
        shortDescription: '4x6 flyers on premium 9pt card stock with UV coating options',
        basePrice: 0.1,
        setupFee: 0,
        productionTime: 3,
        isActive: true,
        categoryId: category.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log(`✅ Product created/updated: ${product.name} (${product.slug})`)

    // 3. Add 9pt C2S Cardstock paper stock
    const ninePtPaper = await prisma.paperStock.findFirst({
      where: { name: { contains: '9pt' } },
    })

    if (!ninePtPaper) {
      console.log('❌ 9pt C2S Cardstock not found in database')
      throw new Error('9pt paper stock not found')
    }

    console.log(`✅ Found paper stock: ${ninePtPaper.name}`)

    // Link paper stock to product
    await prisma.productPaperStock.upsert({
      where: {
        productId_paperStockId: {
          productId: product.id,
          paperStockId: ninePtPaper.id,
        },
      },
      update: {
        isDefault: true,
        additionalCost: 0,
      },
      create: {
        id: createId(),
        productId: product.id,
        paperStockId: ninePtPaper.id,
        isDefault: true,
        additionalCost: 0,
      },
    })
    console.log('✅ Linked 9pt paper stock to product')

    // 4. Create/link 4x6 size
    // First, find or create a size group for flyers
    let sizeGroup = await prisma.sizeGroup.findFirst({
      where: { name: 'Flyer Sizes' },
    })

    if (!sizeGroup) {
      sizeGroup = await prisma.sizeGroup.create({
        data: {
          id: createId(),
          name: 'Flyer Sizes',
          description: 'Standard flyer sizes',
          values: JSON.stringify([
            { value: '4x6', label: '4" x 6"', width: 4, height: 6 },
            { value: '5x7', label: '5" x 7"', width: 5, height: 7 },
            { value: '8.5x11', label: '8.5" x 11"', width: 8.5, height: 11 },
          ]),
          defaultValue: '4x6',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('✅ Created size group: Flyer Sizes')
    } else {
      console.log('✅ Found existing size group: Flyer Sizes')
    }

    // Link size group to product
    await prisma.productSizeGroup.upsert({
      where: {
        productId_sizeGroupId: {
          productId: product.id,
          sizeGroupId: sizeGroup.id,
        },
      },
      update: {
        isDefault: true,
        sortOrder: 1,
        updatedAt: new Date(),
      },
      create: {
        id: createId(),
        productId: product.id,
        sizeGroupId: sizeGroup.id,
        isDefault: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log('✅ Linked size group to product')

    // 5. Create/link quantity group with 5000
    let quantityGroup = await prisma.quantityGroup.findFirst({
      where: { name: 'Flyer Quantities' },
    })

    if (!quantityGroup) {
      quantityGroup = await prisma.quantityGroup.create({
        data: {
          id: createId(),
          name: 'Flyer Quantities',
          description: 'Standard flyer quantities',
          values: JSON.stringify([
            { value: '100', label: '100' },
            { value: '250', label: '250' },
            { value: '500', label: '500' },
            { value: '1000', label: '1,000' },
            { value: '2500', label: '2,500' },
            { value: '5000', label: '5,000' },
            { value: '10000', label: '10,000' },
            { value: 'custom', label: 'Custom Quantity' },
          ]),
          defaultValue: '500',
          sortOrder: 1,
          isActive: true,
          customMin: 50,
          customMax: 100000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('✅ Created quantity group: Flyer Quantities')
    } else {
      console.log('✅ Found existing quantity group: Flyer Quantities')
    }

    // Link quantity group to product
    await prisma.productQuantityGroup.upsert({
      where: {
        productId_quantityGroupId: {
          productId: product.id,
          quantityGroupId: quantityGroup.id,
        },
      },
      update: {
        isDefault: true,
        sortOrder: 1,
        updatedAt: new Date(),
      },
      create: {
        id: createId(),
        productId: product.id,
        quantityGroupId: quantityGroup.id,
        isDefault: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log('✅ Linked quantity group to product')

    // 6. Add Addon Sets (UV coating, rounded corners, etc.)
    const addonSets = await prisma.addOnSet.findMany({
      where: {
        name: {
          in: ['Business Card Enhancements', 'Flyer Finishing Options'],
        },
      },
    })

    console.log(`\n📦 Found ${addonSets.length} addon sets to link`)

    for (const addonSet of addonSets) {
      await prisma.productAddOnSet.upsert({
        where: {
          productId_addOnSetId: {
            productId: product.id,
            addOnSetId: addonSet.id,
          },
        },
        update: {
          isDefault: addonSet.name === 'Flyer Finishing Options',
          sortOrder: addonSet.name === 'Flyer Finishing Options' ? 1 : 2,
          updatedAt: new Date(),
        },
        create: {
          id: createId(),
          productId: product.id,
          addOnSetId: addonSet.id,
          isDefault: addonSet.name === 'Flyer Finishing Options',
          sortOrder: addonSet.name === 'Flyer Finishing Options' ? 1 : 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Linked addon set: ${addonSet.name}`)
    }

    // 7. Add Turnaround Time Sets
    const turnaroundSets = await prisma.turnaroundTimeSet.findMany({
      where: {
        name: {
          in: ['Standard Turnaround Times', 'Rush Production Options'],
        },
      },
    })

    console.log(`\n⏰ Found ${turnaroundSets.length} turnaround time sets to link`)

    for (const ttSet of turnaroundSets) {
      await prisma.productTurnaroundTimeSet.upsert({
        where: {
          productId_turnaroundTimeSetId: {
            productId: product.id,
            turnaroundTimeSetId: ttSet.id,
          },
        },
        update: {
          isDefault: ttSet.name === 'Standard Turnaround Times',
          sortOrder: ttSet.name === 'Standard Turnaround Times' ? 1 : 2,
          updatedAt: new Date(),
        },
        create: {
          id: createId(),
          productId: product.id,
          turnaroundTimeSetId: ttSet.id,
          isDefault: ttSet.name === 'Standard Turnaround Times',
          sortOrder: ttSet.name === 'Standard Turnaround Times' ? 1 : 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Linked turnaround time set: ${ttSet.name}`)
    }

    // 8. Add Design Set
    const designSets = await prisma.designSet.findMany({
      where: {
        name: {
          in: ['Standard Design Options', 'Professional Design Services'],
        },
      },
    })

    console.log(`\n🎨 Found ${designSets.length} design sets to link`)

    for (const designSet of designSets) {
      await prisma.productDesignSet.upsert({
        where: {
          productId_designSetId: {
            productId: product.id,
            designSetId: designSet.id,
          },
        },
        update: {
          isDefault: designSet.name === 'Standard Design Options',
          sortOrder: designSet.name === 'Standard Design Options' ? 1 : 2,
          updatedAt: new Date(),
        },
        create: {
          id: createId(),
          productId: product.id,
          designSetId: designSet.id,
          isDefault: designSet.name === 'Standard Design Options',
          sortOrder: designSet.name === 'Standard Design Options' ? 1 : 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`✅ Linked design set: ${designSet.name}`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ SUCCESS: 4x6 Flyers - 9pt Card Stock product created!')
    console.log('='.repeat(60))
    console.log(`\nProduct URL: https://gangrunprinting.com/products/${product.slug}`)
    console.log(`Product ID: ${product.id}`)
    console.log(`\nConfiguration:`)
    console.log(`  ✓ Paper Stock: 9pt C2S Cardstock`)
    console.log(`  ✓ Size: 4x6 (and other flyer sizes)`)
    console.log(`  ✓ Quantities: 100, 250, 500, 1000, 2500, 5000, 10000, Custom`)
    console.log(`  ✓ Addons: ${addonSets.length} sets linked`)
    console.log(`  ✓ Turnaround Times: ${turnaroundSets.length} sets linked`)
    console.log(`  ✓ Design Options: ${designSets.length} sets linked`)
    console.log(`\nReady for Southwest Cargo shipping tests! 🚀\n`)
  } catch (error) {
    console.error('❌ Error creating product:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
