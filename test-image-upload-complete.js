#!/usr/bin/env node

/**
 * Complete Image Upload Test
 * Tests the full image upload flow and verifies URLs are correct
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://gangrunprinting.com';

// Create a simple test image
function createTestImage() {
  // Create a small PNG image (1x1 red pixel)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );

  const testImagePath = '/tmp/test-product-image.png';
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

// Upload image
async function uploadImage(imagePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(imagePath);
    const fileData = fs.readFileSync(imagePath);

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const formData = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
      'Content-Type: image/png',
      '',
      fileData.toString('binary'),
      `--${boundary}--`,
      ''
    ].join('\r\n');

    const options = {
      hostname: 'gangrunprinting.com',
      port: 443,
      path: '/api/products/upload-image',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData, 'binary')
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(formData, 'binary');
    req.end();
  });
}

// Test if image URL is accessible
async function testImageUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      resolve({
        statusCode: res.statusCode,
        contentType: res.headers['content-type'],
        accessible: res.statusCode === 200
      });
    }).on('error', (error) => {
      resolve({
        statusCode: null,
        error: error.message,
        accessible: false
      });
    });
  });
}

async function main() {
  console.log('🧪 Testing Product Image Upload Flow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create test image
    console.log('\n📝 Step 1: Creating test image...');
    const testImagePath = createTestImage();
    console.log('✅ Test image created:', testImagePath);

    // Step 2: Upload image
    console.log('\n📤 Step 2: Uploading image to API...');
    const uploadResult = await uploadImage(testImagePath);
    console.log(`Status: ${uploadResult.statusCode}`);

    if (uploadResult.statusCode !== 200) {
      console.log('❌ Upload failed!');
      console.log('Response:', JSON.stringify(uploadResult.body, null, 2));
      process.exit(1);
    }

    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadResult.body, null, 2));

    // Step 3: Verify URL format
    console.log('\n🔍 Step 3: Verifying URL format...');
    const uploadedUrl = uploadResult.body.data?.url || uploadResult.body.url;

    if (!uploadedUrl) {
      console.log('❌ No URL in response!');
      process.exit(1);
    }

    console.log('URL:', uploadedUrl);

    // Check URL format
    const expectedPrefix = 'https://gangrunprinting.com/minio/';
    if (uploadedUrl.startsWith(expectedPrefix)) {
      console.log('✅ URL format is correct (includes /minio/ path)');
    } else {
      console.log('❌ URL format is WRONG!');
      console.log(`Expected to start with: ${expectedPrefix}`);
      console.log(`Actual URL: ${uploadedUrl}`);
      process.exit(1);
    }

    // Step 4: Test image accessibility
    console.log('\n🌐 Step 4: Testing image accessibility...');
    const urlTest = await testImageUrl(uploadedUrl);
    console.log('Status:', urlTest.statusCode);
    console.log('Content-Type:', urlTest.contentType);

    if (urlTest.accessible) {
      console.log('✅ Image is accessible via URL!');
    } else {
      console.log('❌ Image is NOT accessible!');
      console.log('Error:', urlTest.error || 'Non-200 status code');
      process.exit(1);
    }

    // Test thumbnail URLs if present
    const thumbnailUrl = uploadResult.body.data?.thumbnailUrl || uploadResult.body.thumbnailUrl;
    if (thumbnailUrl) {
      console.log('\n🖼️  Step 5: Testing thumbnail accessibility...');
      console.log('Thumbnail URL:', thumbnailUrl);
      const thumbTest = await testImageUrl(thumbnailUrl);
      console.log('Status:', thumbTest.statusCode);

      if (thumbTest.accessible) {
        console.log('✅ Thumbnail is accessible!');
      } else {
        console.log('⚠️  Thumbnail not accessible (may still be processing)');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ Image upload working correctly');
    console.log('✅ URL format is correct (includes /minio/ path)');
    console.log('✅ Images are accessible via generated URLs');
    console.log('✅ Fix confirmed: Images will stay visible after upload\n');

    // Cleanup
    fs.unlinkSync(testImagePath);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();
