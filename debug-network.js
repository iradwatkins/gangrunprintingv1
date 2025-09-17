#!/usr/bin/env node

/**
 * Debug network requests and JavaScript errors
 */

const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { Lucia } = require("lucia");
const { PrismaAdapter } = require("@lucia-auth/adapter-prisma");

const prisma = new PrismaClient();

async function debugNetwork() {
  console.log('🔍 Debugging network requests and JavaScript...');

  let browser;
  try {
    // Create fresh session
    const adapter = new PrismaAdapter(prisma.session, prisma.user);
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === "production" } },
      getUserAttributes: (attributes) => ({
        email: attributes.email,
        name: attributes.name,
        role: attributes.role,
        emailVerified: attributes.emailVerified
      })
    });

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const session = await lucia.createSession(adminUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: {
        cookies: [{
          name: sessionCookie.name,
          value: sessionCookie.value,
          domain: '.gangrunprinting.com',
          path: '/',
          httpOnly: sessionCookie.attributes.httpOnly,
          sameSite: 'Lax',
          secure: sessionCookie.attributes.secure
        }]
      }
    });

    const page = await context.newPage();

    // Track all network requests
    page.on('request', request => {
      if (request.url().includes('/api/auth/me')) {
        console.log('🌐 [REQUEST]:', request.method(), request.url());
        console.log('🍪 [REQUEST COOKIES]:', request.headers()['cookie'] || 'none');
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/auth/me')) {
        console.log('📡 [RESPONSE]:', response.status(), response.statusText());
        console.log('📋 [RESPONSE URL]:', response.url());
      }
    });

    // Track all console messages
    page.on('console', msg => {
      console.log(`🖥️  [BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    });

    // Track JavaScript errors
    page.on('pageerror', error => {
      console.log('❌ [JS ERROR]:', error.message);
      console.log('📍 [STACK]:', error.stack);
    });

    // Navigate and wait for completion
    console.log('🔍 Navigating to admin products page...');
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait and check what happens
    console.log('⏳ Waiting 15 seconds for all activity...');
    await page.waitForTimeout(15000);

    // Check final state
    const nameInput = await page.locator('#name').count();
    const loadingText = await page.locator('text=Verifying admin access...').count();
    const title = await page.title();

    console.log('📋 Final Results:');
    console.log('- Page title:', title);
    console.log('- Name input found:', nameInput > 0);
    console.log('- Still loading:', loadingText > 0);
    console.log('- Current URL:', page.url());

    // Check if there are any React hydration errors
    const bodyText = await page.textContent('body');
    console.log('📄 Body content preview:', bodyText.substring(0, 200) + '...');

    await page.screenshot({ path: '/root/websites/gangrunprinting/debug-network.png', fullPage: true });

  } catch (error) {
    console.error(`❌ Debug failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

debugNetwork().catch(console.error);