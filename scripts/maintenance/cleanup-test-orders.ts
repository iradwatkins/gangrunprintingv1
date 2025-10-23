/**
 * Cleanup Test Orders Script
 *
 * Safely removes all test orders created during payment testing
 * Deletes orders and related data (order items, status history)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Test customer emails to identify test orders
const TEST_EMAILS = [
  'payment-test@gangrunprinting.com',
  'chrome-test@gangrunprinting.com',
  'cashapp-test@gangrunprinting.com',
]

/**
 * Find all test orders
 */
async function findTestOrders() {
  console.log('\n🔍 Finding test orders...')

  const orders = await prisma.order.findMany({
    where: {
      email: {
        in: TEST_EMAILS,
      },
    },
    include: {
      OrderItem: true,
      StatusHistory: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log(`   Found ${orders.length} test orders\n`)

  return orders
}

/**
 * Display test orders for confirmation
 */
function displayOrders(orders: any[]) {
  console.log('Test Orders to Delete:')
  console.log('='.repeat(100))
  console.log(
    'Order Number         | Email                               | Status          | Total    | Created'
  )
  console.log('-'.repeat(100))

  orders.forEach((order) => {
    const orderNum = order.orderNumber.padEnd(20)
    const email = order.email.padEnd(35)
    const status = order.status.padEnd(15)
    const total = `$${(order.total / 100).toFixed(2)}`.padStart(8)
    const created = new Date(order.createdAt).toLocaleString()

    console.log(`${orderNum} | ${email} | ${status} | ${total} | ${created}`)
  })

  console.log('='.repeat(100))
  console.log(`\nTotal: ${orders.length} orders\n`)
}

/**
 * Delete a single order and its related data
 */
async function deleteOrder(orderId: string, orderNumber: string) {
  try {
    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete status history
      await tx.statusHistory.deleteMany({
        where: { orderId },
      })

      // Delete order items
      await tx.orderItem.deleteMany({
        where: { orderId },
      })

      // Delete order
      await tx.order.delete({
        where: { id: orderId },
      })
    })

    console.log(`   ✅ Deleted: ${orderNumber}`)
    return true
  } catch (error: any) {
    console.error(`   ❌ Failed to delete ${orderNumber}: ${error.message}`)
    return false
  }
}

/**
 * Delete all test orders
 */
async function deleteAllTestOrders(orders: any[]) {
  console.log('\n🗑️  Deleting test orders...\n')

  let deleted = 0
  let failed = 0

  for (const order of orders) {
    const success = await deleteOrder(order.id, order.orderNumber)
    if (success) {
      deleted++
    } else {
      failed++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('CLEANUP SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Orders: ${orders.length}`)
  console.log(`Deleted: ${deleted} ✅`)
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log('='.repeat(80) + '\n')

  return { deleted, failed }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('PAYMENT TEST ORDER CLEANUP')
  console.log('='.repeat(80))

  try {
    // Find test orders
    const orders = await findTestOrders()

    if (orders.length === 0) {
      console.log('✅ No test orders found. Nothing to clean up.\n')
      return
    }

    // Display orders
    displayOrders(orders)

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete all test orders shown above.')
    console.log('This action cannot be undone.\n')

    // Check if running with --force flag
    const args = process.argv.slice(2)
    const forceDelete = args.includes('--force') || args.includes('-f')

    if (!forceDelete) {
      console.log('To proceed with deletion, run:')
      console.log('  npx tsx cleanup-test-orders.ts --force\n')
      return
    }

    // Delete orders
    const result = await deleteAllTestOrders(orders)

    if (result.failed === 0) {
      console.log('✅ All test orders cleaned up successfully!\n')
    } else {
      console.log(`⚠️  Cleanup completed with ${result.failed} errors.\n`)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use in other scripts
export { findTestOrders, deleteOrder, deleteAllTestOrders }

// Run if called directly
if (require.main === module) {
  main()
}
