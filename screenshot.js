const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Take admin dashboard screenshot
  await page.goto('http://localhost:3001/admin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: 'tests/screenshots/admin-final.png', 
    fullPage: true 
  });
  
  // Take color test page screenshot
  await page.goto('http://localhost:3001/admin/test-colors');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ 
    path: 'tests/screenshots/colors-final.png', 
    fullPage: true 
  });
  
  await browser.close();
  console.log('Screenshots saved!');
})();