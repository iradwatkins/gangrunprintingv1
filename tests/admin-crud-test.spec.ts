import { test, expect } from '@playwright/test'

// Set timeout for all tests
test.setTimeout(60000)

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page - this should handle any auth needed
    await page.goto('http://localhost:3002/admin')
  })

  test('Paper Stock CRUD operations', async ({ page }) => {
    // Navigate to paper stocks page
    await page.goto('http://localhost:3002/admin/paper-stocks')

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Paper Stocks")', { timeout: 10000 })

    // Click create button
    const createButton = page.locator('button:has-text("Create Paper Stock")')
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Fill in the form
    const timestamp = Date.now()
    const testName = `Test Paper Stock ${timestamp}`

    await page.fill('input[name="name"]', testName)
    await page.fill('input[name="weight"]', '0.002')
    await page.fill('input[name="pricePerSqInch"]', '0.0025')
    await page.fill('textarea[name="tooltipText"]', 'Test paper stock for automation')

    // Click save button
    await page.click('[role="dialog"] button:has-text("Create")')

    // Wait for dialog to close and check if paper stock appears in list
    await page.waitForTimeout(2000)

    // Verify the paper stock was created
    const createdStock = page.locator(`text=${testName}`)
    await expect(createdStock).toBeVisible({ timeout: 10000 })

    console.log('✅ Paper Stock created successfully')

    // Test editing
    const editButton = page.locator(`tr:has-text("${testName}") button[title="Edit"]`).first()
    await editButton.click()

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Update the name
    await page.fill('input[name="name"]', `Updated ${testName}`)
    await page.click('[role="dialog"] button:has-text("Save")')

    // Wait and verify update
    await page.waitForTimeout(2000)
    const updatedStock = page.locator(`text=Updated ${testName}`)
    await expect(updatedStock).toBeVisible({ timeout: 10000 })

    console.log('✅ Paper Stock updated successfully')

    // Test delete
    const deleteButton = page.locator(`tr:has-text("Updated ${testName}") button[title="Delete"]`).first()
    await deleteButton.click()

    // Confirm delete in dialog
    await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 })
    await page.click('[role="alertdialog"] button:has-text("Delete")')

    // Verify deletion
    await page.waitForTimeout(2000)
    await expect(page.locator(`text=Updated ${testName}`)).not.toBeVisible()

    console.log('✅ Paper Stock deleted successfully')
  })

  test('Add-on CRUD operations', async ({ page }) => {
    // Navigate to add-ons page
    await page.goto('http://localhost:3002/admin/add-ons')

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Add-ons")', { timeout: 10000 })

    // Click create button
    const createButton = page.locator('button:has-text("Create Add-on")')
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Fill in the form
    const timestamp = Date.now()
    const testName = `Test Add-on ${timestamp}`

    await page.fill('input[name="name"]', testName)
    await page.fill('textarea[name="description"]', 'Test add-on for automation')

    // Select pricing model
    await page.click('button[role="combobox"]:has-text("Select pricing model")')
    await page.click('div[role="option"]:has-text("Flat Rate")')

    // Click save button
    await page.click('[role="dialog"] button:has-text("Create")')

    // Wait and verify creation
    await page.waitForTimeout(2000)
    const createdAddOn = page.locator(`text=${testName}`)
    await expect(createdAddOn).toBeVisible({ timeout: 10000 })

    console.log('✅ Add-on created successfully')

    // Test delete
    const deleteButton = page.locator(`tr:has-text("${testName}") button[title="Delete"]`).first()
    await deleteButton.click()

    // Confirm delete
    await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 })
    await page.click('[role="alertdialog"] button:has-text("Delete")')

    // Verify deletion
    await page.waitForTimeout(2000)
    await expect(page.locator(`text=${testName}`)).not.toBeVisible()

    console.log('✅ Add-on deleted successfully')
  })

  test('Addon Set CRUD operations', async ({ page }) => {
    // Navigate to addon sets page
    await page.goto('http://localhost:3002/admin/addon-sets')

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Add-on Sets")', { timeout: 10000 })

    // Click create button
    const createButton = page.locator('button:has-text("Create Add-on Set")')
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Fill in the form
    const timestamp = Date.now()
    const testName = `Test Addon Set ${timestamp}`

    await page.fill('input[name="name"]', testName)
    await page.fill('textarea[name="description"]', 'Test addon set for automation')

    // Click save button
    await page.click('[role="dialog"] button:has-text("Create")')

    // Wait and verify creation
    await page.waitForTimeout(2000)
    const createdSet = page.locator(`text=${testName}`)
    await expect(createdSet).toBeVisible({ timeout: 10000 })

    console.log('✅ Addon Set created successfully')

    // Test delete
    const deleteButton = page.locator(`div:has-text("${testName}") button[title="Delete"]`).first()
    await deleteButton.click()

    // Confirm delete
    await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 })
    await page.click('[role="alertdialog"] button:has-text("Delete")')

    // Verify deletion
    await page.waitForTimeout(2000)
    await expect(page.locator(`text=${testName}`)).not.toBeVisible()

    console.log('✅ Addon Set deleted successfully')
  })
})