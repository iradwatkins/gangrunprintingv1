#!/usr/bin/env node

/**
 * Simple Google OAuth Login Test
 * Tests the authentication configuration 4 times
 */

const https = require('https');

const BASE_URL = 'https://gangrunprinting.com';

// Test 1: Check if auth providers endpoint works
async function test1_CheckProviders() {
  console.log('\n🧪 Test 1: Checking OAuth providers endpoint...');
  
  return new Promise((resolve) => {
    https.get(`${BASE_URL}/api/auth/providers`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const providers = JSON.parse(data);
          
          if (providers.google) {
            console.log('✅ Google provider found:', {
              id: providers.google.id,
              name: providers.google.name,
              type: providers.google.type
            });
          } else {
            console.log('❌ Google provider NOT found');
            console.log('Available providers:', Object.keys(providers));
          }
        } catch (error) {
          console.log('❌ Failed to parse providers:', error.message);
          console.log('Response:', data.substring(0, 200));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve();
    });
  });
}

// Test 2: Check CSRF token endpoint
async function test2_CheckCSRF() {
  console.log('\n🧪 Test 2: Checking CSRF token endpoint...');
  
  return new Promise((resolve) => {
    https.get(`${BASE_URL}/api/auth/csrf`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const csrf = JSON.parse(data);
          
          if (csrf.csrfToken) {
            console.log('✅ CSRF token received:', csrf.csrfToken.substring(0, 20) + '...');
          } else {
            console.log('❌ No CSRF token in response');
          }
        } catch (error) {
          console.log('❌ Failed to parse CSRF response:', error.message);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve();
    });
  });
}

// Test 3: Check session endpoint
async function test3_CheckSession() {
  console.log('\n🧪 Test 3: Checking session endpoint...');
  
  return new Promise((resolve) => {
    https.get(`${BASE_URL}/api/auth/session`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const session = JSON.parse(data);
          
          if (session.user) {
            console.log('✅ Active session found:', {
              email: session.user.email,
              name: session.user.name
            });
          } else {
            console.log('⚠️ No active session (this is normal if not logged in)');
          }
        } catch (error) {
          console.log('❌ Failed to parse session:', error.message);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve();
    });
  });
}

// Test 4: Try to initiate Google OAuth
async function test4_InitiateOAuth() {
  console.log('\n🧪 Test 4: Testing Google OAuth initiation...');
  
  // First get CSRF token
  const csrfToken = await new Promise((resolve) => {
    https.get(`${BASE_URL}/api/auth/csrf`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const csrf = JSON.parse(data);
          resolve(csrf.csrfToken);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
  
  if (!csrfToken) {
    console.log('❌ Could not get CSRF token');
    return;
  }
  
  // Try to initiate OAuth
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      csrfToken: csrfToken,
      callbackUrl: BASE_URL
    });
    
    const options = {
      hostname: 'gangrunprinting.com',
      path: '/api/auth/signin/google',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        
        if (res.statusCode === 200 || res.statusCode === 302) {
          try {
            const response = JSON.parse(data);
            if (response.url) {
              console.log('✅ OAuth URL generated successfully');
              console.log('OAuth URL starts with:', response.url.substring(0, 50) + '...');
              
              // Check if it's a Google OAuth URL
              if (response.url.includes('accounts.google.com')) {
                console.log('✅ Correctly redirects to Google OAuth');
              } else {
                console.log('⚠️ Unexpected OAuth URL');
              }
            } else {
              console.log('❌ No URL in response');
            }
          } catch {
            console.log('⚠️ Non-JSON response, might be a redirect');
            console.log('Response headers:', res.headers);
          }
        } else {
          console.log('❌ Unexpected status code');
          console.log('Response body:', data.substring(0, 200));
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Google OAuth Login Tests');
  console.log('=====================================');
  console.log('Testing:', BASE_URL);
  console.log('');
  
  await test1_CheckProviders();
  await test2_CheckCSRF();
  await test3_CheckSession();
  await test4_InitiateOAuth();
  
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log('All 4 tests completed.');
  console.log('\n🔍 Common issues to check:');
  console.log('1. Environment variables (AUTH_SECRET, AUTH_GOOGLE_ID, etc.)');
  console.log('2. Google Cloud Console redirect URIs');
  console.log('3. NextAuth configuration in src/auth.config.ts');
  console.log('4. Docker container environment variables');
  console.log('\n📚 See NEXTAUTH-V5-GOOGLE-FIX.md for detailed fixes');
}

// Run tests
runAllTests().catch(console.error);