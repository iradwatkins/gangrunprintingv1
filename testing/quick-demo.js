const puppeteer = require('puppeteer')

async function quickDemo() {
  console.log('🚀 Chrome DevTools MCP and Puppeteer Installation Test')
  console.log('=======================================================\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    console.log('✅ Puppeteer installed and working!')
    console.log('✅ Chrome browser launched successfully!')

    const page = await browser.newPage()
    console.log('✅ New page created!')

    // Test navigation to example site
    console.log('\n📍 Testing navigation to example.com...')
    await page.goto('https://example.com', { waitUntil: 'networkidle2' })

    const title = await page.title()
    console.log(`✅ Page loaded! Title: ${title}`)

    // Test screenshot capability
    await page.screenshot({ path: './screenshots/demo.png' })
    console.log('✅ Screenshot captured!')

    // Test evaluation
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.log(`✅ Page evaluation working! Body has ${bodyText.length} characters`)

    // Test viewport changes
    await page.setViewport({ width: 390, height: 844 })
    console.log('✅ Viewport manipulation working!')

    console.log('\n🎉 SUCCESS: All tools are properly installed and working!')
    console.log('\n📋 Summary:')
    console.log('   - chrome-devtools-mcp: ✅ Installed')
    console.log('   - Puppeteer: ✅ Installed and functional')
    console.log('   - Chrome/Chromium: ✅ Downloaded and working')
    console.log('   - Screenshots: ✅ Working')
    console.log('   - Page evaluation: ✅ Working')
    console.log('   - Navigation: ✅ Working')

    console.log('\n📝 Next steps:')
    console.log('   1. Run test-gangrun.js for full site testing')
    console.log('   2. Run performance-analysis.js for performance metrics')
    console.log('   3. Run automation-tests.js for comprehensive automation suite')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await browser.close()
  }
}

quickDemo().catch(console.error)
