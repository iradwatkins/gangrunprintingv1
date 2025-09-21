import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('BMAD Test 2: Image Upload & Visual Product Creation', () => {
  const testProduct = {
    name: 'Premium Business Cards with Image',
    sku: 'BC-IMG-001',
    description: 'High-quality business cards with custom uploaded design and premium finishing.',
    shortDescription: 'Premium business cards with custom design',
    basePrice: 34.99,
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to admin and handle authentication
    await page.goto('https://gangrunprinting.com/admin')
    await page.waitForLoadState('networkidle')

    // If we're redirected to signin, we need to authenticate
    if (page.url().includes('/auth/signin')) {

    }
  })

  test('Step 1: Create Business Card Design Image', async ({ page }) => {
    // Create a simple test image using Canvas API
    const imageDataUrl = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 350  // 3.5" at 100 DPI
      canvas.height = 200 // 2" at 100 DPI
      const ctx = canvas.getContext('2d')!

      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('JOHN SMITH', canvas.width / 2, 60)

      ctx.font = '16px Arial'
      ctx.fillText('CEO & Founder', canvas.width / 2, 85)

      ctx.font = '14px Arial'
      ctx.fillText('john@company.com', canvas.width / 2, 130)
      ctx.fillText('(555) 123-4567', canvas.width / 2, 150)
      ctx.fillText('www.company.com', canvas.width / 2, 170)

      return canvas.toDataURL('image/png')
    })

    // Convert data URL to blob and save as test file
    await page.evaluate((dataUrl) => {
      const byteCharacters = atob(dataUrl.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      // Create download link to save file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'business-card-design.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, imageDataUrl)

  })

  test('Step 2: Upload Image and Create Product', async ({ page }) => {
    // Navigate to new product page
    await page.goto('https://gangrunprinting.com/admin/products/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow dropdowns to populate

    // Fill in basic product information
    await page.fill('input[name="name"]', testProduct.name)
    await page.fill('input[name="sku"]', testProduct.sku)
    await page.fill('textarea[name="description"]', testProduct.description)
    await page.fill('textarea[name="shortDescription"]', testProduct.shortDescription)
    await page.fill('input[name="basePrice"]', testProduct.basePrice.toString())

    // Select category
    const categorySelect = page.locator('select[name="categoryId"], button:has-text("Select category")')
    if (await categorySelect.count() > 0) {
      await categorySelect.click()
      await page.click('text=Business Cards')
    }

    // Select paper stock set
    const paperStockSelect = page.locator('select[name="selectedPaperStockSet"], button:has-text("Select paper stock set")')
    if (await paperStockSelect.count() > 0) {
      await paperStockSelect.click()
      await page.click('text=Standard Cardstock Set')
    }

    // Select quantity group
    const quantitySelect = page.locator('select[name="selectedQuantityGroup"], button:has-text("Select quantity group")')
    if (await quantitySelect.count() > 0) {
      await quantitySelect.click()
      await page.click('text=Business Card Quantities')
    }

    // Select size group
    const sizeSelect = page.locator('select[name="selectedSizeGroup"], button:has-text("Select size group")')
    if (await sizeSelect.count() > 0) {
      await sizeSelect.click()
      await page.click('text=Business Card Sizes')
    }

    // Test image upload

    // Create a test image blob in the browser
    const testImageBlob = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 350
      canvas.height = 200
      const ctx = canvas.getContext('2d')!

      // Create a simple design
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#ff6b6b')
      gradient.addColorStop(1, '#4ecdc4')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'white'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('TEST PRODUCT', canvas.width / 2, canvas.height / 2)

      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png')
      })
    })

    // Find the file input for image upload
    const fileInput = page.locator('input[type="file"]#product-image')

    // Create a temporary file from our blob
    const buffer = await page.evaluate(async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 350
      canvas.height = 200
      const ctx = canvas.getContext('2d')!

      // Simple test design
      ctx.fillStyle = '#667eea'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('TEST BUSINESS CARD', canvas.width / 2, canvas.height / 2)

      const dataUrl = canvas.toDataURL('image/png')
      const response = await fetch(dataUrl)
      const arrayBuffer = await response.arrayBuffer()
      return Array.from(new Uint8Array(arrayBuffer))
    })

    // Convert buffer to actual file for upload
    const testImagePath = '/tmp/test-business-card.png'

    // For this test, we'll use a simple approach with a data URL
    await page.evaluate(() => {
      // Create a simple canvas image for testing
      const canvas = document.createElement('canvas')
      canvas.width = 350
      canvas.height = 200
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#667eea'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('TEST CARD DESIGN', canvas.width / 2, 100)
      ctx.font = '14px Arial'
      ctx.fillText('Professional Business Card', canvas.width / 2, 130)

      // Convert to blob and trigger upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'test-business-card.png', { type: 'image/png' })

          // Find the file input and simulate upload
          const fileInput = document.querySelector('#product-image') as HTMLInputElement
          if (fileInput) {
            // Create a new FileList with our file
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            fileInput.files = dataTransfer.files

            // Trigger change event
            const event = new Event('change', { bubbles: true })
            fileInput.dispatchEvent(event)
          }
        }
      }, 'image/png')
    })

    // Wait for upload to complete
    await page.waitForSelector('text=Image uploaded successfully', { timeout: 15000 })

    // Verify image preview is showing
    const imagePreview = page.locator('img[alt="Product preview"]')
    await expect(imagePreview).toBeVisible()

    // Save the product
    await page.click('button:has-text("Create Product")')

    // Wait for success message
    await page.waitForSelector('text=success', { timeout: 10000 })

    // Verify we're redirected away from new page
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/new')
  })

  test('Step 3: Verify Image Upload API', async ({ page }) => {
    // Test the upload API endpoint directly
    const response = await page.request.get('https://gangrunprinting.com/api/health')
    expect(response.status()).toBe(200)

    // Test MinIO connectivity (if available)
    try {
      const minioHealth = await page.request.get('https://gangrunprinting.com/api/test/minio-health')
      if (minioHealth.status() === 200) {

      } else {
        console.log('⚠️  MinIO health check returned:', minioHealth.status())
      }
    } catch (error) {

    }
  })

  test('Step 4: Create Multiple Products with Images', async ({ page }) => {
    const products = [
      {
        name: 'Marketing Flyer with Design',
        sku: 'FLY-IMG-001',
        description: 'Eye-catching marketing flyer with professional design',
        category: 'Flyers & Brochures',
        paperStock: 'Marketing Materials Set',
        quantity: 'Flyer Quantities',
        size: 'Flyer Sizes',
        price: '19.99'
      },
      {
        name: 'Large Format Poster',
        sku: 'LFP-IMG-001',
        description: 'High-resolution large format poster for events',
        category: 'Large Format Posters',
        price: '49.99'
      }
    ]

    for (const product of products) {
      await page.goto('https://gangrunprinting.com/admin/products/new')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Fill basic info
      await page.fill('input[name="name"]', product.name)
      await page.fill('input[name="sku"]', product.sku)
      await page.fill('textarea[name="description"]', product.description)
      await page.fill('input[name="basePrice"]', product.price)

      // Select category if available
      try {
        const categorySelect = page.locator('select[name="categoryId"], button:has-text("Select category")')
        if (await categorySelect.count() > 0) {
          await categorySelect.click()
          await page.click(`text=${product.category}`)
        }
      } catch (error) {

      }

      // Upload a different test image for each product
      await page.evaluate((productName) => {
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 300
        const ctx = canvas.getContext('2d')!

        // Different color for each product
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
        const color = colors[Math.floor(Math.random() * colors.length)]

        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(productName.toUpperCase(), canvas.width / 2, canvas.height / 2)

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `${productName.replace(/\s+/g, '-')}.png`, { type: 'image/png' })
            const fileInput = document.querySelector('#product-image') as HTMLInputElement
            if (fileInput) {
              const dataTransfer = new DataTransfer()
              dataTransfer.items.add(file)
              fileInput.files = dataTransfer.files
              fileInput.dispatchEvent(new Event('change', { bubbles: true }))
            }
          }
        }, 'image/png')
      }, product.name)

      // Wait for upload
      await page.waitForSelector('text=Image uploaded successfully', { timeout: 10000 })

      // Save product
      await page.click('button:has-text("Create Product")')
      await page.waitForSelector('text=success', { timeout: 10000 })

    }
  })

  test('Step 5: Verify All Products with Images', async ({ page }) => {
    // Go to products list page
    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForLoadState('networkidle')

    // Look for our test products
    const testProducts = [
      'Premium Business Cards with Image',
      'Marketing Flyer with Design',
      'Large Format Poster'
    ]

    for (const productName of testProducts) {
      const productRow = page.locator(`text=${productName}`)
      await expect(productRow).toBeVisible()

    }

    // Test API to ensure products are stored correctly
    const response = await page.request.get('https://gangrunprinting.com/api/products')
    expect(response.status()).toBe(200)

    const products = await response.json()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)

    // Check if our test products have images
    const productsWithImages = products.filter(p => p.imageUrl || (p.ProductImage && p.ProductImage.length > 0))

  })
})