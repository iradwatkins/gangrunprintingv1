#!/usr/bin/env tsx
/**
 * Workflow Cron Jobs
 *
 * Automated tasks for marketing workflow triggers:
 * - Abandoned cart detection (run hourly)
 * - Inactive customer detection (run daily)
 *
 * Set up in crontab or use this with node-cron
 */

import { checkAbandonedCarts, checkInactiveCustomers } from '../lib/marketing/workflow-events'

const job = process.argv[2]

async function main() {
  console.log(`\n🤖 Running workflow cron job: ${job || 'ALL'}\n`)

  if (!job || job === 'abandoned-carts') {
    console.log('📧 Checking for abandoned carts...')
    await checkAbandonedCarts()
    console.log('✅ Abandoned cart check complete\n')
  }

  if (!job || job === 'inactive-customers') {
    console.log('💤 Checking for inactive customers...')
    await checkInactiveCustomers()
    console.log('✅ Inactive customer check complete\n')
  }

  console.log('✨ Workflow cron jobs completed successfully!\n')
}

main()
  .catch((error) => {
    console.error('❌ Error running workflow cron jobs:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
