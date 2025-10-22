#!/usr/bin/env tsx
/**
 * Activate All Marketing Workflows
 *
 * This script activates ALL marketing workflows in the database.
 * Use with caution - only run when you're ready to go live with email automation.
 *
 * Run with: npx tsx src/scripts/activate-all-workflows.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⚡ Activating All Marketing Workflows...\n')

  try {
    // Get all workflows
    const workflows = await prisma.marketingWorkflow.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    })

    if (workflows.length === 0) {
      console.log('⚠️  No workflows found. Run initialize-workflows.ts first.')
      return
    }

    console.log(`Found ${workflows.length} workflows:\n`)
    workflows.forEach((w, i) => {
      console.log(`${i + 1}. ${w.isActive ? '✓' : '○'} ${w.name}`)
    })

    console.log('\n⚠️  WARNING: This will activate ALL workflows and start sending emails!')
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Activate all workflows
    const result = await prisma.marketingWorkflow.updateMany({
      where: {},
      data: {
        isActive: true,
      },
    })

    console.log(`\n✅ Activated ${result.count} workflows successfully!\n`)

    // Verify activation
    const activeWorkflows = await prisma.marketingWorkflow.findMany({
      where: { isActive: true },
      select: {
        name: true,
        trigger: true,
      },
    })

    console.log('📧 Active Workflows:')
    console.log('─'.repeat(80))

    for (const workflow of activeWorkflows) {
      const trigger = workflow.trigger as any
      console.log(`✓ ${workflow.name}`)
      console.log(`  Trigger: ${trigger.event || trigger.schedule?.type || trigger.condition?.field}`)
    }

    console.log('\n' + '─'.repeat(80))
    console.log(`\n✨ ${activeWorkflows.length} workflows are now ACTIVE and ready to send emails!\n`)

  } catch (error) {
    console.error('❌ Error activating workflows:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
