import { prisma } from '../src/lib/prisma'

async function mergeOrders() {
  console.log('\n📦 MERGING ORDERS FROM COS COKE TO ADMIN ACCOUNT\n')
  console.log('='.repeat(60))

  const adminId = 'cmg46s7ff0000vuu43qg57vlr' // iradwatkins@gmail.com
  const cosCokeId = 'cmgb9of390000sho3zyku3u6c' // ira@irawatkins.com

  // Get orders to merge
  const ordersToMerge = await prisma.order.findMany({
    where: { userId: cosCokeId },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\n📊 Found ${ordersToMerge.length} orders to merge\n`)

  // Update orders to admin account
  const result = await prisma.order.updateMany({
    where: { userId: cosCokeId },
    data: { userId: adminId },
  })

  console.log(`✅ Successfully merged ${result.count} orders to admin account\n`)

  // Verify
  const adminOrders = await prisma.order.count({
    where: { userId: adminId },
  })

  const cosCokeOrders = await prisma.order.count({
    where: { userId: cosCokeId },
  })

  console.log('📈 FINAL COUNTS:')
  console.log(`   Admin account (iradwatkins@gmail.com): ${adminOrders} orders`)
  console.log(`   Cos Coke account (ira@irawatkins.com): ${cosCokeOrders} orders`)

  console.log('\n✅ Merge complete! Check /account/orders to see all orders.')
  console.log('='.repeat(60) + '\n')

  await prisma.$disconnect()
}

mergeOrders()
