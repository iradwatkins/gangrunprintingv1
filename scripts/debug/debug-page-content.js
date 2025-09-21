#!/usr/bin/env node

/**
 * Debug script to see what's actually on the product creation page
 */

const { chromium } = require('playwright')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPageContent() {

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

      return
    }

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

    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait a bit for any dynamic content
    await page.waitForTimeout(5000)

    // Check current URL

    // Check page title
    const title = await page.title()

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

    for (const selector of selectors) {
      const count = await page.locator(selector).count()
      if (count > 0) {

      } else {

      }
    }

    // Check for admin verification loading
    const verifyingText = await page
      .locator('text=Verifying admin access..., text=Loading..., text=Please wait...')
      .count()
    if (verifyingText > 0) {

    }

    // Check for error messages
    const errorMessages = await page.locator('.error, .toast-error, [role="alert"]').count()
    if (errorMessages > 0) {

    }

    // Get page content snippet
    const bodyText = await page.locator('body').textContent()
    const snippet = bodyText.substring(0, 500)

    // Check for forms
    const forms = await page.locator('form').count()

    // Check for specific admin UI elements
    const adminElements = [
      'text=Create Product',
      'text=Product Name',
      'text=Description',
      'text=Category',
      'button:has-text("Save")',
      'button:has-text("Create")',
    ]

    for (const selector of adminElements) {
      const count = await page.locator(selector).count()
      if (count > 0) {

      } else {

      }
    }

    // Take a screenshot for manual inspection
    await page.screenshot({ path: '/root/websites/gangrunprinting/debug-page.png', fullPage: true })

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
