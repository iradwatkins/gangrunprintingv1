const http = require('http');

const BASE_URL = 'http://localhost:3020';
const categories = {
  routing: { tests: [], score: 0, total: 0 },
  api: { tests: [], score: 0, total: 0 },
  assets: { tests: [], score: 0, total: 0 },
  performance: { tests: [], score: 0, total: 0 },
  security: { tests: [], score: 0, total: 0 }
};

function test(category, name, url, expectedCodes = [200]) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`${BASE_URL}${url}`, (res) => {
      const time = Date.now() - start;
      const success = expectedCodes.includes(res.statusCode);

      categories[category].total++;
      if (success) categories[category].score++;

      categories[category].tests.push({
        name,
        success,
        code: res.statusCode,
        time
      });
      resolve();
    }).on('error', (err) => {
      categories[category].total++;
      categories[category].tests.push({
        name,
        success: false,
        code: 'ERROR',
        time: 0
      });
      resolve();
    });
  });
}

async function runAudit() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          GANGRUN PRINTING - COMPREHENSIVE HEALTH AUDIT            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  // ROUTING TESTS (All routes require explicit locale prefix)
  console.log('🔗 Testing Routing...');
  await test('routing', 'Homepage (English)', '/en');
  await test('routing', 'Homepage (Spanish)', '/es');
  await test('routing', 'Products (English)', '/en/products');
  await test('routing', 'Products (Spanish)', '/es/products');
  await test('routing', 'Admin Dashboard', '/en/admin', [200, 302, 401]);
  await test('routing', 'Contact Page', '/en/contact');
  await test('routing', 'About Page', '/en/about');
  await test('routing', 'Track Orders', '/en/track');
  await test('routing', 'Upload Page', '/en/upload');
  await test('routing', 'Checkout', '/en/checkout', [200, 302]);

  // API TESTS
  console.log('⚙️  Testing API Endpoints...');
  await test('api', 'Health Check', '/api/health');
  await test('api', 'Products API', '/api/products');
  await test('api', 'Categories API', '/api/categories');

  // ASSET TESTS
  console.log('📦 Testing Static Assets...');
  await test('assets', 'Favicon', '/favicon.ico');

  // PERFORMANCE TEST
  console.log('⚡ Testing Performance...');
  const perfStart = Date.now();
  await test('performance', 'Homepage Load', '/en');
  const perfTime = Date.now() - perfStart;
  categories.performance.avgTime = perfTime;

  // Calculate scores
  let totalScore = 0;
  let totalTests = 0;

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                          DETAILED RESULTS                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  for (const [cat, data] of Object.entries(categories)) {
    const percentage = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    const status = percentage >= 90 ? '🟢' : percentage >= 70 ? '🟡' : '🔴';

    console.log(`${status} ${label.padEnd(15)} ${data.score}/${data.total} (${percentage}%)`);

    // Show failed tests
    const failed = data.tests.filter(t => !t.success);
    if (failed.length > 0) {
      failed.forEach(f => {
        console.log(`   ✗ ${f.name}: ${f.code}`);
      });
    }

    totalScore += data.score;
    totalTests += data.total;
  }

  const overallPercentage = Math.round((totalScore / totalTests) * 100);
  const grade = overallPercentage >= 90 ? 'A' :
                overallPercentage >= 80 ? 'B' :
                overallPercentage >= 70 ? 'C' :
                overallPercentage >= 60 ? 'D' : 'F';

  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                         OVERALL HEALTH SCORE                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`   Score: ${totalScore}/${totalTests} tests passing`);
  console.log(`   Percentage: ${overallPercentage}%`);
  console.log(`   Grade: ${grade}`);
  console.log(`   Performance: ${categories.performance.avgTime}ms average response\n`);

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                             STATUS                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  if (overallPercentage >= 80) {
    console.log('   ✅ PRODUCTION READY - Site is stable and functional\n');
    console.log('   Next Steps:');
    console.log('   • Create products in admin dashboard');
    console.log('   • Implement LLM SEO for 200 product sets');
    console.log('   • Monitor performance in production\n');
  } else if (overallPercentage >= 70) {
    console.log('   ⚠️  MOSTLY STABLE - Minor issues need attention\n');
    console.log('   Action Items:');
    console.log('   • Fix failing tests before production');
    console.log('   • Review error logs');
    console.log('   • Test critical user paths\n');
  } else {
    console.log('   ❌ NEEDS WORK - Critical issues present\n');
    console.log('   Priority Actions:');
    console.log('   • Fix all critical errors');
    console.log('   • Do not deploy to production');
    console.log('   • Review system logs\n');
  }

  console.log('═══════════════════════════════════════════════════════════════════\n');
}

runAudit();
