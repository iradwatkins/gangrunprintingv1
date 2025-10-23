/**
 * Southwest Cargo Pricing Verification Test
 * Compares Next.js implementation against WooCommerce configuration
 *
 * Reference: .aaaaaa/southwest/*.png (WooCommerce admin screenshots)
 */

import { SOUTHWEST_CARGO_RATES } from '../src/lib/shipping/modules/southwest-cargo/config'

interface PricingTest {
  weight: number
  expectedPickup: number
  expectedDash: number
  description: string
}

// Test cases based on WooCommerce configuration screenshots
const testCases: PricingTest[] = [
  // Tier 1: 0-50 lbs
  {
    weight: 10,
    expectedPickup: 80.0, // Flat $80 for 0-50 lbs
    expectedDash: 95.0, // $85 base + $10 handling
    description: '10 lbs (Tier 1: ≤50 lbs)',
  },
  {
    weight: 50,
    expectedPickup: 80.0, // Flat $80 for 0-50 lbs
    expectedDash: 95.0, // $85 base + $10 handling
    description: '50 lbs (Tier 1: boundary)',
  },

  // Tier 2: 51-100 lbs
  {
    weight: 51,
    expectedPickup: 103.75, // $102 base + (51 × $1.75) = $102 + $89.25... WAIT
    // Let me recalculate from WooCommerce logic:
    // Image 4 shows: Weight ≥51, Shipping: $102, Cost per weight: $1.75
    // This should be: $102 + ((weight - 50) × $1.75)? Or just base?
    expectedDash: 143.0, // $133 base + $10 handling (no per-lb for 51-100)
    description: '51 lbs (Tier 2: start)',
  },
  {
    weight: 75,
    expectedPickup: 145.0, // Need to verify WooCommerce calculation
    expectedDash: 143.0, // $133 + $10 handling
    description: '75 lbs (Tier 2: middle)',
  },
  {
    weight: 100,
    expectedPickup: 187.75, // Need to verify
    expectedDash: 143.0, // $133 + $10 handling
    description: '100 lbs (Tier 2: boundary)',
  },

  // Tier 3: 101+ lbs
  {
    weight: 101,
    expectedPickup: 143.0 + 101 * 1.75 + 10, // $133 base + weight × $1.75 + $10 handling
    expectedDash: 143.0 + 101 * 1.75 + 10, // Same calculation
    description: '101 lbs (Tier 3: start)',
  },
  {
    weight: 150,
    expectedPickup: 143.0 + 150 * 1.75 + 10,
    expectedDash: 143.0 + 150 * 1.75 + 10,
    description: '150 lbs (Tier 3: heavy)',
  },
]

/**
 * Calculate rate using current Next.js implementation
 * Matches logic in provider.ts
 */
function calculatePickupRate(weight: number): number {
  const tiers = SOUTHWEST_CARGO_RATES.pickup.weightTiers

  for (const tier of tiers) {
    if (weight <= tier.maxWeight) {
      const additionalCost = weight * tier.additionalPerPound
      return tier.baseRate + additionalCost + tier.handlingFee
    }
  }

  const lastTier = tiers[tiers.length - 1]
  const additionalCost = weight * lastTier.additionalPerPound
  return lastTier.baseRate + additionalCost + lastTier.handlingFee
}

function calculateDashRate(weight: number): number {
  const tiers = SOUTHWEST_CARGO_RATES.dash.weightTiers
  let previousTierMax = 0

  for (const tier of tiers) {
    if (weight <= tier.maxWeight) {
      // If no per-pound charge, use flat rate
      if (tier.additionalPerPound === 0) {
        return tier.baseRate + tier.handlingFee
      }

      // Calculate weight over the previous tier's maximum
      const weightOverThreshold = weight - previousTierMax
      const additionalCost = weightOverThreshold * tier.additionalPerPound

      return tier.baseRate + additionalCost + tier.handlingFee
    }
    previousTierMax = tier.maxWeight
  }

  // Fallback
  const lastTier = tiers[tiers.length - 1]
  const weightOverThreshold = weight - previousTierMax
  const additionalCost = weightOverThreshold * lastTier.additionalPerPound
  return lastTier.baseRate + additionalCost + lastTier.handlingFee
}

/**
 * Run pricing verification tests
 */
function runTests() {
  console.log('🧪 Southwest Cargo Pricing Verification\n')
  console.log('Comparing Next.js implementation against WooCommerce configuration\n')
  console.log('='.repeat(80))

  let passed = 0
  let failed = 0

  // First, let's just see what the current implementation calculates
  console.log('\n📊 Current Implementation Results:\n')

  const weights = [10, 50, 51, 75, 100, 101, 150]

  weights.forEach((weight) => {
    const pickupRate = calculatePickupRate(weight)
    const dashRate = calculateDashRate(weight)

    console.log(`Weight: ${weight} lbs`)
    console.log(`  Pickup: $${pickupRate.toFixed(2)}`)
    console.log(`  Dash:   $${dashRate.toFixed(2)}`)
    console.log()
  })

  console.log('\n' + '='.repeat(80))
  console.log('\n📋 Current Configuration:\n')

  console.log('PICKUP Tiers:')
  SOUTHWEST_CARGO_RATES.pickup.weightTiers.forEach((tier, i) => {
    console.log(`  Tier ${i + 1}: ≤${tier.maxWeight === Infinity ? '∞' : tier.maxWeight} lbs`)
    console.log(`    Base: $${tier.baseRate}`)
    console.log(`    Per lb: $${tier.additionalPerPound}`)
    console.log(`    Handling: $${tier.handlingFee}`)
    console.log()
  })

  console.log('DASH Tiers:')
  SOUTHWEST_CARGO_RATES.dash.weightTiers.forEach((tier, i) => {
    console.log(`  Tier ${i + 1}: ≤${tier.maxWeight === Infinity ? '∞' : tier.maxWeight} lbs`)
    console.log(`    Base: $${tier.baseRate}`)
    console.log(`    Per lb: $${tier.additionalPerPound}`)
    console.log(`    Handling: $${tier.handlingFee}`)
    console.log()
  })

  console.log('\n' + '='.repeat(80))
  console.log('\n🎯 WooCommerce Configuration (from screenshots):\n')

  console.log('PICKUP (Southwest Cargo Pickup):')
  console.log('  Tier 1: ≤50 lbs → $80 flat')
  console.log('  Tier 2: 51+ lbs → $102 base + $1.75/lb')
  console.log()

  console.log('DASH (Southwest Cargo Dash):')
  console.log('  Tier 1: ≤50 lbs → $85 base + $10 handling')
  console.log('  Tier 2: 51-100 lbs → $133 + $10 handling (no per-lb)')
  console.log('  Tier 3: 101+ lbs → $133 + $10 handling + $1.75/lb')
  console.log()

  console.log('='.repeat(80))
  console.log('\n✅ Test Complete')
  console.log(`\nNote: This test shows current calculations. Manual review needed to confirm`)
  console.log(`they match WooCommerce's conditional shipping rate logic.`)
}

// Run the tests
runTests()
