import { prisma } from './src/lib/prisma-singleton'

async function diagnoseProduct() {
  const slug = '4x6-flyers-9pt-card-stock'

  console.log('=== Investigating Real Product from URL ===\n')
  console.log(`URL: https://gangrunprinting.com/products/${slug}\n`)

  // Step 1: Find product by slug
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: slug },
        { sku: slug }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      isActive: true,
    }
  })

  if (!product) {
    console.log('❌ Product not found by slug:', slug)
    console.log('\n--- Searching for similar products ---')

    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { slug: { contains: '4x6' } },
          { name: { contains: '4x6' } },
          { name: { contains: 'flyer' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
      take: 10
    })

    console.log(`Found ${similarProducts.length} similar products:`)
    similarProducts.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name}`)
      console.log(`     Slug: ${p.slug}`)
      console.log(`     ID: ${p.id}`)
      console.log(`     Active: ${p.isActive}`)
      console.log('')
    })

    await prisma.$disconnect()
    return
  }

  console.log('✅ Product Found!')
  console.log(`   Name: ${product.name}`)
  console.log(`   Slug: ${product.slug}`)
  console.log(`   ID: ${product.id}`)
  console.log(`   Active: ${product.isActive}`)
  console.log('')

  // Step 2: Check ProductQuantityGroup relationships
  console.log('--- Checking Quantity Groups ---')
  const productQuantityGroups = await prisma.productQuantityGroup.findMany({
    where: { productId: product.id },
    include: {
      QuantityGroup: true
    }
  })

  if (productQuantityGroups.length === 0) {
    console.log('❌ NO QUANTITY GROUPS ASSIGNED')
  } else {
    console.log(`✅ Found ${productQuantityGroups.length} quantity group(s):`)
    productQuantityGroups.forEach((pqg, idx) => {
      console.log(`  ${idx + 1}. ${pqg.QuantityGroup.name}`)
      console.log(`     Values: ${pqg.QuantityGroup.values}`)
      console.log(`     Default: ${pqg.QuantityGroup.defaultValue}`)
    })
  }
  console.log('')

  // Step 3: Check ProductSizeGroup relationships
  console.log('--- Checking Size Groups ---')
  const productSizeGroups = await prisma.productSizeGroup.findMany({
    where: { productId: product.id },
    include: {
      SizeGroup: true
    }
  })

  if (productSizeGroups.length === 0) {
    console.log('❌ NO SIZE GROUPS ASSIGNED')
  } else {
    console.log(`✅ Found ${productSizeGroups.length} size group(s):`)
    productSizeGroups.forEach((psg, idx) => {
      console.log(`  ${idx + 1}. ${psg.SizeGroup.name}`)
    })
  }
  console.log('')

  // Step 4: Check ProductPaperStockSet relationships
  console.log('--- Checking Paper Stock Sets ---')
  const productPaperStockSets = await prisma.productPaperStockSet.findMany({
    where: { productId: product.id },
    include: {
      PaperStockSet: {
        include: {
          PaperStockSetItem: {
            include: {
              PaperStock: true
            }
          }
        }
      }
    }
  })

  if (productPaperStockSets.length === 0) {
    console.log('❌ NO PAPER STOCK SETS ASSIGNED')
  } else {
    console.log(`✅ Found ${productPaperStockSets.length} paper stock set(s):`)
    productPaperStockSets.forEach((ppss, idx) => {
      console.log(`  ${idx + 1}. ${ppss.PaperStockSet.name}`)
      console.log(`     Paper stocks: ${ppss.PaperStockSet.PaperStockSetItem.length}`)
    })
  }
  console.log('')

  // Step 5: Test configuration API logic
  console.log('--- Simulating Configuration API Logic ---')

  // Get all quantity groups for this product
  const quantityGroupsData = await prisma.productQuantityGroup.findMany({
    where: { productId: product.id },
    include: {
      QuantityGroup: true,
    },
  })

  const quantities = quantityGroupsData.flatMap((pqg) => {
    const group = pqg.QuantityGroup
    if (!group.values) return []

    return group.values.split(',').map((value: string) => ({
      id: `${group.id}_${value.trim()}`,
      label: value.trim() === 'custom'
        ? `Custom (${group.customMin || 1}-${group.customMax || 100000})`
        : value.trim(),
      value: value.trim(),
      groupId: group.id,
      groupName: group.name,
      isCustom: value.trim().toLowerCase() === 'custom',
    }))
  })

  console.log(`API would return ${quantities.length} quantity options`)
  if (quantities.length === 0) {
    console.log('❌ THIS IS WHY DROPDOWNS DON\'T APPEAR!')
  } else {
    console.log('Quantity options:')
    quantities.forEach((q, idx) => {
      console.log(`  ${idx + 1}. ${q.label}`)
    })
  }
  console.log('')

  // Step 6: Provide fix recommendation
  console.log('=== DIAGNOSIS COMPLETE ===\n')

  if (productQuantityGroups.length === 0) {
    console.log('🔧 FIX REQUIRED: Assign a QuantityGroup to this product')
    console.log('')
    console.log('Available quantity groups in database:')

    const allQuantityGroups = await prisma.quantityGroup.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        values: true,
        defaultValue: true,
      }
    })

    allQuantityGroups.forEach((qg, idx) => {
      console.log(`  ${idx + 1}. ${qg.name} (${qg.id})`)
      console.log(`     Values: ${qg.values}`)
      console.log(`     Default: ${qg.defaultValue}`)
      console.log('')
    })
  } else {
    console.log('✅ Product configuration looks correct')
    console.log('   The issue may be in the API route or frontend rendering')
  }

  await prisma.$disconnect()
}

diagnoseProduct().catch(console.error)
