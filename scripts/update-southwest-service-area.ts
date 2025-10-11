import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🛫 Updating Southwest Cargo service area to match airport locations...\n')

  // Get all unique states from airports
  const states = await prisma.airport.groupBy({
    by: ['state'],
    where: {
      carrier: 'SOUTHWEST_CARGO',
      isActive: true,
    },
  })

  const serviceArea = states.map((s) => s.state).sort()

  console.log(`📍 Found airports in ${serviceArea.length} states:`)
  console.log(`   ${serviceArea.join(', ')}\n`)

  // Update CarrierSettings
  const updated = await prisma.carrierSettings.update({
    where: { carrier: 'SOUTHWEST_CARGO' },
    data: {
      serviceArea: serviceArea,
    },
  })

  console.log('✅ Southwest Cargo service area updated!')
  console.log(`\n📊 New service area (${updated.serviceArea.length} states):`)
  console.log(`   ${updated.serviceArea.join(', ')}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
