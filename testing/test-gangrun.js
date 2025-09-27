const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'https://gangrunprinting.com';
const SCREENSHOTS_DIR = './screenshots';

// Helper function to ensure screenshots directory exists
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating screenshots directory:', error);
  }
}

// Main test function
async function testGangRunPrinting() {
  console.log('🚀 Starting GangRun Printing Test Suite');
  console.log('====================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set viewport for desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable console log capturing
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Capture network errors
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    // Test 1: Homepage Load
    console.log('\n📍 Test 1: Loading Homepage');
    const startTime = Date.now();
    const response = await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const loadTime = Date.now() - startTime;

    console.log(`✅ Homepage loaded in ${loadTime}ms`);
    console.log(`   Status: ${response.status()}`);

    // Take screenshot
    await ensureScreenshotsDir();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'homepage.png'),
      fullPage: true
    });
    console.log(`📸 Screenshot saved: homepage.png`);

    // Test 2: Check page title and meta
    const title = await page.title();
    console.log(`\n📍 Test 2: Page Metadata`);
    console.log(`   Title: ${title}`);

    const metaDescription = await page.$eval('meta[name="description"]',
      el => el.content
    ).catch(() => 'No meta description found');
    console.log(`   Meta Description: ${metaDescription}`);

    // Test 3: Navigation Menu
    console.log('\n📍 Test 3: Testing Navigation Menu');
    const navLinks = await page.$$eval('nav a, header a', links =>
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }))
    );

    console.log(`   Found ${navLinks.length} navigation links`);
    navLinks.slice(0, 5).forEach(link => {
      console.log(`   - ${link.text}: ${link.href}`);
    });

    // Test 4: Check for main sections
    console.log('\n📍 Test 4: Checking Main Sections');
    const sections = await page.evaluate(() => {
      const results = {
        hasHeader: !!document.querySelector('header'),
        hasNav: !!document.querySelector('nav'),
        hasFooter: !!document.querySelector('footer'),
        hasContactInfo: !!document.querySelector('[href*="tel:"], [href*="mailto:"]'),
        hasImages: document.querySelectorAll('img').length
      };
      return results;
    });

    console.log(`   Header present: ${sections.hasHeader ? '✅' : '❌'}`);
    console.log(`   Navigation present: ${sections.hasNav ? '✅' : '❌'}`);
    console.log(`   Footer present: ${sections.hasFooter ? '✅' : '❌'}`);
    console.log(`   Contact info present: ${sections.hasContactInfo ? '✅' : '❌'}`);
    console.log(`   Images found: ${sections.hasImages}`);

    // Test 5: Test Services/Products Pages
    console.log('\n📍 Test 5: Testing Service Pages');

    // Look for product/service links
    const serviceLinks = await page.$$eval('a', links =>
      links
        .map(link => ({ text: link.textContent.trim(), href: link.href }))
        .filter(link =>
          link.href.includes('product') ||
          link.href.includes('service') ||
          link.href.includes('print') ||
          link.text.toLowerCase().includes('card') ||
          link.text.toLowerCase().includes('flyer') ||
          link.text.toLowerCase().includes('banner')
        )
        .slice(0, 3)
    );

    for (let i = 0; i < serviceLinks.length; i++) {
      const link = serviceLinks[i];
      console.log(`\n   Testing: ${link.text}`);

      try {
        await page.goto(link.href, {
          waitUntil: 'networkidle2',
          timeout: 15000
        });

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `service-${i + 1}.png`),
          fullPage: false
        });

        console.log(`   ✅ Page loaded successfully`);
        console.log(`   📸 Screenshot saved: service-${i + 1}.png`);
      } catch (error) {
        console.log(`   ❌ Error loading page: ${error.message}`);
      }
    }

    // Test 6: Mobile Responsiveness
    console.log('\n📍 Test 6: Mobile Responsiveness Test');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // iPhone viewport
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-view.png'),
      fullPage: false
    });
    console.log(`   ✅ Mobile view tested`);
    console.log(`   📸 Screenshot saved: mobile-view.png`);

    // Check for mobile menu
    const hasMobileMenu = await page.evaluate(() => {
      const menuButton = document.querySelector('[aria-label*="menu"], button[class*="menu"], [class*="hamburger"], [class*="mobile-menu"]');
      return !!menuButton;
    });
    console.log(`   Mobile menu present: ${hasMobileMenu ? '✅' : '❌'}`);

    // Test 7: Forms and Interactive Elements
    console.log('\n📍 Test 7: Checking Forms and Interactive Elements');
    const forms = await page.$$('form');
    console.log(`   Forms found: ${forms.length}`);

    const buttons = await page.$$('button, input[type="submit"]');
    console.log(`   Buttons found: ${buttons.length}`);

    const inputs = await page.$$('input, textarea, select');
    console.log(`   Input fields found: ${inputs.length}`);

    // Test 8: Performance Metrics
    console.log('\n📍 Test 8: Performance Metrics');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });

    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Full Page Load: ${performanceMetrics.fullLoad}ms`);
    console.log(`   First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);

    // Test 9: Resource Analysis
    console.log('\n📍 Test 9: Resource Analysis');
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const summary = {
        total: resources.length,
        images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)).length,
        scripts: resources.filter(r => r.name.match(/\.js/i)).length,
        stylesheets: resources.filter(r => r.name.match(/\.css/i)).length,
        fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|otf)/i)).length,
        totalSize: resources.reduce((acc, r) => acc + (r.transferSize || 0), 0)
      };
      return summary;
    });

    console.log(`   Total resources: ${resources.total}`);
    console.log(`   Images: ${resources.images}`);
    console.log(`   Scripts: ${resources.scripts}`);
    console.log(`   Stylesheets: ${resources.stylesheets}`);
    console.log(`   Fonts: ${resources.fonts}`);
    console.log(`   Total transfer size: ${(resources.totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Generate summary report
    console.log('\n====================================');
    console.log('📊 TEST SUMMARY');
    console.log('====================================');
    console.log(`✅ Tests completed successfully`);
    console.log(`📸 Screenshots saved in: ${SCREENSHOTS_DIR}`);
    console.log(`⏱️  Total test duration: ${Date.now() - startTime}ms`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run tests
testGangRunPrinting().catch(console.error);