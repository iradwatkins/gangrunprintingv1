const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding coating and sides options...')

  // Seed Coating Options
  const coatingOptions = [
    { name: 'High Gloss UV', description: 'Ultra-shiny finish with UV protection', additionalCost: 0.05 },
    { name: 'High Gloss UV (One Side)', description: 'UV coating on front only', additionalCost: 0.03 },
    { name: 'Gloss Aqueous', description: 'Standard glossy finish', additionalCost: 0.02 },
    { name: 'Matte Aqueous', description: 'Non-reflective matte finish', additionalCost: 0.02 },
    { name: 'No Coating', description: 'Natural paper finish', additionalCost: null },
  ]

  for (const coating of coatingOptions) {
    await prisma.coatingOption.upsert({
      where: { name: coating.name },
      update: {},
      create: coating,
    })
    console.log(`Created coating option: ${coating.name}`)
  }

  // Seed Sides Options
  const sidesOptions = [
    { 
      name: 'Same image, both sides', 
      code: '4/4', 
      description: 'Full color printing on both sides with same design',
      isDefault: false 
    },
    { 
      name: 'Different image, both sides', 
      code: '4/4-different', 
      description: 'Full color printing on both sides with different designs',
      isDefault: false 
    },
    { 
      name: 'Your Image Front / Ours Back', 
      code: '4/4-template', 
      description: 'Your design on front, our template on back',
      isDefault: false 
    },
    { 
      name: 'Image one side only', 
      code: '4/0', 
      description: 'Full color printing on front only',
      isDefault: true 
    },
  ]

  for (const sides of sidesOptions) {
    await prisma.sidesOption.upsert({
      where: { code: sides.code },
      update: {},
      create: sides,
    })
    console.log(`Created sides option: ${sides.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })