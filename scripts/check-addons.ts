import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const addOns = await prisma.addOn.findMany()

  if (addOns.length > 0) {
    addOns.forEach((addon) => {})
  } else {
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
