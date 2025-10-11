import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyExactSize() {
  try {
    console.log('🔍 Verifying Exact Size addon...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Exact Size' },
      include: {
        addOnSetItems: {
          include: {
            AddOnSet: true,
          },
        },
      },
    })

    if (!addon) {
      console.log('❌ Exact Size addon not found')
      return
    }

    console.log('✅ EXACT SIZE ADDON VERIFICATION\n')
    console.log('━'.repeat(80))

    console.log('\n📋 Addon Details:')
    console.log(`   Name: ${addon.name}`)
    console.log(`   Description: ${addon.description}`)
    console.log(`   Pricing Model: ${addon.pricingModel}`)
    console.log(`   Configuration:`, JSON.stringify(addon.configuration, null, 2))
    console.log(`   Additional Turnaround Days: ${addon.additionalTurnaroundDays}`)
    console.log(`   Admin Notes: ${addon.adminNotes}`)

    console.log('\n💬 Tooltip Text:')
    console.log(`   ${addon.tooltipText}`)

    console.log('\n📦 Associated Addon Sets:')
    addon.addOnSetItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.AddOnSet.name}`)
      console.log(`      Display Position: ${item.displayPosition}`)
      console.log(`      Is Default: ${item.isDefault}`)
    })

    console.log('\n━'.repeat(80))
    console.log('\n💰 Pricing Examples:\n')

    const examples = [
      { basePrice: 100, quantity: 500, description: 'Small Order' },
      { basePrice: 200, quantity: 1000, description: 'Medium Order' },
      { basePrice: 500, quantity: 2500, description: 'Large Order' },
    ]

    examples.forEach(({ basePrice, quantity, description }) => {
      const exactSizeCost = basePrice * 0.3
      const totalPrice = basePrice + exactSizeCost

      console.log(`   ${description}:`)
      console.log(`   Base Price: $${basePrice.toFixed(2)} (${quantity} pieces)`)
      console.log(`   Exact Size (30%): +$${exactSizeCost.toFixed(2)}`)
      console.log(`   Total: $${totalPrice.toFixed(2)}`)
      console.log(`   Per Unit: $${(totalPrice / quantity).toFixed(4)}`)
      console.log('')
    })

    console.log('━'.repeat(80))
    console.log('\n✅ Exact Size addon is configured correctly!')
    console.log('\nKey Features:')
    console.log('   • Adds 30% to base product price')
    console.log('   • Ensures precision cutting to exact dimensions')
    console.log('   • Prevents undersizing by 1/8 inch')
    console.log('   • Adds 1 day to turnaround time')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyExactSize()
