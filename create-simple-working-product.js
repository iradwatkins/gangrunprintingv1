const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSimpleWorkingProduct() {
  try {
    console.log('🔧 CREATING SIMPLE WORKING PRODUCT...\n');

    // 1. Use existing category
    const category = await prisma.productCategory.findFirst({
      where: { isActive: true }
    });
    console.log(`✅ Using category: ${category.name}`);

    // 2. Check if we have existing paper stocks
    let paperStocks = await prisma.paperStock.findMany({
      where: { isActive: true },
      take: 2
    });

    // If no paper stocks exist, create simple ones
    if (paperStocks.length === 0) {
      console.log('📄 Creating paper stocks...');
      const paperStock1 = await prisma.paperStock.create({
        data: {
          name: '100lb Gloss Text',
          weight: 100,
          pricePerSqInch: 0.002,
          isActive: true
        }
      });

      const paperStock2 = await prisma.paperStock.create({
        data: {
          name: '80lb Matte Cover',
          weight: 80,
          pricePerSqInch: 0.0025,
          isActive: true
        }
      });

      paperStocks = [paperStock1, paperStock2];
      console.log(`✅ Created ${paperStocks.length} paper stocks`);
    } else {
      console.log(`✅ Using ${paperStocks.length} existing paper stocks`);
    }

    // 3. Create Quantity Group
    console.log('\n📊 Creating quantity group...');
    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        name: `Print Quantities ${Date.now()}`,
        description: 'Standard printing quantities',
        values: '100,250,500,1000,2500',
        defaultValue: '250',
        isActive: true
      }
    });
    console.log(`✅ Created quantity group: ${quantityGroup.name}`);

    // 4. Create Size Group
    console.log('\n📐 Creating size group...');
    const sizeGroup = await prisma.sizeGroup.create({
      data: {
        name: `Print Sizes ${Date.now()}`,
        description: 'Standard printing sizes',
        values: '4x6,5x7,8.5x11,11x17',
        defaultValue: '8.5x11',
        isActive: true
      }
    });
    console.log(`✅ Created size group: ${sizeGroup.name}`);

    // 5. Create Paper Stock Set
    console.log('\n📄 Creating paper stock set...');
    const paperStockSet = await prisma.paperStockSet.create({
      data: {
        name: `Paper Options ${Date.now()}`,
        description: 'Available paper options',
        isActive: true
      }
    });

    // 6. Link paper stocks to set
    for (let i = 0; i < paperStocks.length; i++) {
      await prisma.paperStockSetItem.create({
        data: {
          paperStockSetId: paperStockSet.id,
          paperStockId: paperStocks[i].id,
          isDefault: i === 0,
          sortOrder: i + 1
        }
      });
    }
    console.log(`✅ Created paper stock set with ${paperStocks.length} options`);

    // 7. Create the main product
    console.log('\n📦 Creating main product...');
    const uniqueId = Date.now();
    const product = await prisma.product.create({
      data: {
        name: `Professional Business Flyers ${uniqueId}`,
        sku: `flyer-${uniqueId}`,
        slug: `professional-business-flyers-${uniqueId}`,
        description: 'High-quality business flyers perfect for marketing and promotion. Available in multiple sizes with professional paper options.',
        shortDescription: 'Professional marketing flyers',
        basePrice: 25.00,
        setupFee: 10.00,
        productionTime: 3,
        isActive: true,
        isFeatured: true,
        categoryId: category.id
      },
      include: {
        productCategory: true
      }
    });

    // 8. Link all modules to the product
    console.log('\n🔗 Linking modules...');

    await prisma.productQuantityGroup.create({
      data: {
        productId: product.id,
        quantityGroupId: quantityGroup.id
      }
    });
    console.log('  ✅ Linked quantity group');

    await prisma.productSizeGroup.create({
      data: {
        productId: product.id,
        sizeGroupId: sizeGroup.id
      }
    });
    console.log('  ✅ Linked size group');

    await prisma.productPaperStockSet.create({
      data: {
        productId: product.id,
        paperStockSetId: paperStockSet.id,
        isDefault: true
      }
    });
    console.log('  ✅ Linked paper stock set');

    console.log('\n🎉 PRODUCT CREATED SUCCESSFULLY!');
    console.log(`📦 Product: ${product.name}`);
    console.log(`🏷️  SKU: ${product.sku}`);
    console.log(`🗂️  Category: ${product.productCategory.name}`);
    console.log(`📊 Quantities: ${quantityGroup.values}`);
    console.log(`📐 Sizes: ${sizeGroup.values}`);
    console.log(`📄 Paper Options: ${paperStocks.length} available`);

    console.log('\n🌐 Access URLs:');
    console.log(`   📋 Admin Dashboard: https://gangrunprinting.com/admin/products`);
    console.log(`   🛒 Frontend Product: https://gangrunprinting.com/products/${product.slug}`);

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        urls: {
          admin: 'https://gangrunprinting.com/admin/products',
          frontend: `https://gangrunprinting.com/products/${product.slug}`
        }
      }
    };

  } catch (error) {
    console.error('❌ Error creating product:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleWorkingProduct().then(result => {
  if (result.success) {
    console.log(`\n🏆 SUCCESS! Product ready for testing.`);
    console.log(`📋 Admin: ${result.product.urls.admin}`);
    console.log(`🛒 Frontend: ${result.product.urls.frontend}`);
  } else {
    console.log(`\n💥 FAILED: ${result.error}`);
  }
});