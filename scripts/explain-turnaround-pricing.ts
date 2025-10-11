import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const turnarounds = await prisma.turnaroundTime.findMany({
    orderBy: { daysMax: 'desc' },
  })

  console.log('📅 HOW TURNAROUND TIME PRICING WORKS:\n')

  const basePrice = 114.96 // From the image

  console.log('Base Price (Product + Addons): $' + basePrice.toFixed(2))
  console.log('\n' + '='.repeat(80) + '\n')

  turnarounds.forEach((t) => {
    const markup = basePrice * (t.priceMultiplier - 1)
    const total = basePrice * t.priceMultiplier
    const markupPercent = (t.priceMultiplier - 1) * 100

    console.log(`${t.displayName || t.name}`)
    console.log(`  Days: ${t.daysMin}${t.daysMax ? '-' + t.daysMax : ''} business days`)
    console.log(`  Multiplier: ${t.priceMultiplier}x (${markupPercent.toFixed(0)}% markup)`)
    console.log(
      `  Calculation: $${basePrice.toFixed(2)} × ${t.priceMultiplier} = $${total.toFixed(2)}`
    )
    console.log(`  Base: $${basePrice.toFixed(2)}`)
    console.log(`  Markup: +$${markup.toFixed(2)}`)
    console.log(`  TOTAL: $${total.toFixed(2)}`)
    console.log('')
  })

  console.log('='.repeat(80))
  console.log('\n📌 HOW IT WORKS:')
  console.log('1. Calculate base price (product + paper + addons)')
  console.log('2. Apply turnaround multiplier to base price')
  console.log('3. Faster turnaround = higher multiplier = higher total price')
  console.log('\nFORMULA: Final Price = Base Price × Turnaround Multiplier')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
