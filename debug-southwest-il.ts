import { prisma } from './src/lib/prisma'
import { isStateAvailable } from './src/lib/shipping/modules/southwest-cargo/airport-availability'

async function debugIllinois() {
  console.log('🔍 Debugging Illinois Southwest Cargo availability...\n')

  // Check if state is available
  const ilAvailable = await isStateAvailable('IL')
  console.log('✅ IL state available:', ilAvailable)

  // Count IL airports
  const count = await prisma.airport.count({
    where: { carrier: 'SOUTHWEST_CARGO', isActive: true, state: 'IL' },
  })
  console.log('📊 IL airports count:', count)

  // List IL airports
  const ilAirports = await prisma.airport.findMany({
    where: { carrier: 'SOUTHWEST_CARGO', state: 'IL', isActive: true },
    select: { code: true, name: true, city: true },
  })
  console.log('\n✈️  IL airports:')
  ilAirports.forEach((airport) => {
    console.log(`   ${airport.code} - ${airport.name} (${airport.city})`)
  })

  await prisma.$disconnect()
}

debugIllinois().catch((e) => {
  console.error('❌ Error:', e)
  process.exit(1)
})
