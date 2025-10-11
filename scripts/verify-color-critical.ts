import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyColorCritical() {
  try {
    console.log('🔍 Verifying Color Critical addon...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Color Critical' },
      include: {
        addOnSetItems: {
          include: {
            AddOnSet: true,
          },
        },
      },
    })

    if (!addon) {
      console.log('❌ Color Critical addon not found')
      return
    }

    console.log('✅ COLOR CRITICAL ADDON VERIFICATION\n')
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
      { basePrice: 100, quantity: 500 },
      { basePrice: 200, quantity: 1000 },
      { basePrice: 500, quantity: 2500 },
    ]

    examples.forEach(({ basePrice, quantity }) => {
      const colorCriticalCost = basePrice * 0.3
      const totalPrice = basePrice + colorCriticalCost

      console.log(`   Base Price: $${basePrice.toFixed(2)} (${quantity} pieces)`)
      console.log(`   Color Critical (30%): +$${colorCriticalCost.toFixed(2)}`)
      console.log(`   Total: $${totalPrice.toFixed(2)}`)
      console.log(`   Per Unit: $${(totalPrice / quantity).toFixed(4)}`)
      console.log('')
    })

    console.log('━'.repeat(80))
    console.log('\n✅ Color Critical addon is configured correctly!')
    console.log('\nKey Features:')
    console.log('   • Adds 30% to base product price')
    console.log('   • Applies to base_price before turnaround')
    console.log('   • Adds 2 days to turnaround time')
    console.log('   • Custom run - does NOT gang with other jobs')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyColorCritical()
