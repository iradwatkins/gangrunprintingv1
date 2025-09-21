import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTurnaroundTimeSets() {
  console.log('🌱 Seeding Turnaround Time Sets...')

  try {
    // First, get existing turnaround times
    const turnaroundTimes = await prisma.turnaroundTime.findMany()
    console.log(`Found ${turnaroundTimes.length} turnaround times`)

    // Create Turnaround Time Sets
    const turnaroundTimeSets = [
      {
        name: 'Standard Turnaround',
        description: 'Regular production schedule options',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Business Card Turnaround',
        description: 'Fast turnaround options for business cards',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Marketing Materials Turnaround',
        description: 'Flexible timing for marketing campaigns',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Large Format Turnaround',
        description: 'Production schedule for posters and banners',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'EDDM Turnaround',
        description: 'Mailing preparation and processing times',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Rush Service',
        description: 'Expedited production for urgent orders',
        isActive: true,
        sortOrder: 6,
      },
    ]

    // Create or update Turnaround Time Sets
    for (const setData of turnaroundTimeSets) {
      const set = await prisma.turnaroundTimeSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })
      console.log(`✅ Created/Updated Turnaround Time Set: ${set.name}`)

      // Add turnaround times to each set if available
      if (turnaroundTimes.length > 0) {
        // Add appropriate turnaround times based on set name
        let timesToAdd = []

        if (set.name.includes('Business Card')) {
          // Business cards can have all options
          timesToAdd = turnaroundTimes
        } else if (set.name.includes('Rush')) {
          // Rush service only includes fast options
          timesToAdd = turnaroundTimes.filter(t =>
            t.name === 'Fast' || t.name === 'Faster' || t.name === 'Fastest'
          )
        } else if (set.name.includes('Large Format')) {
          // Large format usually excludes same-day
          timesToAdd = turnaroundTimes.filter(t => t.name !== 'Fastest')
        } else if (set.name.includes('EDDM')) {
          // EDDM needs more time
          timesToAdd = turnaroundTimes.filter(t =>
            t.name === 'Economy' || t.name === 'Fast'
          )
        } else {
          // Default: all options
          timesToAdd = turnaroundTimes
        }

        for (let i = 0; i < timesToAdd.length; i++) {
          await prisma.turnaroundTimeSetItem.upsert({
            where: {
              turnaroundTimeSetId_turnaroundTimeId: {
                turnaroundTimeSetId: set.id,
                turnaroundTimeId: timesToAdd[i].id,
              },
            },
            update: {
              sortOrder: i + 1,
              isDefault: i === 0, // First item is default
            },
            create: {
              turnaroundTimeSetId: set.id,
              turnaroundTimeId: timesToAdd[i].id,
              sortOrder: i + 1,
              isDefault: i === 0,
            },
          })
        }
        console.log(`  Added ${timesToAdd.length} turnaround times to set`)
      }
    }

    console.log('✅ Turnaround Time Sets seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding Turnaround Time Sets:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedTurnaroundTimeSets()
    .then(() => {
      console.log('✨ Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

export default seedTurnaroundTimeSets