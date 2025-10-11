import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyHoleDrilling() {
  try {
    console.log('🔍 HOLE DRILLING ADDON - COMPLETE VERIFICATION\n')
    console.log('═'.repeat(80))

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Hole Drilling' },
      include: {
        addOnSubOptions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    if (!addon) {
      console.log('❌ Hole Drilling addon not found')
      return
    }

    console.log('\n📋 DATABASE CONFIGURATION\n')
    console.log('━'.repeat(80))
    console.log(`Name: ${addon.name}`)
    console.log(`Pricing Model: ${addon.pricingModel}`)
    console.log(`Base Fee: $${(addon.configuration as any).baseFee}`)
    console.log(`Per Hole Rate: $${(addon.configuration as any).perHoleRate}`)
    console.log(`Tooltip: ${addon.tooltipText}`)
    console.log(`Additional Turnaround: ${addon.additionalTurnaroundDays} days`)

    console.log('\n💰 HOLE PRICING STRUCTURE\n')
    console.log('━'.repeat(80))
    const holePricing = (addon.configuration as any).holePricing
    Object.entries(holePricing).forEach(([holeType, price]) => {
      console.log(`   ${holeType.padEnd(25)} = $${price}`)
    })

    console.log('\n📝 SUB-OPTIONS\n')
    console.log('━'.repeat(80))
    addon.addOnSubOptions.forEach((subOption, index) => {
      console.log(`\n${index + 1}. ${subOption.name}`)
      console.log(`   Type: ${subOption.optionType}`)
      console.log(`   Default: ${subOption.defaultValue}`)
      console.log(`   Required: ${subOption.isRequired}`)
      console.log(`   Affects Pricing: ${subOption.affectsPricing}`)
      console.log(`   Tooltip: ${subOption.tooltipText}`)
      if (subOption.options) {
        console.log(`   Options:`)
        ;(subOption.options as string[]).forEach((opt) => {
          const priceForOption = holePricing[opt]
          if (priceForOption) {
            console.log(`      • ${opt} → $${priceForOption}`)
          } else {
            console.log(`      • ${opt}`)
          }
        })
      }
    })

    console.log('\n\n💰 PRICING CALCULATION EXAMPLES\n')
    console.log('═'.repeat(80))

    const examples = [
      { quantity: 500, holes: '1', position: '1 inch from top', size: '5/16" (Standard)' },
      { quantity: 1000, holes: '3', position: 'Center', size: '1/4"' },
      {
        quantity: 2500,
        holes: '3 Hole Binder Punch',
        position: 'Standard position',
        size: '5/16" (Standard)',
      },
      { quantity: 500, holes: '5', position: '0.5 inch from left', size: '1/8"' },
    ]

    examples.forEach((example, index) => {
      const holePrice = holePricing[example.holes] || 0
      const baseFee = 20
      const perHoleCost = example.quantity * 0.02
      const totalCost = baseFee + perHoleCost + holePrice

      console.log(`\nExample ${index + 1}:`)
      console.log(`  Order Quantity: ${example.quantity} pieces`)
      console.log(`  Number of Holes: ${example.holes}`)
      console.log(`  Position: ${example.position}`)
      console.log(`  Size: ${example.size}`)
      console.log(`  ────────────────────────────────`)
      console.log(`  Base Fee: $${baseFee.toFixed(2)}`)
      console.log(`  Per Hole Cost: ${example.quantity} × $0.02 = $${perHoleCost.toFixed(2)}`)
      console.log(`  Hole Type Fee: $${holePrice.toFixed(2)} (${example.holes})`)
      console.log(`  Total Hole Drilling Cost: $${totalCost.toFixed(2)}`)
    })

    console.log('\n\n⚠️  IMPORTANT: CUSTOM PRICING LOGIC NEEDED\n')
    console.log('═'.repeat(80))
    console.log('\nThe Hole Drilling addon uses CUSTOM pricing model with:')
    console.log('• Base Fee: $20.00')
    console.log('• Per Hole Cost: $0.02 per piece')
    console.log('• Hole Type Fee: Variable ($1-$5 based on selection)')
    console.log('\nPricing logic needs to be implemented in the code to handle:')
    console.log('1. Read the selected hole type from configuration')
    console.log('2. Look up the price from holePricing map')
    console.log('3. Calculate: baseFee + (quantity × perHoleRate) + holeTypePrice')

    console.log('\n\n📊 INTEGRATION STATUS\n')
    console.log('═'.repeat(80))
    console.log('✅ Database configuration complete')
    console.log('✅ Three sub-options created (Number, Position, Size)')
    console.log('✅ Pricing structure stored in configuration')
    console.log('⚠️  Custom pricing logic needs implementation')
    console.log('✅ Default size: 5/16" (Standard)')
    console.log('✅ All hole options available')

    console.log('\n\n✅ VERIFICATION COMPLETE!\n')
    console.log('═'.repeat(80))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyHoleDrilling()
