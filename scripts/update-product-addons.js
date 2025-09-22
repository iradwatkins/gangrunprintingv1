const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function updateProductAddons() {
  console.log('========================================');
  console.log('  UPDATING PRODUCT ADD-ONS WITH POSITIONS');
  console.log('========================================\n');

  try {
    // First check if we already have this set, otherwise create it
    let newAddOnSet = await prisma.addOnSet.findFirst({
      where: { name: 'Multi-Position Add-ons' }
    });

    if (!newAddOnSet) {
      newAddOnSet = await prisma.addOnSet.create({
        data: {
          id: uuidv4(),
          name: 'Multi-Position Add-ons',
          description: 'Add-ons with ABOVE, IN, and BELOW display positions',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Created new add-on set: Multi-Position Add-ons\n');
    } else {
      // Clear existing items
      await prisma.addOnSetItem.deleteMany({
        where: { addOnSetId: newAddOnSet.id }
      });
      console.log('✅ Using existing add-on set: Multi-Position Add-ons (cleared items)\n');
    }

    // Get some add-ons to use
    const addons = await prisma.addOn.findMany({
      where: { isActive: true },
      take: 9
    });

    // Configure add-ons with different display positions
    const addonConfigs = [
      // ABOVE_DROPDOWN items (shown above)
      { addon: addons[0], position: 'ABOVE_DROPDOWN', isDefault: true },
      { addon: addons[1], position: 'ABOVE_DROPDOWN', isDefault: false },
      { addon: addons[2], position: 'ABOVE_DROPDOWN', isDefault: false },

      // IN_DROPDOWN items (shown in dropdown)
      { addon: addons[3], position: 'IN_DROPDOWN', isDefault: false },
      { addon: addons[4], position: 'IN_DROPDOWN', isDefault: false },
      { addon: addons[5], position: 'IN_DROPDOWN', isDefault: false },

      // BELOW_DROPDOWN items (shown below)
      { addon: addons[6], position: 'BELOW_DROPDOWN', isDefault: false },
      { addon: addons[7], position: 'BELOW_DROPDOWN', isDefault: false },
      { addon: addons[8], position: 'BELOW_DROPDOWN', isDefault: false }
    ];

    // Create add-on set items
    for (let i = 0; i < addonConfigs.length; i++) {
      const config = addonConfigs[i];
      await prisma.addOnSetItem.create({
        data: {
          id: uuidv4(),
          addOnSetId: newAddOnSet.id,
          addOnId: config.addon.id,
          displayPosition: config.position,
          isDefault: config.isDefault,
          sortOrder: i,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`  Added ${config.addon.name} - Position: ${config.position}`);
    }

    console.log('\n📦 Updating products with new add-on set...\n');

    // Get the four products
    const products = await prisma.product.findMany({
      where: {
        slug: {
          in: ['product-one', 'product-two', 'product-three', 'product-four']
        }
      }
    });

    // Remove old add-on sets and add the new one
    for (const product of products) {
      // Delete existing product add-on sets
      await prisma.productAddOnSet.deleteMany({
        where: { productId: product.id }
      });

      // Add the new add-on set
      await prisma.productAddOnSet.create({
        data: {
          id: uuidv4(),
          productId: product.id,
          addOnSetId: newAddOnSet.id,
          isDefault: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Updated ${product.name} with new add-on set`);
    }

    // Verify the update
    console.log('\n========================================');
    console.log('    VERIFICATION');
    console.log('========================================\n');

    const verifyProducts = await prisma.product.findMany({
      where: {
        slug: {
          in: ['product-one', 'product-two', 'product-three', 'product-four']
        }
      },
      include: {
        productAddOnSets: {
          include: {
            AddOnSet: {
              include: {
                addOnSetItems: {
                  include: {
                    AddOn: true
                  },
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    verifyProducts.forEach(product => {
      console.log(`\n${product.name}:`);
      product.productAddOnSets.forEach(pas => {
        console.log(`  Add-on Set: ${pas.AddOnSet.name}`);

        const aboveItems = pas.AddOnSet.addOnSetItems.filter(i => i.displayPosition === 'ABOVE_DROPDOWN');
        const inItems = pas.AddOnSet.addOnSetItems.filter(i => i.displayPosition === 'IN_DROPDOWN');
        const belowItems = pas.AddOnSet.addOnSetItems.filter(i => i.displayPosition === 'BELOW_DROPDOWN');

        console.log(`  📍 ABOVE_DROPDOWN (${aboveItems.length}):`);
        aboveItems.forEach(item => {
          console.log(`     - ${item.AddOn.name}${item.isDefault ? ' ⭐ (default)' : ''}`);
        });

        console.log(`  📍 IN_DROPDOWN (${inItems.length}):`);
        inItems.forEach(item => {
          console.log(`     - ${item.AddOn.name}${item.isDefault ? ' ⭐ (default)' : ''}`);
        });

        console.log(`  📍 BELOW_DROPDOWN (${belowItems.length}):`);
        belowItems.forEach(item => {
          console.log(`     - ${item.AddOn.name}${item.isDefault ? ' ⭐ (default)' : ''}`);
        });
      });
    });

    console.log('\n========================================');
    console.log('  ✅ ALL PRODUCTS UPDATED WITH ADD-ONS');
    console.log('========================================');
    console.log('\n🎉 Products now have add-ons in all positions:');
    console.log('   • ABOVE_DROPDOWN - Shown above the dropdown');
    console.log('   • IN_DROPDOWN - Shown in the dropdown menu');
    console.log('   • BELOW_DROPDOWN - Shown below the dropdown\n');

  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductAddons().catch(console.error);