import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAllData() {

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

    products.forEach(p => {

    })

    // 2. Categories
    const categories = await prisma.productCategory.count()

    // 3. Paper Stocks
    const paperStocks = await prisma.paperStock.count()

    // 4. Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany()
    const paperStockItems = await prisma.paperStockSetItem.count()

    paperStockSets.forEach(s => console.log(`   - ${s.name}`))

    // 5. Quantities
    const quantities = await prisma.quantity.count()

    // 6. Sizes
    const sizes = await prisma.size.count()

    // 7. Add-ons
    const addOns = await prisma.addOn.findMany({
      orderBy: { name: 'asc' }
    })

    addOns.filter(a =>
      a.name === 'Corner Rounding' ||
      a.name === 'Variable Data Printing' ||
      a.name === 'Perforation' ||
      a.name === 'Banding'
    ).forEach(a => console.log(`   ⭐ ${a.name} (${a.isActive ? 'Active' : 'Inactive'})`))

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

    // Show display positions
    const aboveItems = addOnSetItems.filter(i => i.displayPosition === 'ABOVE_DROPDOWN')
    const inItems = addOnSetItems.filter(i => i.displayPosition === 'IN_DROPDOWN')
    const belowItems = addOnSetItems.filter(i => i.displayPosition === 'BELOW_DROPDOWN')

    aboveItems.forEach(i => console.log(`     • ${i.addOn.name}`))

    belowItems.forEach(i => console.log(`     • ${i.addOn.name}`))

    // 9. Turnaround Times
    const turnaroundTimes = await prisma.turnaroundTime.count()

    // 10. Turnaround Time Sets
    const turnaroundTimeSets = await prisma.turnaroundTimeSet.findMany()
    const turnaroundTimeItems = await prisma.turnaroundTimeSetItem.count()

    turnaroundTimeSets.forEach(s => console.log(`   - ${s.name}`))

    console.log('\n' + '=' .repeat(50))

    console.log('=' .repeat(50))

  } catch (error) {
    console.error('Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAllData()