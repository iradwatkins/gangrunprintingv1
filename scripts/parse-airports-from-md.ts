import fs from 'fs'
import path from 'path'

const mdContent = fs.readFileSync(
  path.join(process.cwd(), '.aaaaaa', 'Air Cargo Pickup Locations.md'),
  'utf-8'
)

interface Airport {
  code: string
  name: string
  carrier: string
  operator: string | null
  address: string
  city: string
  state: string
  zip: string
  hours: Record<string, string>
}

const airports: Airport[] = []

// Split into sections by ## headers
const sections = mdContent.split(/^## /m).filter(Boolean)

sections.forEach((section) => {
  const lines = section.trim().split('\n')

  // First line is "City (CODE)"
  const firstLine = lines[0]
  const match = firstLine.match(/^(.+?)\s*\(([A-Z]{3})\)/)

  if (!match) return

  const name = match[1].trim()
  const code = match[2]

  let carrier = 'SOUTHWEST_CARGO' // Use enum value, not display name
  let operator: string | null = null
  let address = ''
  let city = ''
  let state = ''
  let zip = ''
  const hours: Record<string, string> = {}

  // Parse the rest of the lines
  let i = 1
  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line || line === '**Southwest Airlines Cargo**') {
      i++
      continue
    }

    // Check for operator
    if (line.startsWith('**Operated by') || line.startsWith('Operated by')) {
      operator = line.replace(/\*\*/g, '').replace('Operated by ', '').trim()
      i++
      continue
    }

    // Check for hours section
    if (line === '**Hours:**' || line === 'Hours:') {
      i++
      // Parse hours
      while (i < lines.length) {
        const hourLine = lines[i].trim().replace(/\*\*/g, '')
        if (!hourLine) break

        // Format: "Mon-Fri: 5:00am-9:00pm"
        const hourMatch = hourLine.match(/^(.+?):\s*(.+)$/)
        if (hourMatch) {
          hours[hourMatch[1]] = hourMatch[2]
        }
        i++
      }
      continue
    }

    // Address lines (before Hours)
    if (!address && line.startsWith('**') && !line.includes('Operated')) {
      address = line.replace(/\*\*/g, '').trim()
    } else if (!city && line.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5})$/)) {
      // City, State ZIP line
      const cityMatch = line.replace(/\*\*/g, '').match(/^(.+?),\s*([A-Z]{2})\s+(\d{5})$/)
      if (cityMatch) {
        city = cityMatch[1].trim()
        state = cityMatch[2]
        zip = cityMatch[3]
      }
    } else if (!city && line.includes(',')) {
      // Sometimes city/state is on separate line
      const parts = line.replace(/\*\*/g, '').split(',')
      if (parts.length >= 2) {
        city = parts[0].trim()
        const stateZip = parts[1].trim().match(/([A-Z]{2})\s+(\d{5})/)
        if (stateZip) {
          state = stateZip[1]
          zip = stateZip[2]
        }
      }
    } else if (line.replace(/\*\*/g, '').match(/^\d+/)) {
      // Address line starting with number
      if (!address) {
        address = line.replace(/\*\*/g, '').trim()
      }
    }

    i++
  }

  // Only add if we have required fields
  if (code && name && address && city && state && zip) {
    airports.push({
      code,
      name,
      carrier,
      operator,
      address,
      city,
      state,
      zip,
      hours,
    })
  }
})

console.log(`Parsed ${airports.length} airports`)

// Generate TypeScript seed file
const seedFileContent = `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const airports = ${JSON.stringify(airports, null, 2)}

async function main() {
  console.log('🛫 Seeding all ${airports.length} Southwest Cargo airport locations...')

  for (const airport of airports) {
    try {
      await prisma.airport.upsert({
        where: { code: airport.code },
        update: airport,
        create: {
          id: \`airport_\${airport.code.toLowerCase()}\`,
          ...airport,
          isActive: true
        }
      })
      console.log(\`✅ \${airport.name} (\${airport.code})\`)
    } catch (error) {
      console.error(\`❌ Failed to seed \${airport.name}:\`, error)
    }
  }

  const count = await prisma.airport.count({
    where: { carrier: 'SOUTHWEST_CARGO', isActive: true }
  })

  console.log(\`\\n✨ Complete! \${count} Southwest Cargo airports in database\`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`

fs.writeFileSync(
  path.join(process.cwd(), 'scripts', 'seed-all-southwest-airports.ts'),
  seedFileContent
)

console.log('✅ Generated seed file: scripts/seed-all-southwest-airports.ts')
console.log(`\nAirports by state:`)
const byState = airports.reduce(
  (acc, a) => {
    acc[a.state] = (acc[a.state] || 0) + 1
    return acc
  },
  {} as Record<string, number>
)

Object.entries(byState)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`)
  })
