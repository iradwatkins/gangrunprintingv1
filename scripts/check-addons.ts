import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking AddOns in database...')
  const addOns = await prisma.addOn.findMany()
  console.log('Total AddOns in database:', addOns.length)
  
  if (addOns.length > 0) {
    console.log('AddOns found:')
    addOns.forEach(addon => {
      console.log(`- ${addon.name} (${addon.pricingModel}) - Active: ${addon.isActive}`)
    })
  } else {
    console.log('No AddOns found in database!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
