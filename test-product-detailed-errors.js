const puppeteer = require('puppeteer');

async function captureDetailedErrors() {
  console.log('Starting detailed error capture for product pages...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const allLogs = [];

  // Capture ALL console messages with full details
  page.on('console', async msg => {
    const type = msg.type();
    const text = msg.text();

    // Try to get more details for error objects
    const args = msg.args();
    const argDetails = [];

    for (const arg of args) {
      try {
        const json = await arg.jsonValue();
        argDetails.push(JSON.stringify(json, null, 2));
      } catch (e) {
        argDetails.push(text);
      }
    }

    allLogs.push({
      type,
      text,
      details: argDetails.length > 0 ? argDetails : [text]
    });
  });

  // Capture page errors
  page.on('pageerror', error => {
    allLogs.push({
      type: 'pageerror',
      text: error.toString(),
      stack: error.stack,
      message: error.message
    });
  });

  try {
    console.log('Navigating to product page...');
    await page.goto('https://gangrunprinting.com/products/asdfddddddddddddd-20', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for page to settle...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n' + '='.repeat(80));
    console.log('CAPTURED CONSOLE LOGS AND ERRORS');
    console.log('='.repeat(80) + '\n');

    // Filter and display errors
    const errors = allLogs.filter(log => log.type === 'error' || log.type === 'pageerror');
    const warnings = allLogs.filter(log => log.type === 'warning');
    const info = allLogs.filter(log => log.type === 'info' || log.type === 'log');

    console.log(`Total Errors: ${errors.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    console.log(`Total Info/Log: ${info.length}\n`);

    if (errors.length > 0) {
      console.log('ERRORS:\n');
      errors.forEach((error, i) => {
        console.log(`--- Error ${i + 1} ---`);
        console.log(`Type: ${error.type}`);
        console.log(`Text: ${error.text}`);
        if (error.message) console.log(`Message: ${error.message}`);
        if (error.stack) console.log(`Stack: ${error.stack}`);
        if (error.details && error.details.length > 0) {
          console.log('Details:');
          error.details.forEach((detail, j) => {
            console.log(`  [${j}]: ${detail.substring(0, 500)}${detail.length > 500 ? '...' : ''}`);
          });
        }
        console.log('');
      });
    }

    if (warnings.length > 0) {
      console.log('\nWARNINGS:\n');
      warnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.text}`);
      });
    }

    // Check the actual page content
    const pageContent = await page.content();
    const hasErrorMessage = pageContent.includes('Unable to Load Product');
    const hasReactError = pageContent.includes('Minified React error');

    console.log('\n' + '='.repeat(80));
    console.log('PAGE CONTENT ANALYSIS');
    console.log('='.repeat(80));
    console.log(`"Unable to Load Product" message: ${hasErrorMessage ? '❌ PRESENT' : '✅ NOT FOUND'}`);
    console.log(`React Error #310 reference: ${hasReactError ? '❌ PRESENT' : '✅ NOT FOUND'}`);

    // Take screenshot
    const screenshotPath = '/root/websites/gangrunprinting/test-detailed-error.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved: ${screenshotPath}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

captureDetailedErrors().catch(console.error);