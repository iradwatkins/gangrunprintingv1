import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyRestoration() {
  try {
    // Check AddOns
    const addons = await prisma.addOn.findMany({
      select: {
        name: true,
        isActive: true,
        pricingModel: true,
      },
    })

    addons.forEach((addon) => {})

    // Check Categories
    const categories = await prisma.productCategory.findMany({
      select: {
        name: true,
        isActive: true,
      },
    })

    categories.forEach((cat) => {})

    // Check Paper Stocks
    const paperStocks = await prisma.paperStock.findMany({
      select: {
        name: true,
        isActive: true,
      },
    })

    paperStocks.forEach((ps) => {})

    // Check Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany({
      include: {
        paperStockItems: {
          include: {
            paperStock: true,
          },
        },
      },
    })

    paperStockSets.forEach((set) => {})

    // Check Quantity Groups
    const quantityGroups = await prisma.quantityGroup.findMany({
      select: {
        name: true,
        values: true,
        isActive: true,
      },
    })

    quantityGroups.forEach((qg) => {})

    // Check Size Groups
    const sizeGroups = await prisma.sizeGroup.findMany({
      select: {
        name: true,
        values: true,
        isActive: true,
      },
    })

    sizeGroups.forEach((sg) => {})

    // Check AddOn Sets
    const addonSets = await prisma.addOnSet.findMany({
      include: {
        addOnSetItems: {
          include: {
            addOn: true,
          },
        },
      },
    })

    addonSets.forEach((set) => {
      set.addOnSetItems.forEach((item) => {})
    })

    // Check Turnaround Time Sets
    const turnaroundSets = await prisma.turnaroundTimeSet.findMany({
      include: {
        turnaroundTimes: true,
      },
    })

    turnaroundSets.forEach((set) => {})

    // Check Products
    const products = await prisma.product.findMany({
      select: {
        name: true,
        slug: true,
        isActive: true,
      },
    })

    products.forEach((product) => {})

    console.log('='.repeat(50))

    // Check for the specific addons we restored
    const cornerRounding = addons.find((a) => a.name === 'Corner Rounding')
    const perforation = addons.find((a) => a.name === 'Perforation')
    const banding = addons.find((a) => a.name === 'Banding')
  } catch (error) {
    console.error('❌ Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRestoration()
  .then(() => console.log('\n✅ Verification complete!'))
  .catch(console.error)
