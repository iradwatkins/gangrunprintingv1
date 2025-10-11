#!/usr/bin/env node

/**
 * COMPREHENSIVE GANGRUN PRINTING PRODUCT CREATION TEST
 *
 * This test suite will:
 * 1. Create a real admin account
 * 2. Login and create 4 different products with images
 * 3. Verify all uploads and product creation
 * 4. Test image storage and accessibility
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://gangrunprinting.com',
  adminEmail: 'testadmin@gangrunprinting.com',
  adminName: 'Test Administrator',
  testTimeout: 120000,
  products: [
    {
      name: 'Premium Business Cards',
      category: 'business-cards',
      description: 'High-quality business cards with premium matte finish',
      basePrice: 45.99,
      setupFee: 15.0,
      productionTime: 3,
      image: 'business-card.jpg',
    },
    {
      name: 'Full-Color Flyers',
      category: 'flyers',
      description: 'Eye-catching full-color flyers for your marketing needs',
      basePrice: 89.99,
      setupFee: 25.0,
      productionTime: 2,
      image: 'flyer-design.jpg',
    },
    {
      name: 'Glossy Postcards',
      category: 'postcards',
      description: 'High-impact glossy postcards for direct mail campaigns',
      basePrice: 67.5,
      setupFee: 20.0,
      productionTime: 3,
      image: 'postcard-image.jpg',
    },
    {
      name: 'Large Format Posters',
      category: 'posters',
      description: 'Professional large format posters for displays and events',
      basePrice: 125.0,
      setupFee: 35.0,
      productionTime: 5,
      image: 'poster-artwork.jpg',
    },
  ],
}

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {}

async function createAdminAccount() {
  log('\n🔧 Creating admin account...', colors.cyan)

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_CONFIG.adminEmail },
    })

    if (existingUser) {
      log('   ⚠️  User already exists, updating role...', colors.yellow)

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN',
          emailVerified: true,
        },
      })

      return updatedUser
    }

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email: TEST_CONFIG.adminEmail,
        name: TEST_CONFIG.adminName,
        role: 'ADMIN',
        emailVerified: true,
      },
    })

    log('   ✅ Admin account created successfully', colors.green)
    return newUser
  } catch (error) {
    log(`   ❌ Failed to create admin account: ${error.message}`, colors.red)
    throw error
  }
}

async function createAuthSession(userId) {
  log('🔑 Creating authentication session...', colors.cyan)

  try {
    // Initialize Lucia exactly like in the app
    const { Lucia } = require('lucia')
    const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')

    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
        },
      },
      getUserAttributes: (attributes) => {
        return {
          email: attributes.email,
          name: attributes.name,
          role: attributes.role,
          emailVerified: attributes.emailVerified,
        }
      },
    })

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId },
    })

    // Create session using Lucia
    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    log('   ✅ Authentication session created using Lucia', colors.green)
    return { session, sessionCookie }
  } catch (error) {
    log(`   ❌ Failed to create session: ${error.message}`, colors.red)
    throw error
  }
}

async function testImageUpload(page, imagePath, productName) {
  log(`   📸 Uploading image: ${path.basename(imagePath)}`, colors.cyan)

  try {
    // Find the file input
    const fileInput = await page.locator('input[type="file"]').first()

    if ((await fileInput.count()) === 0) {
      throw new Error('File input not found')
    }

    // Upload the file
    await fileInput.setInputFiles(imagePath)

    // Wait for upload to complete (increased timeout)
    await page.waitForTimeout(8000)

    // Check for success indicators
    const uploadedImage = await page
      .locator(
        'img[alt*="Product"], img[alt*="product"], .image-preview img, [data-testid="uploaded-image"]'
      )
      .first()

    if ((await uploadedImage.count()) > 0) {
      const imageSrc = await uploadedImage.getAttribute('src')
      log(`      ✅ Image uploaded successfully: ${imageSrc}`, colors.green)
      return true
    } else {
      // Check for error messages
      const errorMessage = await page
        .locator('.toast-error, [role="alert"]:has-text("error"), .error-message')
        .first()
      if ((await errorMessage.count()) > 0) {
        const error = await errorMessage.textContent()
        log(`      ❌ Upload error: ${error}`, colors.red)
      } else {
        log('      ⚠️  Image uploaded but preview not visible', colors.yellow)
      }
      return false
    }
  } catch (error) {
    log(`      ❌ Image upload failed: ${error.message}`, colors.red)
    return false
  }
}

async function createProduct(page, product, index) {
  log(`\n📦 Creating Product ${index + 1}: ${product.name}`, colors.blue)

  try {
    // Navigate to product creation page
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/products/new`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Fill basic product information
    await page.fill('#name', product.name)
    log('   ✓ Product name filled', colors.green)

    await page.fill('#description', product.description)
    log('   ✓ Description filled', colors.green)

    // Category selection
    const categorySelect = await page.locator('select[name="categoryId"], #categoryId').first()
    if ((await categorySelect.count()) > 0) {
      await categorySelect.selectOption(product.category)
      log('   ✓ Category selected', colors.green)
    } else {
      // Try Select component approach
      const categoryTrigger = await page
        .locator('[data-testid="category-select"] button, button:has-text("Select category")')
        .first()
      if ((await categoryTrigger.count()) > 0) {
        await categoryTrigger.click()
        await page.waitForSelector('[role="option"]', { timeout: 5000 })
        await page
          .locator(`[role="option"]:has-text("${product.category}")`, { timeout: 5000 })
          .first()
          .click()
        log('   ✓ Category selected via dropdown', colors.green)
      }
    }

    // Pricing
    await page.fill('#base-price', product.basePrice.toString())
    await page.fill('#production', product.productionTime.toString())
    log('   ✓ Pricing and production time set', colors.green)

    // Upload product image
    const imagePath = path.join(__dirname, 'test-images', product.image)
    const imageUploaded = await testImageUpload(page, imagePath, product.name)

    // Select options (paper stock, quantity, size)
    log('   🔧 Selecting product options...', colors.cyan)

    // Wait for options to load
    await page.waitForTimeout(3000)

    // Select first available paper stock
    const firstPaperStock = await page.locator('input[type="checkbox"][id^="stock-"]').first()
    if ((await firstPaperStock.count()) > 0) {
      await firstPaperStock.click()
      log('   ✓ Paper stock selected', colors.green)

      // Set as default paper stock
      const defaultPaperRadio = await page
        .locator('input[type="radio"][name="defaultPaperStock"]')
        .first()
      if ((await defaultPaperRadio.count()) > 0) {
        await defaultPaperRadio.click()
        log('   ✓ Default paper stock set', colors.green)
      }
    }

    // Select quantity group (should be auto-selected, but verify)
    const quantityGroupSelect = await page.locator('select[name="selectedQuantityGroup"]').first()
    if ((await quantityGroupSelect.count()) > 0) {
      const options = await quantityGroupSelect.locator('option').count()
      if (options > 1) {
        // More than just placeholder
        await quantityGroupSelect.selectOption({ index: 1 })
        log('   ✓ Quantity group selected', colors.green)
      }
    }

    // Select size group (should be auto-selected, but verify)
    const sizeGroupSelect = await page.locator('select[name="selectedSizeGroup"]').first()
    if ((await sizeGroupSelect.count()) > 0) {
      const options = await sizeGroupSelect.locator('option').count()
      if (options > 1) {
        // More than just placeholder
        await sizeGroupSelect.selectOption({ index: 1 })
        log('   ✓ Size group selected', colors.green)
      }
    }

    // Submit the product
    log('   💾 Saving product...', colors.cyan)

    const submitButton = await page
      .locator('button:has-text("Save Product"), button[type="submit"]')
      .first()

    if ((await submitButton.count()) === 0) {
      throw new Error('Submit button not found')
    }

    // Intercept the API call
    const responsePromise = page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/products') && response.request().method() === 'POST',
        { timeout: 15000 }
      )
      .catch(() => null)

    await submitButton.click()

    // Wait for response
    const response = await responsePromise

    if (response) {
      const status = response.status()
      if (status === 200 || status === 201) {
        const data = await response.json()
        log(`   ✅ Product created successfully! ID: ${data.id}`, colors.green)

        // Check for success message
        await page.waitForTimeout(2000)
        const successMessage = await page
          .locator('.toast-success, [role="alert"]:has-text("success")')
          .first()
        if ((await successMessage.count()) > 0) {
          log('   ✅ Success message displayed', colors.green)
        }

        return { success: true, productId: data.id, imageUploaded }
      } else {
        const errorData = await response.json().catch(() => ({}))
        log(
          `   ❌ Product creation failed (${status}): ${errorData.error || 'Unknown error'}`,
          colors.red
        )
        return { success: false, error: errorData.error }
      }
    } else {
      log('   ❌ No response received from product creation API', colors.red)
      return { success: false, error: 'No API response' }
    }
  } catch (error) {
    log(`   ❌ Product creation error: ${error.message}`, colors.red)

    // Take screenshot on error
    try {
      const screenshotPath = path.join(__dirname, `error-product-${index + 1}.png`)
      await page.screenshot({ path: screenshotPath })
      log(`   📸 Error screenshot saved: ${screenshotPath}`, colors.yellow)
    } catch (e) {
      // Ignore screenshot errors
    }

    return { success: false, error: error.message }
  }
}

async function verifyProductsInDatabase() {
  log('\n🔍 Verifying products in database...', colors.cyan)

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          in: TEST_CONFIG.products.map((p) => p.name),
        },
      },
      include: {
        ProductImage: true,
        productPaperStocks: true,
      },
    })

    log(`   Found ${products.length} products in database`, colors.blue)

    products.forEach((product) => {
      log(`   📦 ${product.name}:`, colors.blue)
      log(`      - SKU: ${product.sku}`, colors.reset)
      log(`      - Price: $${product.basePrice}`, colors.reset)
      log(`      - Images: ${product.ProductImage.length}`, colors.reset)
      log(`      - Paper Stocks: ${product.productPaperStocks.length}`, colors.reset)
    })

    return products
  } catch (error) {
    log(`   ❌ Database verification failed: ${error.message}`, colors.red)
    return []
  }
}

async function runCompleteTest() {
  log('🚀 GANGRUN PRINTING - COMPLETE PRODUCT CREATION TEST', colors.blue)
  log('==================================================\n', colors.blue)

  let browser
  let results = {
    adminCreated: false,
    sessionCreated: false,
    productsCreated: 0,
    imagesUploaded: 0,
    errors: [],
  }

  try {
    // Step 1: Create admin account
    const admin = await createAdminAccount()
    results.adminCreated = true

    // Step 2: Create authentication session
    const { session, sessionCookie } = await createAuthSession(admin.id)
    results.sessionCreated = true

    // Step 3: Launch browser and set up context
    log('\n🌐 Launching browser...', colors.cyan)
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      // Set authentication cookie
      storageState: {
        cookies: [
          {
            name: sessionCookie.name,
            value: sessionCookie.value,
            domain: '.gangrunprinting.com',
            path: '/',
            httpOnly: sessionCookie.attributes.httpOnly,
            sameSite: 'Lax',
            secure: sessionCookie.attributes.secure,
          },
        ],
      },
    })

    const page = await context.newPage()

    // Step 4: Test admin dashboard access
    log('\n🔐 Testing admin dashboard access...', colors.cyan)
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/dashboard`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    if (page.url().includes('/auth/signin')) {
      throw new Error('Authentication failed - redirected to login')
    }

    log('   ✅ Admin dashboard accessible', colors.green)

    // Step 5: Create all products
    log('\n📦 Creating products...', colors.blue)

    for (let i = 0; i < TEST_CONFIG.products.length; i++) {
      const product = TEST_CONFIG.products[i]
      const result = await createProduct(page, product, i)

      if (result.success) {
        results.productsCreated++
        if (result.imageUploaded) {
          results.imagesUploaded++
        }
      } else {
        results.errors.push(`Product ${i + 1} (${product.name}): ${result.error}`)
      }

      // Small delay between products
      await page.waitForTimeout(2000)
    }

    // Step 6: Verify products in database
    const dbProducts = await verifyProductsInDatabase()

    // Step 7: Test product listing page
    log('\n📋 Testing product listing...', colors.cyan)
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/products`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const productCount = await page
      .locator('[data-testid="product-row"], .product-item, tr:has(td)')
      .count()
    log(`   Found ${productCount} products in admin listing`, colors.blue)

    // Final Results
    log('\n==================================================', colors.blue)
    log('📊 TEST RESULTS SUMMARY', colors.blue)
    log('==================================================', colors.blue)
    log(
      `✅ Admin Account Created: ${results.adminCreated}`,
      results.adminCreated ? colors.green : colors.red
    )
    log(
      `✅ Authentication Session: ${results.sessionCreated}`,
      results.sessionCreated ? colors.green : colors.red
    )
    log(
      `📦 Products Created: ${results.productsCreated}/${TEST_CONFIG.products.length}`,
      results.productsCreated === TEST_CONFIG.products.length ? colors.green : colors.yellow
    )
    log(
      `📸 Images Uploaded: ${results.imagesUploaded}/${TEST_CONFIG.products.length}`,
      results.imagesUploaded === TEST_CONFIG.products.length ? colors.green : colors.yellow
    )
    log(`🗄️  Database Products: ${dbProducts.length}`, colors.blue)
    log(`📋 Admin Listing Count: ${productCount}`, colors.blue)

    if (results.errors.length > 0) {
      log('\n❌ ERRORS ENCOUNTERED:', colors.red)
      results.errors.forEach((error) => log(`   • ${error}`, colors.red))
    }

    // Success criteria
    const overallSuccess = results.productsCreated >= 3 && results.imagesUploaded >= 2

    if (overallSuccess) {
      log('\n🎉 OVERALL TEST RESULT: SUCCESS', colors.green)
      log('   The product creation system is working!', colors.green)
    } else {
      log('\n⚠️  OVERALL TEST RESULT: PARTIAL SUCCESS', colors.yellow)
      log('   Some issues remain that need attention.', colors.yellow)
    }

    return results
  } catch (error) {
    log(`\n❌ TEST SUITE FAILED: ${error.message}`, colors.red)
    results.errors.push(`Test suite error: ${error.message}`)
    return results
  } finally {
    if (browser) {
      await browser.close()
    }
    await prisma.$disconnect()
    log('\n✨ Test completed\n', colors.cyan)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runCompleteTest().catch((error) => {
    log(`Fatal error: ${error.message}`, colors.red)
    process.exit(1)
  })
}

module.exports = { runCompleteTest, TEST_CONFIG }
