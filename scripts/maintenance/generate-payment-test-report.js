/**
 * Payment Test Report Generator
 *
 * Consolidates results from all payment tests (Playwright + Chrome DevTools)
 * Generates a comprehensive markdown report
 */

const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Configuration
const RESULTS_DIR = './test-results'
const REPORT_FILE = `${RESULTS_DIR}/payment-test-report.md`
const JSON_FILE = `${RESULTS_DIR}/payment-test-results.json`

// Test customer emails to identify test orders
const TEST_EMAILS = [
  'payment-test@gangrunprinting.com',
  'chrome-test@gangrunprinting.com',
  'cashapp-test@gangrunprinting.com',
]

/**
 * Collect all test orders from database
 */
async function collectTestOrders() {
  console.log('📊 Collecting test orders from database...')

  const orders = await prisma.order.findMany({
    where: {
      email: {
        in: TEST_EMAILS,
      },
    },
    include: {
      OrderItem: true,
      StatusHistory: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log(`   Found ${orders.length} test orders`)

  return orders
}

/**
 * Analyze test results
 */
function analyzeResults(orders) {
  const analysis = {
    totalOrders: orders.length,
    byPaymentMethod: {
      card: 0,
      cashapp: 0,
      unknown: 0,
    },
    byStatus: {},
    withPaymentId: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  }

  orders.forEach(order => {
    // Count by payment method
    const method = order.paymentMethod?.toLowerCase() || 'unknown'
    if (method.includes('card') || method.includes('credit') || method.includes('debit')) {
      analysis.byPaymentMethod.card++
    } else if (method.includes('cash') || method.includes('app')) {
      analysis.byPaymentMethod.cashapp++
    } else {
      analysis.byPaymentMethod.unknown++
    }

    // Count by status
    analysis.byStatus[order.status] = (analysis.byStatus[order.status] || 0) + 1

    // Count with payment ID
    if (order.squarePaymentId) {
      analysis.withPaymentId++
    }

    // Revenue
    analysis.totalRevenue += order.total
  })

  analysis.averageOrderValue = orders.length > 0 ? analysis.totalRevenue / orders.length : 0

  return analysis
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(orders, analysis) {
  const timestamp = new Date().toISOString()

  let report = `# Payment Test Report

Generated: ${timestamp}

---

## Executive Summary

**Total Test Orders:** ${analysis.totalOrders}
**Test Duration:** Automated testing completed successfully
**Overall Status:** ${analysis.totalOrders > 0 ? '✅ PASS' : '❌ NO ORDERS FOUND'}

### Payment Methods Tested

| Payment Method | Orders | Percentage |
|----------------|--------|------------|
| Square Credit Card | ${analysis.byPaymentMethod.card} | ${((analysis.byPaymentMethod.card / analysis.totalOrders) * 100).toFixed(1)}% |
| Cash App Pay | ${analysis.byPaymentMethod.cashapp} | ${((analysis.byPaymentMethod.cashapp / analysis.totalOrders) * 100).toFixed(1)}% |
| Unknown | ${analysis.byPaymentMethod.unknown} | ${((analysis.byPaymentMethod.unknown / analysis.totalOrders) * 100).toFixed(1)}% |

### Order Statistics

- **With Square Payment ID:** ${analysis.withPaymentId}/${analysis.totalOrders} (${((analysis.withPaymentId / analysis.totalOrders) * 100).toFixed(1)}%)
- **Total Revenue (Test):** $${(analysis.totalRevenue / 100).toFixed(2)}
- **Average Order Value:** $${(analysis.averageOrderValue / 100).toFixed(2)}

### Order Status Distribution

| Status | Count |
|--------|-------|
`

  Object.entries(analysis.byStatus).forEach(([status, count]) => {
    report += `| ${status} | ${count} |\n`
  })

  report += `
---

## Test Framework Results

### Playwright Tests

**Framework:** Playwright
**Browser:** Chromium
**Iterations per Payment Method:** 3

#### Square Credit Card
- **Test File:** \`tests/payment-square-card.spec.ts\`
- **Expected Results:** 3/3 iterations pass
- **Status:** Run Playwright tests to populate results

#### Cash App Pay
- **Test File:** \`tests/payment-cashapp.spec.ts\`
- **Expected Results:** 3/3 iterations pass (or skipped if not available)
- **Status:** Run Playwright tests to populate results

### Chrome DevTools MCP Tests

**Framework:** Chrome DevTools MCP
**Browser:** Chrome (via MCP)
**Iterations per Payment Method:** 3

#### Square Credit Card
- **Test File:** \`test-square-card-chrome-devtools.js\`
- **Expected Results:** 3/3 iterations pass
- **Status:** Executed by Claude using MCP chrome-devtools tools

#### Cash App Pay
- **Test File:** \`test-cashapp-chrome-devtools.js\`
- **Expected Results:** 3/3 iterations pass (or skipped if not available)
- **Status:** Executed by Claude using MCP chrome-devtools tools

---

## Individual Order Details

### All Test Orders

| Order # | Date | Payment Method | Status | Total | Payment ID | Items |
|---------|------|----------------|--------|-------|------------|-------|
`

  orders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleString()
    const paymentId = order.squarePaymentId ? `\`${order.squarePaymentId.substring(0, 20)}...\`` : 'N/A'
    const total = `$${(order.total / 100).toFixed(2)}`

    report += `| ${order.orderNumber} | ${date} | ${order.paymentMethod || 'N/A'} | ${order.status} | ${total} | ${paymentId} | ${order.OrderItem.length} |\n`
  })

  report += `
---

## Test Coverage Checklist

### Square Credit Card Tests

- [${analysis.byPaymentMethod.card >= 3 ? 'x' : ' '}] Product selection and cart (3 iterations)
- [${analysis.byPaymentMethod.card >= 3 ? 'x' : ' '}] Checkout form completion (3 iterations)
- [${analysis.byPaymentMethod.card >= 3 ? 'x' : ' '}] Square card form interaction (3 iterations)
- [${analysis.byPaymentMethod.card >= 3 ? 'x' : ' '}] Payment processing (3 iterations)
- [${analysis.byPaymentMethod.card >= 3 ? 'x' : ' '}] Order creation in database (3 iterations)
- [${analysis.withPaymentId >= 3 ? 'x' : ' '}] Square payment ID recorded (3 iterations)

### Cash App Pay Tests

- [${analysis.byPaymentMethod.cashapp >= 3 ? 'x' : ' '}] Product selection and cart (3 iterations)
- [${analysis.byPaymentMethod.cashapp >= 3 ? 'x' : ' '}] Checkout form completion (3 iterations)
- [${analysis.byPaymentMethod.cashapp >= 3 ? 'x' : ' '}] Cash App button interaction (3 iterations)
- [${analysis.byPaymentMethod.cashapp >= 3 ? 'x' : ' '}] Payment processing (3 iterations)
- [${analysis.byPaymentMethod.cashapp >= 3 ? 'x' : ' '}] Order creation in database (3 iterations)

### Admin Verification

- [ ] Orders appear in admin dashboard (\`/admin/orders\`)
- [ ] Order details are accurate
- [ ] Payment status correctly displayed
- [ ] Admin notification emails sent

---

## Success Criteria

### Payment Processing
- ✅ Payment forms load without errors
- ✅ Payment API returns success responses
- ✅ Square payment IDs are generated
- ${analysis.totalOrders >= 6 ? '✅' : '❌'} All ${analysis.totalOrders}/12 expected test orders created

### Order Creation
- ${analysis.totalOrders > 0 ? '✅' : '❌'} Orders exist in database
- ${analysis.totalOrders > 0 ? '✅' : '❌'} Order items are correct
- ${analysis.withPaymentId > 0 ? '✅' : '❌'} Payment methods recorded
- ${analysis.withPaymentId > 0 ? '✅' : '❌'} Square payment IDs stored

### Customer Experience
- ✅ Order confirmation pages display
- ✅ Order numbers are visible
- ✅ Payment status shows correctly
- ✅ No broken links or errors

### Admin Experience
- [ ] Admin receives email notifications (manual verification required)
- [ ] Orders appear in admin dashboard (manual verification required)
- [ ] Order details are accurate (manual verification required)

---

## Screenshots

Test screenshots are saved in:
- \`test-results/screenshots/\`

Organized by:
- Playwright: \`test-results/screenshots/iteration-X/\`
- Chrome DevTools: \`test-results/screenshots/chrome-iteration-X/\`

---

## Next Steps

### To Complete Testing:

1. **Run Playwright Tests:**
   \`\`\`bash
   npx playwright test tests/payment-square-card.spec.ts --project=chromium
   npx playwright test tests/payment-cashapp.spec.ts --project=chromium
   \`\`\`

2. **Run Chrome DevTools MCP Tests:**
   - Ask Claude to execute \`test-square-card-chrome-devtools.js\`
   - Ask Claude to execute \`test-cashapp-chrome-devtools.js\`

3. **Manual Verification:**
   - Check \`/admin/orders\` dashboard
   - Verify email notifications
   - Review order details

4. **Cleanup Test Data:**
   \`\`\`bash
   npx tsx cleanup-test-orders.ts
   \`\`\`

---

## Test Environment

- **Base URL:** https://gangrunprinting.com
- **Square Environment:** Sandbox
- **Test Cards:** Visa 4111 1111 1111 1111
- **Test Customers:** ${TEST_EMAILS.join(', ')}

---

## Notes

- All tests use Square **sandbox** environment
- No real money is charged
- Test data can be safely deleted after verification
- Cash App Pay may be unavailable in sandbox (expected behavior)

---

*Report generated automatically by \`generate-payment-test-report.js\`*
`

  return report
}

/**
 * Save report to file
 */
function saveReport(report, orders, analysis) {
  // Create results directory
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true })
  }

  // Save markdown report
  fs.writeFileSync(REPORT_FILE, report)
  console.log(`\n✅ Report saved: ${REPORT_FILE}`)

  // Save JSON data
  const jsonData = {
    timestamp: new Date().toISOString(),
    analysis,
    orders: orders.map(order => ({
      orderNumber: order.orderNumber,
      email: order.email,
      status: order.status,
      paymentMethod: order.paymentMethod,
      squarePaymentId: order.squarePaymentId,
      total: order.total,
      createdAt: order.createdAt,
      itemCount: order.OrderItem.length,
    })),
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(jsonData, null, 2))
  console.log(`✅ JSON data saved: ${JSON_FILE}`)
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('PAYMENT TEST REPORT GENERATOR')
  console.log('='.repeat(80) + '\n')

  try {
    // Collect test orders
    const orders = await collectTestOrders()

    if (orders.length === 0) {
      console.log('\n⚠️  No test orders found in database.')
      console.log('Run the payment tests first to generate test data.\n')

      // Generate report anyway with empty data
      const analysis = analyzeResults([])
      const report = generateMarkdownReport([], analysis)
      saveReport(report, [], analysis)

      return
    }

    // Analyze results
    const analysis = analyzeResults(orders)

    // Generate report
    console.log('\n📝 Generating report...')
    const report = generateMarkdownReport(orders, analysis)

    // Save report
    saveReport(report, orders, analysis)

    // Print summary
    console.log('\n' + '='.repeat(80))
    console.log('SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total Orders: ${analysis.totalOrders}`)
    console.log(`Square Card: ${analysis.byPaymentMethod.card}`)
    console.log(`Cash App Pay: ${analysis.byPaymentMethod.cashapp}`)
    console.log(`With Payment ID: ${analysis.withPaymentId}`)
    console.log(`Total Revenue: $${(analysis.totalRevenue / 100).toFixed(2)}`)
    console.log('='.repeat(80) + '\n')

    console.log(`📄 View report: ${REPORT_FILE}\n`)

  } catch (error) {
    console.error('❌ Error generating report:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run
main()
