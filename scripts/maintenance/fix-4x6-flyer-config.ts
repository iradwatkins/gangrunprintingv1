import { prisma } from './src/lib/prisma-singleton'

async function main() {
  const productId = '4faaa022-05ac-4607-9e73-2da77aecc7ce'

  console.log('=== Fixing 4x6 Flyers Product Configuration ===\n')

  // Get or create necessary groups
  const flyerQuantityGroup = await prisma.quantityGroup.upsert({
    where: { name: 'Flyer Quantities' },
    update: {},
    create: {
      id: 'qtygrp_flyers',
      name: 'Flyer Quantities',
      description: 'Standard flyer quantities',
      values: '250,500,1000,2500,5000,10000,custom',
      defaultValue: '1000',
      customMin: 250,
      customMax: 50000,
      sortOrder: 3,
      isActive: true,
      updatedAt: new Date(),
    },
  })

  console.log(`✅ Flyer Quantity Group: ${flyerQuantityGroup.id}`)

  // Create the ProductQuantityGroup relationship
  const productQuantityGroup = await prisma.productQuantityGroup.upsert({
    where: {
      productId_quantityGroupId: {
        productId: productId,
        quantityGroupId: flyerQuantityGroup.id,
      },
    },
    update: {},
    create: {
      id: `pqg_${productId}_${flyerQuantityGroup.id}`.substring(0, 25),
      productId: productId,
      quantityGroupId: flyerQuantityGroup.id,
      updatedAt: new Date(),
    },
  })

  console.log(`✅ Created ProductQuantityGroup relationship`)

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  })

  console.log(`✅ Updated product: ${product?.name}`)
  console.log(`   Assigned quantity group: ${flyerQuantityGroup.name}`)

  console.log('\n=== Testing Configuration API ===')
  console.log(`Run: curl https://gangrunprinting.com/api/products/${productId}/configuration | jq '.quantities'`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
