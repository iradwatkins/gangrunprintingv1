import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCornerRounding() {
  try {
    console.log('🔍 Verifying Corner Rounding configuration...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' },
      include: { addOnSubOptions: true },
    })

    if (!addon) {
      console.log('❌ Corner Rounding addon not found')
      return
    }

    console.log('✅ CORNER ROUNDING ADDON VERIFICATION\n')
    console.log('━'.repeat(60))

    console.log('\n📋 Main Addon Configuration:')
    console.log(`   Name: ${addon.name}`)
    console.log(`   Description: ${addon.description}`)
    console.log(`   Tooltip: ${addon.tooltipText}`)
    console.log(`   Pricing Model: ${addon.pricingModel}`)
    console.log(`   Configuration:`, JSON.stringify(addon.configuration, null, 2))

    console.log('\n📋 Sub-Options:')
    addon.addOnSubOptions.forEach((subOption, index) => {
      console.log(`\n   ${index + 1}. ${subOption.name}`)
      console.log(`      Type: ${subOption.optionType}`)
      console.log(`      Default: ${subOption.defaultValue}`)
      console.log(`      Tooltip: ${subOption.tooltipText}`)
      console.log(`      Options:`, subOption.options)
    })

    console.log('\n━'.repeat(60))
    console.log('\n✅ Expected Configuration:')
    console.log('   Base Fee: $20.00')
    console.log('   Per Piece Rate: $0.01')
    console.log('   Radius: 1/4" for business cards, 3/16" for other products')
    console.log('   Sub-option: Rounded Corners (All Four, Top Two, etc.)')

    const config = addon.configuration as any
    const isCorrect =
      config.baseFee === 20 &&
      config.perPieceRate === 0.01 &&
      addon.pricingModel === 'CUSTOM' &&
      addon.addOnSubOptions.some((so) => so.name === 'Rounded Corners')

    if (isCorrect) {
      console.log('\n✅ Configuration is CORRECT!')
    } else {
      console.log('\n⚠️  Configuration may need adjustment')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCornerRounding()
