import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyRestoration() {
  console.log('🔍 Verifying data restoration...\n')

  try {
    // Check AddOns
    const addons = await prisma.addOn.findMany({
      select: {
        name: true,
        isActive: true,
        pricingModel: true
      }
    })
    console.log(`✅ AddOns: ${addons.length} total`)
    addons.forEach(addon => {
      console.log(`   - ${addon.name} (${addon.isActive ? 'Active' : 'Inactive'}) - ${addon.pricingModel}`)
    })

    // Check Categories
    const categories = await prisma.productCategory.findMany({
      select: {
        name: true,
        isActive: true
      }
    })
    console.log(`\n✅ Product Categories: ${categories.length} total`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.isActive ? 'Active' : 'Inactive'})`)
    })

    // Check Paper Stocks
    const paperStocks = await prisma.paperStock.findMany({
      select: {
        name: true,
        isActive: true
      }
    })
    console.log(`\n✅ Paper Stocks: ${paperStocks.length} total`)
    paperStocks.forEach(ps => {
      console.log(`   - ${ps.name} (${ps.isActive ? 'Active' : 'Inactive'})`)
    })

    // Check Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany({
      include: {
        paperStockItems: {
          include: {
            paperStock: true
          }
        }
      }
    })
    console.log(`\n✅ Paper Stock Sets: ${paperStockSets.length} total`)
    paperStockSets.forEach(set => {
      console.log(`   - ${set.name} with ${set.paperStockItems.length} paper stocks`)
    })

    // Check Quantity Groups
    const quantityGroups = await prisma.quantityGroup.findMany({
      select: {
        name: true,
        values: true,
        isActive: true
      }
    })
    console.log(`\n✅ Quantity Groups: ${quantityGroups.length} total`)
    quantityGroups.forEach(qg => {
      console.log(`   - ${qg.name}: ${qg.values} (${qg.isActive ? 'Active' : 'Inactive'})`)
    })

    // Check Size Groups
    const sizeGroups = await prisma.sizeGroup.findMany({
      select: {
        name: true,
        values: true,
        isActive: true
      }
    })
    console.log(`\n✅ Size Groups: ${sizeGroups.length} total`)
    sizeGroups.forEach(sg => {
      console.log(`   - ${sg.name}: ${sg.values} (${sg.isActive ? 'Active' : 'Inactive'})`)
    })

    // Check AddOn Sets
    const addonSets = await prisma.addOnSet.findMany({
      include: {
        addOnSetItems: {
          include: {
            addOn: true
          }
        }
      }
    })
    console.log(`\n✅ AddOn Sets: ${addonSets.length} total`)
    addonSets.forEach(set => {
      console.log(`   - ${set.name} with ${set.addOnSetItems.length} addons`)
      set.addOnSetItems.forEach(item => {
        console.log(`      • ${item.addOn.name} (${item.displayPosition})`)
      })
    })

    // Check Turnaround Time Sets
    const turnaroundSets = await prisma.turnaroundTimeSet.findMany({
      include: {
        turnaroundTimes: true
      }
    })
    console.log(`\n✅ Turnaround Time Sets: ${turnaroundSets.length} total`)
    turnaroundSets.forEach(set => {
      console.log(`   - ${set.name} with ${set.turnaroundTimes.length} options`)
    })

    // Check Products
    const products = await prisma.product.findMany({
      select: {
        name: true,
        slug: true,
        isActive: true
      }
    })
    console.log(`\n✅ Products: ${products.length} total`)
    products.forEach(product => {
      console.log(`   - ${product.name} (${product.slug}) - ${product.isActive ? 'Active' : 'Inactive'}`)
    })

    console.log('\n📊 Data Restoration Summary:')
    console.log('=' .repeat(50))
    console.log(`Total AddOns: ${addons.length} (Active: ${addons.filter(a => a.isActive).length})`)
    console.log(`Total Categories: ${categories.length}`)
    console.log(`Total Paper Stocks: ${paperStocks.length}`)
    console.log(`Total Paper Stock Sets: ${paperStockSets.length}`)
    console.log(`Total Quantity Groups: ${quantityGroups.length}`)
    console.log(`Total Size Groups: ${sizeGroups.length}`)
    console.log(`Total AddOn Sets: ${addonSets.length}`)
    console.log(`Total Turnaround Time Sets: ${turnaroundSets.length}`)
    console.log(`Total Products: ${products.length}`)

    // Check for the specific addons we restored
    const cornerRounding = addons.find(a => a.name === 'Corner Rounding')
    const perforation = addons.find(a => a.name === 'Perforation')
    const banding = addons.find(a => a.name === 'Banding')

    console.log('\n✨ Key AddOns from d2d5b5b:')
    console.log(`Corner Rounding: ${cornerRounding ? '✅ Found' : '❌ Missing'}`)
    console.log(`Perforation: ${perforation ? '✅ Found' : '❌ Missing'}`)
    console.log(`Banding: ${banding ? '✅ Found' : '❌ Missing'}`)

  } catch (error) {
    console.error('❌ Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRestoration()
  .then(() => console.log('\n✅ Verification complete!'))
  .catch(console.error)