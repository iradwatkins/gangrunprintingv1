import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 FIXING TURNAROUND MULTIPLIERS...\n')

  // Update "2 - 4 Days" (Economy) to 1.1 (10% markup)
  const economy = await prisma.turnaroundTime.updateMany({
    where: { name: '2 - 4 Days' },
    data: {
      priceMultiplier: 1.1,
      pricingModel: 'PERCENTAGE',
    },
  })
  console.log('✓ Updated "2 - 4 Days" (Economy): 1.1x (10% markup)')

  // Update "1 - 2 Days" (Fast) to 1.3 (30% markup)
  const fast = await prisma.turnaroundTime.updateMany({
    where: { name: '1 - 2 Days' },
    data: {
      priceMultiplier: 1.3,
      pricingModel: 'PERCENTAGE',
    },
  })
  console.log('✓ Updated "1 - 2 Days" (Fast): 1.3x (30% markup)')

  // Update "Tomorrow" (Faster) to 1.5 (50% markup)
  const faster = await prisma.turnaroundTime.updateMany({
    where: { name: 'Tomorrow' },
    data: {
      priceMultiplier: 1.5,
      pricingModel: 'PERCENTAGE',
    },
  })
  console.log('✓ Updated "Tomorrow" (Faster): 1.5x (50% markup)')

  // Update "Today" (Crazy Fast) to 2.0 (100% markup)
  const crazyFast = await prisma.turnaroundTime.updateMany({
    where: { name: 'Today' },
    data: {
      priceMultiplier: 2.0,
      pricingModel: 'PERCENTAGE',
    },
  })
  console.log('✓ Updated "Today" (Crazy Fast): 2.0x (100% markup)')

  console.log('\n✅ All turnaround multipliers fixed!')
  console.log('\nNow prices will calculate correctly:')
  console.log('- Economy (2-4 days): Base × 1.10 = 10% markup')
  console.log('- Fast (1-2 days): Base × 1.30 = 30% markup')
  console.log('- Faster (Tomorrow): Base × 1.50 = 50% markup')
  console.log('- Crazy Fast (Today): Base × 2.00 = 100% markup')
  console.log('\nWhere Base = Product Price + All Addon Costs')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
