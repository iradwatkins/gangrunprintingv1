/**
 * ORDER STATUS MANAGER - Migration Script
 *
 * Migrates existing OrderStatus enum values to CustomOrderStatus database table
 * This enables dynamic status creation while preserving existing workflow
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StatusConfig {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  badgeColor: string
  isPaid: boolean
  includeInReports: boolean
  allowDownloads: boolean
  sortOrder: number
}

// Core status configurations matching existing implementation
const CORE_STATUSES: StatusConfig[] = [
  {
    name: 'Pending Payment',
    slug: 'PENDING_PAYMENT',
    description: 'Order created, waiting for payment',
    icon: 'Clock',
    color: 'yellow',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    isPaid: false,
    includeInReports: false,
    allowDownloads: false,
    sortOrder: 1,
  },
  {
    name: 'Payment Declined',
    slug: 'PAYMENT_DECLINED',
    description: 'Payment was declined by payment processor',
    icon: 'XCircle',
    color: 'red',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    isPaid: false,
    includeInReports: false,
    allowDownloads: false,
    sortOrder: 2,
  },
  {
    name: 'Payment Failed',
    slug: 'PAYMENT_FAILED',
    description: 'Payment processing encountered an error',
    icon: 'AlertCircle',
    color: 'red',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    isPaid: false,
    includeInReports: false,
    allowDownloads: false,
    sortOrder: 3,
  },
  {
    name: 'Paid',
    slug: 'PAID',
    description: 'Payment received and confirmed',
    icon: 'DollarSign',
    color: 'green',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 4,
  },
  {
    name: 'Confirmation',
    slug: 'CONFIRMATION',
    description: 'Order confirmed and ready for production',
    icon: 'CheckCircle',
    color: 'blue',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 5,
  },
  {
    name: 'On Hold',
    slug: 'ON_HOLD',
    description: 'Order has an issue that needs resolution',
    icon: 'AlertCircle',
    color: 'orange',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: false,
    sortOrder: 6,
  },
  {
    name: 'Processing',
    slug: 'PROCESSING',
    description: 'Order is being processed',
    icon: 'Package',
    color: 'purple',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 7,
  },
  {
    name: 'Printing',
    slug: 'PRINTING',
    description: 'Order is currently being printed',
    icon: 'Package',
    color: 'purple',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 8,
  },
  {
    name: 'Production',
    slug: 'PRODUCTION',
    description: 'Order is in production',
    icon: 'Package',
    color: 'purple',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 9,
  },
  {
    name: 'Shipped',
    slug: 'SHIPPED',
    description: 'Order has been shipped',
    icon: 'Truck',
    color: 'teal',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 10,
  },
  {
    name: 'Ready for Pickup',
    slug: 'READY_FOR_PICKUP',
    description: 'Order is ready to be picked up',
    icon: 'Package',
    color: 'cyan',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 11,
  },
  {
    name: 'On The Way',
    slug: 'ON_THE_WAY',
    description: 'Order is on the way for delivery',
    icon: 'Truck',
    color: 'indigo',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 12,
  },
  {
    name: 'Picked Up',
    slug: 'PICKED_UP',
    description: 'Order has been picked up by customer',
    icon: 'CheckCircle',
    color: 'green',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 13,
  },
  {
    name: 'Delivered',
    slug: 'DELIVERED',
    description: 'Order successfully delivered',
    icon: 'CheckCircle',
    color: 'emerald',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: true,
    sortOrder: 14,
  },
  {
    name: 'Reprint',
    slug: 'REPRINT',
    description: 'Order needs to be reprinted',
    icon: 'AlertCircle',
    color: 'yellow',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    isPaid: true,
    includeInReports: true,
    allowDownloads: false,
    sortOrder: 15,
  },
  {
    name: 'Cancelled',
    slug: 'CANCELLED',
    description: 'Order has been cancelled',
    icon: 'XCircle',
    color: 'gray',
    badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    isPaid: false,
    includeInReports: false,
    allowDownloads: false,
    sortOrder: 16,
  },
  {
    name: 'Refunded',
    slug: 'REFUNDED',
    description: 'Order has been refunded',
    icon: 'DollarSign',
    color: 'red',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    isPaid: false,
    includeInReports: false,
    allowDownloads: false,
    sortOrder: 17,
  },
]

// Default status transitions (based on existing implementation)
const STATUS_TRANSITIONS = [
  { from: 'PENDING_PAYMENT', to: 'PAYMENT_DECLINED' },
  { from: 'PENDING_PAYMENT', to: 'PAYMENT_FAILED' },
  { from: 'PENDING_PAYMENT', to: 'PAID' },
  { from: 'PENDING_PAYMENT', to: 'CONFIRMATION' },
  { from: 'PENDING_PAYMENT', to: 'CANCELLED' },

  { from: 'PAYMENT_DECLINED', to: 'PENDING_PAYMENT' },
  { from: 'PAYMENT_DECLINED', to: 'CANCELLED' },

  { from: 'PAYMENT_FAILED', to: 'PENDING_PAYMENT' },
  { from: 'PAYMENT_FAILED', to: 'CANCELLED' },

  { from: 'PAID', to: 'CONFIRMATION' },
  { from: 'PAID', to: 'REFUNDED' },

  { from: 'CONFIRMATION', to: 'ON_HOLD' },
  { from: 'CONFIRMATION', to: 'PROCESSING' },
  { from: 'CONFIRMATION', to: 'PRODUCTION' },
  { from: 'CONFIRMATION', to: 'CANCELLED' },

  { from: 'ON_HOLD', to: 'CONFIRMATION' },
  { from: 'ON_HOLD', to: 'PRODUCTION' },
  { from: 'ON_HOLD', to: 'CANCELLED' },

  { from: 'PROCESSING', to: 'PRODUCTION' },
  { from: 'PROCESSING', to: 'ON_HOLD' },

  { from: 'PRINTING', to: 'PRODUCTION' },
  { from: 'PRINTING', to: 'ON_HOLD' },

  { from: 'PRODUCTION', to: 'SHIPPED' },
  { from: 'PRODUCTION', to: 'READY_FOR_PICKUP' },
  { from: 'PRODUCTION', to: 'ON_THE_WAY' },
  { from: 'PRODUCTION', to: 'ON_HOLD' },
  { from: 'PRODUCTION', to: 'REPRINT' },

  { from: 'SHIPPED', to: 'DELIVERED' },
  { from: 'SHIPPED', to: 'REPRINT' },

  { from: 'READY_FOR_PICKUP', to: 'PICKED_UP' },
  { from: 'READY_FOR_PICKUP', to: 'REPRINT' },

  { from: 'ON_THE_WAY', to: 'DELIVERED' },
  { from: 'ON_THE_WAY', to: 'PICKED_UP' },
  { from: 'ON_THE_WAY', to: 'REPRINT' },

  { from: 'PICKED_UP', to: 'REPRINT' },
  { from: 'DELIVERED', to: 'REPRINT' },

  { from: 'REPRINT', to: 'PRODUCTION' },
]

async function main() {
  console.log('🎯 ORDER STATUS MANAGER: Starting migration...\n')

  try {
    // 1. Create core statuses
    console.log('📝 Creating core order statuses...')
    const createdStatuses = new Map<string, string>()

    for (const status of CORE_STATUSES) {
      console.log(`   ✓ Creating: ${status.name} (${status.slug})`)

      const created = await prisma.customOrderStatus.upsert({
        where: { slug: status.slug },
        update: {
          ...status,
          isCore: true, // Mark as core - cannot be deleted
          isActive: true,
        },
        create: {
          ...status,
          isCore: true,
          isActive: true,
        },
      })

      createdStatuses.set(status.slug, created.id)
    }

    console.log(`\n✅ Created ${createdStatuses.size} core statuses\n`)

    // 2. Create status transitions
    console.log('🔀 Creating status transitions...')
    let transitionsCreated = 0

    for (const transition of STATUS_TRANSITIONS) {
      const fromId = createdStatuses.get(transition.from)
      const toId = createdStatuses.get(transition.to)

      if (fromId && toId) {
        await prisma.statusTransition.upsert({
          where: {
            fromStatusId_toStatusId: {
              fromStatusId: fromId,
              toStatusId: toId,
            },
          },
          update: {},
          create: {
            fromStatusId: fromId,
            toStatusId: toId,
            requiresPayment: false,
            requiresAdmin: false,
          },
        })
        transitionsCreated++
      }
    }

    console.log(`✅ Created ${transitionsCreated} status transitions\n`)

    // 3. Verify existing orders still have valid statuses
    console.log('🔍 Validating existing orders...')
    const orderCount = await prisma.order.count()
    const distinctStatuses = await prisma.order.findMany({
      select: { status: true },
      distinct: ['status'],
    })

    console.log(`   Total orders: ${orderCount}`)
    console.log(`   Distinct statuses in use: ${distinctStatuses.length}`)

    const invalidStatuses = distinctStatuses.filter((order) => !createdStatuses.has(order.status))

    if (invalidStatuses.length > 0) {
      console.warn('\n⚠️  WARNING: Found orders with invalid statuses:')
      invalidStatuses.forEach((order) => {
        console.warn(`   - ${order.status}`)
      })
    } else {
      console.log('   ✅ All order statuses are valid\n')
    }

    // 4. Summary
    console.log('\n📊 Migration Summary:')
    console.log(`   • Core Statuses: ${createdStatuses.size}`)
    console.log(`   • Transitions: ${transitionsCreated}`)
    console.log(`   • Orders Validated: ${orderCount}`)
    console.log('\n✅ Migration completed successfully!\n')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
