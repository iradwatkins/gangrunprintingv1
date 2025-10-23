/**
 * Southwest Cargo Checkout Flow Test
 * Tests end-to-end shipping rate calculation
 */

import { SouthwestCargoProvider } from '../src/lib/shipping/modules/southwest-cargo/provider'
import type { ShippingAddress, ShippingPackage } from '../src/lib/shipping/interfaces'

const provider = new SouthwestCargoProvider()

interface TestCase {
  name: string
  weight: number
  state: string
  expectedPickup: number
  expectedDash: number
}

const testCases: TestCase[] = [
  // Light packages
  {
    name: 'Business Cards (10 lbs)',
    weight: 10,
    state: 'TX',
    expectedPickup: 80.0,
    expectedDash: 95.0,
  },
  {
    name: 'Flyers Bundle (50 lbs - boundary)',
    weight: 50,
    state: 'CA',
    expectedPickup: 80.0,
    expectedDash: 95.0,
  },
  // Medium packages
  {
    name: 'Large Order (51 lbs)',
    weight: 51,
    state: 'GA', // Changed from IL (not serviced) to GA (has airport)
    expectedPickup: 191.25,
    expectedDash: 143.0,
  },
  {
    name: 'Medium Bulk (75 lbs)',
    weight: 75,
    state: 'NY',
    expectedPickup: 233.25,
    expectedDash: 143.0,
  },
  {
    name: 'Heavy Order (100 lbs - boundary)',
    weight: 100,
    state: 'FL',
    expectedPickup: 277.0,
    expectedDash: 143.0,
  },
  // Heavy packages
  {
    name: 'Very Heavy (101 lbs)',
    weight: 101,
    state: 'AZ',
    expectedPickup: 278.75, // $102 + (101 × $1.75)
    expectedDash: 319.75, // $133 + $10 + (101 × $1.75)
  },
  {
    name: 'Extra Heavy (150 lbs)',
    weight: 150,
    state: 'NV',
    expectedPickup: 364.5, // $102 + (150 × $1.75)
    expectedDash: 405.5, // $133 + $10 + (150 × $1.75)
  },
]

async function runTests() {
  console.log('🚚 Southwest Cargo Checkout Flow Test\n')
  console.log('='.repeat(80))

  let passed = 0
  let failed = 0

  const fromAddress: ShippingAddress = {
    street: '123 Print St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    country: 'US',
    isResidential: false,
  }

  for (const test of testCases) {
    console.log(`\n📦 Test: ${test.name}`)
    console.log(`   Weight: ${test.weight} lbs | State: ${test.state}`)

    const toAddress: ShippingAddress = {
      street: '456 Customer Ave',
      city: 'Test City',
      state: test.state,
      zipCode: '10001',
      country: 'US',
      isResidential: true,
    }

    const packages: ShippingPackage[] = [
      {
        weight: test.weight,
        dimensions: {
          length: 12,
          width: 12,
          height: 6,
        },
      },
    ]

    try {
      const rates = await provider.getRates(fromAddress, toAddress, packages)

      if (rates.length === 0) {
        console.log('   ❌ No rates returned')
        failed++
        continue
      }

      const pickupRate = rates.find((r) => r.serviceCode === 'SOUTHWEST_CARGO_PICKUP')
      const dashRate = rates.find((r) => r.serviceCode === 'SOUTHWEST_CARGO_DASH')

      if (!pickupRate || !dashRate) {
        console.log('   ❌ Missing rate options')
        failed++
        continue
      }

      // Apply 5% markup from config
      const markup = 1.05
      const expectedPickupWithMarkup = test.expectedPickup * markup
      const expectedDashWithMarkup = test.expectedDash * markup

      const pickupMatch = Math.abs(pickupRate.rateAmount - expectedPickupWithMarkup) < 0.01
      const dashMatch = Math.abs(dashRate.rateAmount - expectedDashWithMarkup) < 0.01

      console.log(`\n   Pickup:`)
      console.log(
        `     Expected: $${expectedPickupWithMarkup.toFixed(2)} (base: $${test.expectedPickup.toFixed(2)} + 5% markup)`
      )
      console.log(`     Actual:   $${pickupRate.rateAmount.toFixed(2)}`)
      console.log(`     ${pickupMatch ? '✅ PASS' : '❌ FAIL'}`)

      console.log(`\n   Dash:`)
      console.log(
        `     Expected: $${expectedDashWithMarkup.toFixed(2)} (base: $${test.expectedDash.toFixed(2)} + 5% markup)`
      )
      console.log(`     Actual:   $${dashRate.rateAmount.toFixed(2)}`)
      console.log(`     ${dashMatch ? '✅ PASS' : '❌ FAIL'}`)

      if (pickupMatch && dashMatch) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Test Results:`)
  console.log(`   Passed: ${passed}/${testCases.length}`)
  console.log(`   Failed: ${failed}/${testCases.length}`)

  if (failed === 0) {
    console.log(`\n   ✅ All tests passed! Southwest Cargo is working correctly.`)
  } else {
    console.log(`\n   ⚠️  Some tests failed. Review the output above.`)
  }

  console.log()
}

runTests().catch(console.error)
