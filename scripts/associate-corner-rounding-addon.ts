import { prisma } from '../src/lib/prisma'

async function associateCornerRoundingWithProducts() {
  try {
    // Find the Corner Rounding addon
    const cornerRoundingAddon = await prisma.addOn.findFirst({
      where: {
        name: 'Corner Rounding'
      }
    })

    if (!cornerRoundingAddon) {
      console.error('Corner Rounding addon not found. Please run add-corner-rounding-addon.ts first.')
      process.exit(1)
    }

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        productAddOns: true
      }
    })

    // Associate Corner Rounding with each product if not already associated
    for (const product of products) {
      // Check if Corner Rounding is already associated with this product
      const existingAssociation = product.productAddOns.find(
        pa => pa.addOnId === cornerRoundingAddon.id
      )

      if (existingAssociation) {

      } else {
        // Create the association
        await prisma.productAddOn.create({
          data: {
            productId: product.id,
            addOnId: cornerRoundingAddon.id,
            isMandatory: false
          }
        })

      }
    }

    // Also find and associate with Variable Data, Perforation, and Banding if they exist
    const specialAddons = ['Variable Data', 'Perforation', 'Banding']

    for (const addonName of specialAddons) {
      const addon = await prisma.addOn.findFirst({
        where: { name: addonName }
      })

      if (addon) {

        for (const product of products) {
          const existingAssociation = product.productAddOns.find(
            pa => pa.addOnId === addon.id
          )

          if (!existingAssociation) {
            await prisma.productAddOn.create({
              data: {
                productId: product.id,
                addOnId: addon.id,
                isMandatory: false
              }
            })

          } else {

          }
        }
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('Error associating Corner Rounding addon:', error)
    process.exit(1)
  }
}

associateCornerRoundingWithProducts()