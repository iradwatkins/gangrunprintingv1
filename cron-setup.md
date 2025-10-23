# Marketing Workflow Cron Jobs

## Setup Instructions

Add these lines to your system crontab to run the marketing workflow automation:

```bash
# Edit crontab
crontab -e
```

Add these entries:

```cron
# Abandoned Cart Check - Every hour
0 * * * * npx tsx src/scripts/workflow-cron-jobs.ts abandoned-carts >> /var/log/workflow-crons.log 2>&1

# Inactive Customer Check - Daily at midnight
0 0 * * * cd /root/websites/gangrunprinting && npx tsx src/scripts/workflow-cron-jobs.ts inactive-customers >> /var/log/workflow-crons.log 2>&1
```

## Manual Testing

Test abandoned cart check:

```bash
npx tsx src/scripts/workflow-cron-jobs.ts abandoned-carts
```

Test inactive customer check:

```bash
npx tsx src/scripts/workflow-cron-jobs.ts inactive-customers
```

Run all checks:

```bash
npx tsx src/scripts/workflow-cron-jobs.ts
```

## View Logs

```bash
tail -f /var/log/workflow-crons.log
```

## Monitoring

Check if cron jobs are running:

```bash
crontab -l | grep workflow
```

Check recent executions:

```bash
grep "workflow cron" /var/log/workflow-crons.log | tail -20
```
