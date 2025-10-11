import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🛫 Enabling Southwest Cargo in CarrierSettings...\n')

  // Check if it already exists
  const existing = await prisma.carrierSettings.findUnique({
    where: { carrier: 'SOUTHWEST_CARGO' },
  })

  if (existing) {
    console.log('✅ Southwest Cargo already exists in CarrierSettings')
    console.log('Current settings:', JSON.stringify(existing, null, 2))

    if (!existing.enabled) {
      // Enable it
      await prisma.carrierSettings.update({
        where: { carrier: 'SOUTHWEST_CARGO' },
        data: { enabled: true },
      })
      console.log('\n✅ Southwest Cargo ENABLED!')
    }
  } else {
    // Create new entry
    const newSettings = await prisma.carrierSettings.create({
      data: {
        carrier: 'SOUTHWEST_CARGO',
        enabled: true,
        name: 'Southwest Cargo',
        baseRate: 80.0, // Starting rate for airport pickup
        perPoundRate: 1.75, // Rate per pound over threshold
        fuelSurcharge: 0, // No fuel surcharge
        markupPercentage: 5, // 5% markup
        settings: {
          testMode: false,
          apiKey: null, // No API key needed
          accountNumber: null,
        },
      },
    })

    console.log('✅ Southwest Cargo CREATED and ENABLED!')
    console.log('Settings:', JSON.stringify(newSettings, null, 2))
  }

  // Show all enabled carriers
  const allCarriers = await prisma.carrierSettings.findMany({
    where: { enabled: true },
    select: { carrier: true, name: true, enabled: true, markupPercentage: true },
  })

  console.log('\n📊 All Enabled Carriers:')
  allCarriers.forEach((c) => {
    console.log(`  ✓ ${c.name} (${c.carrier}) - Markup: ${c.markupPercentage}%`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
