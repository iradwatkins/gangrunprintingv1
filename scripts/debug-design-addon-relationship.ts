import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging Design Add-on Database Relationships...\n')

  // 1. Check if Design add-on exists
  const designAddon = await prisma.addOn.findFirst({
    where: { id: 'addon_design' }
  })
  console.log('1. Design Add-on exists:', !!designAddon)
  if (designAddon) {
    console.log('   - ID:', designAddon.id)
    console.log('   - Name:', designAddon.name)
    console.log('   - Pricing Model:', designAddon.pricingModel)
  }

  // 2. Check if Design Services addon set exists
  const designServiceSet = await prisma.addOnSet.findFirst({
    where: { name: 'Design Services' }
  })
  console.log('\n2. Design Services AddOn Set exists:', !!designServiceSet)
  if (designServiceSet) {
    console.log('   - ID:', designServiceSet.id)
    console.log('   - Name:', designServiceSet.name)
  }

  // 3. Check if Design add-on is in the Design Services set
  const addOnSetItem = await prisma.addOnSetItem.findFirst({
    where: {
      addOnSetId: designServiceSet?.id,
      addOnId: designAddon?.id
    }
  })
  console.log('\n3. Design add-on in Design Services set:', !!addOnSetItem)
  if (addOnSetItem) {
    console.log('   - ID:', addOnSetItem.id)
    console.log('   - Display Position:', addOnSetItem.displayPosition)
    console.log('   - Sort Order:', addOnSetItem.sortOrder)
  }

  // 4. Check if product is assigned to Design Services addon set
  const productId = '7d4b2f10-d026-4f11-b07c-13851d3cfeb9' // printing product
  const productAddonSet = await prisma.productAddOnSet.findFirst({
    where: {
      productId: productId,
      addOnSetId: designServiceSet?.id
    }
  })
  console.log('\n4. Product assigned to Design Services set:', !!productAddonSet)
  if (productAddonSet) {
    console.log('   - ID:', productAddonSet.id)
    console.log('   - Product ID:', productAddonSet.productId)
    console.log('   - AddOn Set ID:', productAddonSet.addOnSetId)
  }

  // 5. Check what the product API should return
  const productWithAddons = await prisma.product.findFirst({
    where: { id: productId },
    include: {
      productAddOnSets: {
        include: {
          addOnSet: {
            include: {
              addOnSetItems: {
                include: {
                  addOn: true
                }
              }
            }
          }
        }
      }
    }
  })

  console.log('\n5. Product with addons query result:')
  if (productWithAddons?.productAddOnSets.length) {
    console.log('   - Product has', productWithAddons.productAddOnSets.length, 'addon sets')
    productWithAddons.productAddOnSets.forEach((pas, i) => {
      console.log(`   - Set ${i + 1}: ${pas.addOnSet.name}`)
      console.log(`     - Items: ${pas.addOnSet.addOnSetItems.length}`)
      pas.addOnSet.addOnSetItems.forEach((item, j) => {
        console.log(`     - Item ${j + 1}: ${item.addOn.name} (${item.addOn.id})`)
      })
    })
  } else {
    console.log('   - Product has NO addon sets assigned')
  }

  // 6. Check all ProductAddOnSet records
  const allProductAddonSets = await prisma.productAddOnSet.findMany({
    include: {
      product: { select: { name: true } },
      addOnSet: { select: { name: true } }
    }
  })
  console.log('\n6. All ProductAddOnSet relationships:')
  allProductAddonSets.forEach((pas, i) => {
    console.log(`   ${i + 1}. Product: ${pas.product.name} -> AddOn Set: ${pas.addOnSet.name}`)
  })
}

main()
  .catch((e) => {
    console.error('Error debugging relationships:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })