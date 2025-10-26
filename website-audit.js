#!/usr/bin/env node
/**
 * GangRun Printing - Comprehensive Website Audit
 * Tests critical functionality and reports issues
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://gangrunprinting.com';
const TIMEOUT = 15000;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'User-Agent': 'GangRunAudit/1.0',
        'Accept': 'text/html,application/json',
      },
      timeout: TIMEOUT,
      rejectUnauthorized: false, // Allow self-signed certs in dev
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

const tests = [
  // === LOCALE CONFIGURATION TESTS ===
  {
    name: 'Homepage (No Locale Prefix)',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/`);
      if (res.statusCode !== 200 && res.statusCode !== 302) {
        throw new Error(`Expected 200 or 302, got ${res.statusCode}`);
      }
      return 'Homepage accessible';
    },
  },
  {
    name: 'Homepage (English - No Prefix Required)',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/products`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      return 'English URLs work without /en/ prefix';
    },
  },
  {
    name: 'Homepage (Spanish - /es/ Prefix)',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/es/products`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      return 'Spanish URLs work with /es/ prefix';
    },
  },

  // === CRITICAL PAGE TESTS ===
  {
    name: 'Admin Dashboard (No Prefix)',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/admin/dashboard`);
      if (res.statusCode !== 200 && res.statusCode !== 302 && res.statusCode !== 401) {
        throw new Error(`Expected 200/302/401, got ${res.statusCode}`);
      }
      return 'Admin dashboard accessible';
    },
  },
  {
    name: 'Customer Account (No Prefix)',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/account/dashboard`);
      if (res.statusCode !== 200 && res.statusCode !== 302 && res.statusCode !== 401) {
        throw new Error(`Expected 200/302/401, got ${res.statusCode}`);
      }
      return 'Account dashboard accessible';
    },
  },
  {
    name: 'Products Page',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/products`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      if (!res.body.includes('Business Cards') && !res.body.includes('Products')) {
        throw new Error('Products page content missing');
      }
      return 'Products page renders correctly';
    },
  },
  {
    name: 'Contact Page',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/contact`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      return 'Contact page accessible';
    },
  },

  // === API ENDPOINT TESTS ===
  {
    name: 'API Health Check',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/api/health`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      const data = JSON.parse(res.body);
      if (data.status !== 'ok') {
        throw new Error(`Health check failed: ${data.status}`);
      }
      return `API healthy - DB: ${data.database}, Redis: ${data.redis}`;
    },
  },
  {
    name: 'Products API',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/api/products`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      const data = JSON.parse(res.body);
      if (!Array.isArray(data.products)) {
        throw new Error('Products API not returning array');
      }
      return `Found ${data.products.length} products`;
    },
  },
  {
    name: 'Categories API',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/api/categories`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      const data = JSON.parse(res.body);
      if (!Array.isArray(data.categories)) {
        throw new Error('Categories API not returning array');
      }
      return `Found ${data.categories.length} categories`;
    },
  },

  // === STATIC ASSETS TESTS ===
  {
    name: 'Logo Image',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/gangrunprinting_logo_new_1448921366__42384-268x50.png`);
      if (res.statusCode !== 200) {
        throw new Error(`Expected 200, got ${res.statusCode}`);
      }
      return 'Logo loads correctly';
    },
  },
  {
    name: 'Favicon',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/favicon.ico`);
      if (res.statusCode !== 200 && res.statusCode !== 404) {
        throw new Error(`Expected 200 or 404, got ${res.statusCode}`);
      }
      return res.statusCode === 200 ? 'Favicon present' : 'Favicon missing (minor issue)';
    },
  },

  // === SECURITY TESTS ===
  {
    name: 'Security Headers',
    test: async () => {
      const res = await makeRequest(`${BASE_URL}/`);
      const issues = [];
      if (!res.headers['content-security-policy']) {
        issues.push('Missing CSP header');
      }
      if (!res.headers['x-middleware-active']) {
        issues.push('Middleware not active');
      }
      if (issues.length > 0) {
        throw new Error(issues.join(', '));
      }
      return 'Security headers present';
    },
  },

  // === PERFORMANCE TESTS ===
  {
    name: 'Response Time (Homepage)',
    test: async () => {
      const start = Date.now();
      await makeRequest(`${BASE_URL}/`);
      const duration = Date.now() - start;
      if (duration > 3000) {
        throw new Error(`Slow response: ${duration}ms`);
      }
      return `Response time: ${duration}ms`;
    },
  },
];

// === RUN AUDIT ===
async function runAudit() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║  GangRun Printing - Website Audit     ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const test of tests) {
    process.stdout.write(`Testing: ${test.name}... `);
    try {
      const result = await test.test();
      log(`✓ PASS - ${result}`, 'green');
      passed++;
    } catch (error) {
      if (error.message.includes('minor issue') || error.message.includes('Favicon missing')) {
        log(`⚠ WARN - ${error.message}`, 'yellow');
        warnings++;
      } else {
        log(`✗ FAIL - ${error.message}`, 'red');
        failed++;
      }
    }
  }

  log('\n╔════════════════════════════════════════╗', 'magenta');
  log('║           Audit Summary                ║', 'magenta');
  log('╚════════════════════════════════════════╝', 'magenta');
  log(`Passed:   ${passed}`, 'green');
  log(`Warnings: ${warnings}`, 'yellow');
  log(`Failed:   ${failed}`, 'red');
  log(`Total:    ${tests.length}\n`, 'blue');

  if (failed === 0) {
    log('✓ All critical tests passed!', 'green');
    process.exit(0);
  } else {
    log('✗ Some tests failed. Please review errors above.', 'red');
    process.exit(1);
  }
}

runAudit().catch((err) => {
  log(`\n✗ Audit failed: ${err.message}`, 'red');
  process.exit(1);
});
