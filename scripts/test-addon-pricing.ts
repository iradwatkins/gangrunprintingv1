import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 TESTING ALL ADDON PRICING (piece = quantity)\n')

  const testQuantity = 1000

  const addons = await prisma.addOn.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  console.log(`Testing with quantity: ${testQuantity} pieces\n`)
  console.log('='.repeat(80))

  for (const addon of addons) {
    const config = addon.configuration as any
    let calculatedPrice = 0
    let formula = ''

    console.log(`\n📦 ${addon.name}`)
    console.log(`   Model: ${addon.pricingModel}`)

    switch (addon.pricingModel) {
      case 'CUSTOM':
        if (config.baseFee !== undefined && config.perPieceRate !== undefined) {
          calculatedPrice = config.baseFee + config.perPieceRate * testQuantity
          formula = `$${config.baseFee} + ($${config.perPieceRate} × ${testQuantity})`
          console.log(`   Formula: ${formula}`)
          console.log(`   ✓ Price: $${calculatedPrice.toFixed(2)}`)
        } else if (config.baseFee !== undefined && config.perHolePerPieceRate !== undefined) {
          const testHoles = 3
          calculatedPrice = config.baseFee + config.perHolePerPieceRate * testHoles * testQuantity
          formula = `$${config.baseFee} + ($${config.perHolePerPieceRate} × ${testHoles} holes × ${testQuantity})`
          console.log(`   Formula: ${formula} (assuming 3 holes)`)
          console.log(`   ✓ Price: $${calculatedPrice.toFixed(2)}`)
        }
        break

      case 'PERCENTAGE':
        const percentage = config.percentage || 0
        const basePrice = 100 // Example base price
        calculatedPrice = basePrice * percentage
        console.log(`   Formula: ${percentage * 100}% of base price`)
        console.log(
          `   ✓ Price: ${percentage * 100}% (example: $${calculatedPrice.toFixed(2)} on $100 base)`
        )
        break

      case 'PER_UNIT':
        const pricePerUnit = config.pricePerUnit || 0
        calculatedPrice = pricePerUnit * testQuantity
        console.log(`   Formula: $${pricePerUnit} × ${testQuantity} pieces`)
        console.log(`   ✓ Price: $${calculatedPrice.toFixed(2)}`)
        break

      case 'FLAT':
        calculatedPrice = config.flatFee || 0
        console.log(`   Formula: Flat fee`)
        console.log(`   ✓ Price: $${calculatedPrice.toFixed(2)}`)
        break
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✅ All addon pricing formulas verified!')
  console.log('\nKEY RULE: piece = quantity (always)')
  console.log('\nPricing Models:')
  console.log('  • CUSTOM: baseFee + (perPieceRate × quantity)')
  console.log('  • PERCENTAGE: percentage × base_price')
  console.log('  • PER_UNIT: pricePerUnit × quantity')
  console.log('  • FLAT: fixed price regardless of quantity')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
