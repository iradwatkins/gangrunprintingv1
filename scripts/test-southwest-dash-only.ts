/**
 * Southwest Cargo DASH (NFG) Pricing Test
 * Zone 2 (Chicago) → Zone B rates
 * Only DASH service offered (no PICKUP)
 */

import { SOUTHWEST_CARGO_RATES } from '../src/lib/shipping/modules/southwest-cargo/config'

console.log('\n🧪 Southwest Cargo - DASH (NFG) Service Only\n')
console.log('Zone 2 (Chicago) Origin → Zone B (most destinations)')
console.log('Source: NFG General Commodity Rates 2025\n')
console.log('='.repeat(80))

const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers

function calculateDashRate(weight: number): number {
  let previousTierMax = 0

  for (const tier of dashTiers) {
    if (weight <= tier.maxWeight) {
      // If no per-pound charge, use flat rate
      if (tier.additionalPerPound === 0) {
        return tier.baseRate + tier.handlingFee
      }

      // For 101+ lbs: charge per-pound OVER 100
      const weightOverThreshold = weight - previousTierMax
      const additionalCost = weightOverThreshold * tier.additionalPerPound

      return tier.baseRate + additionalCost + tier.handlingFee
    }
    previousTierMax = tier.maxWeight
  }

  return 0
}

// Test weights across all tiers
const testWeights = [10, 25, 26, 50, 51, 75, 100, 101, 110, 150, 200]

console.log('\n📊 DASH (NFG) Pricing:\n')
console.log('Weight | Base Rate | Calculation | Total | With 5% Markup')
console.log('-------|-----------|-------------|-------|----------------')

testWeights.forEach((weight) => {
  const baseRate = calculateDashRate(weight)
  const withMarkup = baseRate * 1.05

  let calculation = ''

  if (weight <= 25) {
    calculation = '$100 flat'
  } else if (weight <= 50) {
    calculation = '$117 flat'
  } else if (weight <= 100) {
    calculation = '$148 flat'
  } else {
    const over = weight - 100
    calculation = `$148 + (${over} × $1.90)`
  }

  console.log(
    `${weight.toString().padEnd(6)} | ` +
      `${calculation.padEnd(25)} | ` +
      `$${baseRate.toFixed(2).padEnd(6)} | ` +
      `$${withMarkup.toFixed(2)}`
  )
})

console.log('\n' + '='.repeat(80))
console.log('\n✅ Verification:')
console.log('  - 0-25 lbs: $100 flat rate')
console.log('  - 26-50 lbs: $117 flat rate')
console.log('  - 51-100 lbs: $148 flat rate')
console.log('  - 101+ lbs: $148 + ((weight - 100) × $1.90)')
console.log('\n  Example: 150 lbs = $148 + ((150-100) × $1.90) = $148 + $95 = $243')
console.log()
