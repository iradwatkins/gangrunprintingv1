/**
 * Test File Upload Security System
 *
 * Tests:
 * 1. File validation (MIME type, size, sanitization)
 * 2. Rate limiting (10 uploads/minute)
 * 3. Response headers (X-RateLimit-*)
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3002';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-error-boundary-fix.png');

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to format response
function formatResponse(response, body) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
      'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
      'retry-after': response.headers.get('retry-after'),
    },
    body: body,
  };
}

// Test 1: Upload temporary file (mimics customer artwork upload)
async function testTemporaryFileUpload(attemptNumber) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${attemptNumber}: Uploading file to temporary storage`);
  console.log('='.repeat(60));

  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(TEST_IMAGE_PATH);
    const stats = fs.statSync(TEST_IMAGE_PATH);

    form.append('file', fileStream, {
      filename: 'test-upload.png',
      contentType: 'image/png',
      knownLength: stats.size,
    });
    form.append('productId', 'test-product-id');

    const response = await fetch(`${BASE_URL}/api/upload/temporary`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const data = await response.json();
    const result = formatResponse(response, data);

    console.log(`\n✅ Upload Attempt ${attemptNumber}:`);
    console.log(`   Status: ${result.status} ${result.statusText}`);
    console.log(`   File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   MIME Type: image/png`);
    console.log(`\n📊 Rate Limit Headers:`);
    console.log(`   Remaining: ${result.headers['x-ratelimit-remaining'] || 'N/A'}`);
    console.log(`   Reset: ${result.headers['x-ratelimit-reset'] || 'N/A'}`);
    console.log(`   Retry After: ${result.headers['retry-after'] || 'N/A'}`);

    if (response.ok) {
      console.log(`\n✅ Response Body:`);
      console.log(`   File ID: ${data.fileId}`);
      console.log(`   Original Name: ${data.originalName}`);
      console.log(`   Size: ${data.size} bytes`);
      console.log(`   MIME Type: ${data.mimeType}`);
    } else {
      console.log(`\n❌ Error Response:`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }

    return result;
  } catch (error) {
    console.error(`\n❌ Upload ${attemptNumber} failed:`, error.message);
    return null;
  }
}

// Test 2: Test file validation with invalid files
async function testFileValidation() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test: File Validation (Dangerous Extension)');
  console.log('='.repeat(60));

  // Create a fake .exe file for testing
  const dangerousFile = path.join(__dirname, 'test-malware.exe');
  fs.writeFileSync(dangerousFile, 'fake executable content');

  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(dangerousFile);

    form.append('file', fileStream, {
      filename: 'malware.exe',
      contentType: 'application/x-msdownload',
    });
    form.append('productId', 'test-product-id');

    const response = await fetch(`${BASE_URL}/api/upload/temporary`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const data = await response.json();

    console.log(`\n📋 Validation Test Result:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Expected: 400 Bad Request (blocked .exe extension)`);

    if (response.status === 400) {
      console.log(`   ✅ PASSED: Dangerous file correctly rejected`);
      console.log(`   Error Message: ${data.error}`);
    } else {
      console.log(`   ❌ FAILED: Dangerous file was accepted!`);
    }

    // Clean up
    fs.unlinkSync(dangerousFile);
  } catch (error) {
    console.error(`\n❌ Validation test failed:`, error.message);
    fs.unlinkSync(dangerousFile);
  }
}

// Test 3: Test filename sanitization
async function testFilenameSanitization() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test: Filename Sanitization (Directory Traversal)');
  console.log('='.repeat(60));

  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(TEST_IMAGE_PATH);

    // Try directory traversal attack
    form.append('file', fileStream, {
      filename: '../../../etc/passwd.png',
      contentType: 'image/png',
    });
    form.append('productId', 'test-product-id');

    const response = await fetch(`${BASE_URL}/api/upload/temporary`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const data = await response.json();

    console.log(`\n📋 Sanitization Test Result:`);
    console.log(`   Original Filename: ../../../etc/passwd.png`);
    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      console.log(`   Sanitized Filename: ${data.originalName}`);
      if (!data.originalName.includes('..') && !data.originalName.includes('/')) {
        console.log(`   ✅ PASSED: Directory traversal removed`);
      } else {
        console.log(`   ❌ FAILED: Directory traversal still present!`);
      }
    } else {
      console.log(`   Response: ${data.error}`);
    }
  } catch (error) {
    console.error(`\n❌ Sanitization test failed:`, error.message);
  }
}

// Test 4: Test rate limiting (rapid uploads)
async function testRateLimiting() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test: Rate Limiting (10 uploads/minute limit)');
  console.log('='.repeat(60));

  const results = [];

  for (let i = 1; i <= 12; i++) {
    console.log(`\nAttempt ${i}/12...`);
    const result = await testTemporaryFileUpload(i);
    results.push(result);

    // Small delay to see rate limit counters
    await sleep(100);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('Rate Limiting Summary:');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r && r.status === 200).length;
  const rateLimitedCount = results.filter(r => r && r.status === 429).length;

  console.log(`\n📊 Results:`);
  console.log(`   Successful: ${successCount}/12`);
  console.log(`   Rate Limited (429): ${rateLimitedCount}/12`);
  console.log(`   Expected: ~10 successful, ~2 rate limited`);

  if (successCount >= 9 && successCount <= 11 && rateLimitedCount >= 1) {
    console.log(`\n   ✅ PASSED: Rate limiting working correctly`);
  } else {
    console.log(`\n   ❌ WARNING: Rate limiting may not be working as expected`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 FILE UPLOAD SECURITY TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Image: ${TEST_IMAGE_PATH}`);
  console.log(`Image Size: ${(fs.statSync(TEST_IMAGE_PATH).size / 1024).toFixed(2)} KB`);

  try {
    // Test 1: Basic upload (3 times as requested)
    console.log('\n\n' + '🔷'.repeat(30));
    console.log('PART 1: BASIC FILE UPLOAD (3 ATTEMPTS)');
    console.log('🔷'.repeat(30));

    for (let i = 1; i <= 3; i++) {
      await testTemporaryFileUpload(i);
      await sleep(500); // Small delay between uploads
    }

    // Test 2: File validation
    console.log('\n\n' + '🔷'.repeat(30));
    console.log('PART 2: FILE VALIDATION TESTS');
    console.log('🔷'.repeat(30));

    await testFileValidation();
    await sleep(500);

    // Test 3: Filename sanitization
    console.log('\n\n' + '🔷'.repeat(30));
    console.log('PART 3: FILENAME SANITIZATION TESTS');
    console.log('🔷'.repeat(30));

    await testFilenameSanitization();
    await sleep(500);

    // Test 4: Rate limiting (optional - uncomment to test)
    // console.log('\n\n' + '🔷'.repeat(30));
    // console.log('PART 4: RATE LIMITING TESTS (12 RAPID UPLOADS)');
    // console.log('🔷'.repeat(30));
    // await testRateLimiting();

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(60));
    console.log('\nNOTE: To test rate limiting (10 uploads/min), uncomment Part 4\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`).catch(() => null);
    if (!response || !response.ok) {
      console.error(`\n❌ Server not responding at ${BASE_URL}`);
      console.log('\nPlease ensure the server is running:');
      console.log('  pm2 status');
      console.log('  pm2 logs gangrunprinting\n');
      return false;
    }
    return true;
  } catch (error) {
    console.error(`\n❌ Cannot connect to server: ${error.message}\n`);
    return false;
  }
}

// Run tests
(async () => {
  // Check if test image exists
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`\n❌ Test image not found: ${TEST_IMAGE_PATH}\n`);
    process.exit(1);
  }

  // Check if server is running
  const serverReady = await checkServer();
  if (!serverReady) {
    process.exit(1);
  }

  // Run all tests
  await runAllTests();
})();
