const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRealData() {
  try {
    const categories = await prisma.category.findMany({ take: 5 });
    const paperStocks = await prisma.paperStock.findMany({ take: 5 });
    const quantityGroups = await prisma.quantityGroup.findMany({ take: 5 });
    const sizeGroups = await prisma.sizeGroup.findMany({ take: 5 });
    const turnaroundGroups = await prisma.turnaroundTimeGroup.findMany({ take: 5 });

    console.log(JSON.stringify({
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      paperStocks: paperStocks.map(p => ({ id: p.id, name: p.name })),
      quantityGroups: quantityGroups.map(q => ({ id: q.id, name: q.name })),
      sizeGroups: sizeGroups.map(s => ({ id: s.id, name: s.name })),
      turnaroundGroups: turnaroundGroups.map(t => ({ id: t.id, name: t.name }))
    }, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

getRealData();
