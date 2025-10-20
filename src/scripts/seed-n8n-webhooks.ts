import { prisma } from '../lib/prisma'
import { nanoid } from 'nanoid'

/**
 * Seed N8N Webhooks for Marketing Automation
 *
 * This script creates webhook records that N8N will trigger for real-time automation
 */

async function seedWebhooks() {
  console.log('🔗 Seeding N8N Webhooks...')

  const now = new Date()

  const webhooks = [
    {
      id: nanoid(),
      name: 'Post-Purchase Thank You',
      url: 'http://localhost:5678/webhook/gangrun-order-created',
      trigger: 'order.created',
      description: 'Send thank you email immediately after order payment',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      name: 'Order Delivered Review Request',
      url: 'http://localhost:5678/webhook/gangrun-order-delivered',
      trigger: 'order.delivered',
      description: 'Send review request when order status changes to DELIVERED',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]

  for (const webhook of webhooks) {
    const existing = await prisma.n8NWebhook.findFirst({
      where: { trigger: webhook.trigger },
    })

    if (existing) {
      console.log(`  ⚠️  Webhook already exists: ${webhook.name} (${webhook.trigger})`)
      continue
    }

    await prisma.n8NWebhook.create({
      data: webhook,
    })

    console.log(`  ✅ Created webhook: ${webhook.name}`)
  }

  console.log('\n📊 Webhook Summary:')
  const allWebhooks = await prisma.n8NWebhook.findMany()
  console.log(`  Total webhooks: ${allWebhooks.length}`)
  allWebhooks.forEach((wh) => {
    console.log(`    - ${wh.name} (${wh.trigger}): ${wh.isActive ? '✅ Active' : '❌ Inactive'}`)
  })

  console.log('\n✅ N8N Webhook seeding complete!')
}

seedWebhooks()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error seeding webhooks:', error)
    process.exit(1)
  })
