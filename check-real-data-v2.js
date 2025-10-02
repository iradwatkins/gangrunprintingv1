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

    // 2. Check individual Quantities
    const quantities = await prisma.quantity.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { quantity: 'asc' }
    });
    console.log('\n📊 QUANTITIES:');
    quantities.forEach(q => console.log(`  - ${q.quantity} (ID: ${q.id})`));

    // 3. Check individual Sizes
    const sizes = await prisma.size.findMany({
      where: { isActive: true },
      take: 10
    });
    console.log('\n📐 SIZES:');
    sizes.forEach(s => console.log(`  - ${s.name}: ${s.width}x${s.height} ${s.unit} (ID: ${s.id})`));

    // 4. Check Paper Stocks
    const paperStocks = await prisma.paperStock.findMany({
      where: { isActive: true },
      take: 10
    });
    console.log('\n📄 PAPER STOCKS:');
    paperStocks.forEach(ps => console.log(`  - ${ps.name} - ${ps.weight}${ps.weightUnit} ${ps.finish} (ID: ${ps.id})`));

    // 5. Check Quantity Groups (if they exist)
    try {
      const quantityGroups = await prisma.quantityGroup.findMany({
        where: { isActive: true },
        take: 3
      });
      if (quantityGroups.length > 0) {
        console.log('\n📊 QUANTITY GROUPS:');
        quantityGroups.forEach(qg => console.log(`  - ${qg.name} (ID: ${qg.id})`));
      }
    } catch (e) {
      console.log('\n📊 No quantity groups found or table does not exist');
    }

    // 6. Check Size Groups (if they exist)
    try {
      const sizeGroups = await prisma.sizeGroup.findMany({
        where: { isActive: true },
        take: 3
      });
      if (sizeGroups.length > 0) {
        console.log('\n📐 SIZE GROUPS:');
        sizeGroups.forEach(sg => console.log(`  - ${sg.name} (ID: ${sg.id})`));
      }
    } catch (e) {
      console.log('\n📐 No size groups found or table does not exist');
    }

    // 7. Check Paper Stock Sets (if they exist)
    try {
      const paperStockSets = await prisma.paperStockSet.findMany({
        where: { isActive: true },
        take: 3
      });
      if (paperStockSets.length > 0) {
        console.log('\n📄 PAPER STOCK SETS:');
        paperStockSets.forEach(pss => console.log(`  - ${pss.name} (ID: ${pss.id})`));
      }
    } catch (e) {
      console.log('\n📄 No paper stock sets found or table does not exist');
    }

    // 8. Check existing products
    const products = await prisma.product.findMany({
      take: 3,
      include: {
        productCategory: true
      }
    });
    console.log(`\n📦 Existing products (${await prisma.product.count()} total):`);
    products.forEach(p => console.log(`  - ${p.name} (${p.sku}) - Category: ${p.productCategory?.name}`));

    // 9. Check for an admin user
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      take: 1,
      select: { id: true, email: true, name: true }
    });
    if (adminUsers.length > 0) {
      console.log('\n👤 Admin user found:');
      console.log(`  - ${adminUsers[0].name || adminUsers[0].email} (ID: ${adminUsers[0].id})`);
    }

    console.log('\n=== DATA CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealData();