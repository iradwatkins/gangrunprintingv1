const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealData() {
  try {
    console.log('=== CHECKING REAL DATABASE DATA ===\n');

    // 1. Check Categories
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      take: 5
    });
    console.log('📁 ACTIVE CATEGORIES:');
    categories.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));

    // 2. Check Quantity Groups
    const quantityGroups = await prisma.quantityGroup.findMany({
      where: { isActive: true },
      include: { quantities: true },
      take: 3
    });
    console.log('\n📊 QUANTITY GROUPS:');
    quantityGroups.forEach(qg => {
      console.log(`  - ${qg.name} (ID: ${qg.id})`);
      if (qg.quantities.length > 0) {
        console.log(`    Quantities: ${qg.quantities.map(q => q.quantity).join(', ')}`);
      }
    });

    // 3. Check Size Groups
    const sizeGroups = await prisma.sizeGroup.findMany({
      where: { isActive: true },
      include: { sizes: true },
      take: 3
    });
    console.log('\n📐 SIZE GROUPS:');
    sizeGroups.forEach(sg => {
      console.log(`  - ${sg.name} (ID: ${sg.id})`);
      if (sg.sizes.length > 0) {
        console.log(`    Sizes: ${sg.sizes.map(s => `${s.width}x${s.height}`).join(', ')}`);
      }
    });

    // 4. Check Paper Stock Sets
    const paperStockSets = await prisma.paperStockSet.findMany({
      where: { isActive: true },
      include: {
        PaperStockSetItem: {
          include: { PaperStock: true }
        }
      },
      take: 3
    });
    console.log('\n📄 PAPER STOCK SETS:');
    paperStockSets.forEach(pss => {
      console.log(`  - ${pss.name} (ID: ${pss.id})`);
      if (pss.PaperStockSetItem.length > 0) {
        console.log(`    Papers: ${pss.PaperStockSetItem.map(i => i.PaperStock.name).join(', ')}`);
      }
    });

    // 5. Check if we have any existing products
    const productCount = await prisma.product.count();
    console.log(`\n📦 Total existing products: ${productCount}`);

    // 6. Get the first valid IDs for creating a product
    if (categories[0] && quantityGroups[0] && sizeGroups[0] && paperStockSets[0]) {
      console.log('\n✅ READY TO CREATE PRODUCT WITH:');
      console.log(`  Category: ${categories[0].name} (${categories[0].id})`);
      console.log(`  Quantity Group: ${quantityGroups[0].name} (${quantityGroups[0].id})`);
      console.log(`  Size Group: ${sizeGroups[0].name} (${sizeGroups[0].id})`);
      console.log(`  Paper Stock Set: ${paperStockSets[0].name} (${paperStockSets[0].id})`);

      return {
        categoryId: categories[0].id,
        quantityGroupId: quantityGroups[0].id,
        sizeGroupId: sizeGroups[0].id,
        paperStockSetId: paperStockSets[0].id
      };
    } else {
      console.log('\n⚠️ Missing required data in database!');
      return null;
    }

  } catch (error) {
    console.error('Error checking database:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

checkRealData().then(result => {
  if (result) {
    console.log('\n📝 Use these IDs for product creation:');
    console.log(JSON.stringify(result, null, 2));
  }
});