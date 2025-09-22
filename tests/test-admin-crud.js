const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')
const prisma = new PrismaClient()

async function testCRUD() {
  console.log('==========================================')
  console.log('     DATABASE CRUD OPERATIONS TEST')
  console.log('==========================================')

  const timestamp = Date.now()
  let allTestsPassed = true

  try {
    // Test Paper Stock CRUD
    console.log('\n1. Testing Paper Stock CRUD...')
    const paperStock = await prisma.paperStock.create({
      data: {
        id: uuidv4(),
        name: `Test Paper Stock ${timestamp}`,
        weight: 0.0015,
        pricePerSqInch: 0.001,
        tooltipText: 'Test paper stock',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', paperStock.name)

    const updatedPaperStock = await prisma.paperStock.update({
      where: { id: paperStock.id },
      data: { name: `Updated ${paperStock.name}` }
    })
    console.log('   ✅ Updated:', updatedPaperStock.name)

    await prisma.paperStock.delete({ where: { id: paperStock.id } })
    console.log('   ✅ Deleted successfully')

    // Test Standard Quantity CRUD
    console.log('\n2. Testing Standard Quantity CRUD...')
    const quantity = await prisma.standardQuantity.create({
      data: {
        id: uuidv4(),
        quantity: Math.floor(Math.random() * 10000),
        displayName: `Test Quantity ${timestamp}`,
        groupId: null,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', quantity.displayName)

    const updatedQuantity = await prisma.standardQuantity.update({
      where: { id: quantity.id },
      data: { displayName: `Updated ${quantity.displayName}` }
    })
    console.log('   ✅ Updated:', updatedQuantity.displayName)

    await prisma.standardQuantity.delete({ where: { id: quantity.id } })
    console.log('   ✅ Deleted successfully')

    // Test Size CRUD
    console.log('\n3. Testing Size CRUD...')
    const size = await prisma.size.create({
      data: {
        id: uuidv4(),
        name: `Test Size ${timestamp}`,
        width: 8.5,
        height: 11,
        unit: 'INCH',
        groupName: 'Standard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', size.name)

    const updatedSize = await prisma.size.update({
      where: { id: size.id },
      data: { name: `Updated ${size.name}` }
    })
    console.log('   ✅ Updated:', updatedSize.name)

    await prisma.size.delete({ where: { id: size.id } })
    console.log('   ✅ Deleted successfully')

    // Test Add-on CRUD
    console.log('\n4. Testing Add-on CRUD...')
    const addon = await prisma.addOn.create({
      data: {
        id: uuidv4(),
        name: `Test Add-on ${timestamp}`,
        category: 'COATING',
        pricingType: 'FLAT',
        flatPrice: 25.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', addon.name)

    const updatedAddon = await prisma.addOn.update({
      where: { id: addon.id },
      data: { name: `Updated ${addon.name}`, flatPrice: 30.00 }
    })
    console.log('   ✅ Updated:', updatedAddon.name, '($' + updatedAddon.flatPrice + ')')

    await prisma.addOn.delete({ where: { id: addon.id } })
    console.log('   ✅ Deleted successfully')

    // Test Add-on Set CRUD
    console.log('\n5. Testing Add-on Set CRUD...')
    const addonSet = await prisma.addOnSet.create({
      data: {
        id: uuidv4(),
        name: `Test Add-on Set ${timestamp}`,
        description: 'Test Description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', addonSet.name)

    const updatedAddonSet = await prisma.addOnSet.update({
      where: { id: addonSet.id },
      data: { description: 'Updated Description' }
    })
    console.log('   ✅ Updated description')

    await prisma.addOnSet.delete({ where: { id: addonSet.id } })
    console.log('   ✅ Deleted successfully')

    // Test Turnaround Time CRUD
    console.log('\n6. Testing Turnaround Time CRUD...')
    const turnaround = await prisma.turnaroundTime.create({
      data: {
        id: uuidv4(),
        name: `Test Turnaround ${timestamp}`,
        businessDays: 5,
        price: 100.00,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', turnaround.name)

    const updatedTurnaround = await prisma.turnaroundTime.update({
      where: { id: turnaround.id },
      data: { businessDays: 7 }
    })
    console.log('   ✅ Updated: Business days changed to', updatedTurnaround.businessDays)

    await prisma.turnaroundTime.delete({ where: { id: turnaround.id } })
    console.log('   ✅ Deleted successfully')

    // Test Turnaround Time Set CRUD
    console.log('\n7. Testing Turnaround Time Set CRUD...')
    const turnaroundSet = await prisma.turnaroundTimeSet.create({
      data: {
        id: uuidv4(),
        name: `Test Turnaround Set ${timestamp}`,
        description: 'Test Description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', turnaroundSet.name)

    const updatedTurnaroundSet = await prisma.turnaroundTimeSet.update({
      where: { id: turnaroundSet.id },
      data: { description: 'Updated Description' }
    })
    console.log('   ✅ Updated description')

    await prisma.turnaroundTimeSet.delete({ where: { id: turnaroundSet.id } })
    console.log('   ✅ Deleted successfully')

    // Test Product Category CRUD
    console.log('\n8. Testing Product Category CRUD...')
    const category = await prisma.productCategory.create({
      data: {
        id: uuidv4(),
        name: `Test Category ${timestamp}`,
        slug: `test-category-${timestamp}`,
        description: 'Test Description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', category.name)

    const updatedCategory = await prisma.productCategory.update({
      where: { id: category.id },
      data: { description: 'Updated Description' }
    })
    console.log('   ✅ Updated description')

    await prisma.productCategory.delete({ where: { id: category.id } })
    console.log('   ✅ Deleted successfully')

    // Test Product CRUD
    console.log('\n9. Testing Product CRUD...')
    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        name: `Test Product ${timestamp}`,
        slug: `test-product-${timestamp}`,
        sku: `SKU${timestamp}`,
        description: 'Test product description',
        basePrice: 99.99,
        isActive: true,
        category: 'business-cards',
        productType: 'SIMPLE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', product.name)

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { basePrice: 149.99 }
    })
    console.log('   ✅ Updated: Price changed to $' + updatedProduct.basePrice)

    await prisma.product.delete({ where: { id: product.id } })
    console.log('   ✅ Deleted successfully')

    // Test Paper Stock Set CRUD
    console.log('\n10. Testing Paper Stock Set CRUD...')
    const paperStockSet = await prisma.paperStockSet.create({
      data: {
        id: uuidv4(),
        name: `Test Paper Stock Set ${timestamp}`,
        description: 'Test Description',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Created:', paperStockSet.name)

    const updatedPaperStockSet = await prisma.paperStockSet.update({
      where: { id: paperStockSet.id },
      data: { description: 'Updated Description' }
    })
    console.log('   ✅ Updated description')

    await prisma.paperStockSet.delete({ where: { id: paperStockSet.id } })
    console.log('   ✅ Deleted successfully')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    allTestsPassed = false
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n==========================================')
  if (allTestsPassed) {
    console.log('     ✅ ALL DATABASE CRUD TESTS PASSED!')
  } else {
    console.log('     ❌ SOME TESTS FAILED')
  }
  console.log('==========================================')

  // Summary
  if (allTestsPassed) {
    console.log('\n📋 SUMMARY OF TESTED COMPONENTS:')
    console.log('✅ Products - Full CRUD Working')
    console.log('✅ Categories - Full CRUD Working')
    console.log('✅ Paper Stocks - Full CRUD Working')
    console.log('✅ Paper Stock Sets - Full CRUD Working')
    console.log('✅ Standard Quantities - Full CRUD Working')
    console.log('✅ Sizes - Full CRUD Working')
    console.log('✅ Add-ons - Full CRUD Working')
    console.log('✅ Add-on Sets - Full CRUD Working')
    console.log('✅ Turnaround Times - Full CRUD Working')
    console.log('✅ Turnaround Time Sets - Full CRUD Working')
    console.log('\n🎉 ALL ADMIN CRUD OPERATIONS ARE FULLY FUNCTIONAL!')
    console.log('🚀 Ready to move to the next level!')
  }
}

testCRUD().catch(console.error)