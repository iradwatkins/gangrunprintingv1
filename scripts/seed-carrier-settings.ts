import { PrismaClient, Carrier } from '@prisma/client'

const prisma = new PrismaClient()

const SOUTHWEST_SERVICE_AREA = [
  'TX',
  'OK',
  'NM',
  'AR',
  'LA',
  'AZ',
  'CA',
  'NV',
  'CO',
  'UT',
  'FL',
  'GA',
  'AL',
  'TN',
  'MS',
  'SC',
  'NC',
  'KY',
  'MO',
  'KS',
]

async function main() {
  console.log('🌱 Seeding carrier settings...')

  // FedEx Settings
  const fedex = await prisma.carrierSettings.upsert({
    where: { carrier: Carrier.FEDEX },
    update: {},
    create: {
      carrier: Carrier.FEDEX,
      enabled: true,
      testMode: false,
      markupPercentage: 0, // No markup on FedEx
      serviceArea: [], // Available in all states
      packagingWeight: 0.5,
      notes: 'Primary carrier - no markup applied',
    },
  })
  console.log('✅ FedEx settings:', fedex)

  // UPS Settings
  const ups = await prisma.carrierSettings.upsert({
    where: { carrier: Carrier.UPS },
    update: {},
    create: {
      carrier: Carrier.UPS,
      enabled: false, // Disabled by default (no API credentials)
      testMode: true,
      markupPercentage: 10,
      serviceArea: [], // Available in all states
      packagingWeight: 0.5,
      notes: 'Requires UPS API credentials - currently disabled',
    },
  })
  console.log('✅ UPS settings:', ups)

  // Southwest Cargo Settings
  const southwest = await prisma.carrierSettings.upsert({
    where: { carrier: Carrier.SOUTHWEST_CARGO },
    update: {},
    create: {
      carrier: Carrier.SOUTHWEST_CARGO,
      enabled: true,
      testMode: false,
      markupPercentage: 5, // 5% markup on Southwest Cargo
      serviceArea: SOUTHWEST_SERVICE_AREA,
      packagingWeight: 1.0, // Heavier packaging for freight
      notes: 'Airport pickup service - limited to Southwest service area',
    },
  })
  console.log('✅ Southwest Cargo settings:', southwest)

  console.log('\n✨ Carrier settings seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding carrier settings:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
