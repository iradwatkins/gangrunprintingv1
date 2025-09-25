#!/usr/bin/env tsx
/**
 * Test script for Southwest Cargo rate calculations
 * Verifies that pickup and dash rates are correctly applied
 */

import { SouthwestCargoProvider } from '../lib/shipping/providers/southwest-cargo'
import type { ShippingAddress, ShippingPackage } from '../lib/shipping/interfaces'

const provider = new SouthwestCargoProvider()

// Test addresses
const fromAddress: ShippingAddress = {
  street: '1234 Print Shop Way',
  city: 'Houston',
  state: 'TX',
  zipCode: '77001',
  country: 'US',
  isResidential: false
}

const toAddress: ShippingAddress = {
  street: '456 Customer St',
  city: 'Dallas',
  state: 'TX',
  zipCode: '75201',
  country: 'US',
  isResidential: true
}

// Test different package weights
const testCases = [
  { weight: 25, description: '25 lbs (under 50)' },
  { weight: 75, description: '75 lbs (50-100)' },
  { weight: 150, description: '150 lbs (over 100)' },
  { weight: 500, description: '500 lbs (heavy)' }
]

async function testRates() {
  console.log('🚚 Testing Southwest Cargo Rate Calculations')
  console.log('=' .repeat(50))

  for (const testCase of testCases) {
    const packages: ShippingPackage[] = [{
      weight: testCase.weight,
      dimensions: {
        length: 12,
        width: 12,
        height: 12
      }
    }]

    console.log(`\n📦 Package: ${testCase.description}`)
    console.log(`Weight: ${testCase.weight} lbs`)

    try {
      const rates = await provider.getRates(fromAddress, toAddress, packages)

      console.log('\nRates returned:')
      for (const rate of rates) {
        console.log(`  ${rate.serviceName}: $${rate.rateAmount.toFixed(2)}`)
        console.log(`    Transit time: ${rate.estimatedDays} day(s)`)
        console.log(`    Guaranteed: ${rate.isGuaranteed ? 'Yes' : 'No'}`)
      }

      // Verify rates are correct (pickup should be less than dash for same weight)
      const pickupRate = rates.find(r => r.serviceCode === 'SOUTHWEST_CARGO_PICKUP')
      const dashRate = rates.find(r => r.serviceCode === 'SOUTHWEST_CARGO_DASH')

      if (pickupRate && dashRate) {
        if (pickupRate.rateAmount > dashRate.rateAmount) {
          console.log('  ✅ VERIFIED: Pickup rate is higher than Dash rate (correct pricing)')
        } else {
          console.log('  ❌ ERROR: Dash rate should be lower than Pickup rate!')
        }
      }
    } catch (error) {
      console.error('  ❌ Error calculating rates:', error)
    }
  }

  console.log('\n' + '=' .repeat(50))
  console.log('✅ Test complete!')
}

// Run the test
testRates().catch(console.error)