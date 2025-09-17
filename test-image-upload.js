#!/usr/bin/env node

/**
 * Image Upload Test
 * Tests image upload functionality with authentication
 */

const { PrismaClient } = require('@prisma/client');
const { Lucia } = require("lucia");
const { PrismaAdapter } = require("@lucia-auth/adapter-prisma");
const FormData = require('form-data');
const fs = require('fs');

const prisma = new PrismaClient();

async function testImageUpload() {
  console.log('📸 IMAGE UPLOAD FUNCTIONALITY TEST');
  console.log('=================================\n');

  try {
    // Create authentication session
    console.log('🔑 Creating admin authentication...');
    const adapter = new PrismaAdapter(prisma.session, prisma.user);
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === "production" } }
    });

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const session = await lucia.createSession(adminUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    console.log('   ✅ Admin session created\n');

    // Get the first product ID from our recent creations
    const recentProduct = await prisma.product.findFirst({
      where: { name: { contains: 'Premium Business Cards' } },
      orderBy: { createdAt: 'desc' }
    });

    if (!recentProduct) {
      throw new Error('No recent product found for testing');
    }

    console.log(`🎯 Testing image upload for product: ${recentProduct.name} (${recentProduct.id})`);

    // Test if image file exists
    const imagePath = 'playwright-tests/sample-images/test-image.jpg';
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Test image not found at ${imagePath}`);
    }

    console.log('📋 Image file size:', fs.statSync(imagePath).size, 'bytes');

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('productId', recentProduct.id);

    console.log('📤 Uploading image...');

    const response = await fetch('https://gangrunprinting.com/api/products/upload-image', {
      method: 'POST',
      headers: {
        'Cookie': `${sessionCookie.name}=${sessionCookie.value}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Image uploaded successfully!');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));

      // Verify the image was stored in database
      const updatedProduct = await prisma.product.findUnique({
        where: { id: recentProduct.id },
        include: { ProductImage: true }
      });

      if (updatedProduct.ProductImage && updatedProduct.ProductImage.length > 0) {
        console.log('   ✅ Image record created in database');
        console.log('   📋 Image URL:', updatedProduct.ProductImage[0].imageUrl);
      } else {
        console.log('   ⚠️  No image record found in database');
      }

    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`   ❌ Upload failed (${response.status}): ${errorData.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

testImageUpload().catch(console.error);
