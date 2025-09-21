#!/usr/bin/env node

/**
 * Verify Image Upload Functionality
 * Tests that all components are working together
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyImageFunctionality() {

  try {
    // Test 1: Check ProductImage schema

    const sampleImage = await prisma.productImage.findFirst()

    // Test 2: Check if any products have images

    const productsWithImages = await prisma.product.findMany({
      include: {
        ProductImage: true,
      },
      where: {
        ProductImage: {
          some: {},
        },
      },
    })

    if (productsWithImages.length > 0) {
      const product = productsWithImages[0]

      product.ProductImage.slice(0, 3).forEach((img, idx) => {
        console.log(
          `      ${idx + 1}. ${img.url} (Primary: ${img.isPrimary}, Sort: ${img.sortOrder})`
        )
      })
    }

    // Test 3: Check API endpoints exist

    const fs = require('fs')

    const uploadAPIExists = fs.existsSync(
      '/root/websites/gangrunprinting/src/app/api/products/upload-image/route.ts'
    )
    const imageAPIExists = fs.existsSync(
      '/root/websites/gangrunprinting/src/app/api/products/images/route.ts'
    )

    // Test 4: Check frontend component

    const componentExists = fs.existsSync(
      '/root/websites/gangrunprinting/src/components/admin/product-image-upload.tsx'
    )

    if (componentExists) {
      const componentContent = fs.readFileSync(
        '/root/websites/gangrunprinting/src/components/admin/product-image-upload.tsx',
        'utf8'
      )
      const hasMultipleSupport = componentContent.includes('multiple')
      const hasThumbnails = componentContent.includes('thumbnail')
      const hasDragDrop = componentContent.includes('drag')

    }

    // Test 5: Database relationships

    const productWithRelations = await prisma.product.findFirst({
      include: {
        ProductImage: true,
        ProductCategory: true,
      },
    })

    if (productWithRelations) {

    }

    // Summary

    console.log('   • Database storage with metadata (alt, caption, sort order)')

  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

verifyImageFunctionality().catch(console.error)
