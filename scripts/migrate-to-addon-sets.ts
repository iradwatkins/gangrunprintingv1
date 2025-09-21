import { prisma } from '../src/lib/prisma'

async function migrateToAddOnSets() {

  try {
    // Get all products with their current addon associations
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        productAddOns: {
          include: {
            addOn: true,
          },
        },
      },
    })

    // Create a default addon set for each product
    for (const product of products) {
      if (product.productAddOns.length === 0) {

        continue
      }

      const addonSetName = `${product.name} - Default Set`

      // Check if a default addon set already exists for this product
      const existingProductSet = await prisma.productAddOnSet.findFirst({
        where: {
          productId: product.id,
        },
        include: {
          addOnSet: true,
        },
      })

      let addOnSetId: string

      if (existingProductSet) {

        addOnSetId = existingProductSet.addOnSetId
      } else {
        // Create new addon set
        const addOnSet = await prisma.addOnSet.create({
          data: {
            name: addonSetName,
            description: `Default addon set for ${product.name}`,
            sortOrder: 0,
            isActive: true,
          },
        })

        addOnSetId = addOnSet.id

        // Associate the addon set with the product
        await prisma.productAddOnSet.create({
          data: {
            productId: product.id,
            addOnSetId: addOnSet.id,
            isDefault: true,
            sortOrder: 0,
          },
        })

      }

      // Create addon set items from existing product addons
      for (const productAddOn of product.productAddOns) {
        // Check if item already exists
        const existingItem = await prisma.addOnSetItem.findFirst({
          where: {
            addOnSetId,
            addOnId: productAddOn.addOnId,
          },
        })

        if (existingItem) {

          continue
        }

        // Determine display position based on addon type
        let displayPosition: 'ABOVE_DROPDOWN' | 'IN_DROPDOWN' | 'BELOW_DROPDOWN' = 'IN_DROPDOWN'

        // Special addons like Variable Data, Perforation, Banding, Corner Rounding should be above
        const specialAddonTypes = ['variable_data', 'perforation', 'banding', 'corner_rounding']
        const addonConfig = productAddOn.addOn.configuration as any

        if (addonConfig && addonConfig.type && specialAddonTypes.includes(addonConfig.type)) {
          displayPosition = 'ABOVE_DROPDOWN'
        } else if (productAddOn.isMandatory) {
          displayPosition = 'ABOVE_DROPDOWN'
        }

        await prisma.addOnSetItem.create({
          data: {
            addOnSetId,
            addOnId: productAddOn.addOnId,
            displayPosition,
            isDefault: productAddOn.isMandatory,
            sortOrder: 0,
          },
        })

      }
    }

    // Create a "Default Addon Set" with common addons for new products
    const commonAddons = await prisma.addOn.findMany({
      where: {
        isActive: true,
        name: {
          in: [
            'Variable Data',
            'Perforation',
            'Banding',
            'Corner Rounding',
            'Foil Stamping',
            'Spot UV Coating',
            'Embossing/Debossing',
          ],
        },
      },
    })

    if (commonAddons.length > 0) {
      // Check if default set exists
      const defaultSet = await prisma.addOnSet.findFirst({
        where: {
          name: 'Default Addon Set',
        },
      })

      if (!defaultSet) {
        const newDefaultSet = await prisma.addOnSet.create({
          data: {
            name: 'Default Addon Set',
            description: 'Standard addon collection for new products',
            sortOrder: 0,
            isActive: true,
          },
        })

        // Add common addons
        for (const [index, addon] of commonAddons.entries()) {
          let displayPosition: 'ABOVE_DROPDOWN' | 'IN_DROPDOWN' | 'BELOW_DROPDOWN' = 'IN_DROPDOWN'

          const specialAddonTypes = ['variable_data', 'perforation', 'banding', 'corner_rounding']
          const addonConfig = addon.configuration as any

          if (addonConfig && addonConfig.type && specialAddonTypes.includes(addonConfig.type)) {
            displayPosition = 'ABOVE_DROPDOWN'
          }

          await prisma.addOnSetItem.create({
            data: {
              addOnSetId: newDefaultSet.id,
              addOnId: addon.id,
              displayPosition,
              isDefault: false,
              sortOrder: index,
            },
          })

        }
      } else {

      }
    }

    // Summary
    const totalSets = await prisma.addOnSet.count()
    const totalItems = await prisma.addOnSetItem.count()
    const totalProductAssociations = await prisma.productAddOnSet.count()

  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  }
}

// Run the migration
migrateToAddOnSets()
  .then(() => {

    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })