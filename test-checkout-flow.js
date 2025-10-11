#!/usr/bin/env node

/**
 * Test script to verify checkout flow
 * Simulates the complete order process
 */

const https = require('https')

const testOrderData = {
  cartItems: [
    {
      id: 'test-item-1',
      productName: 'Business Cards',
      sku: 'BC-001',
      quantity: 100,
      price: 29.99,
      options: {
        size: '3.5" x 2"',
        paperStock: '16pt',
        coating: 'Matte',
      },
      dimensions: {
        width: 3.5,
        height: 2,
      },
      paperStockWeight: 0.0009,
      fileName: 'test-design.pdf',
      fileSize: 1024000,
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
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    company: 'Test Company',
    phone: '(555) 123-4567',
  },
  shippingAddress: {
    street: '123 Test Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75001',
    country: 'US',
  },
  billingAddress: null, // Same as shipping
  shippingRate: {
    carrier: 'USPS',
    serviceName: 'Priority Mail',
    rateAmount: 7.95,
    estimatedDays: 3,
    transitDays: 3,
  },
  selectedAirportId: null,
  subtotal: 29.99,
  tax: 2.47,
  shipping: 7.95,
  total: 40.41,
}

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data)),
      },
    }

    const req = https.request(options, (res) => {
      let body = ''

      res.on('data', (chunk) => {
        body += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: response })
          } else {
            reject({ status: res.statusCode, error: body })
          }
        } catch (e) {
          reject({ status: res.statusCode, error: body })
        }
      })
    })

    req.on('error', (e) => {
      reject({ error: e.message })
    })

    req.write(JSON.stringify(data))
    req.end()
  })
}

async function testCheckout() {
  console.log('🧪 Testing Checkout Flow\n')
  console.log('========================\n')

  try {
    // Test 1: Test Cash Payment
    console.log('1. Testing Test Cash Payment...')
    const testCashResult = await makeRequest(
      '/api/checkout/create-test-order',
      'POST',
      testOrderData
    )

    if (testCashResult.data.success) {
      console.log('   ✅ Test cash payment successful!')
      console.log(`   Order Number: ${testCashResult.data.orderNumber}`)
      console.log(`   Order ID: ${testCashResult.data.orderId}\n`)
    } else {
      console.log('   ❌ Test cash payment failed:', testCashResult.data.error)
    }

    // Test 2: Square Checkout (will fail without valid Square credentials)
    console.log('2. Testing Square Checkout...')
    try {
      const squareResult = await makeRequest('/api/checkout/create-payment', 'POST', testOrderData)

      if (squareResult.data.success) {
        console.log('   ✅ Square checkout session created!')
        console.log(`   Checkout URL: ${squareResult.data.checkoutUrl}`)
        console.log(`   Order Number: ${squareResult.data.orderNumber}\n`)
      } else {
        console.log(
          '   ⚠️  Square checkout failed (expected if Square not configured):',
          squareResult.data.error
        )
      }
    } catch (error) {
      console.log(
        '   ⚠️  Square checkout error (expected if Square not configured):',
        error.error || error
      )
    }

    console.log('\n========================')
    console.log('✅ Checkout flow test complete!')
    console.log('\nNext steps:')
    console.log('1. Open https://gangrunprinting.com/checkout in your browser')
    console.log('2. Add a product to cart from /products')
    console.log('3. Complete the checkout flow')
    console.log('4. Check browser console for any errors')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

// Run the test
testCheckout()
