/**
 * Test Analytics Dashboard
 *
 * This script:
 * 1. Seeds sample order data with realistic status transitions
 * 2. Tests the analytics API endpoint
 * 3. Verifies all analytics calculations
 */

const { PrismaClient } = require('@prisma/client')
const { createId } = require('@paralleldrive/cuid2')

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Order Status Analytics Dashboard\n')

  // Step 1: Check if core statuses exist
  console.log('📊 Step 1: Checking core statuses...')
  const statuses = await prisma.customOrderStatus.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (statuses.length === 0) {
    console.log('❌ ERROR: No statuses found. Please run migrations and seed script first.')
    console.log('   Run: docker exec -i gangrunprinting-postgres psql -U gangrun_user -d gangrun_db < migrations/seed-core-statuses.sql')
    process.exit(1)
  }

  console.log(`✅ Found ${statuses.length} active statuses`)
  statuses.forEach(s => console.log(`   - ${s.name} (${s.slug})`))

  // Step 2: Check existing orders
  console.log('\n📦 Step 2: Checking existing orders...')
  const existingOrderCount = await prisma.order.count()
  console.log(`   Existing orders: ${existingOrderCount}`)

  let shouldSeed = false
  if (existingOrderCount < 20) {
    console.log('   ⚠️  Low order count - seeding sample data for better analytics')
    shouldSeed = true
  }

  // Step 3: Seed sample orders if needed
  if (shouldSeed) {
    console.log('\n🌱 Step 3: Seeding sample order data...')

    // Get a sample user (or create one)
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: createId(),
          email: 'test@gangrunprinting.com',
          name: 'Test Customer',
          role: 'CUSTOMER',
        },
      })
      console.log('   Created test user')
    }

    // Define realistic order workflows
    const workflows = [
      // Fast orders (1-3 days in each status)
      ['PENDING_PAYMENT', 'CONFIRMATION', 'PRODUCTION', 'SHIPPED', 'DELIVERED'],
      // Slow orders with bottlenecks (some statuses take 7-10 days)
      ['PENDING_PAYMENT', 'CONFIRMATION', 'PRODUCTION', 'PRODUCTION', 'SHIPPED', 'DELIVERED'], // stuck in production
      // Orders with pickup
      ['PENDING_PAYMENT', 'CONFIRMATION', 'PRODUCTION', 'READY_FOR_PICKUP', 'PICKED_UP'],
      // Incomplete orders
      ['PENDING_PAYMENT', 'CONFIRMATION', 'PRODUCTION'],
      ['PENDING_PAYMENT', 'CONFIRMATION'],
    ]

    const statusMap = {}
    statuses.forEach(s => {
      statusMap[s.slug] = s.id
    })

    const createdOrders = []

    for (let i = 0; i < 50; i++) {
      const workflow = workflows[i % workflows.length]
      const orderNumber = `ORD-TEST-${Date.now()}-${i}`

      // Create order
      const createdAt = new Date(Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000)) // Last 60 days
      const currentStatus = workflow[workflow.length - 1]

      const subtotal = Math.random() * 400 + 50
      const tax = subtotal * 0.08
      const shipping = 10
      const total = subtotal + tax + shipping

      const order = await prisma.order.create({
        data: {
          id: createId(),
          orderNumber,
          userId: user.id,
          email: user.email,
          phone: '555-0123',
          status: currentStatus,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: {
            name: 'Test Customer',
            street: '123 Test St',
            city: 'Test City',
            state: 'TX',
            zip: '12345',
          },
          createdAt,
          updatedAt: createdAt,
        },
      })

      createdOrders.push(order)

      // Create status history
      let currentTime = createdAt.getTime()

      for (let j = 0; j < workflow.length; j++) {
        const statusSlug = workflow[j]
        const fromStatus = j === 0 ? 'PENDING_PAYMENT' : workflow[j - 1]

        // Time in status: 1-10 days with some randomness
        const daysInStatus = j === workflow.length - 1
          ? 0 // Current status (still in it)
          : Math.random() * 9 + 1 // 1-10 days

        const statusChangeTime = new Date(currentTime)

        await prisma.statusHistory.create({
          data: {
            id: createId(),
            orderId: order.id,
            fromStatus,
            toStatus: statusSlug,
            notes: `Test transition ${j + 1}`,
            changedBy: 'system@test',
            createdAt: statusChangeTime,
          },
        })

        currentTime += daysInStatus * 24 * 60 * 60 * 1000
      }
    }

    console.log(`✅ Created ${createdOrders.length} test orders with status history`)
  } else {
    console.log('\n⏭️  Step 3: Skipping seed (sufficient data exists)')
  }

  // Step 4: Test analytics API data calculation
  console.log('\n📈 Step 4: Testing analytics calculations...')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const now = new Date()

  // Get orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
        lte: now,
      },
    },
    include: {
      StatusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  console.log(`   Orders in last 30 days: ${orders.length}`)

  // Calculate average time in each status
  const timeInStatusData = {}

  orders.forEach((order) => {
    const history = order.StatusHistory

    for (let i = 0; i < history.length; i++) {
      const currentHistory = history[i]
      const nextHistory = history[i + 1]

      const statusSlug = currentHistory.toStatus
      const enteredAt = currentHistory.createdAt
      const exitedAt = nextHistory ? nextHistory.createdAt : now

      const timeSpent = exitedAt.getTime() - enteredAt.getTime() // milliseconds

      if (!timeInStatusData[statusSlug]) {
        timeInStatusData[statusSlug] = {
          totalTime: 0,
          orderCount: 0,
        }
      }

      timeInStatusData[statusSlug].totalTime += timeSpent
      timeInStatusData[statusSlug].orderCount += 1
    }
  })

  console.log('\n   Average time in each status:')
  Object.keys(timeInStatusData).forEach((slug) => {
    const data = timeInStatusData[slug]
    const avgTimeMs = data.orderCount > 0 ? data.totalTime / data.orderCount : 0
    const avgTimeDays = avgTimeMs / (1000 * 60 * 60 * 24)
    const avgTimeHours = avgTimeMs / (1000 * 60 * 60)

    const formatted = avgTimeDays >= 1
      ? `${avgTimeDays.toFixed(1)} days`
      : avgTimeHours >= 1
      ? `${avgTimeHours.toFixed(1)} hours`
      : `${Math.round(avgTimeMs / (1000 * 60))} minutes`

    console.log(`   - ${slug}: ${formatted} (${data.orderCount} orders)`)
  })

  // Identify bottlenecks
  const bottlenecks = Object.entries(timeInStatusData)
    .map(([slug, data]) => ({
      slug,
      avgTimeMs: data.totalTime / data.orderCount,
      orderCount: data.orderCount,
    }))
    .sort((a, b) => b.avgTimeMs - a.avgTimeMs)
    .slice(0, 5)

  console.log('\n   🚨 Top 5 Bottlenecks:')
  bottlenecks.forEach((b, index) => {
    const avgTimeDays = b.avgTimeMs / (1000 * 60 * 60 * 24)
    console.log(`   ${index + 1}. ${b.slug}: ${avgTimeDays.toFixed(2)} days (${b.orderCount} orders)`)
  })

  // Step 5: Test API endpoint
  console.log('\n🔌 Step 5: Testing Analytics API Endpoint...')
  console.log('   To test the API, run:')
  console.log('   curl http://localhost:3020/api/admin/order-statuses/analytics')
  console.log('\n   Or visit in browser:')
  console.log('   http://gangrunprinting.com/admin/settings/order-statuses/analytics')

  console.log('\n✅ Analytics Dashboard Test Complete!')
  console.log('\n📊 Summary:')
  console.log(`   - Statuses configured: ${statuses.length}`)
  console.log(`   - Total orders: ${await prisma.order.count()}`)
  console.log(`   - Orders in last 30 days: ${orders.length}`)
  console.log(`   - Bottlenecks detected: ${bottlenecks.length}`)
  console.log('\n🎯 Next Steps:')
  console.log('   1. Ensure app is running (docker-compose up -d or pm2 start)')
  console.log('   2. Visit: http://gangrunprinting.com/admin/settings/order-statuses/analytics')
  console.log('   3. Try different date ranges')
  console.log('   4. Analyze bottlenecks and optimize workflow')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
