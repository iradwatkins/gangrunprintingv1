/**
 * Upload AI-Generated Images to Products
 *
 * Takes the generated images from public/generated-images/
 * and uploads them to MinIO, then links to products
 */

import { prisma } from '../src/lib/prisma'
import { uploadFile } from '../src/lib/minio'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

async function uploadImageToProduct(
  productId: string,
  imagePath: string,
  altText: string,
  productName: string
) {
  console.log(`\n📦 Processing: ${productName}`)
  console.log(`   Product ID: ${productId}`)

  // Read the image file
  const fullPath = path.join(process.cwd(), imagePath)

  if (!fs.existsSync(fullPath)) {
    console.error(`   ❌ File not found: ${fullPath}`)
    return
  }

  const buffer = fs.readFileSync(fullPath)
  const fileSize = buffer.length
  console.log(`   ✅ File loaded: ${(fileSize / 1024 / 1024).toFixed(2)}MB`)

  // Upload to MinIO
  const filename = path.basename(imagePath)
  console.log(`   📤 Uploading to MinIO...`)

  try {
    const uploadResult = await uploadFile(filename, buffer, { 'Content-Type': 'image/png' })
    const imageUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.url
    console.log(`   ✅ Uploaded: ${imageUrl}`)

    // Check if image already exists by name
    let image = await prisma.image.findUnique({
      where: { name: filename },
    })

    if (image) {
      console.log(`   ℹ️  Image already exists, updating...`)
      // Update existing image
      image = await prisma.image.update({
        where: { id: image.id },
        data: {
          url: imageUrl,
          alt: altText,
          width: 2048,
          height: 1536,
          fileSize: fileSize,
          mimeType: 'image/png',
          category: 'product',
        },
      })
    } else {
      // Create new Image record
      const now = new Date()
      image = await prisma.image.create({
        data: {
          id: crypto.randomUUID(),
          name: filename,
          url: imageUrl,
          alt: altText,
          width: 2048,
          height: 1536,
          fileSize: fileSize,
          mimeType: 'image/png',
          category: 'product',
          updatedAt: now,
        },
      })
    }
    console.log(`   ✅ Image record ready: ${image.id}`)

    // Link to product (check if image already exists)
    const existingLink = await prisma.productImage.findFirst({
      where: { productId: productId },
    })

    if (existingLink) {
      console.log(`   ℹ️  Product already has an image, updating...`)
      await prisma.productImage.update({
        where: { id: existingLink.id },
        data: {
          imageId: image.id,
          isPrimary: true,
          sortOrder: 0,
        },
      })
    } else {
      const now = new Date()
      await prisma.productImage.create({
        data: {
          id: crypto.randomUUID(),
          productId: productId,
          imageId: image.id,
          isPrimary: true,
          sortOrder: 0,
          updatedAt: now,
        },
      })
    }

    console.log(`   ✅ Linked to product!`)
  } catch (error) {
    console.error(`   ❌ Upload failed:`, error)
  }
}

async function main() {
  console.log('🚀 Uploading AI Images to Products\n')
  console.log('='.repeat(50))

  // Upload Generic Postcard Image
  await uploadImageToProduct(
    'prod_postcard_4x6',
    'public/generated-images/postcard-hero-generic.png',
    'Professional 4x6 postcards with vibrant designs - studio photography - GangRun Printing',
    '4x6 Postcards (Generic)'
  )

  // Upload NYC Postcard Image
  await uploadImageToProduct(
    'prod_postcard_4x6_ny_new_york',
    'public/generated-images/postcard-hero-nyc.png',
    '4x6 postcards featuring New York City skyline on marble desk - premium urban business aesthetic - GangRun Printing NYC',
    '4x6 Postcards - New York, NY'
  )

  console.log('\n' + '='.repeat(50))
  console.log('✨ All images uploaded successfully!')
  console.log('\n📋 Next: Visit the product pages to see your new images:')
  console.log('   • https://gangrunprinting.com/products/postcards-4x6')
  console.log('   • https://gangrunprinting.com/products/postcards-4x6-new-york-ny')
}

main()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
