import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseData() {
  console.log('🔍 Checking database for existing data...\n')

  try {
    // Check Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany()
    console.log(`Paper Stock Sets: ${paperStockSets.length}`)
    if (paperStockSets.length > 0) {
      console.log('Existing Paper Stock Sets:')
      paperStockSets.forEach(set => {
        console.log(`  - ${set.name}: ${set.description}`)
      })
    }

    // Check AddOn Sets
    const addOnSets = await prisma.addOnSet.findMany()
    console.log(`\nAddOn Sets: ${addOnSets.length}`)
    if (addOnSets.length > 0) {
      console.log('Existing AddOn Sets:')
      addOnSets.forEach(set => {
        console.log(`  - ${set.name}: ${set.description}`)
      })
    }

    // Check Turnaround Time Sets
    const turnaroundTimeSets = await prisma.turnaroundTimeSet.findMany()
    console.log(`\nTurnaround Time Sets: ${turnaroundTimeSets.length}`)
    if (turnaroundTimeSets.length > 0) {
      console.log('Existing Turnaround Time Sets:')
      turnaroundTimeSets.forEach(set => {
        console.log(`  - ${set.name}: ${set.description}`)
      })
    }

    // Check Paper Stocks
    const paperStocks = await prisma.paperStock.findMany()
    console.log(`\nPaper Stocks: ${paperStocks.length}`)

    // Check Turnaround Times
    const turnaroundTimes = await prisma.turnaroundTime.findMany()
    console.log(`Turnaround Times: ${turnaroundTimes.length}`)

    // Check if there are any products using these sets
    const products = await prisma.product.findMany({
      include: {
        productPaperStockSets: true,
        productAddOnSets: true,
        productTurnaroundTimeSets: true,
      }
    })

    const productsWithSets = products.filter(p =>
      p.productPaperStockSets.length > 0 ||
      p.productAddOnSets.length > 0 ||
      p.productTurnaroundTimeSets.length > 0
    )

    console.log(`\nProducts using Sets: ${productsWithSets.length} out of ${products.length} total products`)

    if (productsWithSets.length > 0) {
      console.log('Products with Sets configured:')
      productsWithSets.forEach(product => {
        console.log(`  - ${product.name}:`)
        console.log(`    Paper Stock Sets: ${product.productPaperStockSets.length}`)
        console.log(`    AddOn Sets: ${product.productAddOnSets.length}`)
        console.log(`    Turnaround Time Sets: ${product.productTurnaroundTimeSets.length}`)
      })
    }

  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseData()