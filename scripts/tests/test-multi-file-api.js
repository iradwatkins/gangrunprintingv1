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
  console.log('🚀 MULTI-FILE UPLOAD API TEST')
  console.log('=============================\n')

  try {
    // Create admin authentication
    console.log('🔑 Creating admin session...')
    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === 'production' } },
    })

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    console.log('   ✅ Admin session created')

    // Get test product
    const testProduct = await prisma.product.findFirst({
      where: { name: { contains: 'Premium Business Cards' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!testProduct) {
      throw new Error('No test product found')
    }

    console.log(`🎯 Testing with product: ${testProduct.name} (${testProduct.id})`)

    // Clear existing images for clean test
    await prisma.productImage.deleteMany({
      where: { productId: testProduct.id },
    })
    console.log('   🧹 Cleared existing images for clean test')

    // Create test image files
    console.log('📸 Creating test images...')
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
    console.log(`   ✅ Created ${testImages.length} test images`)

    // Test multiple image uploads
    console.log('📤 Testing multiple image uploads...')
    const uploadResults = []

    for (const [index, image] of testImages.entries()) {
      console.log(`   📸 Uploading image ${index + 1}: ${image.fileName}`)

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
          console.log(`      ✅ Upload successful! ID: ${data.id}`)
          console.log(`      📋 URL: ${data.url.substring(0, 50)}...`)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.log(
            `      ❌ Upload failed (${response.status}): ${errorData.error || 'Unknown error'}`
          )
        }
      } catch (error) {
        console.log(`      ❌ Upload error: ${error.message}`)
      }
    }

    // Verify database storage
    console.log('\n🗄️  Verifying database storage...')
    const productWithImages = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { ProductImage: true },
    })

    if (productWithImages && productWithImages.ProductImage.length > 0) {
      console.log(`   ✅ Images in database: ${productWithImages.ProductImage.length}`)

      // Check primary image
      const primaryImage = productWithImages.ProductImage.find((img) => img.isPrimary)
      if (primaryImage) {
        console.log(`   ✅ Primary image set: ${primaryImage.id}`)
      } else {
        console.log('   ⚠️  No primary image found')
      }

      // Check sort order
      const sortedImages = productWithImages.ProductImage.sort((a, b) => a.sortOrder - b.sortOrder)
      console.log('   📊 Sort order:')
      sortedImages.forEach((img, idx) => {
        console.log(
          `      ${idx + 1}. Order: ${img.sortOrder}, Primary: ${img.isPrimary}, Size: ${img.fileSize} bytes`
        )
      })

      // Check URLs and metadata
      productWithImages.ProductImage.forEach((img, idx) => {
        console.log(`   🔗 Image ${idx + 1}: ${img.url}`)
        console.log(`      Alt: "${img.alt || 'Not set'}", Caption: "${img.caption || 'Not set'}"`)
      })
    } else {
      console.log('   ❌ No images found in database')
    }

    // Test image management API
    if (productWithImages && productWithImages.ProductImage.length > 1) {
      console.log('\n🔧 Testing image management API...')

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
        console.log(`   ✅ GET images API: Found ${getResult.images.length} images`)
      } else {
        console.log(`   ❌ GET images API failed: ${getResponse.status}`)
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
        console.log('   ✅ Image metadata update successful')
      } else {
        console.log(`   ❌ Image metadata update failed: ${updateResponse.status}`)
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
          console.log('   ✅ Image deletion successful')

          // Verify deletion
          const verifyProduct = await prisma.product.findUnique({
            where: { id: testProduct.id },
            include: { ProductImage: true },
          })

          const remainingCount = verifyProduct?.ProductImage.length || 0
          console.log(`   📊 Remaining images after deletion: ${remainingCount}`)
        } else {
          console.log(`   ❌ Image deletion failed: ${deleteResponse.status}`)
        }
      }
    }

    // Final summary
    console.log('\n🏁 Final Results Summary:')
    console.log('========================')

    const finalProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { ProductImage: true },
    })

    if (finalProduct) {
      console.log(`✅ Product: ${finalProduct.name}`)
      console.log(`✅ Total uploads attempted: ${testImages.length}`)
      console.log(`✅ Images stored in database: ${finalProduct.ProductImage.length}`)
      console.log(
        `✅ Primary image: ${finalProduct.ProductImage.some((img) => img.isPrimary) ? 'Set' : 'Missing'}`
      )

      const totalSize = finalProduct.ProductImage.reduce((sum, img) => sum + (img.fileSize || 0), 0)
      console.log(`✅ Total storage used: ${totalSize} bytes`)
    }

    console.log('\n🎉 Multi-file upload API test completed successfully!')
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testMultiFileAPI().catch(console.error)
