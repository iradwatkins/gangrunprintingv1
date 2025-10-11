import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.airport.count({
    where: { carrier: 'SOUTHWEST_CARGO', isActive: true },
  })

  const states = await prisma.airport.groupBy({
    by: ['state'],
    where: { carrier: 'SOUTHWEST_CARGO', isActive: true },
  })

  console.log(`\n✈️  Southwest Cargo Airport Statistics`)
  console.log(`=====================================`)
  console.log(`Total airports: ${count}`)
  console.log(`States covered: ${states.length}`)
  console.log(
    `\nStates: ${states
      .map((s) => s.state)
      .sort()
      .join(', ')}`
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
