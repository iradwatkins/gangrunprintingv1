import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const productId = '7d4b2f10-d026-4f11-b07c-13851d3cfeb9' // printing product
  const addonSetId = 'addonset_design_services' // Design Services addon set

  // Check if the assignment already exists
  const existing = await prisma.productAddOnSet.findFirst({
    where: {
      productId: productId,
      addOnSetId: addonSetId
    }
  })

  if (existing) {
    console.log('Design Services addon set already assigned to printing product')
    return
  }

  // Create the assignment
  const assignment = await prisma.productAddOnSet.create({
    data: {
      id: 'product_design_assignment',
      productId: productId,
      addOnSetId: addonSetId,
      updatedAt: new Date()
    }
  })

  console.log('Assigned Design Services addon set to printing product:', assignment.id)
}

main()
  .catch((e) => {
    console.error('Error assigning Design Services to product:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })