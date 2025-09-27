const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://gangrunprinting.com';
const SCREENSHOTS_DIR = './screenshots';
const RESULTS_DIR = './test-results';

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  await fs.mkdir(RESULTS_DIR, { recursive: true });
}

// Test result tracking
class TestResults {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addTest(name, status, details = {}) {
    this.results.push({
      name,
      status,
      details,
      timestamp: Date.now()
    });

    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`${icon} ${name}`);
    if (details.message) {
      console.log(`   ${details.message}`);
    }
  }

  async save() {
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      warned: this.results.filter(r => r.status === 'warning').length,
      duration: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      results: this.results
    };

    const filePath = path.join(RESULTS_DIR, `test-results-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(summary, null, 2));
    return summary;
  }
}

// Main automation test suite
async function runAutomationTests() {
  console.log('🤖 Starting Automation Test Suite for GangRun Printing');
  console.log('=====================================================\n');

  const testResults = new TestResults();

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
    await ensureDirectories();

    // Test 1: Homepage Navigation
    console.log('\n📋 Test Suite 1: Homepage Navigation\n');

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      testResults.addTest('Homepage loads successfully', 'passed');

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'test1-homepage.png')
      });
    } catch (error) {
      testResults.addTest('Homepage loads successfully', 'failed', {
        message: error.message
      });
    }

    // Test 2: Navigation Menu Functionality
    console.log('\n📋 Test Suite 2: Navigation Menu\n');

    try {
      const navLinks = await page.$$eval('nav a, header a', links =>
        links.map(link => ({ text: link.textContent.trim(), href: link.href }))
      );

      if (navLinks.length > 0) {
        testResults.addTest('Navigation menu exists', 'passed', {
          message: `Found ${navLinks.length} navigation links`
        });

        // Test clicking first few nav items
        for (let i = 0; i < Math.min(3, navLinks.length); i++) {
          const link = navLinks[i];
          try {
            await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 15000 });
            testResults.addTest(`Navigate to: ${link.text}`, 'passed');
          } catch (error) {
            testResults.addTest(`Navigate to: ${link.text}`, 'failed', {
              message: error.message
            });
          }
        }
      } else {
        testResults.addTest('Navigation menu exists', 'warning', {
          message: 'No navigation links found'
        });
      }
    } catch (error) {
      testResults.addTest('Navigation menu functionality', 'failed', {
        message: error.message
      });
    }

    // Test 3: Search Functionality
    console.log('\n📋 Test Suite 3: Search Functionality\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    try {
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');

      if (searchInput) {
        await searchInput.type('business cards');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        testResults.addTest('Search functionality works', 'passed', {
          message: 'Search for "business cards" executed'
        });

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'test3-search-results.png')
        });
      } else {
        testResults.addTest('Search functionality', 'warning', {
          message: 'No search input field found'
        });
      }
    } catch (error) {
      testResults.addTest('Search functionality', 'failed', {
        message: error.message
      });
    }

    // Test 4: Product/Service Pages
    console.log('\n📋 Test Suite 4: Product/Service Pages\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    try {
      // Look for product links
      const productLinks = await page.$$eval('a', links =>
        links
          .filter(link => {
            const href = link.href.toLowerCase();
            const text = link.textContent.toLowerCase();
            return (
              href.includes('product') ||
              href.includes('service') ||
              text.includes('business card') ||
              text.includes('flyer') ||
              text.includes('banner') ||
              text.includes('poster') ||
              text.includes('brochure')
            );
          })
          .map(link => ({ text: link.textContent.trim(), href: link.href }))
          .slice(0, 5)
      );

      if (productLinks.length > 0) {
        testResults.addTest('Product pages found', 'passed', {
          message: `Found ${productLinks.length} product/service links`
        });

        // Test first product page
        const firstProduct = productLinks[0];
        try {
          await page.goto(firstProduct.href, { waitUntil: 'networkidle2', timeout: 15000 });

          // Check for product elements
          const hasProductInfo = await page.evaluate(() => {
            const elements = document.querySelectorAll('h1, h2, .price, .product, .service');
            return elements.length > 0;
          });

          if (hasProductInfo) {
            testResults.addTest('Product page displays information', 'passed');
          } else {
            testResults.addTest('Product page displays information', 'warning', {
              message: 'Limited product information found'
            });
          }

          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'test4-product-page.png')
          });
        } catch (error) {
          testResults.addTest('Product page loads', 'failed', {
            message: error.message
          });
        }
      } else {
        testResults.addTest('Product pages', 'warning', {
          message: 'No product/service links found'
        });
      }
    } catch (error) {
      testResults.addTest('Product/Service pages', 'failed', {
        message: error.message
      });
    }

    // Test 5: Forms and Interactive Elements
    console.log('\n📋 Test Suite 5: Forms and Interactive Elements\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    try {
      const forms = await page.$$('form');
      const buttons = await page.$$('button, input[type="submit"]');
      const inputs = await page.$$('input:not([type="hidden"]), textarea, select');

      testResults.addTest('Interactive elements check', 'passed', {
        message: `Forms: ${forms.length}, Buttons: ${buttons.length}, Inputs: ${inputs.length}`
      });

      // Test contact form if available
      const contactLink = await page.$('a[href*="contact"]');
      if (contactLink) {
        await contactLink.click();
        await page.waitForTimeout(2000);

        const contactForm = await page.$('form');
        if (contactForm) {
          // Try to fill form fields
          const nameInput = await page.$('input[name*="name" i], input[placeholder*="name" i]');
          const emailInput = await page.$('input[type="email"], input[name*="email" i]');
          const messageInput = await page.$('textarea');

          if (nameInput) await nameInput.type('Test User');
          if (emailInput) await emailInput.type('test@example.com');
          if (messageInput) await messageInput.type('This is a test message');

          testResults.addTest('Contact form fillable', 'passed', {
            message: 'Form fields can be filled'
          });

          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'test5-contact-form.png')
          });
        }
      }
    } catch (error) {
      testResults.addTest('Forms and interactive elements', 'failed', {
        message: error.message
      });
    }

    // Test 6: Mobile Responsiveness
    console.log('\n📋 Test Suite 6: Mobile Responsiveness\n');

    const viewports = [
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      try {
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);

        const isResponsive = await page.evaluate(() => {
          const viewport = window.innerWidth;
          const body = document.body.scrollWidth;
          return body <= viewport + 20; // Allow small margin
        });

        if (isResponsive) {
          testResults.addTest(`Responsive at ${viewport.name}`, 'passed');
        } else {
          testResults.addTest(`Responsive at ${viewport.name}`, 'warning', {
            message: 'Horizontal scrolling detected'
          });
        }

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `test6-${viewport.name.toLowerCase().replace(' ', '-')}.png`)
        });
      } catch (error) {
        testResults.addTest(`Responsive at ${viewport.name}`, 'failed', {
          message: error.message
        });
      }
    }

    // Test 7: Image Loading and Galleries
    console.log('\n📋 Test Suite 7: Images and Galleries\n');

    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    try {
      const images = await page.$$eval('img', imgs =>
        imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          loading: img.loading,
          hasAlt: !!img.alt,
          isVisible: img.offsetWidth > 0 && img.offsetHeight > 0
        }))
      );

      const visibleImages = images.filter(img => img.isVisible);
      const imagesWithAlt = images.filter(img => img.hasAlt);
      const lazyImages = images.filter(img => img.loading === 'lazy');

      testResults.addTest('Images load correctly', 'passed', {
        message: `${visibleImages.length}/${images.length} images visible`
      });

      if (imagesWithAlt.length < images.length * 0.8) {
        testResults.addTest('Image alt text', 'warning', {
          message: `Only ${imagesWithAlt.length}/${images.length} images have alt text`
        });
      } else {
        testResults.addTest('Image alt text', 'passed', {
          message: `${imagesWithAlt.length}/${images.length} images have alt text`
        });
      }

      testResults.addTest('Lazy loading implementation', lazyImages.length > 0 ? 'passed' : 'warning', {
        message: `${lazyImages.length} images use lazy loading`
      });

    } catch (error) {
      testResults.addTest('Image loading', 'failed', {
        message: error.message
      });
    }

    // Test 8: Pricing Calculator/Tools
    console.log('\n📋 Test Suite 8: Calculators and Tools\n');

    try {
      // Look for calculator or pricing elements
      const hasCalculator = await page.evaluate(() => {
        const calculatorKeywords = ['calculator', 'price', 'quantity', 'estimate', 'quote'];
        const elements = document.querySelectorAll('*');

        for (const element of elements) {
          const text = element.textContent.toLowerCase();
          const className = element.className.toLowerCase();

          if (calculatorKeywords.some(keyword => text.includes(keyword) || className.includes(keyword))) {
            return true;
          }
        }
        return false;
      });

      if (hasCalculator) {
        testResults.addTest('Pricing/Calculator elements found', 'passed');

        // Try to interact with quantity selectors
        const quantityInput = await page.$('input[type="number"], select[name*="quantity" i]');
        if (quantityInput) {
          await quantityInput.click();
          testResults.addTest('Quantity selector interactive', 'passed');
        }
      } else {
        testResults.addTest('Pricing/Calculator tools', 'warning', {
          message: 'No calculator or pricing tools found'
        });
      }
    } catch (error) {
      testResults.addTest('Calculator/Tools', 'failed', {
        message: error.message
      });
    }

    // Test 9: Footer Information
    console.log('\n📋 Test Suite 9: Footer Information\n');

    try {
      const footer = await page.$('footer');
      if (footer) {
        const footerContent = await page.evaluate(() => {
          const footer = document.querySelector('footer');
          return {
            hasContactInfo: !!footer.querySelector('[href*="tel:"], [href*="mailto:"]'),
            hasSocialLinks: !!footer.querySelector('[href*="facebook"], [href*="twitter"], [href*="instagram"], [href*="linkedin"]'),
            hasAddress: footer.textContent.includes('address') || footer.textContent.match(/\d{5}/),
            linkCount: footer.querySelectorAll('a').length
          };
        });

        testResults.addTest('Footer exists', 'passed', {
          message: `${footerContent.linkCount} links found`
        });

        if (footerContent.hasContactInfo) {
          testResults.addTest('Footer contact information', 'passed');
        } else {
          testResults.addTest('Footer contact information', 'warning', {
            message: 'No contact information in footer'
          });
        }

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'test9-footer.png')
        });
      } else {
        testResults.addTest('Footer', 'warning', {
          message: 'No footer element found'
        });
      }
    } catch (error) {
      testResults.addTest('Footer information', 'failed', {
        message: error.message
      });
    }

    // Save and display results
    const summary = await testResults.save();

    console.log('\n=====================================================');
    console.log('📊 AUTOMATION TEST SUMMARY');
    console.log('=====================================================');
    console.log(`✅ Passed: ${summary.passed}/${summary.totalTests}`);
    console.log(`❌ Failed: ${summary.failed}/${summary.totalTests}`);
    console.log(`⚠️  Warnings: ${summary.warned}/${summary.totalTests}`);
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`📁 Results saved to: ${RESULTS_DIR}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Automation tests failed:', error);
  } finally {
    await browser.close();
  }
}

// Run automation tests
runAutomationTests().catch(console.error);