import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Read all airports from markdown file
  const mdContent = fs.readFileSync(
    path.join(process.cwd(), '.aaaaaa', 'Air Cargo Pickup Locations.md'),
    'utf-8'
  )

  const allAirportsInMD: string[] = []
  const lines = mdContent.split('\n')

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const airportName = line.replace('## ', '').trim()
      allAirportsInMD.push(airportName)
    }
  }

  console.log(`\n📋 Total airports in markdown file: ${allAirportsInMD.length}`)

  // Get all airports from database
  const airportsInDB = await prisma.airport.findMany({
    where: {
      carrier: 'SOUTHWEST_CARGO',
      isActive: true,
    },
    select: {
      code: true,
      name: true,
    },
  })

  console.log(`📊 Total airports in database: ${airportsInDB.length}`)

  // Create a set of airport codes in DB
  const codesInDB = new Set(airportsInDB.map((a) => a.code))

  // Find missing airports by extracting codes from markdown names
  const missingAirports: string[] = []

  for (const mdAirport of allAirportsInMD) {
    const codeMatch = mdAirport.match(/\(([A-Z]{3})\)/)
    if (codeMatch) {
      const code = codeMatch[1]
      if (!codesInDB.has(code)) {
        missingAirports.push(mdAirport)
      }
    }
  }

  console.log(`\n❌ Missing ${missingAirports.length} airports:\n`)
  missingAirports.forEach((airport, index) => {
    console.log(`${index + 1}. ${airport}`)
  })

  // Also show the airports in DB for verification
  console.log(`\n✅ Airports currently in database:`)
  airportsInDB
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((airport) => {
      console.log(`   ${airport.code}: ${airport.name}`)
    })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
