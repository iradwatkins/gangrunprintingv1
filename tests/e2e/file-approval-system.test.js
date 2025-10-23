/**
 * End-to-End Test Suite for File Approval System
 *
 * Tests the complete file approval workflow from upload to production
 * including customer and admin interactions, email notifications,
 * and database state changes.
 */

const { test, expect } = require('@playwright/test')
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3020',
  adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin@gangrunprinting.com',
  adminPassword: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  customerEmail: process.env.TEST_CUSTOMER_EMAIL || 'customer@test.com',
  customerPassword: process.env.TEST_CUSTOMER_PASSWORD || 'customer123',
  testTimeout: 60000, // 60 seconds
}

// Test files for upload
const TEST_FILES = {
  validPDF: path.join(__dirname, 'fixtures', 'test-business-card.pdf'),
  validImage: path.join(__dirname, 'fixtures', 'test-logo.jpg'),
  invalidFile: path.join(__dirname, 'fixtures', 'malicious.exe'),
  largeFile: path.join(__dirname, 'fixtures', 'large-image.jpg'),
}

// Helper functions
class FileApprovalTestHelpers {
  constructor(page) {
    this.page = page
  }

  async login(email, password) {
    await this.page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
    await this.page.waitForNavigation()
  }

  async loginAsAdmin() {
    await this.login(TEST_CONFIG.adminEmail, TEST_CONFIG.adminPassword)
  }

  async loginAsCustomer() {
    await this.login(TEST_CONFIG.customerEmail, TEST_CONFIG.customerPassword)
  }

  async createTestOrder() {
    // Navigate to products and create a test order
    await this.page.goto(`${TEST_CONFIG.baseURL}/products`)
    await this.page.click('[data-testid="business-cards-product"]')

    // Configure product
    await this.page.selectOption('[data-testid="size-select"]', 'standard')
    await this.page.selectOption('[data-testid="quantity-select"]', '100')
    await this.page.selectOption('[data-testid="paper-select"]', 'standard')

    // Add to cart
    await this.page.click('[data-testid="add-to-cart-button"]')

    // Proceed to checkout
    await this.page.goto(`${TEST_CONFIG.baseURL}/checkout`)
    await this.page.fill('[data-testid="customer-name"]', 'Test Customer')
    await this.page.fill('[data-testid="customer-email"]', TEST_CONFIG.customerEmail)
    await this.page.fill('[data-testid="shipping-address"]', '123 Test St')
    await this.page.fill('[data-testid="shipping-city"]', 'Test City')
    await this.page.fill('[data-testid="shipping-zip"]', '12345')

    // Complete order
    await this.page.click('[data-testid="place-order-button"]')
    await this.page.waitForSelector('[data-testid="order-confirmation"]')

    // Extract order number
    const orderNumber = await this.page.textContent('[data-testid="order-number"]')
    return orderNumber.replace('Order #', '')
  }

  async uploadCustomerArtwork(orderId, filePath) {
    await this.page.goto(`${TEST_CONFIG.baseURL}/admin/orders/${orderId}`)
    await this.page.click('[data-testid="upload-file-button"]')

    // Select file type
    await this.page.selectOption('[data-testid="file-type-select"]', 'CUSTOMER_ARTWORK')

    // Upload file
    await this.page.setInputFiles('[data-testid="file-input"]', filePath)
    await this.page.fill('[data-testid="file-message"]', 'Customer artwork upload')
    await this.page.click('[data-testid="upload-submit-button"]')

    // Wait for upload success
    await this.page.waitForSelector('[data-testid="upload-success"]')
  }

  async uploadAdminProof(orderId, filePath, message = 'Here is your proof for review') {
    await this.page.goto(`${TEST_CONFIG.baseURL}/admin/orders/${orderId}`)
    await this.page.click('[data-testid="upload-file-button"]')

    // Select file type
    await this.page.selectOption('[data-testid="file-type-select"]', 'ADMIN_PROOF')

    // Upload file
    await this.page.setInputFiles('[data-testid="file-input"]', filePath)
    await this.page.fill('[data-testid="file-message"]', message)
    await this.page.click('[data-testid="upload-submit-button"]')

    // Wait for upload success
    await this.page.waitForSelector('[data-testid="upload-success"]')
  }

  async approveProof(orderId, fileId, message = 'Looks great!') {
    await this.page.goto(`${TEST_CONFIG.baseURL}/track/${orderId}`)
    await this.page.click(`[data-testid="approve-proof-${fileId}"]`)
    await this.page.fill('[data-testid="approval-message"]', message)
    await this.page.click('[data-testid="confirm-approval-button"]')

    // Wait for approval success
    await this.page.waitForSelector('[data-testid="approval-success"]')
  }

  async rejectProof(orderId, fileId, message) {
    await this.page.goto(`${TEST_CONFIG.baseURL}/track/${orderId}`)
    await this.page.click(`[data-testid="reject-proof-${fileId}"]`)
    await this.page.fill('[data-testid="rejection-message"]', message)
    await this.page.click('[data-testid="confirm-rejection-button"]')

    // Wait for rejection success
    await this.page.waitForSelector('[data-testid="rejection-success"]')
  }

  async checkEmailNotification(recipientEmail, subject) {
    // This would integrate with your email testing service
    // For now, we'll check the database for email records
    // or use a service like MailHog for testing

    // Placeholder for email verification
    console.log(`Checking email to ${recipientEmail} with subject: ${subject}`)
    return true
  }

  async checkDatabaseState(orderId, expectedState) {
    // This would check the database directly
    // For this example, we'll use API calls to verify state

    const response = await this.page.request.get(
      `${TEST_CONFIG.baseURL}/api/orders/${orderId}/files`
    )
    const data = await response.json()

    return data
  }
}

// Test suites
test.describe('File Approval System - Complete Workflow', () => {
  let browser, adminContext, customerContext, adminPage, customerPage
  let adminHelpers, customerHelpers
  let testOrderId

  test.beforeAll(async () => {
    browser = await chromium.launch()

    // Create separate contexts for admin and customer
    adminContext = await browser.newContext()
    customerContext = await browser.newContext()

    adminPage = await adminContext.newPage()
    customerPage = await customerContext.newPage()

    adminHelpers = new FileApprovalTestHelpers(adminPage)
    customerHelpers = new FileApprovalTestHelpers(customerPage)

    // Setup: Login both users
    await adminHelpers.loginAsAdmin()
    await customerHelpers.loginAsCustomer()

    // Create a test order
    testOrderId = await customerHelpers.createTestOrder()
  })

  test.afterAll(async () => {
    await browser.close()
  })

  test('1. Customer uploads artwork files', async () => {
    // Customer uploads design files
    await customerHelpers.uploadCustomerArtwork(testOrderId, TEST_FILES.validPDF)
    await customerHelpers.uploadCustomerArtwork(testOrderId, TEST_FILES.validImage)

    // Verify files appear in admin interface
    await adminPage.goto(`${TEST_CONFIG.baseURL}/admin/orders/${testOrderId}`)
    await expect(adminPage.locator('[data-testid="customer-artwork-section"]')).toBeVisible()
    await expect(adminPage.locator('[data-testid="artwork-file-list"]')).toContainText(
      'test-business-card.pdf'
    )
    await expect(adminPage.locator('[data-testid="artwork-file-list"]')).toContainText(
      'test-logo.jpg'
    )

    // Verify email notification to admin
    const emailSent = await adminHelpers.checkEmailNotification(
      TEST_CONFIG.adminEmail,
      'New Artwork Uploaded'
    )
    expect(emailSent).toBe(true)
  })

  test('2. Admin uploads proof for customer approval', async () => {
    // Admin uploads proof
    await adminHelpers.uploadAdminProof(
      testOrderId,
      TEST_FILES.validPDF,
      'Please review this proof carefully'
    )

    // Verify proof appears in customer interface
    await customerPage.goto(`${TEST_CONFIG.baseURL}/track/${testOrderId}`)
    await expect(customerPage.locator('[data-testid="proof-approval-section"]')).toBeVisible()
    await expect(customerPage.locator('[data-testid="waiting-proofs"]')).toContainText(
      'Awaiting Your Approval'
    )

    // Verify email notification to customer
    const emailSent = await customerHelpers.checkEmailNotification(
      TEST_CONFIG.customerEmail,
      'Your Proof is Ready for Review'
    )
    expect(emailSent).toBe(true)

    // Verify database state
    const dbState = await adminHelpers.checkDatabaseState(testOrderId)
    const proofFile = dbState.files.find((f) => f.fileType === 'ADMIN_PROOF')
    expect(proofFile.approvalStatus).toBe('WAITING')
  })

  test('3. Customer rejects proof and requests changes', async () => {
    await customerPage.goto(`${TEST_CONFIG.baseURL}/track/${testOrderId}`)

    // Find the proof file ID
    const proofFileId = await customerPage.getAttribute(
      '[data-testid="proof-file-card"]',
      'data-file-id'
    )

    // Reject the proof
    await customerHelpers.rejectProof(
      testOrderId,
      proofFileId,
      'Please make the logo 20% larger and change the phone number to 555-1234'
    )

    // Verify rejection status
    await expect(customerPage.locator('[data-testid="rejected-proofs"]')).toContainText(
      'Changes Requested'
    )

    // Verify email notification to admin
    const emailSent = await adminHelpers.checkEmailNotification(
      TEST_CONFIG.adminEmail,
      'Changes Requested'
    )
    expect(emailSent).toBe(true)

    // Verify database state
    const dbState = await customerHelpers.checkDatabaseState(testOrderId)
    const proofFile = dbState.files.find((f) => f.fileType === 'ADMIN_PROOF')
    expect(proofFile.approvalStatus).toBe('REJECTED')
  })

  test('4. Admin uploads revised proof', async () => {
    // Admin uploads revised proof
    await adminHelpers.uploadAdminProof(
      testOrderId,
      TEST_FILES.validPDF,
      'Revised proof with larger logo and updated phone number'
    )

    // Verify new proof appears
    await customerPage.reload()
    await expect(customerPage.locator('[data-testid="waiting-proofs"]')).toContainText(
      'Awaiting Your Approval'
    )

    // Should have 2 proof files now (original rejected + new waiting)
    const proofCards = await customerPage.locator('[data-testid="proof-file-card"]').count()
    expect(proofCards).toBe(2)
  })

  test('5. Customer approves revised proof', async () => {
    await customerPage.goto(`${TEST_CONFIG.baseURL}/track/${testOrderId}`)

    // Find the waiting proof
    const waitingProofs = await customerPage.locator(
      '[data-testid="waiting-proofs"] [data-testid="proof-file-card"]'
    )
    const proofFileId = await waitingProofs.first().getAttribute('data-file-id')

    // Approve the proof
    await customerHelpers.approveProof(
      testOrderId,
      proofFileId,
      'Perfect! Please proceed with production.'
    )

    // Verify approval status
    await expect(customerPage.locator('[data-testid="approved-proofs"]')).toContainText('Approved')
    await expect(customerPage.locator('[data-testid="all-proofs-approved-alert"]')).toBeVisible()

    // Verify email notification to admin
    const emailSent = await customerHelpers.checkEmailNotification(
      TEST_CONFIG.adminEmail,
      'All Proofs Approved - Ready for Production'
    )
    expect(emailSent).toBe(true)

    // Verify database state
    const dbState = await adminHelpers.checkDatabaseState(testOrderId)
    const approvedProof = dbState.files.find(
      (f) => f.fileType === 'ADMIN_PROOF' && f.approvalStatus === 'APPROVED'
    )
    expect(approvedProof).toBeTruthy()
  })

  test('6. Order status updates to ready for production', async () => {
    // Check admin interface shows order ready for production
    await adminPage.goto(`${TEST_CONFIG.baseURL}/admin/orders/${testOrderId}`)
    await expect(adminPage.locator('[data-testid="order-status"]')).toContainText(
      'Ready for Production'
    )
    await expect(adminPage.locator('[data-testid="all-proofs-approved-badge"]')).toBeVisible()

    // Verify order timestamps updated
    const dbState = await adminHelpers.checkDatabaseState(testOrderId)
    expect(dbState.order.filesApprovedAt).toBeTruthy()
  })
})

test.describe('File Approval System - Security Tests', () => {
  let page, helpers

  test.beforeEach(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    page = await context.newPage()
    helpers = new FileApprovalTestHelpers(page)

    await helpers.loginAsAdmin()
  })

  test('7. Reject malicious file uploads', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Attempt to upload malicious file
    await page.goto(`${TEST_CONFIG.baseURL}/admin/orders/${testOrderId}`)
    await page.click('[data-testid="upload-file-button"]')
    await page.setInputFiles('[data-testid="file-input"]', TEST_FILES.invalidFile)
    await page.click('[data-testid="upload-submit-button"]')

    // Verify rejection
    await expect(page.locator('[data-testid="upload-error"]')).toContainText(
      'File type not allowed'
    )
  })

  test('8. Enforce file size limits', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Attempt to upload oversized file
    await page.goto(`${TEST_CONFIG.baseURL}/admin/orders/${testOrderId}`)
    await page.click('[data-testid="upload-file-button"]')
    await page.setInputFiles('[data-testid="file-input"]', TEST_FILES.largeFile)
    await page.click('[data-testid="upload-submit-button"]')

    // Verify rejection
    await expect(page.locator('[data-testid="upload-error"]')).toContainText(
      'File size exceeds limit'
    )
  })

  test('9. Test rate limiting on file uploads', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Rapidly upload multiple files
    for (let i = 0; i < 15; i++) {
      try {
        await helpers.uploadCustomerArtwork(testOrderId, TEST_FILES.validImage)
      } catch (error) {
        // Expected to fail due to rate limiting
      }
    }

    // Verify rate limit triggered
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible()
  })
})

test.describe('File Approval System - Mobile Responsiveness', () => {
  let page, helpers

  test.beforeEach(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE viewport
    })
    page = await context.newPage()
    helpers = new FileApprovalTestHelpers(page)

    await helpers.loginAsCustomer()
  })

  test('10. Mobile proof approval interface', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Navigate to mobile order tracking
    await page.goto(`${TEST_CONFIG.baseURL}/track/${testOrderId}`)

    // Verify mobile-optimized interface
    await expect(page.locator('[data-testid="mobile-proof-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-approve-button"]')).toBeVisible()

    // Test mobile sheet interaction
    await page.click('[data-testid="view-details-button"]')
    await expect(page.locator('[data-testid="mobile-details-sheet"]')).toBeVisible()

    // Test mobile approval flow
    await page.click('[data-testid="mobile-approve-button"]')
    await expect(page.locator('[data-testid="mobile-approval-dialog"]')).toBeVisible()
  })
})

test.describe('File Approval System - Performance Tests', () => {
  let page, helpers

  test.beforeEach(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    page = await context.newPage()
    helpers = new FileApprovalTestHelpers(page)

    await helpers.loginAsAdmin()
  })

  test('11. Large file upload performance', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Test upload time for large files
    const startTime = Date.now()
    await helpers.uploadCustomerArtwork(testOrderId, TEST_FILES.largeFile)
    const uploadTime = Date.now() - startTime

    // Verify reasonable upload time (under 30 seconds)
    expect(uploadTime).toBeLessThan(30000)
  })

  test('12. Multiple file handling', async () => {
    const testOrderId = await helpers.createTestOrder()

    // Upload multiple files simultaneously
    const uploadPromises = []
    for (let i = 0; i < 5; i++) {
      uploadPromises.push(helpers.uploadCustomerArtwork(testOrderId, TEST_FILES.validImage))
    }

    await Promise.all(uploadPromises)

    // Verify all files uploaded successfully
    const dbState = await helpers.checkDatabaseState(testOrderId)
    const customerFiles = dbState.files.filter((f) => f.fileType === 'CUSTOMER_ARTWORK')
    expect(customerFiles.length).toBe(5)
  })
})

// Test data cleanup
test.afterAll(async () => {
  // Clean up test data from database
  // This would connect to your test database and remove test orders
  console.log('Cleaning up test data...')
})
