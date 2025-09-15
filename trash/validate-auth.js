#!/usr/bin/env node

/**
 * Authentication Configuration Validator
 * Run this script to check if all auth configuration is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Authentication Configuration Validator');
console.log('=========================================\n');

// Check for .env file
const envPath = path.join(__dirname, '.env');
const envProductionPath = path.join(__dirname, '.env.production');

let envVars = {};

// Load environment variables from files
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  console.log('✅ Found .env file');
} else {
  console.log('⚠️  No .env file found');
}

if (fs.existsSync(envProductionPath)) {
  const envContent = fs.readFileSync(envProductionPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (!line.startsWith('#') && line.includes('=')) {
      const [key, value] = line.split('=');
      if (key && value && !envVars[key.trim()]) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
  console.log('✅ Found .env.production file');
}

// Also check process.env
Object.keys(process.env).forEach(key => {
  if (!envVars[key]) {
    envVars[key] = process.env[key];
  }
});

console.log('\n📋 Required Environment Variables:\n');

const requiredVars = [
  { 
    name: 'AUTH_SECRET', 
    fallback: 'NEXTAUTH_SECRET',
    description: 'Secret for JWT encryption (required)',
    validator: (v) => v && v.length >= 32
  },
  { 
    name: 'AUTH_GOOGLE_ID', 
    description: 'Google OAuth Client ID',
    validator: (v) => v && v.includes('.apps.googleusercontent.com')
  },
  { 
    name: 'AUTH_GOOGLE_SECRET', 
    description: 'Google OAuth Client Secret',
    validator: (v) => v && v.startsWith('GOCSPX-')
  },
  { 
    name: 'NEXTAUTH_URL', 
    description: 'Public URL of your site',
    validator: (v) => v && (v.startsWith('http://') || v.startsWith('https://'))
  },
  { 
    name: 'AUTH_TRUST_HOST', 
    description: 'Trust host header (should be true for production)',
    validator: (v) => v === 'true' || v === 'false'
  },
  { 
    name: 'DATABASE_URL', 
    description: 'PostgreSQL connection string',
    validator: (v) => v && v.startsWith('postgresql://')
  }
];

let hasErrors = false;

requiredVars.forEach(({ name, fallback, description, validator }) => {
  const value = envVars[name] || (fallback && envVars[fallback]);
  
  if (!value) {
    console.log(`❌ ${name}: Missing`);
    console.log(`   ${description}`);
    if (fallback) {
      console.log(`   (Also checked fallback: ${fallback})`);
    }
    hasErrors = true;
  } else if (validator && !validator(value)) {
    console.log(`⚠️  ${name}: Invalid value`);
    console.log(`   ${description}`);
    console.log(`   Current: ${value.substring(0, 20)}...`);
    hasErrors = true;
  } else {
    console.log(`✅ ${name}: Set correctly`);
    if (name === 'AUTH_GOOGLE_ID') {
      console.log(`   Value: ${value}`);
    } else {
      console.log(`   Value: ${value.substring(0, 20)}...`);
    }
  }
  console.log('');
});

console.log('\n📌 Google OAuth Configuration:\n');

const googleClientId = envVars['AUTH_GOOGLE_ID'];
if (googleClientId) {
  console.log('Client ID:', googleClientId);
  console.log('\nRequired Authorized Redirect URIs:');
  
  const baseUrl = envVars['NEXTAUTH_URL'] || 'https://gangrunprinting.com';
  const urls = [
    `${baseUrl}/api/auth/callback/google`,
    `${baseUrl.replace('https://', 'https://www.')}/api/auth/callback/google`,
    `${baseUrl.replace('https://', 'http://')}/api/auth/callback/google`,
    `${baseUrl.replace('https://', 'http://www.')}/api/auth/callback/google`
  ];
  
  urls.forEach(url => console.log('  -', url));
  
  console.log('\nAuthorized JavaScript Origins:');
  const origins = [
    baseUrl,
    baseUrl.replace('https://', 'https://www.'),
    baseUrl.replace('https://', 'http://'),
    baseUrl.replace('https://', 'http://www.')
  ];
  
  origins.forEach(origin => console.log('  -', origin));
  
  console.log('\n🔗 Configure at: https://console.cloud.google.com/apis/credentials');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Authentication configuration has errors!');
  console.log('Please fix the issues above before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✅ Authentication configuration looks good!');
  console.log('If you still have issues, check:');
  console.log('1. Google OAuth redirect URIs are configured correctly');
  console.log('2. The application is rebuilt and redeployed');
  console.log('3. Browser cache is cleared\n');
}