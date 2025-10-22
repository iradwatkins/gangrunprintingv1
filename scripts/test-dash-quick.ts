import { SOUTHWEST_CARGO_RATES } from '../src/lib/shipping/modules/southwest-cargo/config'

console.log('\n🧪 Quick DASH Calculation Test\n')

const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers

function calculateDashRate(weight: number): number {
  let previousTierMax = 0

  for (const tier of dashTiers) {
    if (weight <= tier.maxWeight) {
      if (tier.additionalPerPound === 0) {
        console.log(`  Tier match: ≤${tier.maxWeight} lbs → Flat rate $${tier.baseRate}`)
        return tier.baseRate + tier.handlingFee
      }

      const weightOverThreshold = weight - previousTierMax
      const additionalCost = weightOverThreshold * tier.additionalPerPound

      console.log(`  Tier match: >${previousTierMax} lbs`)
      console.log(`  Base rate: $${tier.baseRate}`)
      console.log(`  Weight over threshold: ${weight} - ${previousTierMax} = ${weightOverThreshold} lbs`)
      console.log(`  Additional cost: ${weightOverThreshold} × $${tier.additionalPerPound} = $${additionalCost.toFixed(2)}`)
      console.log(`  Total: $${tier.baseRate} + $${additionalCost.toFixed(2)} = $${(tier.baseRate + additionalCost).toFixed(2)}`)

      return tier.baseRate + additionalCost + tier.handlingFee
    }
    previousTierMax = tier.maxWeight
  }

  return 0
}

console.log('101 lbs:')
const rate101 = calculateDashRate(101)
console.log(`  Final: $${rate101.toFixed(2)}\n`)

console.log('150 lbs:')
const rate150 = calculateDashRate(150)
console.log(`  Final: $${rate150.toFixed(2)}\n`)
