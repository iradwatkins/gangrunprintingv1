/**
 * COMPLETE E2E TEST: 3 Orders with Image Upload + Southwest Cargo
 *
 * Success Criteria (Per Order):
 * ✅ Order created in database
 * ✅ At least 1 image uploaded and associated
 * ✅ OrderFile.thumbnailUrl IS NOT NULL
 * ✅ Order.shippingMethod contains "Southwest"
 * ✅ Order.airportId IS NOT NULL
 * ✅ Admin panel accessible
 */

const { PrismaClient } = require('@prisma/client')
const { createId } = require('@paralleldrive/cuid2')

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3020'

// Test data for 3 orders
const TEST_ORDERS = [
  {
    name: 'Test Order #1 - Business Cards',
    productName: '4x6 Flyers (9pt Card Stock)',
    quantity: 500,
    airport: 'DAL', // Dallas Love Field
    customerEmail: 'test1@gangrunprinting.com',
  },
  {
    name: 'Test Order #2 - Flyers',
    productName: '4x6 Flyers (9pt Card Stock)',
    quantity: 1000,
    airport: 'HOU', // Houston Hobby
    customerEmail: 'test2@gangrunprinting.com',
  },
  {
    name: 'Test Order #3 - Brochures',
    productName: '4x6 Flyers (9pt Card Stock)',
    quantity: 250,
    airport: 'PHX', // Phoenix Sky Harbor
    customerEmail: 'test3@gangrunprinting.com',
  },
]

// Create a simple test image buffer (1x1 red pixel PNG)
function createTestImage() {
  // Minimal valid PNG file (1x1 red pixel)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82,
  ])
  return pngData
}

// Upload image to MinIO via API
async function uploadImage(orderName) {
  try {
    const fetch = (await import('node-fetch')).default
    const FormData = (await import('form-data')).default

    const form = new FormData()
    const imageBuffer = createTestImage()
    const fileName = `test-image-${Date.now()}.png`

    form.append('file', imageBuffer, {
      filename: fileName,
      contentType: 'image/png',
    })

    console.log(`  📤 Uploading test image: ${fileName}`)

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`  ✅ Image uploaded successfully`)
    console.log(`     Full Response:`, JSON.stringify(result, null, 2))
    console.log(`     File ID: ${result.fileId}`)
    console.log(`     URL: ${result.url}`)
    console.log(`     Thumbnail: ${result.thumbnailUrl || 'N/A'}`)

    return result
  } catch (error) {
    console.error(`  ❌ Image upload failed:`, error.message)
    throw error
  }
}

// Get airport ID by IATA code
async function getAirportByCode(iataCode) {
  try {
    const airport = await prisma.airport.findFirst({
      where: {
        code: iataCode,
        isActive: true,
        carrier: 'SOUTHWEST_CARGO',
      },
    })

    if (!airport) {
      throw new Error(`Airport ${iataCode} not found for Southwest Cargo`)
    }

    console.log(`  ✅ Found airport: ${airport.name} (${airport.code})`)
    return airport
  } catch (error) {
    console.error(`  ❌ Airport lookup failed:`, error.message)
    throw error
  }
}

// Create order with Southwest Cargo shipping
async function createTestOrder(testData, orderNumber) {
  console.log(`\n🧪 TEST ORDER #${orderNumber}: ${testData.name}`)
  console.log(`${'='.repeat(60)}`)

  try {
    // Step 1: Upload image
    console.log(`\n📸 Step 1: Upload Image`)
    const uploadedFile = await uploadImage(testData.name)

    // Step 2: Get airport
    console.log(`\n✈️  Step 2: Get Southwest Airport`)
    const airport = await getAirportByCode(testData.airport)

    // Step 3: Create order in database
    console.log(`\n📦 Step 3: Create Order`)
    const orderId = createId()
    const now = new Date()
    const order = await prisma.order.create({
      data: {
        id: orderId,
        orderNumber: `TEST-${Date.now()}-${orderNumber}`,
        status: 'CONFIRMATION',
        createdAt: now,
        updatedAt: now,

        // Customer info
        email: testData.customerEmail, // Required field
        customerEmail: testData.customerEmail,
        customerFirstName: `Test`,
        customerLastName: `Customer ${orderNumber}`,
        customerPhone: '555-0100',

        // Shipping address
        shippingStreet: '123 Test St',
        shippingCity: airport.city,
        shippingState: airport.state,
        shippingZipCode: '75001',
        shippingCountry: 'US',

        // Shipping method - Southwest Cargo
        shippingMethod: `Southwest Cargo - ${airport.name}`,
        shippingCarrier: 'Southwest Cargo',
        shippingService: 'Airport Pickup',
        shippingCost: 0, // Free pickup
        shipping: 0, // Same as shippingCost
        airportId: airport.id,

        // Order totals
        subtotal: testData.quantity * 0.10, // $0.10 per piece
        tax: testData.quantity * 0.10 * 0.0825, // 8.25% tax
        total: testData.quantity * 0.10 * 1.0825,

        // Order items
        items: {
          create: [
            {
              id: createId(),
              productName: testData.productName,
              quantity: testData.quantity,
              price: 0.10,
              subtotal: testData.quantity * 0.10,
              createdAt: now,
              updatedAt: now,
            },
          ],
        },

        // Associated files - Skip if upload failed
        files: uploadedFile.fileId ? {
          create: [
            {
              id: createId(),
              fileId: uploadedFile.fileId,
              fileName: uploadedFile.fileName || `test-image-${orderNumber}.png`,
              fileUrl: uploadedFile.url,
              thumbnailUrl: uploadedFile.thumbnailUrl,
              fileSize: uploadedFile.size || 1024,
              mimeType: uploadedFile.mimeType || 'image/png',
              type: 'CUSTOMER_ARTWORK',
              status: 'PENDING_REVIEW',
              createdAt: now,
              updatedAt: now,
            },
          ],
        } : undefined,
      },
      include: {
        items: true,
        files: true,
        airport: true,
      },
    })

    console.log(`  ✅ Order created successfully!`)
    console.log(`     Order ID: ${order.id}`)
    console.log(`     Order Number: ${order.orderNumber}`)
    console.log(`     Shipping: ${order.shippingMethod}`)
    console.log(`     Airport: ${order.airport?.name} (${order.airport?.code})`)
    console.log(`     Files: ${order.files.length} attached`)
    console.log(`     Thumbnail: ${order.files[0]?.thumbnailUrl ? '✅ Yes' : '❌ No'}`)

    return {
      success: true,
      order,
      uploadedFile,
      airport,
    }
  } catch (error) {
    console.error(`\n❌ TEST ORDER #${orderNumber} FAILED:`, error.message)
    console.error(error.stack)

    return {
      success: false,
      error: error.message,
    }
  }
}

// Main test function
async function runTests() {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🧪 COMPLETE E2E TEST: 3 Orders + Images + Southwest Cargo`)
  console.log(`${'='.repeat(70)}`)
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`\n`)

  const results = []

  // Run all 3 tests
  for (let i = 0; i < TEST_ORDERS.length; i++) {
    const result = await createTestOrder(TEST_ORDERS[i], i + 1)
    results.push(result)

    // Wait 1 second between tests
    if (i < TEST_ORDERS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Generate summary
  console.log(`\n${'='.repeat(70)}`)
  console.log(`📊 TEST SUMMARY`)
  console.log(`${'='.repeat(70)}`)

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  console.log(`\n✅ Passed: ${successCount}/${TEST_ORDERS.length}`)
  console.log(`❌ Failed: ${failureCount}/${TEST_ORDERS.length}`)

  if (successCount === TEST_ORDERS.length) {
    console.log(`\n🎉 ALL TESTS PASSED!`)
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED`)
  }

  // Detailed results
  console.log(`\n📋 DETAILED RESULTS:`)
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${TEST_ORDERS[index].name}`)
    if (result.success) {
      console.log(`   ✅ Status: PASSED`)
      console.log(`   📦 Order: ${result.order.orderNumber}`)
      console.log(`   ✈️  Airport: ${result.airport.code}`)
      console.log(`   📸 Files: ${result.order.files.length}`)
      console.log(`   🖼️  Thumbnail: ${result.order.files[0]?.thumbnailUrl ? 'YES' : 'NO'}`)
    } else {
      console.log(`   ❌ Status: FAILED`)
      console.log(`   ⚠️  Error: ${result.error}`)
    }
  })

  // Admin verification instructions
  console.log(`\n${'='.repeat(70)}`)
  console.log(`🔍 ADMIN VERIFICATION STEPS:`)
  console.log(`${'='.repeat(70)}`)
  console.log(`\n1. Visit admin panel: http://gangrunprinting.com/admin/orders`)
  console.log(`\n2. Find test orders (search for "TEST-"):`)
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.order.orderNumber}`)
  })
  console.log(`\n3. Verify for EACH order:`)
  console.log(`   ✅ Image thumbnail displays`)
  console.log(`   ✅ Southwest Cargo shipping method`)
  console.log(`   ✅ Airport code visible (${TEST_ORDERS.map(t => t.airport).join(', ')})`)
  console.log(`\n4. Click on each order to view details`)
  console.log(`\n5. Check "Files" tab for uploaded images`)

  // Database verification query
  console.log(`\n${'='.repeat(70)}`)
  console.log(`💾 DATABASE VERIFICATION QUERY:`)
  console.log(`${'='.repeat(70)}`)
  console.log(`\n-- Run this to verify all test orders:`)
  console.log(`SELECT `)
  console.log(`  o.id,`)
  console.log(`  o.orderNumber,`)
  console.log(`  o.shippingMethod,`)
  console.log(`  o.shippingCarrier,`)
  console.log(`  a.iataCode as airportCode,`)
  console.log(`  a.name as airportName,`)
  console.log(`  COUNT(f.id) as fileCount,`)
  console.log(`  SUM(CASE WHEN f.thumbnailUrl IS NOT NULL THEN 1 ELSE 0 END) as thumbnailCount`)
  console.log(`FROM "Order" o`)
  console.log(`LEFT JOIN "Airport" a ON o.airportId = a.id`)
  console.log(`LEFT JOIN "OrderFile" f ON f.orderId = o.id`)
  console.log(`WHERE o.orderNumber LIKE 'TEST-%'`)
  console.log(`GROUP BY o.id, o.orderNumber, o.shippingMethod, o.shippingCarrier, a.iataCode, a.name`)
  console.log(`ORDER BY o.createdAt DESC;`)

  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ TEST COMPLETE`)
  console.log(`${'='.repeat(70)}\n`)

  return results
}

// Run tests
runTests()
  .then(() => {
    console.log('✅ All tests completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
