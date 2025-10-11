import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking AddOn Relationship Patterns...\n')

  // Check direct ProductAddOn relationships
  const directAddons = await prisma.productAddOn.findMany({
    include: {
      Product: { select: { name: true } },
      AddOn: { select: { name: true } },
    },
  })

  console.log('1. Direct ProductAddOn relationships:')
  if (directAddons.length === 0) {
    console.log('   - No direct addon relationships found')
  } else {
    directAddons.forEach((pa, i) => {
      console.log(`   ${i + 1}. Product: ${pa.Product.name} -> AddOn: ${pa.AddOn.name}`)
    })
  }

  // Check ProductAddOnSet relationships
  const addonSets = await prisma.productAddOnSet.findMany({
    include: {
      Product: { select: { name: true } },
      AddOnSet: {
        select: {
          name: true,
          addOnSetItems: {
            include: {
              addOn: { select: { name: true } },
            },
          },
        },
      },
    },
  })

  console.log('\n2. ProductAddOnSet relationships:')
  if (addonSets.length === 0) {
    console.log('   - No addon set relationships found')
  } else {
    addonSets.forEach((pas, i) => {
      console.log(`   ${i + 1}. Product: ${pas.Product.name} -> AddOn Set: ${pas.AddOnSet.name}`)
      pas.AddOnSet.addOnSetItems.forEach((item, j) => {
        console.log(`      - Contains AddOn: ${item.addOn.name}`)
      })
    })
  }

  // Check what the pattern should be
  console.log('\n3. Recommended approach:')
  if (directAddons.length > 0 && addonSets.length > 0) {
    console.log('   - Both patterns exist, API should support both')
  } else if (directAddons.length > 0) {
    console.log('   - Only direct relationships exist, create ProductAddOn for Design')
  } else if (addonSets.length > 0) {
    console.log('   - Only addon sets exist, update API to support ProductAddOnSet')
  } else {
    console.log('   - No existing patterns, establish new convention')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
