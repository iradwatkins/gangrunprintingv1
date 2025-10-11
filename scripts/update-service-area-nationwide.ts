import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// All US states + territories
const allStates = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

async function main() {
  const updated = await prisma.carrierSettings.update({
    where: { carrier: 'SOUTHWEST_CARGO' },
    data: { serviceArea: allStates },
  })

  console.log('✅ Southwest Cargo now available nationwide!')
  console.log(`📊 Service area: ${updated.serviceArea.length} states`)
  console.log(`   ${updated.serviceArea.join(', ')}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
