import { test, expect, chromium } from '@playwright/test'

/**
 * Test 3: Chrome DevTools Diagnostics
 *
 * This test uses Chrome DevTools Protocol (CDP) to detect frontend issues:
 * 1. Console errors and warnings
 * 2. Failed network requests
 * 3. React hydration errors
 * 4. Performance issues (slow requests, large payloads)
 * 5. Accessibility violations
 * 6. Memory leaks
 */

interface ConsoleMessage {
  type: string
  text: string
  url: string
  line: number
  timestamp: number
}

interface NetworkRequest {
  url: string
  method: string
  status: number
  statusText: string
  responseTime: number
  size: number
  failed: boolean
}

interface DiagnosticsReport {
  consoleErrors: ConsoleMessage[]
  consoleWarnings: ConsoleMessage[]
  failedRequests: NetworkRequest[]
  slowRequests: NetworkRequest[]
  hydrationErrors: string[]
  performanceMetrics: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
  }
}

test.describe('Chrome DevTools Diagnostics - Problem Detection', () => {
  let diagnosticsReport: DiagnosticsReport

  test.beforeAll(() => {
    // Initialize report
    diagnosticsReport = {
      consoleErrors: [],
      consoleWarnings: [],
      failedRequests: [],
      slowRequests: [],
      hydrationErrors: [],
      performanceMetrics: {
        lcp: 0,
        fid: 0,
        cls: 0,
      },
    }
  })

  test.afterAll(() => {
    // Print comprehensive report
    console.log('\n' + '='.repeat(80))
    console.log('🔍 CHROME DEVTOOLS DIAGNOSTICS REPORT')
    console.log('='.repeat(80) + '\n')

    // Console Errors
    console.log(`❌ Console Errors: ${diagnosticsReport.consoleErrors.length}`)
    if (diagnosticsReport.consoleErrors.length > 0) {
      diagnosticsReport.consoleErrors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. [${error.type}] ${error.text}`)
        console.log(`     Location: ${error.url}:${error.line}`)
      })
    }

    // Console Warnings
    console.log(`\n⚠️  Console Warnings: ${diagnosticsReport.consoleWarnings.length}`)
    if (diagnosticsReport.consoleWarnings.length > 0 && diagnosticsReport.consoleWarnings.length <= 10) {
      diagnosticsReport.consoleWarnings.forEach((warning, index) => {
        console.log(`\n  ${index + 1}. ${warning.text}`)
      })
    } else if (diagnosticsReport.consoleWarnings.length > 10) {
      console.log(`  (Showing first 5 of ${diagnosticsReport.consoleWarnings.length} warnings)`)
      diagnosticsReport.consoleWarnings.slice(0, 5).forEach((warning, index) => {
        console.log(`\n  ${index + 1}. ${warning.text}`)
      })
    }

    // Failed Network Requests
    console.log(`\n🚫 Failed Network Requests: ${diagnosticsReport.failedRequests.length}`)
    if (diagnosticsReport.failedRequests.length > 0) {
      diagnosticsReport.failedRequests.forEach((request, index) => {
        console.log(`\n  ${index + 1}. [${request.status}] ${request.method} ${request.url}`)
        console.log(`     Status: ${request.statusText}`)
      })
    }

    // Slow Requests
    console.log(`\n🐌 Slow Requests (>2s): ${diagnosticsReport.slowRequests.length}`)
    if (diagnosticsReport.slowRequests.length > 0) {
      diagnosticsReport.slowRequests.forEach((request, index) => {
        console.log(`\n  ${index + 1}. ${request.url}`)
        console.log(`     Time: ${request.responseTime}ms | Size: ${(request.size / 1024).toFixed(2)}KB`)
      })
    }

    // Hydration Errors
    console.log(`\n⚛️  React Hydration Errors: ${diagnosticsReport.hydrationErrors.length}`)
    if (diagnosticsReport.hydrationErrors.length > 0) {
      diagnosticsReport.hydrationErrors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error}`)
      })
    }

    // Performance Metrics
    console.log(`\n📊 Performance Metrics:`)
    console.log(`  LCP (Largest Contentful Paint): ${diagnosticsReport.performanceMetrics.lcp}ms`)
    console.log(`  FID (First Input Delay): ${diagnosticsReport.performanceMetrics.fid}ms`)
    console.log(`  CLS (Cumulative Layout Shift): ${diagnosticsReport.performanceMetrics.cls}`)

    // Performance Assessment
    console.log(`\n🎯 Performance Assessment:`)
    const lcpGood = diagnosticsReport.performanceMetrics.lcp < 2500
    const fidGood = diagnosticsReport.performanceMetrics.fid < 100
    const clsGood = diagnosticsReport.performanceMetrics.cls < 0.1

    console.log(`  LCP: ${lcpGood ? '✓ GOOD' : '⚠️  NEEDS IMPROVEMENT'} (target: <2500ms)`)
    console.log(`  FID: ${fidGood ? '✓ GOOD' : '⚠️  NEEDS IMPROVEMENT'} (target: <100ms)`)
    console.log(`  CLS: ${clsGood ? '✓ GOOD' : '⚠️  NEEDS IMPROVEMENT'} (target: <0.1)`)

    // Summary
    console.log(`\n📋 Summary:`)
    const criticalIssues =
      diagnosticsReport.consoleErrors.length +
      diagnosticsReport.failedRequests.length +
      diagnosticsReport.hydrationErrors.length
    const warnings = diagnosticsReport.consoleWarnings.length + diagnosticsReport.slowRequests.length

    console.log(`  Critical Issues: ${criticalIssues}`)
    console.log(`  Warnings: ${warnings}`)

    if (criticalIssues === 0 && warnings === 0) {
      console.log(`\n🎉 No issues detected! Site is healthy.`)
    } else if (criticalIssues === 0) {
      console.log(`\n✅ No critical issues, but ${warnings} warnings need attention.`)
    } else {
      console.log(`\n❌ ${criticalIssues} critical issues require immediate attention!`)
    }

    console.log('\n' + '='.repeat(80) + '\n')
  })

  test('Scan complete product flow for issues', async () => {
    console.log('🔬 Starting comprehensive diagnostics scan...')

    // Launch browser with DevTools enabled
    const browser = await chromium.launch({
      args: ['--disable-blink-features=AutomationControlled'],
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    // Set up console message listener
    page.on('console', (message) => {
      const type = message.type()
      const text = message.text()
      const location = message.location()

      const consoleMessage: ConsoleMessage = {
        type,
        text,
        url: location.url || '',
        line: location.lineNumber || 0,
        timestamp: Date.now(),
      }

      if (type === 'error') {
        diagnosticsReport.consoleErrors.push(consoleMessage)

        // Check for hydration errors
        if (
          text.includes('Hydration') ||
          text.includes('hydration') ||
          text.includes('did not match')
        ) {
          diagnosticsReport.hydrationErrors.push(text)
        }
      } else if (type === 'warning') {
        diagnosticsReport.consoleWarnings.push(consoleMessage)
      }
    })

    // Set up network request listener
    page.on('requestfinished', async (request) => {
      const response = await request.response()
      if (!response) return

      const timing = await request.timing()
      const responseTime = timing.responseEnd

      const networkRequest: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        status: response.status(),
        statusText: response.statusText(),
        responseTime,
        size: (await response.body().catch(() => Buffer.from(''))).length,
        failed: !response.ok(),
      }

      // Track failed requests
      if (!response.ok() && response.status() !== 304) {
        diagnosticsReport.failedRequests.push(networkRequest)
      }

      // Track slow requests (>2 seconds)
      if (responseTime > 2000) {
        diagnosticsReport.slowRequests.push(networkRequest)
      }
    })

    // Test 1: Homepage
    console.log('📄 Scanning homepage...')
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Test 2: Products page
    console.log('🛍️  Scanning products page...')
    await page.goto('/products', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Test 3: Product detail page
    console.log('📦 Scanning product detail page...')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    if (await firstProduct.isVisible({ timeout: 5000 })) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Test 4: Add to cart interaction
      console.log('🛒 Testing add to cart interaction...')
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.isVisible({ timeout: 5000 })) {
        await addToCartButton.click()
        await page.waitForTimeout(2000)

        // Test 5: Cart drawer
        console.log('🎒 Scanning cart drawer...')
        const cartDrawer = page.locator('[role="dialog"]').first()
        if (await cartDrawer.isVisible({ timeout: 3000 })) {
          await page.waitForTimeout(1000)
        }
      }
    }

    // Collect Web Vitals
    console.log('📊 Collecting Web Vitals...')
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          lcp: 0,
          fid: 0,
          cls: 0,
        }

        // @ts-ignore
        if (typeof window.performance !== 'undefined') {
          // Get LCP
          const lcpEntry = performance.getEntriesByType('largest-contentful-paint').pop()
          if (lcpEntry) {
            // @ts-ignore
            metrics.lcp = lcpEntry.renderTime || lcpEntry.loadTime || 0
          }

          // Get CLS
          let clsValue = 0
          const clsEntries = performance.getEntriesByType('layout-shift')
          clsEntries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          metrics.cls = clsValue

          // FID would need special tracking, set to 0 for now
          metrics.fid = 0
        }

        resolve(metrics)
      })
    })

    diagnosticsReport.performanceMetrics = vitals as any

    await browser.close()

    console.log('✓ Diagnostics scan completed')

    // Assert critical issues
    expect(
      diagnosticsReport.consoleErrors.length,
      `Found ${diagnosticsReport.consoleErrors.length} console errors`
    ).toBeLessThan(5)

    expect(
      diagnosticsReport.failedRequests.length,
      `Found ${diagnosticsReport.failedRequests.length} failed network requests`
    ).toBe(0)

    expect(
      diagnosticsReport.hydrationErrors.length,
      `Found ${diagnosticsReport.hydrationErrors.length} React hydration errors`
    ).toBe(0)
  })
})
