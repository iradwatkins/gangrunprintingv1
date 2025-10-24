#!/usr/bin/env tsx
/**
 * Analytics Aggregation Cron Jobs
 *
 * Runs daily to aggregate analytics data into summary tables.
 *
 * Usage:
 *   npx tsx src/scripts/analytics-cron-jobs.ts              # Run all jobs
 *   npx tsx src/scripts/analytics-cron-jobs.ts campaigns    # Run campaign aggregation only
 *   npx tsx src/scripts/analytics-cron-jobs.ts funnels      # Run funnel aggregation only
 *   npx tsx src/scripts/analytics-cron-jobs.ts yesterday    # Aggregate yesterday's data
 *
 * Crontab setup:
 *   # Run daily at 1 AM to aggregate previous day's data
 *   0 1 * * * cd /root/websites/gangrunprinting && npx tsx src/scripts/analytics-cron-jobs.ts >> /var/log/analytics-crons.log 2>&1
 */

import {
  runDailyAggregations,
  aggregateCampaignMetrics,
  aggregateFunnelMetrics,
} from '../lib/analytics/aggregation-service'

async function main() {
  const job = process.argv[2]
  const timeframe = process.argv[3]

  // Determine which date to aggregate
  const targetDate = new Date()

  if (timeframe === 'yesterday') {
    targetDate.setDate(targetDate.getDate() - 1)
  }

  console.log(`\n=== ANALYTICS AGGREGATION JOB ===`)
  console.log(`Date: ${targetDate.toISOString().split('T')[0]}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log(`Job: ${job || 'all'}\n`)

  try {
    switch (job) {
      case 'campaigns':
        console.log('📊 Running campaign analytics aggregation...\n')
        await aggregateCampaignMetrics(targetDate)
        break

      case 'funnels':
        console.log('📊 Running funnel analytics aggregation...\n')
        await aggregateFunnelMetrics(targetDate)
        break

      case 'yesterday':
      case 'all':
      default:
        console.log('📊 Running all analytics aggregations...\n')
        await runDailyAggregations(targetDate)
        break
    }

    console.log(`\n✨ Analytics cron jobs completed successfully!\n`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error running analytics cron jobs:', error)
    process.exit(1)
  }
}

main()
