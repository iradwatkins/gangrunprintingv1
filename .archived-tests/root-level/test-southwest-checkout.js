/**
 * Test Southwest Cargo shipping rates at checkout
 * Tests 4 different addresses to verify service area restrictions
 */

const testAddresses = [
  {
    name: 'Test 1: Dallas, TX (SHOULD show Southwest)',
    address: {
      street: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'US',
      isResidential: true,
    },
  },
  {
    name: 'Test 2: Los Angeles, CA (SHOULD show Southwest)',
    address: {
      street: '456 Hollywood Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'US',
      isResidential: false,
    },
  },
  {
    name: 'Test 3: New York, NY (should NOT show Southwest)',
    address: {
      street: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      isResidential: true,
    },
  },
  {
    name: 'Test 4: Miami, FL (SHOULD show Southwest)',
    address: {
      street: '321 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'US',
      isResidential: false,
    },
  },
]

const testItems = [
  {
    productId: 'test-product',
    quantity: 100,
    width: 3.5,
    height: 2.0,
    paperStockWeight: 0.0009, // 60lb offset
  },
]

async function testShippingRates(testCase) {
  console.log('\n' + '='.repeat(80))
  console.log(`🧪 ${testCase.name}`)
  console.log('='.repeat(80))
  console.log('📍 Address:', JSON.stringify(testCase.address, null, 2))

  try {
    const response = await fetch('http://localhost:3002/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toAddress: testCase.address,
        items: testItems,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API Error:', data.error)
      console.error('   Details:', data.details)
      return
    }

    console.log('\n📊 Results:')
    console.log('   Success:', data.success)
    console.log('   Total Weight:', data.totalWeight, 'lbs')
    console.log('   Number of Boxes:', data.numBoxes)
    console.log('   Total Rates Returned:', data.rates?.length || 0)

    if (data.rates && data.rates.length > 0) {
      console.log('\n📦 Available Shipping Options:')
      data.rates.forEach((rate, index) => {
        console.log(
          `   ${index + 1}. ${rate.carrier} - ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`
        )
      })

      // Check for Southwest Cargo
      const southwestRates = data.rates.filter((r) => r.carrier === 'SOUTHWEST_CARGO')
      if (southwestRates.length > 0) {
        console.log('\n✅ Southwest Cargo FOUND:', southwestRates.length, 'options')
        southwestRates.forEach((rate) => {
          console.log(`   - ${rate.serviceName}: $${rate.rateAmount.toFixed(2)}`)
        })
      } else {
        console.log('\n⚠️  Southwest Cargo NOT FOUND (may be expected for this state)')
      }

      // Check for FedEx
      const fedexRates = data.rates.filter((r) => r.carrier === 'FEDEX')
      console.log('\n📬 FedEx rates:', fedexRates.length, 'options')
    } else {
      console.log('\n❌ NO RATES RETURNED')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

async function runAllTests() {
  console.log('\n🚀 STARTING SOUTHWEST CARGO CHECKOUT TESTS')
  console.log('Testing 4 different addresses to verify service area logic\n')

  for (const testCase of testAddresses) {
    await testShippingRates(testCase)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second between tests
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ ALL TESTS COMPLETED')
  console.log('='.repeat(80))
  console.log('\nExpected Results:')
  console.log('  - Test 1 (TX): Southwest Cargo should appear ✅')
  console.log('  - Test 2 (CA): Southwest Cargo should appear ✅')
  console.log('  - Test 3 (NY): Southwest Cargo should NOT appear ❌')
  console.log('  - Test 4 (FL): Southwest Cargo should appear ✅')
  console.log('\n')
}

runAllTests().catch(console.error)
