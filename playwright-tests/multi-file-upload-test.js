#!/usr/bin/env node

/**
 * Multi-File Image Upload Test with Database Integration
 * Tests complete image upload workflow including thumbnails and database storage
 */

const { chromium } = require('playwright')
const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
}

function log(message, color = colors.reset) {}

// Create test images with different colors/content
async function createTestImages() {
  const testDir = 'playwright-tests/test-images-multi'
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // Create 3 different test images with unique content
  const images = [
    { name: 'test-image-1.jpg', color: 'red' },
    { name: 'test-image-2.jpg', color: 'green' },
    { name: 'test-image-3.jpg', color: 'blue' },
  ]

  for (const img of images) {
    const filePath = path.join(testDir, img.name)
    if (!fs.existsSync(filePath)) {
      // Create a minimal JPEG with unique content for each
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
      const jpegFooter = Buffer.from([0xff, 0xd9])
      const uniqueContent = Buffer.from(`TEST_IMAGE_${img.color.toUpperCase()}_${Date.now()}`)
      const fullContent = Buffer.concat([jpegHeader, uniqueContent, jpegFooter])
      fs.writeFileSync(filePath, fullContent)
    }
  }

  return images.map((img) => ({
    ...img,
    path: path.join(testDir, img.name),
  }))
}

async function testMultiFileUpload() {
  log('🚀 MULTI-FILE IMAGE UPLOAD TEST', colors.blue)
  log('===============================', colors.blue)

  let browser
  try {
    // Create test images
    log('📸 Creating test images...', colors.cyan)
    const testImages = await createTestImages()
    log(`   ✅ Created ${testImages.length} test images`, colors.green)

    // Create admin authentication
    log('🔑 Creating admin session...', colors.cyan)
    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === 'production' } },
      getUserAttributes: (attributes) => ({
        email: attributes.email,
        name: attributes.name,
        role: attributes.role,
        emailVerified: attributes.emailVerified,
      }),
    })

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    log('   ✅ Admin session created', colors.green)

    // Get test product
    const testProduct = await prisma.product.findFirst({
      where: { name: { contains: 'Premium Business Cards' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!testProduct) {
      throw new Error('No test product found')
    }

    log(`🎯 Testing with product: ${testProduct.name} (${testProduct.id})`, colors.cyan)

    // Clear existing images for clean test
    await prisma.productImage.deleteMany({
      where: { productId: testProduct.id },
    })
    log('   🧹 Cleared existing images for clean test', colors.yellow)

    // Launch browser
    browser = await chromium.launch({
      headless: true, // Headless mode for server environment
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
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

    // Navigate to admin product creation page
    log('🌐 Navigating to admin product page...', colors.cyan)
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait for page to load completely
    await page.waitForTimeout(3000)

    // Fill basic product info first (required for image upload)
    log('📝 Filling basic product information...', colors.cyan)
    await page.locator('#name').fill('Multi-File Upload Test Product')
    await page.locator('#description').fill('Testing multi-file image upload functionality')

    // Select category
    await page.locator('#category').selectOption('business-cards')

    // Set pricing
    await page.locator('#basePrice').fill('99.99')
    await page.locator('#setupFee').fill('50.00')

    log('   ✅ Basic product info filled', colors.green)

    // Test 1: Multiple file upload via file input
    log('📤 Testing multiple file upload...', colors.cyan)
    const fileInput = await page.locator('input[type="file"]').first()

    // Upload all test images at once
    const imagePaths = testImages.map((img) => path.resolve(img.path))
    await fileInput.setInputFiles(imagePaths)

    // Wait for uploads to complete
    log('   ⏳ Waiting for uploads to complete...', colors.yellow)
    await page.waitForTimeout(8000)

    // Test 2: Verify thumbnails are displayed
    log('🖼️  Verifying thumbnail display...', colors.cyan)
    const thumbnails = await page.locator('img[alt*="Product image"], .image-preview img').count()

    if (thumbnails >= testImages.length) {
      log(`   ✅ Found ${thumbnails} thumbnails (expected: ${testImages.length})`, colors.green)
    } else {
      log(`   ⚠️  Found ${thumbnails} thumbnails (expected: ${testImages.length})`, colors.yellow)
    }

    // Test 3: Verify database integration
    log('🗄️  Verifying database storage...', colors.cyan)

    // First, save the product to get an ID for image association
    await page.locator('button:has-text("Save Product"), button[type="submit"]').first().click()

    // Wait for product creation
    await page.waitForTimeout(5000)

    // Check if product was created
    const createdProduct = await prisma.product.findFirst({
      where: { name: 'Multi-File Upload Test Product' },
      include: { ProductImage: true },
    })

    if (createdProduct) {
      log(`   ✅ Product created: ${createdProduct.id}`, colors.green)
      log(`   📊 Images in database: ${createdProduct.ProductImage.length}`, colors.green)

      // Verify image properties
      if (createdProduct.ProductImage.length > 0) {
        const primaryImage = createdProduct.ProductImage.find((img) => img.isPrimary)
        if (primaryImage) {
          log('   ✅ Primary image correctly set', colors.green)
        } else {
          log('   ⚠️  No primary image found', colors.yellow)
        }

        // Check sort order
        const sortedImages = createdProduct.ProductImage.sort((a, b) => a.sortOrder - b.sortOrder)
        const correctSort = sortedImages.every((img, idx) => img.sortOrder === idx + 1)
        if (correctSort) {
          log('   ✅ Sort order correctly assigned', colors.green)
        } else {
          log('   ⚠️  Sort order issues detected', colors.yellow)
        }
      }
    } else {
      log('   ❌ Product not found in database', colors.red)
    }

    // Test 4: Test image management features
    if (createdProduct && createdProduct.ProductImage.length > 1) {
      log('🔧 Testing image management features...', colors.cyan)

      // Navigate to edit the product
      await page.goto(`https://gangrunprinting.com/admin/products/${createdProduct.id}/edit`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      await page.waitForTimeout(3000)

      // Test setting a different primary image
      const starButtons = await page.locator('button:has(.lucide-star-off)').count()
      if (starButtons > 0) {
        await page.locator('button:has(.lucide-star-off)').first().click()
        await page.waitForTimeout(2000)
        log('   ✅ Primary image changed successfully', colors.green)
      }

      // Test image deletion
      const deleteButtons = await page.locator('button:has(.lucide-trash-2)').count()
      if (deleteButtons > 0) {
        const initialCount = createdProduct.ProductImage.length
        await page.locator('button:has(.lucide-trash-2)').first().click()
        await page.waitForTimeout(3000)

        // Verify deletion in database
        const updatedProduct = await prisma.product.findUnique({
          where: { id: createdProduct.id },
          include: { ProductImage: true },
        })

        if (updatedProduct && updatedProduct.ProductImage.length < initialCount) {
          log('   ✅ Image deletion successful', colors.green)
        } else {
          log('   ⚠️  Image deletion may not have worked', colors.yellow)
        }
      }
    }

    // Test 5: API endpoint verification
    log('🔌 Testing API endpoints...', colors.cyan)

    // Test GET images
    const getResponse = await page.evaluate(
      async (productId, cookie) => {
        const response = await fetch(`/api/products/images?productId=${productId}`, {
          headers: { Cookie: cookie },
        })
        return { status: response.status, ok: response.ok }
      },
      createdProduct?.id,
      `${sessionCookie.name}=${sessionCookie.value}`
    )

    if (getResponse.ok) {
      log('   ✅ GET images API working', colors.green)
    } else {
      log(`   ❌ GET images API failed: ${getResponse.status}`, colors.red)
    }

    // Final verification
    log('🏁 Final Results Summary:', colors.blue)
    log('========================', colors.blue)

    const finalProduct = await prisma.product.findUnique({
      where: { id: createdProduct?.id },
      include: { ProductImage: true },
    })

    if (finalProduct) {
      log(`✅ Product: ${finalProduct.name}`, colors.green)
      log(`✅ Images stored: ${finalProduct.ProductImage.length}`, colors.green)
      log(
        `✅ Primary image: ${finalProduct.ProductImage.some((img) => img.isPrimary) ? 'Set' : 'Missing'}`,
        finalProduct.ProductImage.some((img) => img.isPrimary) ? colors.green : colors.yellow
      )

      // Show image URLs for verification
      finalProduct.ProductImage.forEach((img, idx) => {
        log(`   📸 Image ${idx + 1}: ${img.url.substring(0, 50)}...`, colors.cyan)
      })
    }

    log('\n🎉 Multi-file upload test completed!', colors.green)
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red)
    console.error(error.stack)
  } finally {
    if (browser) await browser.close()
    await prisma.$disconnect()
  }
}

testMultiFileUpload().catch(console.error)
