import { ShippingCalculator } from '@/lib/shipping/shipping-calculator'

async function test() {
  console.log('🧪 Testing Southwest Cargo shipping for Chicago, IL (180 lbs)\n')

  const calculator = new ShippingCalculator()

  const fromAddress = {
    street: '1300 Basswood Road',
    city: 'Schaumburg',
    state: 'IL',
    zipCode: '60173',
    country: 'US',
  }

  const toAddress = {
    street: '2740 west 83rd pl',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60652',
    country: 'US',
  }

  const packages = [
    {
      weight: 180.0,
      length: 12,
      width: 12,
      height: 12,
    },
  ]

  console.log('From:', fromAddress.city, fromAddress.state)
  console.log('To:', toAddress.city, toAddress.state)
  console.log('Weight:', packages[0].weight, 'lbs\n')

  try {
    const rates = await calculator.getAllRates(fromAddress, toAddress, packages, false)

    console.log(`✅ Found ${rates.length} shipping rates:\n`)

    rates.forEach((rate) => {
      console.log(`${rate.carrier} - ${rate.serviceName}`)
      console.log(`  Price: $${rate.rateAmount.toFixed(2)}`)
      console.log(`  Delivery: ${rate.estimatedDays} days`)
      console.log(`  Guaranteed: ${rate.isGuaranteed ? 'Yes' : 'No'}`)
      if ((rate as any).isAirportDelivery) {
        console.log(`  ✈️  Airport Pickup Required`)
      }
      console.log('')
    })

    const southwestRates = rates.filter((r) => r.carrier === 'SOUTHWEST_CARGO')
    console.log(`\n📊 Southwest Cargo: ${southwestRates.length} options found`)

    if (southwestRates.length === 0) {
      console.error('❌ No Southwest Cargo rates found!')
      console.error('This might be why checkout is not showing Southwest Cargo options')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

test()
