#!/usr/bin/env node

/**
 * Debug script to see what's actually on the product creation page
 */

const { chromium } = require('playwright')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPageContent() {
  console.log('🔍 Debugging product creation page content...')

  let browser
  try {
    // Get the latest admin session
    const session = await prisma.session.findFirst({
      where: {
        user: {
          role: 'ADMIN',
        },
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!session) {
      console.log('❌ No valid admin session found')
      return
    }

    console.log(`✅ Using session: ${session.id.substring(0, 10)}...`)

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: {
        cookies: [
          {
            name: 'auth_session',
            value: session.id,
            domain: '.gangrunprinting.com',
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            secure: true,
          },
        ],
      },
    })

    const page = await context.newPage()

    // Navigate to product creation page
    console.log('📄 Loading product creation page...')
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait a bit for any dynamic content
    await page.waitForTimeout(5000)

    // Check current URL
    console.log(`📍 Current URL: ${page.url()}`)

    // Check page title
    const title = await page.title()
    console.log(`📋 Page title: ${title}`)

    // Look for various input selectors
    const selectors = [
      '#name',
      'input[name="name"]',
      'input[placeholder*="name"]',
      'input[placeholder*="Name"]',
      'input[type="text"]',
      '.form-control',
      '.input',
      'input',
      '[data-testid="product-name"]',
    ]

    console.log('\n🔍 Checking for input selectors:')
    for (const selector of selectors) {
      const count = await page.locator(selector).count()
      if (count > 0) {
        console.log(`   ✅ Found ${count} elements for: ${selector}`)
      } else {
        console.log(`   ❌ Not found: ${selector}`)
      }
    }

    // Check for admin verification loading
    const verifyingText = await page
      .locator('text=Verifying admin access..., text=Loading..., text=Please wait...')
      .count()
    if (verifyingText > 0) {
      console.log('\n⚠️  Page shows loading/verification state')
    }

    // Check for error messages
    const errorMessages = await page.locator('.error, .toast-error, [role="alert"]').count()
    if (errorMessages > 0) {
      console.log(`\n❌ Found ${errorMessages} error message(s)`)
    }

    // Get page content snippet
    const bodyText = await page.locator('body').textContent()
    const snippet = bodyText.substring(0, 500)
    console.log(`\n📄 Page content snippet:\n${snippet}...`)

    // Check for forms
    const forms = await page.locator('form').count()
    console.log(`\n📝 Found ${forms} form(s) on page`)

    // Check for specific admin UI elements
    const adminElements = [
      'text=Create Product',
      'text=Product Name',
      'text=Description',
      'text=Category',
      'button:has-text("Save")',
      'button:has-text("Create")',
    ]

    console.log('\n🎯 Checking for admin UI elements:')
    for (const selector of adminElements) {
      const count = await page.locator(selector).count()
      if (count > 0) {
        console.log(`   ✅ Found: ${selector}`)
      } else {
        console.log(`   ❌ Not found: ${selector}`)
      }
    }

    // Take a screenshot for manual inspection
    await page.screenshot({ path: '/root/websites/gangrunprinting/debug-page.png', fullPage: true })
    console.log('\n📸 Screenshot saved: /root/websites/gangrunprinting/debug-page.png')
  } catch (error) {
    console.error(`❌ Debug failed: ${error.message}`)
  } finally {
    if (browser) {
      await browser.close()
    }
    await prisma.$disconnect()
  }
}

debugPageContent().catch(console.error)
