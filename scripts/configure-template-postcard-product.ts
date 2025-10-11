import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

/**
 * Configure the New York 4x6 Postcard product as a complete template
 * This will be used as a reference to clone to all other city products
 */

async function main() {
  console.log('🎯 Starting template product configuration...\n')

  // Step 1: Get the New York product
  const nyProduct = await prisma.product.findUnique({
    where: { slug: 'postcards-4x6-new-york-ny' },
    include: {
      City: true,
    },
  })

  if (!nyProduct) {
    console.error('❌ New York product not found!')
    process.exit(1)
  }

  console.log(`✅ Found product: ${nyProduct.name} (${nyProduct.id})\n`)

  // Step 2: Create PaperStockSet for this product
  console.log('📄 Creating Paper Stock Set...')

  const paperStockSet = await prisma.paperStockSet.upsert({
    where: {
      id: `pss_postcard_4x6_template`,
    },
    update: {},
    create: {
      id: `pss_postcard_4x6_template`,
      name: '4x6 Postcard Paper Stocks',
      description: 'Standard cardstock options for 4x6 postcards',
      updatedAt: new Date(),
    },
  })

  // Get paper stocks (14pt and 16pt cardstock)
  const paperStocks = await prisma.paperStock.findMany({
    where: {
      name: {
        in: ['14pt C2S Cardstock', '16pt C2S Cardstock'],
      },
    },
  })

  console.log(`Found ${paperStocks.length} paper stocks`)

  // Add paper stocks to set
  for (const paperStock of paperStocks) {
    await prisma.paperStockSetItem.upsert({
      where: {
        paperStockSetId_paperStockId: {
          paperStockSetId: paperStockSet.id,
          paperStockId: paperStock.id,
        },
      },
      update: {},
      create: {
        id: createId(),
        paperStockSetId: paperStockSet.id,
        paperStockId: paperStock.id,
        isDefault: paperStock.name === '14pt C2S Cardstock',
        sortOrder: paperStock.name === '14pt C2S Cardstock' ? 0 : 1,
        updatedAt: new Date(),
      },
    })
  }

  // Link paper stock set to product
  await prisma.productPaperStockSet.upsert({
    where: {
      productId_paperStockSetId: {
        productId: nyProduct.id,
        paperStockSetId: paperStockSet.id,
      },
    },
    update: {},
    create: {
      id: createId(),
      productId: nyProduct.id,
      paperStockSetId: paperStockSet.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Paper stocks configured\n')

  // Step 3: Create SizeGroup for 4x6
  console.log('📐 Creating Size Group...')

  const sizeGroup = await prisma.sizeGroup.upsert({
    where: {
      id: 'sg_postcard_4x6_template',
    },
    update: {},
    create: {
      id: 'sg_postcard_4x6_template',
      name: '4x6 Postcards',
      description: 'Standard 4x6 postcard size',
      values: '4x6',
      defaultValue: '4x6',
      updatedAt: new Date(),
    },
  })

  // Link size group to product
  await prisma.productSizeGroup.upsert({
    where: {
      productId_sizeGroupId: {
        productId: nyProduct.id,
        sizeGroupId: sizeGroup.id,
      },
    },
    update: {},
    create: {
      id: createId(),
      productId: nyProduct.id,
      sizeGroupId: sizeGroup.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Sizes configured\n')

  // Step 4: Create QuantityGroup
  console.log('🔢 Creating Quantity Group...')

  // Standard postcard quantities
  const quantities = [100, 250, 500, 1000, 2500, 5000, 10000]

  const quantityGroup = await prisma.quantityGroup.upsert({
    where: {
      id: 'qg_postcard_4x6_template',
    },
    update: {},
    create: {
      id: 'qg_postcard_4x6_template',
      name: '4x6 Postcard Quantities',
      values: quantities.join(','),
      defaultValue: '500',
      updatedAt: new Date(),
    },
  })

  // Link quantity group to product
  await prisma.productQuantityGroup.upsert({
    where: {
      productId_quantityGroupId: {
        productId: nyProduct.id,
        quantityGroupId: quantityGroup.id,
      },
    },
    update: {},
    create: {
      id: createId(),
      productId: nyProduct.id,
      quantityGroupId: quantityGroup.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Quantities configured\n')

  // Step 5: Create TurnaroundTimeSet
  console.log('⏱️  Creating Turnaround Time Set...')

  const turnaroundSet = await prisma.turnaroundTimeSet.upsert({
    where: {
      id: 'tts_postcard_4x6_template',
    },
    update: {},
    create: {
      id: 'tts_postcard_4x6_template',
      name: '4x6 Postcard Turnaround Times',
      description: 'Standard turnaround options for postcards',
      updatedAt: new Date(),
    },
  })

  // Get all turnaround times
  const turnaroundTimes = await prisma.turnaroundTime.findMany({
    where: {
      name: {
        in: ['Economy', 'Fast', 'Faster', 'Crazy Fast'],
      },
    },
    orderBy: {
      priceMultiplier: 'asc',
    },
  })

  console.log(`Found ${turnaroundTimes.length} turnaround times`)

  for (let i = 0; i < turnaroundTimes.length; i++) {
    const tt = turnaroundTimes[i]
    await prisma.turnaroundTimeSetItem.upsert({
      where: {
        turnaroundTimeSetId_turnaroundTimeId: {
          turnaroundTimeSetId: turnaroundSet.id,
          turnaroundTimeId: tt.id,
        },
      },
      update: {},
      create: {
        id: createId(),
        turnaroundTimeSetId: turnaroundSet.id,
        turnaroundTimeId: tt.id,
        isDefault: tt.name === 'Economy',
        sortOrder: i,
        updatedAt: new Date(),
      },
    })
  }

  // Link turnaround set to product
  await prisma.productTurnaroundTimeSet.upsert({
    where: {
      productId_turnaroundTimeSetId: {
        productId: nyProduct.id,
        turnaroundTimeSetId: turnaroundSet.id,
      },
    },
    update: {},
    create: {
      id: createId(),
      productId: nyProduct.id,
      turnaroundTimeSetId: turnaroundSet.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Turnaround times configured\n')

  // Step 6: Create AddOnSet with common postcard addons
  console.log('🎨 Creating Add-On Set...')

  const addonSet = await prisma.addOnSet.upsert({
    where: {
      id: 'aos_postcard_4x6_template',
    },
    update: {},
    create: {
      id: 'aos_postcard_4x6_template',
      name: '4x6 Postcard Add-Ons',
      description: 'Available finishing options for postcards',
      updatedAt: new Date(),
    },
  })

  // Common postcard addons
  const addonNames = ['Corner Rounding', 'Design', 'Digital Proof', 'QR Code', 'Color Critical']

  const addons = await prisma.addOn.findMany({
    where: {
      name: {
        in: addonNames,
      },
      isActive: true,
    },
  })

  console.log(`Found ${addons.length} add-ons`)

  for (let i = 0; i < addons.length; i++) {
    const addon = addons[i]
    await prisma.addOnSetItem.upsert({
      where: {
        addOnSetId_addOnId: {
          addOnSetId: addonSet.id,
          addOnId: addon.id,
        },
      },
      update: {},
      create: {
        id: createId(),
        addOnSetId: addonSet.id,
        addOnId: addon.id,
        isDefault: false,
        sortOrder: i,
        updatedAt: new Date(),
      },
    })
  }

  // Link addon set to product
  await prisma.productAddOnSet.upsert({
    where: {
      productId_addOnSetId: {
        productId: nyProduct.id,
        addOnSetId: addonSet.id,
      },
    },
    update: {},
    create: {
      id: createId(),
      productId: nyProduct.id,
      addOnSetId: addonSet.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Add-ons configured\n')

  // Step 7: Verify the configuration
  console.log('🔍 Verifying configuration...')

  const verifyProduct = await prisma.product.findUnique({
    where: { id: nyProduct.id },
    include: {
      ProductPaperStockSet: {
        include: {
          PaperStockSet: {
            include: {
              PaperStockSetItem: {
                include: {
                  PaperStock: true,
                },
              },
            },
          },
        },
      },
      ProductSizeGroup: {
        include: {
          SizeGroup: true,
        },
      },
      ProductQuantityGroup: {
        include: {
          QuantityGroup: true,
        },
      },
      ProductTurnaroundTimeSet: {
        include: {
          TurnaroundTimeSet: {
            include: {
              TurnaroundTimeSetItem: {
                include: {
                  TurnaroundTime: true,
                },
              },
            },
          },
        },
      },
      ProductAddOnSet: {
        include: {
          AddOnSet: {
            include: {
              AddOnSetItem: {
                include: {
                  AddOn: true,
                },
              },
            },
          },
        },
      },
    },
  })

  console.log('\n✅ CONFIGURATION COMPLETE!\n')
  console.log('📊 Template Product Summary:')
  console.log(`   Product: ${verifyProduct?.name}`)
  console.log(
    `   Paper Stocks: ${verifyProduct?.ProductPaperStockSet[0]?.PaperStockSet?.PaperStockSetItem.length || 0}`
  )
  console.log(`   Sizes: ${verifyProduct?.ProductSizeGroup[0]?.SizeGroup?.values || 'None'}`)
  console.log(
    `   Quantities: ${verifyProduct?.ProductQuantityGroup[0]?.QuantityGroup?.values || 'None'}`
  )
  console.log(
    `   Turnaround Times: ${verifyProduct?.ProductTurnaroundTimeSet[0]?.TurnaroundTimeSet?.TurnaroundTimeSetItem.length || 0}`
  )
  console.log(
    `   Add-Ons: ${verifyProduct?.ProductAddOnSet[0]?.AddOnSet?.AddOnSetItem.length || 0}`
  )
  console.log('\n🎉 Template is ready to be cloned to other city products!\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
