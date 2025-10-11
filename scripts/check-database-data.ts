import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseData() {
  try {
    // Check Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany()

    if (paperStockSets.length > 0) {
      paperStockSets.forEach((set) => {})
    }

    // Check AddOn Sets
    const addOnSets = await prisma.addOnSet.findMany()

    if (addOnSets.length > 0) {
      addOnSets.forEach((set) => {})
    }

    // Check Turnaround Time Sets
    const turnaroundTimeSets = await prisma.turnaroundTimeSet.findMany()

    if (turnaroundTimeSets.length > 0) {
      turnaroundTimeSets.forEach((set) => {})
    }

    // Check Paper Stocks
    const paperStocks = await prisma.paperStock.findMany()

    // Check Turnaround Times
    const turnaroundTimes = await prisma.turnaroundTime.findMany()

    // Check if there are any products using these sets
    const products = await prisma.product.findMany({
      include: {
        productPaperStockSets: true,
        productAddOnSets: true,
        productTurnaroundTimeSets: true,
      },
    })

    const productsWithSets = products.filter(
      (p) =>
        p.productPaperStockSets.length > 0 ||
        p.productAddOnSets.length > 0 ||
        p.productTurnaroundTimeSets.length > 0
    )

    if (productsWithSets.length > 0) {
      productsWithSets.forEach((product) => {})
    }
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseData()
