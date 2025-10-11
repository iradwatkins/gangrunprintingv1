import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Finding recent orders (last 24 hours)...\n')

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const recentOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
    include: {
      User: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  console.log(`📊 Found ${recentOrders.length} recent orders:\n`)

  recentOrders.forEach((order, index) => {
    console.log(`${index + 1}. Order ${order.orderNumber}`)
    console.log(`   Order ID: ${order.id}`)
    console.log(`   Email: ${order.email}`)
    console.log(`   User ID: ${order.userId}`)
    console.log(`   User Account: ${order.User?.email} (${order.User?.name})`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Total: $${order.total}`)
    console.log(`   Created: ${order.createdAt}`)
    console.log('')
  })

  // Find duplicate users by email
  console.log('\n🔍 Checking for duplicate user accounts...\n')

  const duplicateEmails = await prisma.user.groupBy({
    by: ['email'],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  })

  if (duplicateEmails.length > 0) {
    console.log(`⚠️  Found ${duplicateEmails.length} emails with multiple accounts:\n`)

    for (const dup of duplicateEmails) {
      const users = await prisma.user.findMany({
        where: { email: dup.email },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })

      console.log(`📧 ${dup.email}:`)
      users.forEach((u) => {
        console.log(`   - ID: ${u.id} | Name: ${u.name} | Orders: ${u._count.orders}`)
      })
      console.log('')
    }
  } else {
    console.log('✅ No duplicate email accounts found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
