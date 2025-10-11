#!/usr/bin/env node

/**
 * REAL Order Creation Test (Not Test Orders)
 * Creates actual production orders through the checkout API
 */

const fetch = require('node-fetch')

// Real order data structure
const createRealOrderData = (orderNumber) => ({
  cartItems: [
    {
      id: `item-${Date.now()}`,
      productName: 'Business Cards - Premium',
      productId: 'business-cards-001',
      sku: 'BC-PREM-001',
      quantity: 500,
      price: 125.0,
      options: {
        size: 'Standard (3.5" x 2")',
        paperStock: '16pt Premium',
        coating: 'UV Glossy Both Sides',
        corners: 'Rounded',
      },
      dimensions: {
        width: 3.5,
        height: 2,
      },
      paperStockWeight: 0.0009,
      fileName: 'business-cards-design.pdf',
      fileSize: 2048000,
      fileUrl: '/uploads/business-cards-design.pdf',
    },
  ],
  uploadedImages: [
    {
      id: `img-${Date.now()}`,
      url: '/uploads/business-cards-design.pdf',
      thumbnailUrl: '/uploads/business-cards-thumb.jpg',
      fileName: 'business-cards-design.pdf',
      fileSize: 2048000,
      uploadedAt: new Date().toISOString(),
    },
  ],
  customerInfo: {
    email: 'appvillagellc@gmail.com',
    firstName: 'App',
    lastName: 'Village',
    company: 'App Village LLC',
    phone: '(773) 270-0582',
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
    carrier: 'UPS',
    serviceName: 'Ground',
    rateAmount: 12.95,
    estimatedDays: 5,
    transitDays: 5,
  },
  selectedAirportId: null,
  subtotal: 125.0,
  tax: 10.31,
  shipping: 12.95,
  total: 148.26,
  paymentMethod: 'square',
  paymentDetails: {
    type: 'credit_card',
    last4: '1111',
    brand: 'Visa',
  },
  orderType: 'STANDARD', // Not a test order
  isRushOrder: false,
  specialInstructions: `Real Order #${orderNumber} - Created ${new Date().toLocaleString()}`,
})

async function createRealOrder(orderNumber) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`🛍️ CREATING REAL ORDER #${orderNumber}`)
  console.log('='.repeat(50))

  try {
    const orderData = createRealOrderData(orderNumber)

    console.log('📧 Customer: appvillagellc@gmail.com')
    console.log('📦 Product: Business Cards - Premium (500 qty)')
    console.log('📍 Shipping: 2740 West 83rd Pl, Chicago, IL 60652')
    console.log('💰 Total: $' + orderData.total.toFixed(2))
    console.log('💳 Payment: Credit Card (Visa ****1111)\n')

    // Call the regular checkout API, not the test order endpoint
    const response = await fetch('https://gangrunprinting.com/api/checkout/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Origin: 'https://gangrunprinting.com',
        Referer: 'https://gangrunprinting.com/checkout',
      },
      body: JSON.stringify(orderData),
    })

    const responseText = await response.text()
    console.log('Response Status:', response.status)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.log('Raw Response:', responseText)
      throw new Error('Response is not valid JSON')
    }

    if (response.ok && result.success) {
      console.log(`✅ REAL ORDER CREATED SUCCESSFULLY!`)
      console.log(`📦 Order Number: ${result.orderNumber}`)
      console.log(`🆔 Order ID: ${result.orderId}`)
      console.log(`💳 Payment Status: ${result.paymentStatus || 'Processed'}`)
      console.log(`\n✉️ Confirmation email sent to: appvillagellc@gmail.com`)
      return {
        success: true,
        orderNumber: result.orderNumber,
        orderId: result.orderId,
        total: orderData.total,
      }
    } else {
      console.log(`❌ ORDER FAILED`)
      console.log('Error:', result.error || responseText)
      return { success: false, error: result.error || responseText }
    }
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runRealOrders() {
  console.log('\n' + '='.repeat(60))
  console.log('🎯 REAL PRODUCTION ORDER TEST')
  console.log('📍 Creating 3 real orders for App Village LLC')
  console.log('📧 Customer: appvillagellc@gmail.com')
  console.log('='.repeat(60))

  const results = []
  let totalAmount = 0

  for (let i = 1; i <= 3; i++) {
    const result = await createRealOrder(i)
    results.push(result)

    if (result.success) {
      totalAmount += result.total
    }

    // Wait 3 seconds between orders
    if (i < 3) {
      console.log('\n⏳ Waiting 3 seconds before next order...')
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 REAL ORDER SUMMARY')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`\n🛍️ Total Orders Attempted: 3`)
  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (successful.length > 0) {
    console.log('\n✅ Successfully Created Orders:')
    successful.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.orderNumber} (ID: ${r.orderId}) - $${r.total.toFixed(2)}`)
    })
    console.log(`\n💰 Total Order Value: $${totalAmount.toFixed(2)}`)
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Orders:')
    failed.forEach((r, i) => {
      console.log(`  ${i + 1}. Error: ${r.error}`)
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log(`🏁 COMPLETE - ${successful.length}/3 real orders created`)
  console.log('📧 Check appvillagellc@gmail.com for confirmation emails')
  console.log('🌐 View orders at: https://gangrunprinting.com/admin/orders')
  console.log('👤 Customer portal: https://gangrunprinting.com/account/orders')
  console.log('='.repeat(60) + '\n')

  process.exit(successful.length === 3 ? 0 : 1)
}

// Check if node-fetch is installed
try {
  require.resolve('node-fetch')
  runRealOrders().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
} catch (e) {
  console.log('Installing node-fetch...')
  require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' })
  console.log('Please run the script again.')
  process.exit(0)
}
