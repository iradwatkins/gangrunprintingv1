#!/usr/bin/env node

/**
 * Direct API Test for Order Creation
 * Tests the order creation directly via API endpoints
 */

const fetch = require('node-fetch')

const testOrderData = {
  cartItems: [
    {
      id: `item-${Date.now()}`,
      productName: 'Premium Business Cards',
      productId: 'business-cards-premium',
      sku: 'BC-PREM-001',
      quantity: 500,
      price: 149.99,
      options: {
        size: 'Standard',
        paperStock: '14pt',
        coating: 'Glossy',
      },
      dimensions: {
        width: 3.5,
        height: 2,
      },
      paperStockWeight: 0.0009,
      fileName: 'test-design.pdf',
      fileSize: 1024000,
      fileUrl: '/uploads/test-design.pdf',
    },
  ],
  uploadedImages: [
    {
      id: 'img-1',
      url: '/uploads/test-design.pdf',
      thumbnailUrl: '/uploads/test-design-thumb.jpg',
      fileName: 'test-design.pdf',
      fileSize: 1024000,
      uploadedAt: new Date().toISOString(),
    },
  ],
  customerInfo: {
    email: 'appvillagellc@gmail.com',
    firstName: 'Test',
    lastName: 'Customer',
    company: 'App Village LLC',
    phone: '(773) 123-4567',
  },
  shippingAddress: {
    street: '2740 West 83rd Pl',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60652',
    country: 'US',
  },
  billingAddress: null, // Same as shipping
  shippingRate: {
    carrier: 'USPS',
    serviceName: 'Priority Mail',
    rateAmount: 8.95,
    estimatedDays: 3,
    transitDays: 3,
  },
  selectedAirportId: null,
  subtotal: 149.99,
  tax: 12.37,
  shipping: 14.95,
  total: 177.31,
}

async function testOrder(testNumber) {
  console.log(`\n📦 ORDER #${testNumber} - Premium Business Cards`)
  console.log('='.repeat(50))

  try {
    console.log('📧 Customer: App Village LLC (appvillagellc@gmail.com)')
    console.log('📍 Delivery: 2740 West 83rd Pl, Chicago, IL 60652')
    console.log('🎨 Product: 500 Premium Business Cards')
    console.log('💰 Total: $' + testOrderData.total.toFixed(2))
    console.log('💳 Payment: Processing...\n')

    const response = await fetch('https://gangrunprinting.com/api/checkout/create-test-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Origin: 'https://gangrunprinting.com',
        Referer: 'https://gangrunprinting.com/checkout',
      },
      body: JSON.stringify(testOrderData),
    })

    const responseText = await response.text()
    console.log('Response Status:', response.status)
    console.log('Response Headers:', response.headers.raw())

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.log('Raw Response:', responseText)
      throw new Error('Response is not valid JSON')
    }

    if (response.ok && result.success) {
      console.log(`✅ ORDER CREATED SUCCESSFULLY!`)
      console.log(`📦 Order Number: ${result.orderNumber}`)
      console.log(`🆔 Order ID: ${result.orderId}`)
      console.log(`\n✉️ Confirmation email should be sent to: appvillagellc@gmail.com`)
      return { success: true, orderNumber: result.orderNumber, orderId: result.orderId }
    } else {
      console.log(`❌ ORDER FAILED`)
      console.log('Error:', result.error || responseText)
      return { success: false, error: result.error || responseText }
    }
  } catch (error) {
    console.error(`❌ TEST FAILED: ${error.message}`)
    console.error('Stack:', error.stack)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60))
  console.log('🏢 APP VILLAGE LLC - BUSINESS CARD ORDER')
  console.log('📍 Delivering to Chicago, IL 60652')
  console.log('='.repeat(60))

  const results = []

  for (let i = 1; i <= 3; i++) {
    const result = await testOrder(i)
    results.push(result)

    // Wait 2 seconds between tests
    if (i < 5) {
      console.log('\n⏳ Waiting 2 seconds before next test...')
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`\nTotal Tests: 3`)
  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (successful.length > 0) {
    console.log('\nSuccessful Orders:')
    successful.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.orderNumber} (ID: ${r.orderId})`)
    })
  }

  if (failed.length > 0) {
    console.log('\nFailed Orders:')
    failed.forEach((r, i) => {
      console.log(`  ${i + 1}. Error: ${r.error}`)
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log(`🏁 TEST COMPLETE - ${successful.length}/3 orders created successfully`)
  console.log('📧 Check appvillagellc@gmail.com for confirmation emails')
  console.log('='.repeat(60) + '\n')

  process.exit(successful.length === 5 ? 0 : 1)
}

// Check if node-fetch is installed
try {
  require.resolve('node-fetch')
  runTests().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
} catch (e) {
  console.log('Installing node-fetch...')
  require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' })
  console.log('Please run the script again.')
  process.exit(0)
}
