import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.productCategory.findMany()
  console.log('Categories found:', categories.length)
  if (categories.length === 0) {
    console.log('No categories found. Run: npx tsx prisma/seed-categories.ts')
  } else {
    categories.forEach((c) => console.log(`- ${c.name} (${c.id})`))
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
