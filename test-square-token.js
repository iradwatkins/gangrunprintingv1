/**
 * Test Square Access Token validity
 * This will help verify if the token itself is valid
 */

const https = require('https');

const ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || 'EAAAlxYyMtLJ_zKIJZ1Tva-CYjbqoCzWxWE_im0a5rNSvrTeYWvtpVaIbW3p8COG';
const LOCATION_ID = process.env.SQUARE_LOCATION_ID || 'LWMA9R9E2ENXP';

console.log('Testing Square Access Token validity...\n');
console.log(`Token (first 30 chars): ${ACCESS_TOKEN.substring(0, 30)}...`);
console.log(`Location ID: ${LOCATION_ID}`);
console.log(`Environment: production\n`);

// Test 1: Retrieve Token Status
console.log('========================================');
console.log('TEST 1: Retrieve Token Status');
console.log('========================================\n');

const tokenStatusOptions = {
  hostname: 'connect.squareup.com',
  path: '/oauth2/token/status',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': '2025-01-23'
  }
};

const tokenStatusReq = https.request(tokenStatusOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}\n`);

    if (res.statusCode === 200) {
      const parsed = JSON.parse(data);
      console.log('✅ Token is VALID');
      console.log(`Scopes: ${parsed.scopes?.join(', ')}\n`);

      // Test 2: Retrieve Location
      runLocationTest();
    } else {
      console.log('❌ Token is INVALID or EXPIRED');
      console.log('Please generate a new Access Token from Square Dashboard\n');
    }
  });
});

tokenStatusReq.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

tokenStatusReq.end();

function runLocationTest() {
  console.log('========================================');
  console.log('TEST 2: Retrieve Location');
  console.log('========================================\n');

  const locationOptions = {
    hostname: 'connect.squareup.com',
    path: `/v2/locations/${LOCATION_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2025-01-23'
    }
  };

  const locationReq = https.request(locationOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Response: ${data}\n`);

      if (res.statusCode === 200) {
        console.log('✅ Location retrieved successfully');
        console.log('✅ Access Token and Location ID are correctly matched\n');
      } else if (res.statusCode === 401) {
        console.log('❌ 401 UNAUTHORIZED - Access Token is invalid');
        console.log('The token may be:');
        console.log('  - Expired');
        console.log('  - Revoked');
        console.log('  - From wrong application');
        console.log('  - For wrong environment (sandbox vs production)\n');
      } else if (res.statusCode === 404) {
        console.log('❌ 404 NOT FOUND - Location ID does not exist or token lacks permissions\n');
      }

      console.log('========================================');
      console.log('DIAGNOSIS COMPLETE');
      console.log('========================================\n');
    });
  });

  locationReq.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  locationReq.end();
}
