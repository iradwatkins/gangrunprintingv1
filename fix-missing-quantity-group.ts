import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createMissingQuantityGroup() {
  try {
    // Check if it already exists
    const existing = await prisma.quantityGroup.findFirst({
      where: { name: 'Basic Gangrun Price' }
    });

    if (existing) {
      console.log('Basic Gangrun Price quantity group already exists');
      return;
    }

    // Create the missing quantity group
    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        id: 'qty_group_basic_gangrun',
        name: 'Basic Gangrun Price',
        description: 'Standard quantity options for Gangrun Printing',
        values: '500,1000,2500,5000,10000,Custom',
        defaultValue: '5000',
        customMin: 100,
        customMax: 100000,
        sortOrder: 0,
        isActive: true,
        updatedAt: new Date()
      }
    });

    console.log('Created Basic Gangrun Price quantity group:', quantityGroup.id);

    // Link it to the printing product
    const productId = '7d4b2f10-d026-4f11-b07c-13851d3cfeb9';

    const productQuantityGroup = await prisma.productQuantityGroup.create({
      data: {
        id: 'product_qty_group_basic',
        productId: productId,
        quantityGroupId: quantityGroup.id,
        updatedAt: new Date()
      }
    });

    console.log('Linked quantity group to printing product:', productQuantityGroup.id);

  } catch (error) {
    console.error('Error creating quantity group:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingQuantityGroup();