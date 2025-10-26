const http = require('http');

const BASE_URL = 'http://localhost:3020';
let passed = 0;
let failed = 0;

function test(name, url, expectedCodes = [200]) {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}${url}`, (res) => {
      const success = expectedCodes.includes(res.statusCode);
      if (success) passed++;
      else failed++;
      const icon = success ? '✓' : '✗';
      const status = success ? 'PASS' : 'FAIL';
      console.log(`${icon} ${name}: ${res.statusCode} ${status}`);
      resolve();
    }).on('error', () => {
      failed++;
      console.log(`✗ ${name}: ERROR`);
      resolve();
    });
  });
}

async function runAudit() {
  console.log('\n═══════════════════════════════════════');
  console.log('   GANGRUN PRINTING - FINAL AUDIT');
  console.log('═══════════════════════════════════════\n');

  await test('Homepage (English)', '/en/');
  await test('Products (English)', '/en/products');
  await test('Admin Dashboard', '/en/admin', [200, 302, 401]);
  await test('Contact Page', '/en/contact');
  await test('About Page', '/en/about');
  await test('Track Order', '/en/track');

  await test('Homepage (Spanish)', '/es/');
  await test('Products (Spanish)', '/es/products');
  await test('Contact (Spanish)', '/es/contact');

  await test('Health Check API', '/api/health');
  await test('Products API', '/api/products');
  await test('Categories API', '/api/categories');

  await test('Logo', '/logo.svg');
  await test('Favicon', '/favicon.ico');

  console.log('\n═══════════════════════════════════════');
  console.log(`   RESULTS: ✓ ${passed} passed  ✗ ${failed} failed`);
  console.log('═══════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED - SITE IS STABLE!\n');
  } else {
    console.log(`⚠️  ${failed} tests need attention\n`);
  }
}

runAudit();
