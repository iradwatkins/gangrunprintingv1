#!/usr/bin/env node

/**
 * Multi-File Upload API Test with Database Integration
 * Tests image upload API and database storage functionality
 */

const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')
const fs = require('fs')
const FormData = require('form-data')

const prisma = new PrismaClient()

async function testMultiFileAPI() {
  try {
    // Create admin authentication

    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === 'production' } },
    })

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    // Get test product
    const testProduct = await prisma.product.findFirst({
      where: { name: { contains: 'Premium Business Cards' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!testProduct) {
      throw new Error('No test product found')
    }

    // Clear existing images for clean test
    await prisma.productImage.deleteMany({
      where: { productId: testProduct.id },
    })

    // Create test image files

    const testImages = []
    for (let i = 1; i <= 3; i++) {
      const fileName = `test-image-${i}.jpg`
      const filePath = `playwright-tests/sample-images/${fileName}`

      // Ensure directory exists
      if (!fs.existsSync('playwright-tests/sample-images')) {
        fs.mkdirSync('playwright-tests/sample-images', { recursive: true })
      }

      // Create a simple JPEG file
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
      const jpegFooter = Buffer.from([0xff, 0xd9])
      const uniqueContent = Buffer.from(`TEST_IMAGE_${i}_${Date.now()}`)
      const fullContent = Buffer.concat([jpegHeader, uniqueContent, jpegFooter])

      fs.writeFileSync(filePath, fullContent)
      testImages.push({ fileName, filePath, size: fullContent.length })
    }

    // Test multiple image uploads

    const uploadResults = []

    for (const [index, image] of testImages.entries()) {
      const formData = new FormData()
      formData.append('file', fs.createReadStream(image.filePath), {
        filename: image.fileName,
        contentType: 'image/jpeg',
      })
      formData.append('productId', testProduct.id)

      try {
        const response = await fetch('https://gangrunprinting.com/api/products/upload-image', {
          method: 'POST',
          headers: {
            Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
            ...formData.getHeaders(),
          },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadResults.push(data)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.log(
            `      ❌ Upload failed (${response.status}): ${errorData.error || 'Unknown error'}`
          )
        }
      } catch (error) {}
    }

    // Verify database storage

    const productWithImages = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { ProductImage: true },
    })

    if (productWithImages && productWithImages.ProductImage.length > 0) {
      // Check primary image
      const primaryImage = productWithImages.ProductImage.find((img) => img.isPrimary)
      if (primaryImage) {
      } else {
      }

      // Check sort order
      const sortedImages = productWithImages.ProductImage.sort((a, b) => a.sortOrder - b.sortOrder)

      sortedImages.forEach((img, idx) => {})

      // Check URLs and metadata
      productWithImages.ProductImage.forEach((img, idx) => {})
    } else {
    }

    // Test image management API
    if (productWithImages && productWithImages.ProductImage.length > 1) {
      // Test GET images API
      const getResponse = await fetch(
        `https://gangrunprinting.com/api/products/images?productId=${testProduct.id}`,
        {
          headers: {
            Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
          },
        }
      )

      if (getResponse.ok) {
        const getResult = await getResponse.json()
      } else {
      }

      // Test updating image metadata
      const firstImage = productWithImages.ProductImage[0]
      const updateResponse = await fetch('https://gangrunprinting.com/api/products/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
        },
        body: JSON.stringify({
          imageId: firstImage.id,
          alt: 'Updated alt text',
          caption: 'Test caption',
          isPrimary: true,
        }),
      })

      if (updateResponse.ok) {
      } else {
      }

      // Test deletion
      if (productWithImages.ProductImage.length > 1) {
        const lastImage = productWithImages.ProductImage[productWithImages.ProductImage.length - 1]
        const deleteResponse = await fetch(
          `https://gangrunprinting.com/api/products/images?imageId=${lastImage.id}`,
          {
            method: 'DELETE',
            headers: {
              Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
            },
          }
        )

        if (deleteResponse.ok) {
          // Verify deletion
          const verifyProduct = await prisma.product.findUnique({
            where: { id: testProduct.id },
            include: { ProductImage: true },
          })

          const remainingCount = verifyProduct?.ProductImage.length || 0
        } else {
        }
      }
    }

    // Final summary

    const finalProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { ProductImage: true },
    })

    if (finalProduct) {
      console.log(
        `✅ Primary image: ${finalProduct.ProductImage.some((img) => img.isPrimary) ? 'Set' : 'Missing'}`
      )

      const totalSize = finalProduct.ProductImage.reduce((sum, img) => sum + (img.fileSize || 0), 0)
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testMultiFileAPI().catch(console.error)
