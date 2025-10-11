import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`\n👥 All user accounts (${users.length} total):\n`)

  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email}`)
    console.log(`   ID: ${u.id}`)
    console.log(`   Name: ${u.name}`)
    console.log(`   Role: ${u.role}`)
    console.log(`   Orders: ${u._count.orders}`)
    console.log(`   Created: ${u.createdAt}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
