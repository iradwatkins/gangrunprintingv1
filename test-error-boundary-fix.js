const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text
    });
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });

  console.log('🔍 Navigating to product page...');
  
  try {
    // Navigate and wait for network to settle
    await page.goto('https://gangrunprinting.com/products/asdfddddddddddddd-20', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('⏳ Waiting 5 seconds for page to fully load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    const screenshotPath = '/root/websites/gangrunprinting/test-error-boundary-fix.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Check for React Error #310
    const hasError310 = consoleMessages.some(msg => 
      msg.text.includes('Error #310') || 
      msg.text.includes('Minified React error #310')
    );

    // Check for product configuration elements
    const hasQuantitySelector = await page.$('[data-testid="quantity-selector"], select[name="quantity"], input[name="quantity"]') !== null;
    const hasSizeSelector = await page.$('[data-testid="size-selector"], select[name="size"], [class*="size"]') !== null;
    const hasPaperStockSelector = await page.$('[data-testid="paper-stock-selector"], select[name="paperStock"], [class*="paper"]') !== null;
    
    // Check page title
    const pageTitle = await page.title();
    
    // Check for any error boundaries or error messages
    const errorBoundaryVisible = await page.evaluate(() => {
      const errorTexts = ['Something went wrong', 'Error loading', 'Failed to load'];
      return errorTexts.some(text => document.body.textContent.includes(text));
    });

    // Get visible text content
    const visibleText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });

    console.log('\n==================== TEST RESULTS ====================\n');
    
    // 1. React Error #310 Status
    if (hasError310) {
      console.log('❌ React Error #310: STILL PRESENT');
    } else {
      console.log('✅ React Error #310: GONE');
    }

    // 2. Page Load Success
    if (pageErrors.length === 0 && !errorBoundaryVisible) {
      console.log('✅ Page Load: SUCCESS (no errors)');
    } else {
      console.log('❌ Page Load: ERRORS DETECTED');
    }

    // 3. Product Configuration Options
    console.log('\n📦 Product Configuration Elements:');
    console.log(`   Quantity Selector: ${hasQuantitySelector ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`   Size Selector: ${hasSizeSelector ? '✅ VISIBLE' : '❌ NOT FOUND'}`);
    console.log(`   Paper Stock Selector: ${hasPaperStockSelector ? '✅ VISIBLE' : '❌ NOT FOUND'}`);

    // 4. Additional Info
    console.log(`\n📄 Page Title: ${pageTitle}`);
    console.log(`\n🔍 First 500 chars of visible content:\n${visibleText}\n`);

    // Console Messages Summary
    console.log('\n📋 Console Messages Summary:');
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.text.substring(0, 200)}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 200)}`);
      });
    }

    console.log('\n====================================================\n');

    // Final Status
    const isFullyWorking = !hasError310 && 
                          pageErrors.length === 0 && 
                          !errorBoundaryVisible &&
                          (hasQuantitySelector || hasSizeSelector || hasPaperStockSelector);

    if (isFullyWorking) {
      console.log('🎉 FINAL STATUS: PAGE IS WORKING CORRECTLY ✅');
    } else {
      console.log('⚠️  FINAL STATUS: ISSUES DETECTED - NEEDS ATTENTION ❌');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
