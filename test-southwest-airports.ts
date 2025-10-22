/**
 * Test script to check Southwest Cargo airports in database
 */

import { prisma } from './src/lib/prisma'

async function checkAirports() {
  try {
    console.log('🔍 Checking Southwest Cargo airports in database...\n')

    // Count total airports
    const totalCount = await prisma.airport.count({
      where: { carrier: 'SOUTHWEST_CARGO' },
    })

    // Count active airports
    const activeCount = await prisma.airport.count({
      where: {
        carrier: 'SOUTHWEST_CARGO',
        isActive: true,
      },
    })

    console.log(`📊 Total Southwest Cargo airports: ${totalCount}`)
    console.log(`✅ Active Southwest Cargo airports: ${activeCount}`)

    if (totalCount === 0) {
      console.log('\n❌ NO AIRPORTS FOUND IN DATABASE!')
      console.log('   Run seed script: npx tsx src/scripts/seed-southwest-airports.ts')
    } else {
      // Get distinct states
      const airports = await prisma.airport.findMany({
        where: {
          carrier: 'SOUTHWEST_CARGO',
          isActive: true,
        },
        select: {
          state: true,
          code: true,
          name: true,
        },
        distinct: ['state'],
        orderBy: { state: 'asc' },
      })

      console.log(`\n🗺️  States with Southwest Cargo service: ${airports.length}`)
      console.log('States:', airports.map((a) => a.state).join(', '))

      // Check specifically for Illinois (IL)
      const illinoisAirports = await prisma.airport.findMany({
        where: {
          carrier: 'SOUTHWEST_CARGO',
          state: 'IL',
          isActive: true,
        },
        select: {
          code: true,
          name: true,
          city: true,
        },
      })

      console.log(`\n✈️  Illinois airports: ${illinoisAirports.length}`)
      illinoisAirports.forEach((airport) => {
        console.log(`   ${airport.code} - ${airport.name} (${airport.city})`)
      })
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error checking airports:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkAirports()
