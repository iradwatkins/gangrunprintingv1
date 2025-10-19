#!/bin/bash
# Setup Daily SEO Monitoring Cron Job
# This script installs a cron job that runs daily SEO tracking

# Define the cron job
CRON_SCHEDULE="0 2 * * *"  # 2am daily (America/Chicago timezone)
CRON_COMMAND="cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts >> /var/log/gangrun-seo.log 2>&1"
CRON_JOB="$CRON_SCHEDULE $CRON_COMMAND"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "daily-seo-check.ts"; then
    echo "✅ SEO cron job already exists"
    echo "Current cron job:"
    crontab -l | grep "daily-seo-check.ts"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ SEO cron job installed successfully"
    echo "Schedule: Daily at 2:00 AM (America/Chicago)"
    echo "Command: $CRON_COMMAND"
fi

# Create log file if it doesn't exist
touch /var/log/gangrun-seo.log
chmod 644 /var/log/gangrun-seo.log

echo ""
echo "📋 To verify the cron job:"
echo "   crontab -l | grep daily-seo-check"
echo ""
echo "📄 To view logs:"
echo "   tail -f /var/log/gangrun-seo.log"
echo ""
echo "🧪 To test manually:"
echo "   cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts"
