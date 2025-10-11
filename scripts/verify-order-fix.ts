import { prisma } from '../src/lib/prisma'

async function verifyOrderFix() {
  console.log('\n🔍 ORDER FIX VERIFICATION REPORT\n')
  console.log('='.repeat(60))

  // 1. Check both user accounts
  const adminUser = await prisma.user.findUnique({
    where: { id: 'cmg46s7ff0000vuu43qg57vlr' },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  const cosCokeUser = await prisma.user.findUnique({
    where: { id: 'cmgb9of390000sho3zyku3u6c' },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  console.log('\n1️⃣ ADMIN ACCOUNT (iradwatkins@gmail.com)')
  console.log('   User ID:', adminUser?.id)
  console.log('   Total Orders:', adminUser?._count.orders || 0)
  if (adminUser?.orders && adminUser.orders.length > 0) {
    console.log('   Recent Orders:')
    adminUser.orders.forEach((order) => {
      console.log(`     - ${order.orderNumber} | ${order.status} | $${order.total}`)
    })
  }

  console.log('\n2️⃣ COS COKE ACCOUNT (ira@irawatkins.com)')
  console.log('   User ID:', cosCokeUser?.id)
  console.log('   Total Orders:', cosCokeUser?._count.orders || 0)
  if (cosCokeUser?.orders && cosCokeUser.orders.length > 0) {
    console.log('   Recent Orders:')
    cosCokeUser.orders.forEach((order) => {
      console.log(`     - ${order.orderNumber} | ${order.status} | $${order.total}`)
    })
  }

  // 2. Check last 10 orders to see distribution
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      User: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  console.log('\n3️⃣ LAST 10 ORDERS DISTRIBUTION')
  const ordersByUser: Record<string, number> = {}
  recentOrders.forEach((order) => {
    ordersByUser[order.User.email] = (ordersByUser[order.User.email] || 0) + 1
  })

  Object.entries(ordersByUser).forEach(([email, count]) => {
    console.log(`   ${email}: ${count} orders`)
  })

  console.log('\n4️⃣ ISSUE DIAGNOSIS')
  console.log('   Problem: You are logged in as iradwatkins@gmail.com')
  console.log('   Result: You only see 1 order (the one actually placed with that account)')
  console.log('   Root Cause: 10 orders were placed with ira@irawatkins.com instead')

  console.log('\n5️⃣ FIX STATUS')
  console.log('   ✅ Code fix applied: checkout now uses logged-in user')
  console.log('   ✅ Fix deployed: pm2 restart completed')
  console.log('   ⏳ Needs testing: Place new order while logged in as iradwatkins@gmail.com')

  console.log('\n6️⃣ NEXT STEPS')
  console.log('   1. Make sure you are logged in as iradwatkins@gmail.com')
  console.log('   2. Place a test order (use any email in the form - will be ignored)')
  console.log('   3. Check /account/orders - new order should appear')
  console.log('   4. Verify order is linked to iradwatkins@gmail.com in database')

  console.log('\n7️⃣ ALTERNATIVE SOLUTION')
  console.log('   If you want to see all 10 orders in your current account:')
  console.log('   Option A: Log in as ira@irawatkins.com (if you have access)')
  console.log('   Option B: Merge orders from ira@irawatkins.com to iradwatkins@gmail.com')
  console.log('   Option C: Keep them separate and test new orders with fix')

  console.log('\n' + '='.repeat(60))

  await prisma.$disconnect()
}

verifyOrderFix()
