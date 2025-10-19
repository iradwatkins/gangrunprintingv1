#!/usr/bin/env tsx
/**
 * Daily SEO Health Check
 *
 * Runs at 3am daily via cron job
 * - Tracks Google Search Console rankings
 * - Detects ranking drops and traffic changes
 * - Sends email alerts for critical issues
 * - Updates admin dashboard
 *
 * Usage:
 *   npx tsx scripts/daily-seo-check.ts
 *
 * Cron setup:
 *   0 3 * * * cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts
 */

import {
  trackAllProductsSEO,
  generateDailySEOReport,
  isGSCConfigured,
} from '../src/lib/seo/google-search-console'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SLACK_WEBHOOK_URL = process.env.SEO_SLACK_WEBHOOK_URL

async function sendSEOAlertEmail(report: any) {
  const criticalCount = report.criticalIssues
  const highCount = report.highIssues
  const totalIssues = criticalCount + highCount

  if (totalIssues === 0) {
    console.log('✅ No critical issues - skipping email')
    return
  }

  const subject =
    criticalCount > 0
      ? `🚨 SEO CRITICAL: ${criticalCount} issues need immediate attention`
      : `⚠️ SEO Alert: ${highCount} issues need attention this week`

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .alert { background: white; margin: 15px 0; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px; }
    .alert.high { border-left-color: #f59e0b; }
    .alert.medium { border-left-color: #3b82f6; }
    .alert.good { border-left-color: #10b981; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #dc2626; }
    .stat-label { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Daily SEO Health Report</h1>
      <p style="margin: 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${report.criticalIssues}</div>
          <div class="stat-label">Critical Issues</div>
        </div>
        <div class="stat">
          <div class="stat-number">${report.highIssues}</div>
          <div class="stat-label">High Priority</div>
        </div>
        <div class="stat">
          <div class="stat-number" style="color: #10b981;">${report.improvements}</div>
          <div class="stat-label">Improvements</div>
        </div>
      </div>

      <h2>🔴 Action Required</h2>
      ${report.productReports
        .filter((p: any) =>
          p.alerts.some((a: any) => a.severity === 'CRITICAL' || a.severity === 'HIGH')
        )
        .map((product: any) => {
          const criticalAlerts = product.alerts.filter((a: any) => a.severity === 'CRITICAL')
          const highAlerts = product.alerts.filter((a: any) => a.severity === 'HIGH')

          return `
            <div class="alert ${criticalAlerts.length > 0 ? 'critical' : 'high'}">
              <h3 style="margin-top: 0;">📦 ${product.productName}</h3>
              ${criticalAlerts
                .map(
                  (alert: any) => `
                <p><strong>🔴 CRITICAL:</strong> ${alert.suggestion}</p>
              `
                )
                .join('')}
              ${highAlerts
                .map(
                  (alert: any) => `
                <p><strong>🟡 HIGH:</strong> ${alert.suggestion}</p>
              `
                )
                .join('')}
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                <strong>URL:</strong> /products/${product.slug}
              </p>
            </div>
          `
        })
        .join('')}

      ${
        report.improvements > 0
          ? `
        <h2>✅ Good News</h2>
        ${report.productReports
          .filter((p: any) => p.alerts.some((a: any) => a.type === 'RANKING_IMPROVE'))
          .slice(0, 3)
          .map((product: any) => {
            const improvements = product.alerts.filter((a: any) => a.type === 'RANKING_IMPROVE')
            return `
              <div class="alert good">
                <p><strong>📈 ${product.productName}:</strong> ${improvements[0].suggestion}</p>
              </div>
            `
          })
          .join('')}
      `
          : ''
      }

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://gangrunprinting.com/admin/seo/performance" class="button">
          View Full SEO Dashboard
        </a>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
        This is an automated report from GangRun Printing SEO Monitoring System<br>
        To stop receiving these alerts, update your notification preferences in the admin panel
      </p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await resend.emails.send({
      from: 'SEO Alerts <seo@gangrunprinting.com>',
      to: [process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'],
      subject,
      html: emailHtml,
    })

    console.log(`✅ Alert email sent to ${process.env.ADMIN_EMAIL}`)
  } catch (error) {
    console.error('❌ Failed to send email:', error)
  }
}

async function sendSlackAlert(report: any) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  Slack webhook not configured - skipping Slack notification')
    return
  }

  const criticalCount = report.criticalIssues
  const highCount = report.highIssues
  const totalIssues = criticalCount + highCount

  if (totalIssues === 0) {
    return // No alerts needed
  }

  const criticalProducts = report.productReports
    .filter((p: any) => p.alerts.some((a: any) => a.severity === 'CRITICAL'))
    .slice(0, 3)

  const message = {
    text: `🚨 SEO Alert: ${criticalCount} critical, ${highCount} high priority issues`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Daily SEO Health Report',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Critical Issues:*\n${criticalCount}`,
          },
          {
            type: 'mrkdwn',
            text: `*High Priority:*\n${highCount}`,
          },
          {
            type: 'mrkdwn',
            text: `*Improvements:*\n${report.improvements} ✅`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Products:*\n${report.totalProducts}`,
          },
        ],
      },
      ...(criticalProducts.length > 0
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*🔴 Top Issues:*\n${criticalProducts
                  .map((p: any) => {
                    const alert = p.alerts.find((a: any) => a.severity === 'CRITICAL')
                    return `• *${p.productName}*: ${alert?.suggestion}`
                  })
                  .join('\n')}`,
              },
            },
          ]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Full Report',
              emoji: true,
            },
            url: 'https://gangrunprinting.com/admin/seo/performance',
            style: 'primary',
          },
        ],
      },
    ],
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (response.ok) {
      console.log('✅ Slack alert sent successfully')
    } else {
      console.error('❌ Slack alert failed:', await response.text())
    }
  } catch (error) {
    console.error('❌ Failed to send Slack alert:', error)
  }
}

async function main() {
  console.log('🔍 Starting daily SEO health check...')
  console.log(`📅 Date: ${new Date().toISOString()}`)

  // Check if Google Search Console is configured
  if (!isGSCConfigured()) {
    console.log('⚠️  Google Search Console not configured')
    console.log('   Add credentials to .env:')
    console.log('   - GOOGLE_SEARCH_CONSOLE_CLIENT_ID')
    console.log('   - GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET')
    console.log('   - GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN')
    console.log('')
    console.log('   See: docs/GOOGLE-SEARCH-CONSOLE-SETUP.md')
    process.exit(1)
  }

  try {
    // Track all products
    console.log('\n📊 Tracking SEO metrics for all products...')
    const trackingResults = await trackAllProductsSEO()

    console.log(`\n✅ Tracking complete:`)
    console.log(`   - Products tracked: ${trackingResults.length}`)
    console.log(`   - Successful: ${trackingResults.filter((r) => r.success).length}`)
    console.log(`   - Failed: ${trackingResults.filter((r) => !r.success).length}`)

    // Generate daily report
    console.log('\n📋 Generating daily report...')
    const report = await generateDailySEOReport()

    console.log('\n📊 Report Summary:')
    console.log(`   - Total products: ${report.totalProducts}`)
    console.log(`   - Critical issues: ${report.criticalIssues}`)
    console.log(`   - High priority: ${report.highIssues}`)
    console.log(`   - Medium issues: ${report.mediumIssues}`)
    console.log(`   - Improvements: ${report.improvements}`)

    // Send notifications if action needed
    if (report.criticalIssues > 0 || report.highIssues > 0) {
      console.log('\n📧 Sending notifications...')
      await Promise.all([sendSEOAlertEmail(report), sendSlackAlert(report)])
    } else {
      console.log('\n✅ No critical issues - notifications not sent')
    }

    console.log('\n✨ Daily SEO check complete!')
  } catch (error) {
    console.error('\n❌ SEO check failed:', error)
    process.exit(1)
  }
}

main()
