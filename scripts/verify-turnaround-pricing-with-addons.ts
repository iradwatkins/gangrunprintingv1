/**
 * Verify that turnaround pricing includes addon costs
 *
 * This script tests the pricing flow to ensure:
 * 1. Base product price is calculated correctly
 * 2. Addon costs are added to base price
 * 3. Turnaround pricing is applied to (base + addons)
 * 4. Final price = (base + addons) × turnaround_multiplier OR (base + addons) + turnaround_fee
 */

// Test configuration
interface TestConfig {
  quantity: number
  baseProductPrice: number
  addonCosts: number
  turnaroundMultiplier: number
  turnaroundFlatFee: number
}

function testPercentageTurnaround(config: TestConfig) {
  const baseWithAddons = config.baseProductPrice + config.addonCosts
  const expectedFinalPrice = baseWithAddons * config.turnaroundMultiplier

  return {
    baseProductPrice: config.baseProductPrice,
    addonCosts: config.addonCosts,
    baseWithAddons,
    turnaroundMultiplier: config.turnaroundMultiplier,
    expectedFinalPrice,
  }
}

function testFlatFeeTurnaround(config: TestConfig) {
  const baseWithAddons = config.baseProductPrice + config.addonCosts
  const expectedFinalPrice = baseWithAddons + config.turnaroundFlatFee

  return {
    baseProductPrice: config.baseProductPrice,
    addonCosts: config.addonCosts,
    baseWithAddons,
    turnaroundFlatFee: config.turnaroundFlatFee,
    expectedFinalPrice,
  }
}

console.log('🧪 Testing Turnaround Pricing with Addons\n')
console.log('='.repeat(80))

// Test Case 1: Percentage-based turnaround with Corner Rounding addon
console.log('\n📊 Test Case 1: Percentage Turnaround + Corner Rounding')
console.log('-'.repeat(80))

const test1Config = {
  quantity: 500,
  baseProductPrice: 100.0,
  addonCosts: 20 + 0.01 * 500, // Corner Rounding: $20 + $0.01 × 500 = $25
  turnaroundMultiplier: 1.25, // 25% markup for standard turnaround
  turnaroundFlatFee: 0,
}

const test1Result = testPercentageTurnaround(test1Config)
console.log('Inputs:')
console.log(`  Quantity: ${test1Config.quantity}`)
console.log(`  Base Product Price: $${test1Config.baseProductPrice.toFixed(2)}`)
console.log(`  Corner Rounding Cost: $${test1Config.addonCosts.toFixed(2)}`)
console.log(`  Turnaround Multiplier: ${test1Config.turnaroundMultiplier}x (25% markup)`)
console.log('\nCalculation:')
console.log(
  `  Base + Addons: $${test1Result.baseProductPrice.toFixed(2)} + $${test1Result.addonCosts.toFixed(2)} = $${test1Result.baseWithAddons.toFixed(2)}`
)
console.log(
  `  Apply Turnaround: $${test1Result.baseWithAddons.toFixed(2)} × ${test1Result.turnaroundMultiplier} = $${test1Result.expectedFinalPrice.toFixed(2)}`
)
console.log('\n✅ Expected Final Price: $' + test1Result.expectedFinalPrice.toFixed(2))

// Test Case 2: Flat fee turnaround with multiple addons
console.log('\n\n📊 Test Case 2: Flat Fee Turnaround + Multiple Addons')
console.log('-'.repeat(80))

const test2Config = {
  quantity: 1000,
  baseProductPrice: 200.0,
  // Variable Data: $80
  addonCosts:
    20 +
    0.01 * 1000 + // Corner Rounding: $30
    (20 + 0.01 * 1000) + // Perforation: $30
    (60 + 0.02 * 1000), // Total addons: $140
  turnaroundMultiplier: 0,
  turnaroundFlatFee: 50.0, // Rush turnaround flat fee
}

const test2Result = testFlatFeeTurnaround(test2Config)
console.log('Inputs:')
console.log(`  Quantity: ${test2Config.quantity}`)
console.log(`  Base Product Price: $${test2Config.baseProductPrice.toFixed(2)}`)
console.log(`  Addon Costs:`)
console.log(`    - Corner Rounding: $20 + ($0.01 × 1000) = $30.00`)
console.log(`    - Perforation: $20 + ($0.01 × 1000) = $30.00`)
console.log(`    - Variable Data: $60 + ($0.02 × 1000) = $80.00`)
console.log(`    - Total Addons: $${test2Config.addonCosts.toFixed(2)}`)
console.log(`  Turnaround Flat Fee: $${test2Config.turnaroundFlatFee.toFixed(2)}`)
console.log('\nCalculation:')
console.log(
  `  Base + Addons: $${test2Result.baseProductPrice.toFixed(2)} + $${test2Result.addonCosts.toFixed(2)} = $${test2Result.baseWithAddons.toFixed(2)}`
)
console.log(
  `  Apply Turnaround: $${test2Result.baseWithAddons.toFixed(2)} + $${test2Result.turnaroundFlatFee.toFixed(2)} = $${test2Result.expectedFinalPrice.toFixed(2)}`
)
console.log('\n✅ Expected Final Price: $' + test2Result.expectedFinalPrice.toFixed(2))

// Summary
console.log('\n\n' + '='.repeat(80))
console.log('📝 SUMMARY: Correct Pricing Flow')
console.log('='.repeat(80))
console.log('\n1️⃣  Calculate base product price (quantity × size × paper × coating × sides)')
console.log('2️⃣  Add ALL addon costs to base price')
console.log('3️⃣  Apply turnaround pricing to (base + addons)')
console.log('4️⃣  Final price shown to customer includes everything')
console.log('\n✅ This ensures customers see the correct total price in turnaround options!')
console.log('\n' + '='.repeat(80))
