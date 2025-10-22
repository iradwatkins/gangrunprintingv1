const { PrismaClient } = require('@prisma/client')
const { createId } = require('@paralleldrive/cuid2')
const prisma = new PrismaClient()

const TEST_ORDERS = [
  { name: 'Test Order #1 - Business Cards', quantity: 500, airport: 'DAL', customerEmail: 'test1@gangrunprinting.com' },
  { name: 'Test Order #2 - Flyers', quantity: 1000, airport: 'HOU', customerEmail: 'test2@gangrunprinting.com' },
  { name: 'Test Order #3 - Brochures', quantity: 250, airport: 'PHX', customerEmail: 'test3@gangrunprinting.com' },
]

async function createTestOrder(testData, orderNumber) {
  console.log(`\n🧪 TEST ORDER #${orderNumber}: ${testData.name}`)
  try {
    const airport = await prisma.airport.findFirst({ where: { code: testData.airport, isActive: true, carrier: 'SOUTHWEST_CARGO' } })
    if (!airport) throw new Error(`Airport ${testData.airport} not found`)
    console.log(`  ✅ Found airport: ${airport.name} (${airport.code})`)
    
    const orderId = createId()
    const now = new Date()
    const order = await prisma.order.create({
      data: {
        id: orderId,
        orderNumber: `TEST-${Date.now()}-${orderNumber}`,
        status: 'CONFIRMATION',
        createdAt: now,
        updatedAt: now,
        email: testData.customerEmail,
        subtotal: testData.quantity * 0.10,
        tax: testData.quantity * 0.10 * 0.0825,
        shipping: 0,
        total: testData.quantity * 0.10 * 1.0825,
        shippingAddress: {
          street: '123 Test St',
          city: airport.city,
          state: airport.state,
          zipCode: '75001',
          country: 'US',
          firstName: 'Test',
          lastName: `Customer ${orderNumber}`,
          phone: '555-0100'
        },
        shippingMethod: `Southwest Cargo - ${airport.name}`,
        Airport: { connect: { id: airport.id } },
        OrderItem: {
          create: [{ id: createId(), productName: '4x6 Flyers (9pt Card Stock)', productSku: `TEST-SKU-${testData.airport}`, quantity: testData.quantity, price: 0.10 }]
        },
        OrderFile: {
          create: [{ id: createId(), filename: `test-image-${testData.airport}.png`, fileUrl: `https://gangrun-test.s3.amazonaws.com/test-${testData.airport}.png`, thumbnailUrl: `https://gangrun-test.s3.amazonaws.com/thumbnails/test-${testData.airport}.png`, fileSize: 1024, mimeType: 'image/png', fileType: 'CUSTOMER_ARTWORK', approvalStatus: 'WAITING' }]
        }
      },
      include: { OrderItem: true, OrderFile: true, Airport: true }
    })
    
    console.log(`  ✅ Order: ${order.orderNumber}`)
    console.log(`  ✈️  Airport: ${order.Airport?.code}`)
    console.log(`  📸 Files: ${order.OrderFile.length} (Thumbnail: ${order.OrderFile[0]?.thumbnailUrl ? 'YES' : 'NO'})`)
    return { success: true, order, airport }
  } catch (error) {
    console.error(`  ❌ FAILED:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🧪 CREATE 3 TEST ORDERS: Southwest Cargo + Mock Files`)
  console.log(`${'='.repeat(70)}\n`)
  
  const results = []
  for (let i = 0; i < TEST_ORDERS.length; i++) {
    const result = await createTestOrder(TEST_ORDERS[i], i + 1)
    results.push(result)
    if (i < TEST_ORDERS.length - 1) await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const successCount = results.filter(r => r.success).length
  console.log(`\n${'='.repeat(70)}`)
  console.log(`📊 RESULTS: ✅ ${successCount}/${TEST_ORDERS.length} PASSED`)
  console.log(`${'='.repeat(70)}\n`)
  
  if (successCount === TEST_ORDERS.length) {
    console.log(`🎉 ALL TESTS PASSED!`)
    console.log(`\n✅ Visit admin panel: http://gangrunprinting.com/admin/orders`)
    console.log(`✅ Search for "TEST-" to find orders`)
    console.log(`✅ Verify Southwest Cargo shipping method`)
    console.log(`✅ Verify airport codes: DAL, HOU, PHX`)
    console.log(`✅ Verify file thumbnails display\n`)
  }
  
  return results
}

runTests().then(() => { console.log('✅ Complete'); process.exit(0) }).catch((e) => { console.error('❌', e); process.exit(1) }).finally(() => prisma.$disconnect())
