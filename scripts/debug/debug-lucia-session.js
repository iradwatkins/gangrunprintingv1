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
  console.log('🔍 Debugging lucia session creation and validation...')

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

    console.log('✅ Lucia initialized')
    console.log('📍 Session cookie name:', lucia.sessionCookieName)

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    if (!adminUser) {
      console.log('❌ No admin user found')
      return
    }

    console.log(`✅ Found admin user: ${adminUser.email}`)

    // Create a fresh session using lucia
    console.log('\n🔑 Creating fresh session...')
    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    console.log('✅ Session created:', session.id.substring(0, 10) + '...')
    console.log('📋 Session cookie:')
    console.log('- Name:', sessionCookie.name)
    console.log('- Value:', sessionCookie.value.substring(0, 10) + '...')
    console.log('- Attributes:', sessionCookie.attributes)

    // Test session validation immediately
    console.log('\n🧪 Testing session validation...')
    const validationResult = await lucia.validateSession(session.id)
    console.log('✅ Validation result:')
    console.log('- Session valid:', !!validationResult.session)
    console.log('- User found:', !!validationResult.user)

    if (validationResult.user) {
      console.log('- User:', validationResult.user.email, '(' + validationResult.user.role + ')')
    }

    // Test with browser
    console.log('\n🌐 Testing with browser...')
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
    console.log('🔍 Testing auth endpoint...')
    await page.goto('https://gangrunprinting.com/api/auth/me')
    const responseText = await page.textContent('body')
    console.log('Auth API response:', responseText)

    // Test admin page
    console.log('🔍 Testing admin page...')
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await page.waitForTimeout(5000)

    const nameInput = await page.locator('#name').count()
    console.log('Name input found:', nameInput > 0)

    const loadingText = await page.locator('text=Verifying admin access...').count()
    console.log('Still loading:', loadingText > 0)

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
