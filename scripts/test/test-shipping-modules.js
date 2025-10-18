#!/usr/bin/env node

/**
 * Test Shipping Modules
 * Tests both FedEx and Southwest Cargo shipping providers
 */

const API_BASE = 'http://localhost:3020'

// Test scenarios
const testCases = [
  {
    name: 'Business Cards to Texas (Southwest Cargo Territory)',
    destination: {
      zipCode: '75201',
      state: 'TX',
      city: 'Dallas',
      isResidential: false,
    },
    package: {
      weight: 5, // 5 lbs
      dimensions: {
        length: 12,
        width: 9,
        height: 2,
      },
    },
    providers: ['fedex', 'southwest-cargo'], // Test both
  },
  {
    name: 'Flyers to California (Southwest Cargo Territory)',
    destination: {
      zipCode: '90001',
      state: 'CA',
      city: 'Los Angeles',
      isResidential: true,
    },
    package: {
      weight: 25, // 25 lbs
      dimensions: {
        length: 18,
        width: 12,
        height: 4,
      },
    },
    providers: ['fedex', 'southwest-cargo'],
  },
  {
    name: 'Heavy Package to New York (FedEx Only - Outside Southwest)',
    destination: {
      zipCode: '10001',
      state: 'NY',
      city: 'New York',
      isResidential: false,
    },
    package: {
      weight: 75, // 75 lbs
      dimensions: {
        length: 24,
        width: 18,
        height: 12,
      },
    },
    providers: ['fedex', 'southwest-cargo'], // Request both, but only FedEx should return
  },
  {
    name: 'Lightweight to Illinois (Local)',
    destination: {
      zipCode: '60601',
      state: 'IL',
      city: 'Chicago',
      isResidential: true,
    },
    package: {
      weight: 2, // 2 lbs
      dimensions: {
        length: 12,
        width: 9,
        height: 1,
      },
    },
  },
]

async function testShippingRates() {
  console.log('🚚 Testing Modular Shipping System\n')
  console.log('=' .repeat(80))

  for (const testCase of testCases) {
    console.log(`\n📦 Test: ${testCase.name}`)
    console.log('-'.repeat(80))
    console.log(`   Destination: ${testCase.destination.city}, ${testCase.destination.state} ${testCase.destination.zipCode}`)
    console.log(`   Weight: ${testCase.package.weight} lbs`)
    console.log(`   Dimensions: ${testCase.package.dimensions.length}x${testCase.package.dimensions.width}x${testCase.package.dimensions.height} in`)
    if (testCase.providers) {
      console.log(`   Requested Providers: ${testCase.providers.join(', ')}`)
    }

    try {
      const response = await fetch(`${API_BASE}/api/shipping/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      })

      if (!response.ok) {
        const error = await response.json()
        console.log(`   ❌ Error: ${error.message}`)
        continue
      }

      const data = await response.json()

      console.log(`\n   ✅ Received ${data.rates.length} rates:`)

      if (data.metadata) {
        console.log(`\n   📊 Metadata:`)
        console.log(`      Modules Used: ${data.metadata.modulesUsed?.join(', ') || 'N/A'}`)
        console.log(`      Total Weight: ${data.metadata.totalWeight} lbs`)

        if (data.metadata.moduleStatus) {
          console.log(`\n      Module Status:`)
          Object.entries(data.metadata.moduleStatus).forEach(([id, status]) => {
            console.log(`         ${id}: ${status.enabled ? '✅ Enabled' : '❌ Disabled'} (Priority: ${status.priority}${status.testMode ? ', Test Mode' : ''})`)
          })
        }

        if (data.metadata.errors) {
          console.log(`\n      ⚠️  Errors:`)
          Object.entries(data.metadata.errors).forEach(([id, error]) => {
            console.log(`         ${id}: ${error}`)
          })
        }
      }

      // Group rates by provider
      const ratesByProvider = data.rates.reduce((acc, rate) => {
        if (!acc[rate.provider]) {
          acc[rate.provider] = []
        }
        acc[rate.provider].push(rate)
        return acc
      }, {})

      Object.entries(ratesByProvider).forEach(([provider, rates]) => {
        console.log(`\n   📫 ${provider.toUpperCase()} (${rates.length} options):`)
        rates.forEach((rate) => {
          console.log(
            `      • ${rate.providerName.padEnd(40)} $${rate.rate.amount.toFixed(2).padStart(8)}  (${rate.delivery.text}${rate.delivery.guaranteed ? ' - Guaranteed' : ''})`
          )
        })
      })
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Shipping Module Tests Complete\n')
}

// Run tests
testShippingRates().catch(console.error)
