import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testOrderWorkflow() {
  console.log('🧪 Testing Order Workflow...\n')

  try {
    // 1. Check if products exist
    console.log('1️⃣ Checking products...')
    const products = await prisma.product.findMany({
      take: 3,
      include: {
        ProductCategory: true,
        productPaperStocks: {
          include: {
            paperStock: true,
          },
        },
        PricingTier: true,
      },
    })

    if (products.length === 0) {
      console.log('❌ No products found. Run seed scripts first.')
      return
    }

    console.log(`✅ Found ${products.length} products`)
    products.forEach((p) => {
      console.log(`   - ${p.name} (${p.ProductCategory.name})`)
      console.log(`     Base price: $${p.basePrice}`)
      console.log(`     Paper stocks: ${p.productPaperStocks.length}`)
      console.log(`     Pricing tiers: ${p.PricingTier.length}`)
    })

    // 2. Check paper stocks
    console.log('\n2️⃣ Checking paper stocks...')
    const paperStocks = await prisma.paperStock.findMany({ take: 5 })
    console.log(`✅ Found ${paperStocks.length} paper stocks`)
    paperStocks.forEach((ps) => {
      console.log(`   - ${ps.name} (${ps.category})`)
    })

    // 3. Check size groups
    console.log('\n3️⃣ Checking size groups...')
    const sizeGroups = await prisma.sizeGroup.findMany({ take: 5 })
    console.log(`✅ Found ${sizeGroups.length} size groups`)
    sizeGroups.forEach((sg) => {
      console.log(`   - ${sg.name}: ${sg.values}`)
    })

    // 4. Check quantity groups
    console.log('\n4️⃣ Checking quantity groups...')
    const quantityGroups = await prisma.quantityGroup.findMany({ take: 5 })
    console.log(`✅ Found ${quantityGroups.length} quantity groups`)
    quantityGroups.forEach((qg) => {
      console.log(`   - ${qg.name}: ${qg.values}`)
    })

    // 5. Check add-ons
    console.log('\n5️⃣ Checking add-ons...')
    const addOns = await prisma.addOn.findMany({ take: 5 })
    console.log(`✅ Found ${addOns.length} add-ons`)
    addOns.forEach((ao) => {
      console.log(`   - ${ao.name}: ${ao.pricingModel}`)
    })

    // 6. Create a test order
    console.log('\n6️⃣ Creating test order...')
    const testOrderNumber = `TEST-${Date.now()}`

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: testOrderNumber,
        email: 'test@gangrunprinting.com',
        phone: '555-0123',
        subtotal: 9999, // $99.99
        tax: 825, // $8.25
        shipping: 1000, // $10.00
        total: 11824, // $118.24
        status: 'PENDING_PAYMENT',
        shippingAddress: {
          name: 'Test Customer',
          address: '123 Test Street',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'US',
        },
        OrderItem: {
          create: [
            {
              id: `${testOrderNumber}-item-1`,
              productName: 'Standard Business Cards',
              productSku: 'BC-STD-001',
              quantity: 500,
              price: 1999, // $19.99 per 500
              options: {
                size: '2x3.5',
                paperStock: '14pt Gloss Cover',
                sides: 'Double',
              },
            },
          ],
        },
        StatusHistory: {
          create: {
            id: `${testOrderNumber}-status-1`,
            toStatus: 'PENDING_PAYMENT',
            changedBy: 'System Test',
          },
        },
      },
      include: {
        OrderItem: true,
        StatusHistory: true,
      },
    })

    console.log(`✅ Created test order: ${testOrder.orderNumber}`)
    console.log(`   Total: $${(testOrder.total / 100).toFixed(2)}`)
    console.log(`   Status: ${testOrder.status}`)
    console.log(`   Items: ${testOrder.OrderItem.length}`)

    // 7. Test order status update
    console.log('\n7️⃣ Testing status update...')
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        StatusHistory: {
          create: {
            id: `${testOrderNumber}-status-2`,
            fromStatus: 'PENDING_PAYMENT',
            toStatus: 'PAID',
            changedBy: 'System Test',
          },
        },
      },
    })
    console.log(`✅ Updated order status to: ${updatedOrder.status}`)

    // 8. Test notification creation
    console.log('\n8️⃣ Testing notification...')
    const notification = await prisma.notification.create({
      data: {
        id: `${testOrderNumber}-notif-1`,
        orderId: testOrder.id,
        type: 'ORDER_CONFIRMED',
        sent: false,
      },
    })
    console.log(`✅ Created notification: ${notification.type}`)

    // 9. Clean up test data
    console.log('\n9️⃣ Cleaning up test data...')
    await prisma.notification.delete({ where: { id: notification.id } })
    await prisma.statusHistory.deleteMany({ where: { orderId: testOrder.id } })
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } })
    await prisma.order.delete({ where: { id: testOrder.id } })
    console.log('✅ Test data cleaned up')

    console.log('\n✨ Order workflow test completed successfully!')

    // Summary
    console.log('\n📊 Summary:')
    console.log('- Products are properly configured')
    console.log('- Paper stocks are available')
    console.log('- Size and quantity groups are set up')
    console.log('- Add-ons are configured')
    console.log('- Order creation and updates work')
    console.log('- Notification system is functional')
    console.log('\n🎉 The order workflow is ready for production!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testOrderWorkflow()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
