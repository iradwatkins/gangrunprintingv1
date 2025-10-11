const { PrismaClient, Carrier } = require('@prisma/client')

const prisma = new PrismaClient()

// Test addresses
const fromAddress = {
  street: '1300 Basswood Road',
  city: 'Schaumburg',
  state: 'IL',
  zipCode: '60173',
  country: 'US',
  isResidential: false,
}

const toAddressDallas = {
  street: '123 Main St',
  city: 'Dallas',
  state: 'TX',
  zipCode: '75201',
  country: 'US',
  isResidential: false,
}

const toAddressNY = {
  street: '456 Broadway',
  city: 'New York',
  state: 'NY',
  zipCode: '10013',
  country: 'US',
  isResidential: false,
}

// Southwest Cargo rate calculation (matching the provider logic)
const SOUTHWEST_CARGO_RATES = {
  pickup: {
    weightTiers: [
      { maxWeight: 50, baseRate: 85.0, additionalPerPound: 0, handlingFee: 10.0 },
      { maxWeight: 100, baseRate: 133.0, additionalPerPound: 0, handlingFee: 10.0 },
      { maxWeight: Infinity, baseRate: 133.0, additionalPerPound: 1.75, handlingFee: 10.0 },
    ],
  },
  dash: {
    weightTiers: [
      { maxWeight: 50, baseRate: 80.0, additionalPerPound: 1.75, handlingFee: 0 },
      { maxWeight: Infinity, baseRate: 102.0, additionalPerPound: 1.75, handlingFee: 0 },
    ],
  },
}

const SOUTHWEST_SERVICE_AREA = [
  'TX',
  'OK',
  'NM',
  'AR',
  'LA',
  'AZ',
  'CA',
  'NV',
  'CO',
  'UT',
  'FL',
  'GA',
  'AL',
  'TN',
  'MS',
  'SC',
  'NC',
  'KY',
  'MO',
  'KS',
]

function isServiceAvailable(state) {
  return SOUTHWEST_SERVICE_AREA.includes(state.toUpperCase())
}

function calculatePickupRate(weight) {
  const pickupTiers = SOUTHWEST_CARGO_RATES.pickup.weightTiers

  for (const tier of pickupTiers) {
    if (weight <= tier.maxWeight) {
      const additionalCost = weight * tier.additionalPerPound
      return tier.baseRate + additionalCost + tier.handlingFee
    }
  }

  const lastTier = pickupTiers[pickupTiers.length - 1]
  const additionalCost = weight * lastTier.additionalPerPound
  return lastTier.baseRate + additionalCost + lastTier.handlingFee
}

function calculateDashRate(weight) {
  const dashTiers = SOUTHWEST_CARGO_RATES.dash.weightTiers

  for (let i = 0; i < dashTiers.length; i++) {
    const tier = dashTiers[i]

    if (weight <= tier.maxWeight) {
      let additionalCost = 0

      if (tier.additionalPerPound > 0 && i === dashTiers.length - 1 && weight > 100) {
        const overageWeight = weight - 100
        additionalCost = overageWeight * tier.additionalPerPound
      }

      return tier.baseRate + additionalCost + tier.handlingFee
    }
  }

  const lastTier = dashTiers[dashTiers.length - 1]
  const overageWeight = Math.max(0, weight - 100)
  const additionalCost = overageWeight * lastTier.additionalPerPound
  return lastTier.baseRate + additionalCost + lastTier.handlingFee
}

async function testSouthwestCargo() {
  console.log('🚀 Testing Southwest Cargo Shipping Rates\n')
  console.log('═'.repeat(80))

  const weights = [10, 25, 50, 75, 100, 150, 200]
  const markup = 1.05 // 5% markup

  for (const weight of weights) {
    console.log(`\n📦 Weight: ${weight} lbs`)
    console.log('─'.repeat(80))

    // Dallas, TX (in service area)
    console.log(`\n📍 To: Dallas, TX (In Service Area)`)
    if (isServiceAvailable('TX')) {
      const pickupRate = calculatePickupRate(weight)
      const dashRate = calculateDashRate(weight)

      console.log(`  ✈️  Southwest Cargo Pickup: $${(pickupRate * markup).toFixed(2)} (3 days)`)
      console.log(`  ⚡ Southwest Cargo Dash:   $${(dashRate * markup).toFixed(2)} (1 day)`)
    } else {
      console.log('  ❌ Not available in this area')
    }

    // New York, NY (NOT in service area)
    console.log(`\n📍 To: New York, NY (Outside Service Area)`)
    if (isServiceAvailable('NY')) {
      const pickupRate = calculatePickupRate(weight)
      const dashRate = calculateDashRate(weight)

      console.log(`  ✈️  Southwest Cargo Pickup: $${(pickupRate * markup).toFixed(2)} (3 days)`)
      console.log(`  ⚡ Southwest Cargo Dash:   $${(dashRate * markup).toFixed(2)} (1 day)`)
    } else {
      console.log('  ❌ Not available in this area')
    }
  }

  console.log('\n' + '═'.repeat(80))
  console.log('\n✅ Southwest Cargo Shipping Test Complete!')
  console.log('\n📋 Service Area States:')
  console.log(SOUTHWEST_SERVICE_AREA.join(', '))

  await prisma.$disconnect()
}

testSouthwestCargo().catch(console.error)
