import { prisma } from './src/lib/prisma-singleton'

async function checkProduct() {
  const productId = 'ac24cea0-bf8d-4f1e-9642-4c9a05033bac'

  console.log('=== CHECKING NEWLY CREATED PRODUCT ===\n')

  // Step 1: Find the product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      ProductQuantityGroup: {
        include: {
          QuantityGroup: true
        }
      },
      ProductSizeGroup: {
        include: {
          SizeGroup: true
        }
      },
      ProductPaperStockSet: {
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
      },
      ProductTurnaroundTimeGroup: {
        include: {
          TurnaroundTimeGroup: true
        }
      }
    }
  })

  if (!product) {
    console.log('❌ Product not found:', productId)
    console.log('\n--- Checking total products in database ---')
    const totalProducts = await prisma.product.count()
    console.log(`Total products in database: ${totalProducts}`)

    if (totalProducts > 0) {
      console.log('\nRecent products:')
      const recentProducts = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        }
      })
      recentProducts.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name}`)
        console.log(`     ID: ${p.id}`)
        console.log(`     Slug: ${p.slug}`)
        console.log(`     Created: ${p.createdAt}`)
        console.log('')
      })
    }

    await prisma.$disconnect()
    return
  }

  console.log('✅ Product Found!')
  console.log(`   Name: ${product.name}`)
  console.log(`   Slug: ${product.slug}`)
  console.log(`   ID: ${product.id}`)
  console.log(`   Active: ${product.isActive}`)
  console.log(`   Created: ${product.createdAt}`)
  console.log('')

  // Step 2: Check configuration completeness
  console.log('=== CONFIGURATION CHECK ===\n')

  // Quantity Groups
  console.log('1. QUANTITY GROUPS:')
  if (product.ProductQuantityGroup.length === 0) {
    console.log('   ❌ NO QUANTITY GROUPS ASSIGNED')
    console.log('   → This is why quantities dropdown is empty!')
  } else {
    console.log(`   ✅ ${product.ProductQuantityGroup.length} quantity group(s)`)
    product.ProductQuantityGroup.forEach((pqg) => {
      console.log(`      - ${pqg.QuantityGroup.name}: ${pqg.QuantityGroup.values}`)
    })
  }
  console.log('')

  // Size Groups
  console.log('2. SIZE GROUPS:')
  if (product.ProductSizeGroup.length === 0) {
    console.log('   ❌ NO SIZE GROUPS ASSIGNED')
  } else {
    console.log(`   ✅ ${product.ProductSizeGroup.length} size group(s)`)
    product.ProductSizeGroup.forEach((psg) => {
      console.log(`      - ${psg.SizeGroup.name}`)
    })
  }
  console.log('')

  // Paper Stock Sets
  console.log('3. PAPER STOCK SETS:')
  if (product.ProductPaperStockSet.length === 0) {
    console.log('   ❌ NO PAPER STOCK SETS ASSIGNED')
  } else {
    console.log(`   ✅ ${product.ProductPaperStockSet.length} paper stock set(s)`)
    product.ProductPaperStockSet.forEach((ppss) => {
      console.log(`      - ${ppss.PaperStockSet.name} (${ppss.PaperStockSet.PaperStockSetItem.length} stocks)`)
    })
  }
  console.log('')

  // Turnaround Time Groups
  console.log('4. TURNAROUND TIME GROUPS:')
  if (product.ProductTurnaroundTimeGroup.length === 0) {
    console.log('   ❌ NO TURNAROUND TIME GROUPS ASSIGNED')
  } else {
    console.log(`   ✅ ${product.ProductTurnaroundTimeGroup.length} turnaround time group(s)`)
    product.ProductTurnaroundTimeGroup.forEach((pttg) => {
      console.log(`      - ${pttg.TurnaroundTimeGroup.name}`)
    })
  }
  console.log('')

  // Step 3: Simulate API configuration endpoint
  console.log('=== SIMULATING API RESPONSE ===\n')

  const quantities = product.ProductQuantityGroup.flatMap((pqg) => {
    const group = pqg.QuantityGroup
    if (!group.values) return []

    return group.values.split(',').map((value: string) => ({
      id: `${group.id}_${value.trim()}`,
      label: value.trim() === 'custom'
        ? `Custom (${group.customMin || 1}-${group.customMax || 100000})`
        : value.trim(),
      value: value.trim(),
    }))
  })

  console.log(`API would return:`)
  console.log(`  - ${quantities.length} quantity options`)
  console.log(`  - ${product.ProductSizeGroup.length} size groups`)
  console.log(`  - ${product.ProductPaperStockSet.length} paper stock sets`)
  console.log(`  - ${product.ProductTurnaroundTimeGroup.length} turnaround groups`)
  console.log('')

  if (quantities.length === 0) {
    console.log('⚠️  CRITICAL: quantities array will be EMPTY')
    console.log('   This causes "No quantities available" on frontend')
    console.log('')
    console.log('🔧 FIX REQUIRED:')
    console.log('   Admin must assign a Quantity Group when creating product')
    console.log('   OR we need to auto-assign a default quantity group')
  } else {
    console.log('✅ Configuration complete - dropdowns should appear!')
  }

  await prisma.$disconnect()
}

checkProduct().catch(console.error)
