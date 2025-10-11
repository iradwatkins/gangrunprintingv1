#!/usr/bin/env tsx
/**
 * Test Square Payment Integration
 * Verifies Square credentials and API connectivity
 */

import { config } from 'dotenv'
import { SquareClient, SquareEnvironment } from 'square'

// Load environment variables
config()

async function testSquareIntegration() {
  console.log('🧪 Testing Square Payment Integration\n')

  // Check credentials
  console.log('📋 Checking credentials...')
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const locationId = process.env.SQUARE_LOCATION_ID
  const applicationId = process.env.SQUARE_APPLICATION_ID
  const environment = process.env.SQUARE_ENVIRONMENT

  if (!accessToken || accessToken === 'your_square_access_token') {
    console.log('❌ SQUARE_ACCESS_TOKEN not configured')
    process.exit(1)
  }

  if (!locationId || locationId === 'your_location_id') {
    console.log('❌ SQUARE_LOCATION_ID not configured')
    process.exit(1)
  }

  if (!applicationId || applicationId === 'your_application_id') {
    console.log('❌ SQUARE_APPLICATION_ID not configured')
    process.exit(1)
  }

  console.log(`✅ Access Token: ${accessToken.substring(0, 20)}...`)
  console.log(`✅ Location ID: ${locationId}`)
  console.log(`✅ Application ID: ${applicationId}`)
  console.log(`✅ Environment: ${environment}\n`)

  // Initialize Square client
  console.log('🔌 Connecting to Square API...')
  const client = new SquareClient({
    squareVersion: '2024-09-19',
    accessToken,
    environment:
      environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  } as any)

  try {
    // Test 1: Get location details
    console.log('📍 Test 1: Retrieving location details...')
    const locationResponse = await client.locationsApi.retrieveLocation(locationId)

    if (locationResponse.result.location) {
      const loc = locationResponse.result.location
      console.log(`✅ Location found: ${loc.name}`)
      console.log(
        `   Address: ${loc.address?.addressLine1}, ${loc.address?.locality}, ${loc.address?.administrativeDistrictLevel1}`
      )
      console.log(`   Status: ${loc.status}`)
      console.log(`   Business Name: ${loc.businessName || 'N/A'}`)
      console.log(`   Currency: ${loc.currency}\n`)
    }

    // Test 2: List recent payments
    console.log('💳 Test 2: Checking payment history...')
    const paymentsResponse = await client.paymentsApi.listPayments(
      undefined,
      undefined,
      undefined,
      locationId,
      5
    )

    if (paymentsResponse.result.payments && paymentsResponse.result.payments.length > 0) {
      console.log(`✅ Found ${paymentsResponse.result.payments.length} recent payments:`)
      paymentsResponse.result.payments.forEach((payment, index) => {
        const amount = payment.amountMoney?.amount
          ? (Number(payment.amountMoney.amount) / 100).toFixed(2)
          : '0.00'
        console.log(`   ${index + 1}. $${amount} - ${payment.status} - ${payment.createdAt}`)
      })
      console.log()
    } else {
      console.log('ℹ️  No payments found yet (this is normal for a new account)\n')
    }

    // Test 3: Create a test customer (will be used for checkout)
    console.log('👤 Test 3: Creating test customer...')
    const customerResponse = await client.customersApi.createCustomer({
      emailAddress: 'test@gangrunprinting.com',
      givenName: 'Test',
      familyName: 'Customer',
      note: 'Test customer created by integration test',
    })

    if (customerResponse.result.customer) {
      const customer = customerResponse.result.customer
      console.log(`✅ Test customer created:`)
      console.log(`   ID: ${customer.id}`)
      console.log(`   Email: ${customer.emailAddress}`)
      console.log(`   Name: ${customer.givenName} ${customer.familyName}\n`)

      // Clean up - delete test customer
      console.log('🧹 Cleaning up test customer...')
      await client.customersApi.deleteCustomer(customer.id!)
      console.log('✅ Test customer deleted\n')
    }

    // Test 4: Verify catalog capabilities
    console.log('📦 Test 4: Checking catalog access...')
    const catalogResponse = await client.catalogApi.listCatalog(undefined, 'ITEM')

    if (catalogResponse.result.objects) {
      console.log(`✅ Catalog accessible - ${catalogResponse.result.objects.length} items found\n`)
    } else {
      console.log('ℹ️  No catalog items yet (this is normal)\n')
    }

    // Summary
    console.log('═══════════════════════════════════════')
    console.log('✅ Square Integration Test: PASSED')
    console.log('═══════════════════════════════════════\n')

    console.log('📝 Next Steps:')
    console.log('1. Visit a product page: https://gangrunprinting.com/products/business-cards')
    console.log('2. Add to cart and proceed to checkout')
    console.log('3. Complete payment using Square test cards:')
    console.log('   - Card: 4111 1111 1111 1111')
    console.log('   - Exp: Any future date')
    console.log('   - CVV: Any 3 digits')
    console.log('   - ZIP: Any 5 digits\n')

    console.log('🔐 Security Notes:')
    console.log(`- Currently using ${environment?.toUpperCase()} environment`)
    if (environment === 'sandbox') {
      console.log('- Test mode: No real charges will be made')
      console.log('- Switch to PRODUCTION when ready to accept real payments\n')
    } else {
      console.log('- PRODUCTION mode: Real charges will be made')
      console.log('- Make sure you have tested thoroughly in sandbox first\n')
    }

    console.log('📄 Documentation:')
    console.log('- Square Dashboard: https://squareup.com/dashboard')
    console.log('- Developer Console: https://developer.squareup.com/apps')
    console.log(
      '- Webhook Configuration: https://developer.squareup.com/apps (select your app > Webhooks)\n'
    )
  } catch (error: any) {
    console.log('\n❌ Square API Error:')
    console.log(`   ${error.message}`)

    if (error.errors) {
      console.log('\n   Details:')
      error.errors.forEach((err: any) => {
        console.log(`   - ${err.category}: ${err.detail}`)
      })
    }

    console.log('\n💡 Common Issues:')
    console.log('   - Invalid access token: Check SQUARE_ACCESS_TOKEN in .env')
    console.log('   - Wrong environment: Verify SQUARE_ENVIRONMENT matches your token')
    console.log('   - Location not found: Verify SQUARE_LOCATION_ID is correct')
    console.log('   - Permissions: Ensure your Square app has required permissions\n')

    process.exit(1)
  }
}

testSquareIntegration().catch(console.error)
