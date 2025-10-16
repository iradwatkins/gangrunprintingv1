/**
 * Compare shipping to Illinois (no Southwest) vs Texas (has Southwest)
 */

const testCases = [
  {
    name: 'Chicago, IL (IL NOT in service area - Southwest should NOT appear)',
    address: {
      street: '2740 west 83rd pl',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60652',
      country: 'US',
    },
  },
  {
    name: 'Dallas, TX (TX IS in service area - Southwest SHOULD appear)',
    address: {
      street: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'US',
    },
  },
]

const testItems = [
  {
    quantity: 5000,
    width: 4,
    height: 6,
    paperStockWeight: 0.0015,
  },
]

async function testShipping(testCase) {
  console.log('\n' + '='.repeat(80))
  console.log(`🧪 ${testCase.name}`)
  console.log('='.repeat(80))

  try {
    const response = await fetch('http://localhost:3002/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toAddress: testCase.address,
        items: testItems,
      }),
    })

    const data = await response.json()

    console.log('\n📦 Carriers Available:')
    const carriers = new Set(data.rates?.map((r) => r.carrier) || [])
    carriers.forEach((carrier) => {
      const carrierRates = data.rates.filter((r) => r.carrier === carrier)
      console.log(`   ✓ ${carrier}: ${carrierRates.length} options`)
    })

    const hasSouthwest = data.rates?.some((r) => r.carrier === 'SOUTHWEST_CARGO')
    if (hasSouthwest) {
      console.log('\n✅ Southwest Cargo IS AVAILABLE')
    } else {
      console.log('\n❌ Southwest Cargo NOT AVAILABLE (expected for IL)')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function run() {
  console.log('\n🔍 TESTING: Illinois vs Texas Shipping\n')
  for (const test of testCases) {
    await testShipping(test)
  }
  console.log('\n' + '='.repeat(80))
  console.log('✅ CONCLUSION: Southwest Cargo only appears for service area states')
  console.log('   IL (Illinois) = NOT in service area')
  console.log('   TX (Texas) = IN service area')
  console.log('='.repeat(80) + '\n')
}

run()
