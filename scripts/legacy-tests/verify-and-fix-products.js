const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PRODUCT_IDS = [
  'cmg8ffwq00001yywuq87ws213', // Premium Business Cards
  'cmg8ffwql0007yywudyq3i72c', // Marketing Flyers
  'cmg8ffwqu000dyywumaaygj2r', // Promotional Postcards
  'cmg8ffwr3000jyywu8ssw5vnb', // Professional Brochures
]

const REAL_DATA = {
  paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
  quantityGroupId: 'cmg5i6poy000094pu856umjxa',
  sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
  turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('VERIFY AND FIX PRODUCT CONFIGURATIONS')
  console.log('='.repeat(60))

  for (const productId of PRODUCT_IDS) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          productCategory: true,
          productPaperStockSets: true,
          productQuantityGroups: true,
          productSizeGroups: true,
          productTurnaroundTimeSets: true,
        },
      })

      if (!product) {
        console.log(`\n❌ Product ${productId} not found`)
        continue
      }

      console.log(`\n${'='.repeat(60)}`)
      console.log(`Product: ${product.name} (${product.sku})`)
      console.log(`ID: ${product.id}`)
      console.log(`Category: ${product.productCategory.name}`)
      console.log(`Base Price: $${product.basePrice}`)
      console.log(`Setup Fee: $${product.setupFee}`)
      console.log(`Active: ${product.isActive}, Featured: ${product.isFeatured}`)

      console.log(`\nCurrent Configuration:`)
      console.log(`  - Paper Stock Sets: ${product.productPaperStockSets.length}`)
      console.log(`  - Quantity Groups: ${product.productQuantityGroups.length}`)
      console.log(`  - Size Groups: ${product.productSizeGroups.length}`)
      console.log(`  - Turnaround Time Sets: ${product.productTurnaroundTimeSets.length}`)

      //  Add missing configurations
      if (product.productPaperStockSets.length === 0) {
        await prisma.productPaperStockSet.create({
          data: {
            productId: product.id,
            paperStockSetId: REAL_DATA.paperStockSetId,
            isDefault: true,
            sortOrder: 0,
          },
        })
        console.log(`  ✓ Added Paper Stock Set`)
      }

      if (product.productQuantityGroups.length === 0) {
        await prisma.productQuantityGroup.create({
          data: {
            productId: product.id,
            quantityGroupId: REAL_DATA.quantityGroupId,
          },
        })
        console.log(`  ✓ Added Quantity Group`)
      }

      if (product.productSizeGroups.length === 0) {
        await prisma.productSizeGroup.create({
          data: {
            productId: product.id,
            sizeGroupId: REAL_DATA.sizeGroupId,
          },
        })
        console.log(`  ✓ Added Size Group`)
      }

      if (product.productTurnaroundTimeSets.length === 0) {
        await prisma.productTurnaroundTimeSet.create({
          data: {
            productId: product.id,
            turnaroundTimeSetId: REAL_DATA.turnaroundTimeSetId,
            isDefault: true,
          },
        })
        console.log(`  ✓ Added Turnaround Time Set`)
      }

      console.log(`✅ Product configuration complete!`)
    } catch (error) {
      console.log(`❌ Error processing product ${productId}: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ All products verified and fixed!')
  console.log('='.repeat(60))

  await prisma.$disconnect()
}

main().catch(console.error)
