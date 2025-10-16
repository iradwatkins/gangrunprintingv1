#!/usr/bin/env node

/**
 * Test Image Transformation
 * Verifies that the data transformer correctly handles ProductImage relation
 */

const https = require('https');

const BASE_URL = 'https://gangrunprinting.com';

async function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${endpoint}`, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Failed to parse JSON', raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🧪 Testing Image Transformation\n');
  console.log('='.repeat(60));

  // Test product with images
  const productId = '8cbdfd22-ab44-42b7-b5ff-883422f05457';

  console.log(`\n📦 Fetching product: ${productId}`);
  const response = await testAPI(`/api/products/${productId}`);

  if (response.error) {
    console.log('❌ API Error:', response.error);
    process.exit(1);
  }

  const product = response.data;

  console.log('\n🔍 Product Data Structure:');
  console.log('Product Name:', product.Name);
  console.log('Has ProductImages (PascalCase):', !!product.ProductImages);
  console.log('Has productImages (camelCase):', !!product.productImages);

  if (product.ProductImages) {
    console.log('ProductImages length:', product.ProductImages.length);
    console.log('ProductImages:', JSON.stringify(product.ProductImages, null, 2));
  }

  if (product.productImages) {
    console.log('productImages length:', product.productImages.length);
    console.log('productImages:', JSON.stringify(product.productImages, null, 2));
  }

  // Check if images are present
  const imageCount = product.ProductImages?.length || 0;

  console.log('\n' + '='.repeat(60));
  if (imageCount > 0) {
    console.log('✅ SUCCESS: Images found!');
    console.log(`📊 Total images: ${imageCount}`);
    product.ProductImages.forEach((img, i) => {
      console.log(`\nImage ${i + 1}:`);
      console.log('  URL:', img.Url);
      console.log('  Thumbnail:', img.ThumbnailUrl);
      console.log('  Primary:', img.IsPrimary);
    });
  } else {
    console.log('❌ FAILED: No images found');
    console.log('This means the transformer is not picking up the ProductImage relation');
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
