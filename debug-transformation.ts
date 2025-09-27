import { PrismaClient } from '@prisma/client';
import { transformAddonSets } from './src/lib/utils/addon-transformer';

const prisma = new PrismaClient();

async function debugTransformation() {
  try {
    console.log('🔍 Testing addon transformation logic...\n');

    // Get the exact same data as the API
    const productAddOnSets = await prisma.productAddOnSet.findMany({
      where: { productId: '7d4b2f10-d026-4f11-b07c-13851d3cfeb9' },
      include: {
        AddOnSet: {
          include: {
            addOnSetItems: {
              include: { AddOn: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log('1. Raw data check:');
    console.log('   - productAddOnSets.length:', productAddOnSets.length);

    if (productAddOnSets.length > 0) {
      console.log('   - ✅ Data exists, attempting transformation...\n');

      try {
        // This is the exact same call the API makes
        const transformedAddons = transformAddonSets(productAddOnSets);

        console.log('2. Transformation result:');
        console.log('   - ✅ Success! Transformed', transformedAddons.length, 'addons');

        transformedAddons.forEach((addon, i) => {
          console.log(`   - ${i + 1}. ${addon.name} (${addon.id}) - ${addon.pricingModel}`);
        });

        // Look specifically for Design addon
        const designAddon = transformedAddons.find(a => a.name === 'Design');
        if (designAddon) {
          console.log('\n3. ✅ Found Design addon:');
          console.log('   - ID:', designAddon.id);
          console.log('   - Name:', designAddon.name);
          console.log('   - Pricing Model:', designAddon.pricingModel);
          console.log('   - Price Display:', designAddon.priceDisplay);
        } else {
          console.log('\n3. ❌ Design addon NOT found in transformation');
        }

      } catch (transformError) {
        console.log('2. ❌ Transformation failed:');
        console.error('   Error:', transformError.message);
        console.error('   Stack:', transformError.stack);
      }
    } else {
      console.log('   - ❌ No productAddOnSets found');
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTransformation();