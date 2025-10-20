/**
 * Test Shipping Rates API using Playwright (simulates browser request)
 */

import { chromium } from 'playwright'

async function testShippingAPI() {
  console.log('🚀 Testing Shipping Rates API in browser context...\n')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext()
  const page = await context.newPage()

  // Listen to console
  page.on('console', (msg) => {
    const type = msg.type()
    if (type === 'log') {
      console.log(`[Browser]:`, msg.text())
    } else if (type === 'error') {
      console.error(`[Browser ERROR]:`, msg.text())
    }
  })

  try {
    // Navigate to homepage first to get cookies/session
    console.log('📄 Loading homepage...')
    await page.goto('http://gangrunprinting.com', { waitUntil: 'load' })
    console.log('   ✅ Homepage loaded\n')

    // Test 1: Beverly Hills, CA (Southwest should be available)
    console.log('=' .repeat(60))
    console.log('TEST 1: Beverly Hills, CA 90210 (Southwest available)')
    console.log('=' .repeat(60))

    const test1Request = {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 1 }],
    }

    console.log('📤 Request:', JSON.stringify(test1Request, null, 2))

    const response1 = await page.request.post('http://gangrunprinting.com/api/shipping/rates', {
      data: test1Request,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(`\n📥 Response Status: ${response1.status()} ${response1.statusText()}`)

    const data1 = await response1.json()
    console.log('\n📦 Response Data:', JSON.stringify(data1, null, 2))

    if (data1.success) {
      console.log(`\n✅ SUCCESS - Got ${data1.rates.length} shipping rates:`)
      data1.rates.forEach((rate, i) => {
        console.log(`   ${i + 1}. ${rate.providerName} - $${rate.rate.amount.toFixed(2)} (${rate.delivery.text})`)
      })

      // Check for FedEx
      const fedexRates = data1.rates.filter((r) => r.provider === 'fedex')
      console.log(`\n   🚚 FedEx: ${fedexRates.length} rates`)

      // Check for Southwest
      const southwestRates = data1.rates.filter((r) => r.provider === 'southwest-cargo')
      console.log(`   ✈️  Southwest Cargo: ${southwestRates.length} rates`)

      if (southwestRates.length === 0) {
        console.log('\n⚠️  WARNING: No Southwest Cargo rates found for CA!')
      }
    } else {
      console.log('\n❌ FAILED - API returned error')
      if (data1.error) {
        console.log(`   Error: ${data1.error}`)
      }
      if (data1.details) {
        console.log(`   Details:`, data1.details)
      }
    }

    // Test 2: Dallas, TX (Southwest should be available - 11 airports in TX)
    console.log('\n\n' + '='.repeat(60))
    console.log('TEST 2: Dallas, TX 75201 (Southwest available - 11 TX airports)')
    console.log('='.repeat(60))

    const test2Request = {
      destination: {
        zipCode: '75201',
        state: 'TX',
        city: 'Dallas',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 5 }], // 5 lb package
    }

    console.log('📤 Request:', JSON.stringify(test2Request, null, 2))

    const response2 = await page.request.post('http://gangrunprinting.com/api/shipping/rates', {
      data: test2Request,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(`\n📥 Response Status: ${response2.status()} ${response2.statusText()}`)

    const data2 = await response2.json()

    if (data2.success) {
      console.log(`\n✅ SUCCESS - Got ${data2.rates.length} shipping rates:`)
      data2.rates.forEach((rate, i) => {
        console.log(`   ${i + 1}. ${rate.providerName} - $${rate.rate.amount.toFixed(2)} (${rate.delivery.text})`)
      })

      // Check for Southwest
      const southwestRates = data2.rates.filter((r) => r.provider === 'southwest-cargo')
      console.log(`\n   ✈️  Southwest Cargo: ${southwestRates.length} rates`)

      if (southwestRates.length > 0) {
        console.log('\n   Southwest Cargo Details:')
        southwestRates.forEach((rate) => {
          console.log(`      - ${rate.providerName}: $${rate.rate.amount.toFixed(2)}`)
        })
      } else {
        console.log('\n   ❌ ERROR: No Southwest Cargo rates for TX (should have 11 airports!)')
      }
    } else {
      console.log('\n❌ FAILED - API returned error')
      console.log('   Response:', JSON.stringify(data2, null, 2))
    }

    // Test 3: Vermont (Southwest NOT available)
    console.log('\n\n' + '='.repeat(60))
    console.log('TEST 3: Burlington, VT 05401 (Southwest NOT available)')
    console.log('='.repeat(60))

    const test3Request = {
      destination: {
        zipCode: '05401',
        state: 'VT',
        city: 'Burlington',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 2 }],
    }

    const response3 = await page.request.post('http://gangrunprinting.com/api/shipping/rates', {
      data: test3Request,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data3 = await response3.json()

    if (data3.success) {
      const southwestRates = data3.rates.filter((r) => r.provider === 'southwest-cargo')
      if (southwestRates.length === 0) {
        console.log('   ✅ CORRECT: No Southwest Cargo rates for VT (as expected)')
      } else {
        console.log('   ❌ ERROR: Found Southwest Cargo rates for VT (should not exist!)')
      }

      const fedexRates = data3.rates.filter((r) => r.provider === 'fedex')
      console.log(`   🚚 FedEx: ${fedexRates.length} rates (should still work)`)
    }

    console.log('\n\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log('✅ API is responding')
    console.log('✅ Request format is correct')
    console.log('\nNext steps:')
    console.log('1. Check if Southwest Cargo rates are returning')
    console.log('2. Verify 82 airports in database')
    console.log('3. Check provider logs for errors')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error.stack)
  } finally {
    await browser.close()
  }
}

testShippingAPI().catch(console.error)
