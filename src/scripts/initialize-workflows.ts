#!/usr/bin/env tsx
/**
 * Initialize Marketing Workflows
 *
 * This script creates and activates the predefined marketing workflows:
 * 1. Welcome Series - Onboards new customers
 * 2. Abandoned Cart Recovery - Recovers abandoned carts
 * 3. Win-Back Campaign - Re-engages inactive customers
 *
 * Run with: npx tsx src/scripts/initialize-workflows.ts
 */

import { PrismaClient } from '@prisma/client'
import { WorkflowEngine } from '../lib/marketing/workflow-engine'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initializing Marketing Workflows...\n')

  try {
    // Check if workflows already exist
    const existingWorkflows = await prisma.marketingWorkflow.count()

    if (existingWorkflows > 0) {
      console.log(`⚠️  Found ${existingWorkflows} existing workflows.`)
      console.log('Do you want to continue? This will create additional workflows.')
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Create predefined workflows
    console.log('📧 Creating predefined workflows...\n')
    await WorkflowEngine.createPredefinedWorkflows()

    console.log('✅ Predefined workflows created successfully!\n')

    // List all workflows
    const workflows = await prisma.marketingWorkflow.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        trigger: true,
      },
    })

    console.log('📋 Workflow Summary:')
    console.log('─'.repeat(80))

    for (const workflow of workflows) {
      const trigger = workflow.trigger as any
      console.log(`\n${workflow.isActive ? '✓' : '○'} ${workflow.name}`)
      console.log(`  ID: ${workflow.id}`)
      console.log(`  Description: ${workflow.description || 'N/A'}`)
      console.log(`  Trigger: ${trigger.type} ${trigger.event ? `(${trigger.event})` : ''}`)
      console.log(`  Status: ${workflow.isActive ? 'ACTIVE' : 'INACTIVE'}`)
    }

    console.log('\n' + '─'.repeat(80))
    console.log(`\n✅ Total Workflows: ${workflows.length}`)
    console.log(`✓ Active: ${workflows.filter(w => w.isActive).length}`)
    console.log(`○ Inactive: ${workflows.filter(w => !w.isActive).length}`)

    console.log('\n📝 Next Steps:')
    console.log('1. Activate workflows using the Admin UI or activate_all_workflows.ts script')
    console.log('2. Test workflows by triggering events (user registration, cart abandonment)')
    console.log('3. Monitor workflow executions in the database')

    console.log('\n✨ Marketing Workflows initialized successfully!\n')

  } catch (error) {
    console.error('❌ Error initializing workflows:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
