#!/usr/bin/env node

/**
 * Test admin page with console debugging
 */

const { chromium } = require('playwright')
const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')

const prisma = new PrismaClient()

async function testAdminPage() {
  let browser
  try {
    // Create fresh session
    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
        },
      },
      getUserAttributes: (attributes) => {
        return {
          email: attributes.email,
          name: attributes.name,
          role: attributes.role,
          emailVerified: attributes.emailVerified,
        }
      },
    })

    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!adminUser) {
      return
    }

    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    console.log('✅ Session created:', session.id.substring(0, 10) + '...')

    browser = await chromium.launch({
      headless: true, // Server environment
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: {
        cookies: [
          {
            name: sessionCookie.name,
            value: sessionCookie.value,
            domain: '.gangrunprinting.com',
            path: '/',
            httpOnly: sessionCookie.attributes.httpOnly,
            sameSite: 'Lax',
            secure: sessionCookie.attributes.secure,
          },
        ],
      },
    })

    const page = await context.newPage()

    // Enable console logging
    page.on('console', (msg) => {
      const msgType = msg.type()
      const text = msg.text()

      if (text.includes('AdminAuthWrapper')) {
        console.log(`🌐 [BROWSER ${msgType.toUpperCase()}]:`, text)
      }
    })

    page.on('pageerror', (error) => {})

    // Navigate to admin page

    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait for processing

    await page.waitForTimeout(10000)

    // Check if we're still loading or if form is available
    const nameInput = await page.locator('#name').count()
    const loadingText = await page.locator('text=Verifying admin access...').count()

    console.log('- Current URL:', page.url())

    // Take screenshot
    await page.screenshot({
      path: '/root/websites/gangrunprinting/test-admin-debug.png',
      fullPage: true,
    })

    // Complete the test
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`)
  } finally {
    if (browser) {
      await browser.close()
    }
    await prisma.$disconnect()
  }
}

testAdminPage().catch(console.error)
