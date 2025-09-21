#!/usr/bin/env node

/**
 * Debug script to create and test lucia session properly
 */

const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')
const { chromium } = require('playwright')

const prisma = new PrismaClient()

async function debugLuciaSession() {

  try {
    // Initialize lucia exactly like in the app
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

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    if (!adminUser) {

      return
    }

    // Create a fresh session using lucia

    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    console.log('✅ Session created:', session.id.substring(0, 10) + '...')

    console.log('- Value:', sessionCookie.value.substring(0, 10) + '...')

    // Test session validation immediately

    const validationResult = await lucia.validateSession(session.id)

    if (validationResult.user) {
      console.log('- User:', validationResult.user.email, '(' + validationResult.user.role + ')')
    }

    // Test with browser

    const browser = await chromium.launch({
      headless: true,
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

    // Test auth endpoint

    await page.goto('https://gangrunprinting.com/api/auth/me')
    const responseText = await page.textContent('body')

    // Test admin page

    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await page.waitForTimeout(5000)

    const nameInput = await page.locator('#name').count()

    const loadingText = await page.locator('text=Verifying admin access...').count()

    await page.screenshot({
      path: '/root/websites/gangrunprinting/debug-lucia-test.png',
      fullPage: true,
    })

    await browser.close()
  } catch (error) {
    console.error(`❌ Debug failed: ${error.message}`)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugLuciaSession().catch(console.error)
