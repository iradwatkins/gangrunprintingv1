/**
 * Workflow Event Integration
 *
 * This module connects your order/user lifecycle events to the FunnelKit workflow engine.
 * Call these functions from your order creation, checkout, and user management code.
 */

import { WorkflowEngine } from './workflow-engine'
import { prisma } from '@/lib/prisma'

/**
 * Trigger when a new user registers
 * Activates: Welcome Series workflow
 */
export async function triggerUserRegistered(userId: string) {
  try {
    await WorkflowEngine.handleEvent('user_registered', {
      userId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to trigger user_registered workflow:', error)
  }
}

/**
 * Trigger when a user places an order
 * Activates: Post-purchase workflows, review requests
 */
export async function triggerOrderPlaced(userId: string, orderId: string, orderData: any) {
  try {
    await WorkflowEngine.handleEvent('order_placed', {
      userId,
      orderId,
      orderNumber: orderData.orderNumber,
      total: orderData.total,
      items: orderData.items,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to trigger order_placed workflow:', error)
  }
}

/**
 * Trigger when a cart is abandoned (no checkout for 1 hour)
 * Activates: Abandoned Cart Recovery workflow
 *
 * Call this from a cron job that checks for abandoned carts
 */
export async function triggerCartAbandoned(userId: string, cartData: any) {
  try {
    await WorkflowEngine.handleEvent('cart_abandoned', {
      userId,
      cartItems: cartData.items,
      cartTotal: cartData.total,
      abandonedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to trigger cart_abandoned workflow:', error)
  }
}

/**
 * Trigger when a user hasn't ordered in 90 days
 * Activates: Win-Back Campaign workflow
 *
 * Call this from a daily cron job
 */
export async function triggerInactiveCustomer(userId: string, daysSinceLastOrder: number) {
  try {
    await WorkflowEngine.handleEvent('customer_inactive', {
      userId,
      daysSinceLastOrder,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to trigger customer_inactive workflow:', error)
  }
}

/**
 * Trigger when an email is opened (requires email tracking)
 * Activates: Follow-up workflows based on engagement
 */
export async function triggerEmailOpened(userId: string, campaignId: string) {
  try {
    await WorkflowEngine.handleEvent('email_opened', {
      userId,
      campaignId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to trigger email_opened workflow:', error)
  }
}

/**
 * Daily cron job: Check for abandoned carts
 * Run this every hour to identify carts abandoned > 1 hour ago
 */
export async function checkAbandonedCarts() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  try {
    // Find cart sessions abandoned > 1 hour ago with no recent orders
    const abandonedCarts = await prisma.cartSession.findMany({
      where: {
        updatedAt: {
          lte: oneHourAgo,
        },
        items: {
          not: null,
        },
      },
      select: {
        id: true,
        userId: true,
        items: true,
        updatedAt: true,
        User: {
          select: {
            id: true,
            email: true,
            marketingOptIn: true,
            Order: {
              where: {
                createdAt: {
                  gte: oneHourAgo,
                },
              },
              take: 1,
            },
          },
        },
      },
    })

    // Filter to only users who haven't ordered recently and are opted into marketing
    const eligibleCarts = abandonedCarts.filter(
      (cart) => cart.User && cart.User.marketingOptIn && cart.User.Order.length === 0
    )

    for (const cart of eligibleCarts) {
      if (cart.userId && cart.items) {
        await triggerCartAbandoned(cart.userId, cart.items as any)
      }
    }

    console.log(
      `✅ Checked ${abandonedCarts.length} abandoned carts, ${eligibleCarts.length} eligible for workflow`
    )
  } catch (error) {
    console.error('Error checking abandoned carts:', error)
  }
}

/**
 * Daily cron job: Check for inactive customers
 * Run this daily to identify customers who haven't ordered in 90+ days
 */
export async function checkInactiveCustomers() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  try {
    // Find users whose last order was 90+ days ago
    const users = await prisma.user.findMany({
      where: {
        Order: {
          some: {},
        },
      },
      include: {
        Order: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    const inactiveUsers = users.filter((user) => {
      const lastOrder = user.Order[0]
      return lastOrder && lastOrder.createdAt < ninetyDaysAgo
    })

    for (const user of inactiveUsers) {
      const daysSinceLastOrder = Math.floor(
        (Date.now() - user.Order[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      await triggerInactiveCustomer(user.id, daysSinceLastOrder)
    }

    console.log(`✅ Checked ${inactiveUsers.length} inactive customers`)
  } catch (error) {
    console.error('Error checking inactive customers:', error)
  }
}

/**
 * Integration Points for Your Existing Code
 *
 * Add these calls to your existing code:
 *
 * 1. User Registration (src/app/api/auth/signup/route.ts or similar):
 *    ```ts
 *    import { triggerUserRegistered } from '@/lib/marketing/workflow-events'
 *    // After user creation:
 *    await triggerUserRegistered(newUser.id)
 *    ```
 *
 * 2. Order Creation (src/app/api/checkout/route.ts):
 *    ```ts
 *    import { triggerOrderPlaced } from '@/lib/marketing/workflow-events'
 *    // After order creation:
 *    await triggerOrderPlaced(user.id, order.id, order)
 *    ```
 *
 * 3. Set up cron jobs (using cron, node-cron, or system crontab):
 *    ```ts
 *    // Every hour - check abandoned carts
 *    cron.schedule('0 * * * *', async () => {
 *      await checkAbandonedCarts()
 *    })
 *
 *    // Daily at midnight - check inactive customers
 *    cron.schedule('0 0 * * *', async () => {
 *      await checkInactiveCustomers()
 *    })
 *    ```
 */
