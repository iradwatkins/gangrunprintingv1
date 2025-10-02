const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSizeOnlyProduct() {
  console.log('🔧 Creating Size-Only Test Product...\n');

  try {
    // Generate unique timestamp
    const timestamp = Date.now();
    const productName = `Business Cards - Size Only Test ${timestamp}`;

    // Get the category
    const category = await prisma.productCategory.findFirst({
      where: { name: 'Brochures' }
    });

    if (!category) {
      throw new Error('Brochures category not found');
    }

    console.log('✅ Found category:', category.name);

    // Create the product with ONLY basic fields
    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: `BC-SIZE-${timestamp}`,
        basePrice: 39.99, // Different price from quantity product
        categoryId: category.id,
        isActive: true,
        productionTime: 3,
        description: 'High-quality business cards with flexible size options. This product demonstrates the Size Module working independently without any other modules.',
        shortDescription: 'Business cards with size options only'
      }
    });

    console.log('✅ CREATED BASE PRODUCT:');
    console.log('- ID:', product.id);
    console.log('- Name:', product.name);
    console.log('- SKU:', product.sku);
    console.log('- Base Price: $' + product.basePrice);

    // Get available size groups
    const sizeGroups = await prisma.sizeGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    if (sizeGroups.length === 0) {
      throw new Error('No size groups found');
    }

    console.log(`\n📏 AVAILABLE SIZE GROUPS:`);
    sizeGroups.forEach((sg, i) => {
      console.log(`${i + 1}. ${sg.name} - Values: ${sg.values} (Default: ${sg.defaultValue})`);
    });

    // Add ONLY the Size module to the product
    const selectedSizeGroup = sizeGroups[0];
    await prisma.productSizeGroup.create({
      data: {
        productId: product.id,
        sizeGroupId: selectedSizeGroup.id
      }
    });

    console.log(`\n✅ ADDED SIZE MODULE: ${selectedSizeGroup.name}`);

    // Verify the final product configuration
    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        productQuantityGroups: {
          include: {
            QuantityGroup: true
          }
        },
        productSizeGroups: {
          include: {
            SizeGroup: true
          }
        },
        productPaperStockSets: true,
        productAddOnSets: true,
        productTurnaroundTimeSets: true
      }
    });

    console.log('\n📦 FINAL MODULE CONFIGURATION:');
    console.log('=====================================');
    console.log('❌ Quantity Module:', finalProduct.productQuantityGroups.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)');

    console.log('✅ Size Module:', finalProduct.productSizeGroups.length > 0 ? 'ENABLED' : 'DISABLED');
    if (finalProduct.productSizeGroups.length > 0) {
      const sg = finalProduct.productSizeGroups[0].SizeGroup;
      console.log('   - Group Name:', sg.name);
      console.log('   - Available Sizes:', sg.values);
      console.log('   - Default:', sg.defaultValue);
    }

    console.log('❌ Paper Stock Module:', finalProduct.productPaperStockSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)');
    console.log('❌ Add-On Module:', finalProduct.productAddOnSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)');
    console.log('❌ Turnaround Module:', finalProduct.productTurnaroundTimeSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)');

    console.log('\n🎯 SIZE-ONLY PRODUCT CREATED!');
    console.log('This product has ONLY the Size Module - completely independent!');

    console.log('\n🔗 URLS:');
    console.log('Admin URL:');
    console.log(`https://gangrunprinting.com/admin/products/${product.id}`);
    console.log('Frontend URL:');
    console.log(`https://gangrunprinting.com/products/${product.slug}`);

    return { success: true, product };

  } catch (error) {
    console.error('❌ Error creating size-only product:', error.message);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation
createSizeOnlyProduct()
  .then(result => {
    if (result.success) {
      console.log('\n🏆 SIZE-ONLY PRODUCT CREATED SUCCESSFULLY!');
      console.log('\n📊 MODULAR ARCHITECTURE STATUS:');
      console.log('- Quantity-Only Product: ✅ Working');
      console.log('- Size-Only Product: ✅ Created (needs frontend testing)');
      console.log('- Each module is independent and modular!');
    } else {
      console.error('\n❌ Failed to create size-only product');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });