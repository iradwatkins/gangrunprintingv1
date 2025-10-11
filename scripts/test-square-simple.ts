#!/usr/bin/env tsx
/**
 * Simple Square Payment Test
 * Tests if Square credentials are configured correctly
 */

import { config } from 'dotenv'
config()

import {
  createSquareCheckout,
  createOrUpdateSquareCustomer,
  SQUARE_LOCATION_ID,
  SQUARE_APPLICATION_ID,
} from '../src/lib/square'

async function testSquareSimple() {
  console.log('🧪 Testing Square Payment Integration\n')

  // Check credentials
  console.log('📋 Checking credentials...')
  console.log(`✅ Location ID: ${SQUARE_LOCATION_ID}`)
  console.log(`✅ Application ID: ${SQUARE_APPLICATION_ID}`)
  console.log(`✅ Environment: ${process.env.SQUARE_ENVIRONMENT}\n`)

  try {
    // Test 1: Create a test customer
    console.log('👤 Test 1: Creating test customer...')
    const customer = await createOrUpdateSquareCustomer(
      'test@gangrunprinting.com',
      'Test Customer',
      '555-0100'
    )

    console.log(`✅ Customer created/updated:`)
    console.log(`   ID: ${customer.id}`)
    console.log(`   Email: ${customer.email}`)
    console.log(`   Name: ${customer.name}\n`)

    // Test 2: Create a test checkout link
    console.log('💳 Test 2: Creating test checkout link...')
    const checkout = await createSquareCheckout({
      amount: 1000, // $10.00 in cents
      orderNumber: `TEST-${Date.now()}`,
      email: 'test@gangrunprinting.com',
      items: [
        {
          name: 'Test Product',
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(1000),
            currency: 'USD',
          },
        },
      ],
    })

    console.log(`✅ Checkout link created:`)
    console.log(`   URL: ${checkout.url}`)
    console.log(`   ID: ${checkout.id}`)
    console.log(`   Order ID: ${checkout.orderId}\n`)

    // Summary
    console.log('═══════════════════════════════════════')
    console.log('✅ Square Integration Test: PASSED')
    console.log('═══════════════════════════════════════\n')

    console.log('📝 Next Steps:')
    console.log('1. Test the checkout link:')
    console.log(`   ${checkout.url}\n`)
    console.log('2. Use Square test cards:')
    console.log('   - Card: 4111 1111 1111 1111')
    console.log('   - Exp: Any future date')
    console.log('   - CVV: Any 3 digits')
    console.log('   - ZIP: Any 5 digits\n')
    console.log('3. Verify payment in Square Dashboard:')
    console.log(`   https://squareup.com/dashboard/sales/transactions\n`)

    console.log('🔐 Security Notes:')
    console.log(`- Currently using ${process.env.SQUARE_ENVIRONMENT?.toUpperCase()} environment`)
    if (process.env.SQUARE_ENVIRONMENT === 'sandbox') {
      console.log('- Test mode: No real charges will be made')
      console.log('- Switch to PRODUCTION in .env when ready\n')
    }
  } catch (error: any) {
    console.log('\n❌ Square API Error:')
    console.log(`   ${error.message}\n`)

    if (error.errors) {
      console.log('   Details:')
      error.errors.forEach((err: any) => {
        console.log(`   - ${err.category}: ${err.detail}`)
      })
      console.log()
    }

    console.log('💡 Common Issues:')
    console.log('   - Invalid access token: Check SQUARE_ACCESS_TOKEN in .env')
    console.log('   - Wrong environment: Verify SQUARE_ENVIRONMENT matches your token')
    console.log('   - Location not found: Verify SQUARE_LOCATION_ID is correct\n')

    process.exit(1)
  }
}

testSquareSimple().catch(console.error)
