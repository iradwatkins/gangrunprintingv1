#!/usr/bin/env node

/**
 * Simple File Upload Test
 */

const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const TEST_IMAGE = '/tmp/test-flyer.jpg';

async function testUpload() {
  console.log('\n🧪 Testing File Upload API...\n');

  const form = new FormData();
  form.append('file', fs.createReadStream(TEST_IMAGE), {
    filename: 'test-upload.jpg',
    contentType: 'image/jpeg',
  });
  form.append('fileType', 'CUSTOMER_ARTWORK');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3020,
      path: '/api/upload',
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);

        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200 && result.success) {
            console.log('✅ PASS: File uploaded successfully!');
            console.log(`   Path: ${result.path}`);
            console.log(`   Size: ${result.size} bytes\n`);
            resolve(true);
          } else {
            console.log('❌ FAIL: Upload failed');
            console.log(`   Error: ${result.error || 'Unknown'}\n`);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ FAIL: Invalid JSON response');
          console.log(`   Error: ${e.message}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ FAIL: Request error');
      console.log(`   Error: ${error.message}\n`);
      resolve(false);
    });

    form.pipe(req);
  });
}

testUpload()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
