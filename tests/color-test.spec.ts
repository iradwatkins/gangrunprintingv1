import { test } from '@playwright/test'

test('capture color test page', async ({ page }) => {
  await page.goto('http://localhost:3001/admin/test-colors')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ 
    path: 'tests/screenshots/color-test.png', 
    fullPage: true 
  })
})