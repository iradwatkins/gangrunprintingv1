import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAllData() {
  console.log('🔍 Final Data Verification Report\n')
  console.log('=' .repeat(50))

  try {
    // 1. Products
    const products = await prisma.product.findMany({
      include: {
        productPaperStockSets: true,
        productAddOnSets: true,
        productTurnaroundTimeSets: true
      }
    })
    console.log(`\n✅ PRODUCTS: ${products.length}`)
    products.forEach(p => {
      console.log(`   - ${p.name}`)
      console.log(`     Paper Stock Sets: ${p.productPaperStockSets.length}`)
      console.log(`     AddOn Sets: ${p.productAddOnSets.length}`)
      console.log(`     Turnaround Sets: ${p.productTurnaroundTimeSets.length}`)
    })

    // 2. Categories
    const categories = await prisma.productCategory.count()
    console.log(`\n✅ CATEGORIES: ${categories}`)

    // 3. Paper Stocks
    const paperStocks = await prisma.paperStock.count()
    console.log(`\n✅ PAPER STOCKS: ${paperStocks}`)

    // 4. Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany()
    const paperStockItems = await prisma.paperStockSetItem.count()
    console.log(`\n✅ PAPER STOCK SETS: ${paperStockSets.length}`)
    console.log(`   Total items in sets: ${paperStockItems}`)
    paperStockSets.forEach(s => console.log(`   - ${s.name}`))

    // 5. Quantities
    const quantities = await prisma.quantity.count()
    console.log(`\n✅ QUANTITIES: ${quantities}`)

    // 6. Sizes
    const sizes = await prisma.size.count()
    console.log(`\n✅ SIZES: ${sizes}`)

    // 7. Add-ons
    const addOns = await prisma.addOn.findMany({
      orderBy: { name: 'asc' }
    })
    console.log(`\n✅ ADD-ONS: ${addOns.length}`)
    console.log('   Special Add-ons with conditional fields:')
    addOns.filter(a =>
      a.name === 'Corner Rounding' ||
      a.name === 'Variable Data Printing' ||
      a.name === 'Perforation' ||
      a.name === 'Banding'
    ).forEach(a => console.log(`   ⭐ ${a.name} (${a.isActive ? 'Active' : 'Inactive'})`))
    console.log('   Regular Add-ons:')
    addOns.filter(a =>
      a.name !== 'Corner Rounding' &&
      a.name !== 'Variable Data Printing' &&
      a.name !== 'Perforation' &&
      a.name !== 'Banding'
    ).forEach(a => console.log(`   - ${a.name} (${a.isActive ? 'Active' : 'Inactive'})`))

    // 8. Add-on Sets
    const addOnSets = await prisma.addOnSet.findMany()
    const addOnSetItems = await prisma.addOnSetItem.findMany({
      include: { addOn: true }
    })
    console.log(`\n✅ ADD-ON SETS: ${addOnSets.length}`)
    console.log(`   Total items in sets: ${addOnSetItems.length}`)

    // Show display positions
    const aboveItems = addOnSetItems.filter(i => i.displayPosition === 'ABOVE_DROPDOWN')
    const inItems = addOnSetItems.filter(i => i.displayPosition === 'IN_DROPDOWN')
    const belowItems = addOnSetItems.filter(i => i.displayPosition === 'BELOW_DROPDOWN')

    console.log(`   Display Positions:`)
    console.log(`   - ABOVE_DROPDOWN: ${aboveItems.length} items`)
    aboveItems.forEach(i => console.log(`     • ${i.addOn.name}`))
    console.log(`   - IN_DROPDOWN: ${inItems.length} items`)
    console.log(`   - BELOW_DROPDOWN: ${belowItems.length} items`)
    belowItems.forEach(i => console.log(`     • ${i.addOn.name}`))

    // 9. Turnaround Times
    const turnaroundTimes = await prisma.turnaroundTime.count()
    console.log(`\n✅ TURNAROUND TIMES: ${turnaroundTimes}`)

    // 10. Turnaround Time Sets
    const turnaroundTimeSets = await prisma.turnaroundTimeSet.findMany()
    const turnaroundTimeItems = await prisma.turnaroundTimeSetItem.count()
    console.log(`\n✅ TURNAROUND TIME SETS: ${turnaroundTimeSets.length}`)
    console.log(`   Total items in sets: ${turnaroundTimeItems}`)
    turnaroundTimeSets.forEach(s => console.log(`   - ${s.name}`))

    console.log('\n' + '=' .repeat(50))
    console.log('✨ All data verified successfully!')
    console.log('=' .repeat(50))

  } catch (error) {
    console.error('Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAllData()