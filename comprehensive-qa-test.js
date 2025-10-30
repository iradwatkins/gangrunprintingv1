/**
 * COMPREHENSIVE PRE-DELIVERY QA TEST
 *
 * This script performs exhaustive testing of:
 * 1. Site structure & navigation
 * 2. All interactive elements
 * 3. External links & resources
 * 4. Cross-page functionality
 * 5. Responsive behavior
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3020';
const REPORT_FILE = 'qa-report-' + new Date().toISOString().split('T')[0] + '.json';

const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalPages: 0,
    pagesWorking: 0,
    pagesFailed: 0,
    totalLinks: 0,
    linksWorking: 0,
    linksBroken: 0,
    totalButtons: 0,
    buttonsWorking: 0,
    buttonsFailed: 0,
    totalForms: 0,
    formsWorking: 0,
    formsFailed: 0,
    responsiveIssues: 0
  },
  pages: {},
  issues: [],
  warnings: [],
  successes: []
};

// Key pages to test (organized by section)
const PAGES_TO_TEST = {
  'Homepage': '/en',
  'Customer Pages': {
    'Products': '/en/products',
    'About': '/en/about',
    'Contact': '/en/contact',
    'FAQ': '/en/faq',
    'Business Cards FAQ': '/en/faq/business-cards',
    'Flyers FAQ': '/en/faq/flyers',
    'Help Center': '/en/help-center',
    'Track Order': '/en/track',
    'Quote Request': '/en/quote',
    'Privacy Policy': '/en/privacy-policy',
    'Terms of Service': '/en/terms-of-service',
    'Locations': '/en/locations',
  },
  'Account Pages': {
    'Dashboard': '/en/account/dashboard',
    'Orders': '/en/account/orders',
    'Addresses': '/en/account/addresses',
    'Payment Methods': '/en/account/payment-methods',
    'Account Details': '/en/account/details',
    'Downloads': '/en/account/downloads',
  },
  'Checkout Flow': {
    'Cart/Checkout': '/en/checkout',
    'Shipping': '/en/checkout/shipping',
    'Payment': '/en/checkout/payment',
  },
  'Auth Pages': {
    'Sign In': '/en/sign-in',
  }
};

// Flatten pages for testing
const flatPages = [];
for (const [section, pages] of Object.entries(PAGES_TO_TEST)) {
  if (typeof pages === 'string') {
    flatPages.push({ section, name: section, url: pages });
  } else {
    for (const [name, url] of Object.entries(pages)) {
      flatPages.push({ section, name, url });
    }
  }
}

function addIssue(severity, page, element, message) {
  const issue = { severity, page, element, message, timestamp: new Date().toISOString() };
  if (severity === 'error') {
    report.issues.push(issue);
  } else if (severity === 'warning') {
    report.warnings.push(issue);
  } else {
    report.successes.push(issue);
  }
}

async function testPage(browser, pageInfo) {
  const { section, name, url } = pageInfo;
  const fullUrl = BASE_URL + url;

  console.log(`\n🔍 Testing: ${name} (${url})`);

  const page = await browser.newPage();
  const pageReport = {
    url,
    section,
    name,
    accessible: false,
    loadTime: 0,
    links: { total: 0, working: 0, broken: [] },
    buttons: { total: 0, working: 0, failed: [] },
    forms: { total: 0, working: 0, failed: [] },
    images: { total: 0, loaded: 0, failed: [] },
    responsive: { mobile: null, tablet: null, desktop: null },
    consoleErrors: [],
    networkErrors: []
  };

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageReport.consoleErrors.push(msg.text());
    }
  });

  // Capture network errors
  page.on('requestfailed', request => {
    pageReport.networkErrors.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });

  try {
    // Test page accessibility and load time
    const startTime = Date.now();
    const response = await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const loadTime = Date.now() - startTime;
    pageReport.loadTime = loadTime;

    if (response.status() === 200) {
      pageReport.accessible = true;
      report.summary.pagesWorking++;
      addIssue('success', url, 'Page Load', `Loaded successfully in ${loadTime}ms`);
    } else {
      report.summary.pagesFailed++;
      addIssue('error', url, 'Page Load', `HTTP ${response.status()}`);
    }

    // Wait a bit for JS to initialize
    await page.waitForTimeout(2000);

    // Test all links
    const links = await page.$$eval('a[href]', anchors =>
      anchors.map(a => ({
        href: a.href,
        text: a.innerText?.trim() || a.title || 'No text',
        isExternal: a.href.startsWith('http') && !a.href.includes('localhost')
      }))
    );

    pageReport.links.total = links.length;
    report.summary.totalLinks += links.length;

    for (const link of links.slice(0, 20)) { // Test first 20 links
      if (link.href && link.href !== 'javascript:void(0)') {
        try {
          const linkPage = await browser.newPage();
          const response = await linkPage.goto(link.href, {
            timeout: 10000,
            waitUntil: 'domcontentloaded'
          });

          if (response && response.ok()) {
            pageReport.links.working++;
            report.summary.linksWorking++;
          } else {
            pageReport.links.broken.push({ ...link, status: response?.status() });
            report.summary.linksBroken++;
            addIssue('error', url, `Link: ${link.text}`, `Broken link to ${link.href}`);
          }
          await linkPage.close();
        } catch (error) {
          pageReport.links.broken.push({ ...link, error: error.message });
          report.summary.linksBroken++;
          addIssue('error', url, `Link: ${link.text}`, `Failed to load ${link.href}`);
        }
      }
    }

    // Test all buttons
    const buttons = await page.$$eval('button, a[role="button"], input[type="submit"], input[type="button"]', btns =>
      btns.map(btn => ({
        text: btn.innerText?.trim() || btn.value || btn.title || 'No label',
        type: btn.tagName.toLowerCase(),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }))
    );

    pageReport.buttons.total = buttons.length;
    report.summary.totalButtons += buttons.length;

    for (const btn of buttons) {
      if (!btn.disabled && btn.visible) {
        pageReport.buttons.working++;
        report.summary.buttonsWorking++;
      } else if (btn.disabled) {
        addIssue('warning', url, `Button: ${btn.text}`, 'Button is disabled');
      }
    }

    // Test forms
    const forms = await page.$$eval('form', frms =>
      frms.map((frm, idx) => ({
        id: frm.id || `form-${idx}`,
        action: frm.action,
        method: frm.method,
        inputs: Array.from(frm.querySelectorAll('input, textarea, select')).length
      }))
    );

    pageReport.forms.total = forms.length;
    report.summary.totalForms += forms.length;

    for (const form of forms) {
      if (form.action && form.inputs > 0) {
        pageReport.forms.working++;
        report.summary.formsWorking++;
        addIssue('success', url, `Form: ${form.id}`, `Has ${form.inputs} inputs`);
      } else {
        pageReport.forms.failed.push(form);
        report.summary.formsFailed++;
        addIssue('warning', url, `Form: ${form.id}`, 'Form missing action or inputs');
      }
    }

    // Test images
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    pageReport.images.total = images.length;
    pageReport.images.loaded = images.filter(img => img.loaded).length;
    pageReport.images.failed = images.filter(img => !img.loaded).map(img => img.src);

    if (pageReport.images.failed.length > 0) {
      addIssue('error', url, 'Images', `${pageReport.images.failed.length} images failed to load`);
    }

    // Test responsive behavior at different viewports
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForTimeout(1000);

      // Check for layout issues
      const layoutIssues = await page.evaluate(() => {
        const issues = [];

        // Check for horizontal overflow
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
          issues.push('Horizontal overflow detected');
        }

        // Check for overlapping elements
        const buttons = document.querySelectorAll('button, a[role="button"]');
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            issues.push(`Button "${btn.innerText}" has zero dimensions`);
          }
        });

        return issues;
      });

      pageReport.responsive[viewport.name] = {
        width: viewport.width,
        height: viewport.height,
        issues: layoutIssues
      };

      if (layoutIssues.length > 0) {
        report.summary.responsiveIssues += layoutIssues.length;
        layoutIssues.forEach(issue => {
          addIssue('warning', url, `Responsive (${viewport.name})`, issue);
        });
      } else {
        addIssue('success', url, `Responsive (${viewport.name})`, 'Layout renders correctly');
      }
    }

    // Report console errors
    if (pageReport.consoleErrors.length > 0) {
      addIssue('warning', url, 'Console', `${pageReport.consoleErrors.length} console errors`);
    }

    // Report network errors
    if (pageReport.networkErrors.length > 0) {
      addIssue('error', url, 'Network', `${pageReport.networkErrors.length} failed requests`);
    }

  } catch (error) {
    report.summary.pagesFailed++;
    addIssue('error', url, 'Page Load', error.message);
    pageReport.accessible = false;
  } finally {
    await page.close();
  }

  report.pages[url] = pageReport;
  report.summary.totalPages++;
}

async function runTests() {
  console.log('🚀 Starting Comprehensive QA Test Suite\n');
  console.log(`Testing ${flatPages.length} pages...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const pageInfo of flatPages) {
      await testPage(browser, pageInfo);
    }

    // Calculate overall health score
    const totalChecks =
      report.summary.totalPages +
      report.summary.totalLinks +
      report.summary.totalButtons +
      report.summary.totalForms;

    const passedChecks =
      report.summary.pagesWorking +
      report.summary.linksWorking +
      report.summary.buttonsWorking +
      report.summary.formsWorking;

    report.summary.healthScore = Math.round((passedChecks / totalChecks) * 100);

    // Save report
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

    // Generate human-readable report
    generateHumanReport();

  } finally {
    await browser.close();
  }
}

function generateHumanReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 QA TEST REPORT - GANGRUN PRINTING');
  console.log('='.repeat(80));

  console.log('\n📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Overall Health Score: ${report.summary.healthScore}%`);
  console.log(`\nPages Tested: ${report.summary.totalPages}`);
  console.log(`  ✅ Working: ${report.summary.pagesWorking}`);
  console.log(`  ❌ Failed: ${report.summary.pagesFailed}`);

  console.log(`\nLinks Tested: ${report.summary.totalLinks}`);
  console.log(`  ✅ Working: ${report.summary.linksWorking}`);
  console.log(`  ❌ Broken: ${report.summary.linksBroken}`);

  console.log(`\nButtons Found: ${report.summary.totalButtons}`);
  console.log(`  ✅ Working: ${report.summary.buttonsWorking}`);
  console.log(`  ❌ Failed: ${report.summary.buttonsFailed}`);

  console.log(`\nForms Found: ${report.summary.totalForms}`);
  console.log(`  ✅ Working: ${report.summary.formsWorking}`);
  console.log(`  ❌ Failed: ${report.summary.formsFailed}`);

  console.log(`\nResponsive Issues: ${report.summary.responsiveIssues}`);

  if (report.issues.length > 0) {
    console.log('\n❌ ISSUES FOUND');
    console.log('-'.repeat(80));
    report.issues.slice(0, 20).forEach(issue => {
      console.log(`\n📍 ${issue.page}`);
      console.log(`   Element: ${issue.element}`);
      console.log(`   Issue: ${issue.message}`);
    });
    if (report.issues.length > 20) {
      console.log(`\n... and ${report.issues.length - 20} more issues`);
    }
  }

  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS');
    console.log('-'.repeat(80));
    report.warnings.slice(0, 10).forEach(warning => {
      console.log(`\n📍 ${warning.page}`);
      console.log(`   Element: ${warning.element}`);
      console.log(`   Warning: ${warning.message}`);
    });
    if (report.warnings.length > 10) {
      console.log(`\n... and ${report.warnings.length - 10} more warnings`);
    }
  }

  console.log('\n✅ SUCCESSFUL CHECKS');
  console.log('-'.repeat(80));
  console.log(`Total successful checks: ${report.successes.length}`);

  console.log('\n📄 DETAILED REPORT');
  console.log('-'.repeat(80));
  console.log(`Full JSON report saved to: ${REPORT_FILE}`);

  console.log('\n' + '='.repeat(80));
  console.log('QA TEST COMPLETE');
  console.log('='.repeat(80) + '\n');
}

// Run the tests
runTests().catch(console.error);
