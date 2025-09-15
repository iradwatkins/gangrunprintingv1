#!/usr/bin/env node

/**
 * Production Authentication Configuration Validator
 * Run this on the production server to validate auth configuration
 * Usage: node validate-auth-production.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Production Authentication Configuration Validator');
console.log('====================================================\n');
console.log('Server:', process.env.HOSTNAME || 'Unknown');
console.log('Environment:', process.env.NODE_ENV || 'Unknown');
console.log('Date:', new Date().toISOString());
console.log('\n');

// Critical environment variables for authentication
const criticalVars = {
  'AUTH_SECRET': {
    required: true,
    sensitive: true,
    validator: (v) => v && v.length >= 32,
    description: 'Primary auth secret (NextAuth v5)'
  },
  'NEXTAUTH_SECRET': {
    required: true,
    sensitive: true,
    validator: (v) => v && v.length >= 32,
    description: 'Fallback auth secret for compatibility'
  },
  'AUTH_GOOGLE_ID': {
    required: true,
    sensitive: false,
    validator: (v) => v && v.includes('.apps.googleusercontent.com'),
    description: 'Google OAuth Client ID'
  },
  'AUTH_GOOGLE_SECRET': {
    required: true,
    sensitive: true,
    validator: (v) => v && v.startsWith('GOCSPX-'),
    description: 'Google OAuth Client Secret'
  },
  'NEXTAUTH_URL': {
    required: true,
    sensitive: false,
    validator: (v) => v && v.startsWith('https://'),
    description: 'Production URL (must be HTTPS)'
  },
  'NEXT_PUBLIC_APP_URL': {
    required: true,
    sensitive: false,
    validator: (v) => v && v.startsWith('https://'),
    description: 'Public app URL'
  },
  'AUTH_TRUST_HOST': {
    required: true,
    sensitive: false,
    validator: (v) => v === 'true',
    description: 'Trust host header (must be true for production)'
  },
  'DATABASE_URL': {
    required: true,
    sensitive: true,
    validator: (v) => v && v.startsWith('postgresql://'),
    description: 'PostgreSQL connection string'
  }
};

// Additional important variables
const importantVars = {
  'ADMIN_EMAIL': {
    required: false,
    sensitive: false,
    validator: (v) => v && v.includes('@'),
    description: 'Admin user email'
  },
  'SENDGRID_API_KEY': {
    required: false,
    sensitive: true,
    validator: (v) => v && v.startsWith('SG.'),
    description: 'SendGrid API key for email'
  },
  'SQUARE_ACCESS_TOKEN': {
    required: false,
    sensitive: true,
    validator: (v) => v && v.length > 20,
    description: 'Square payment token'
  },
  'SQUARE_ENVIRONMENT': {
    required: false,
    sensitive: false,
    validator: (v) => v === 'production' || v === 'sandbox',
    description: 'Square environment (production/sandbox)'
  }
};

let hasErrors = false;
let hasWarnings = false;

console.log('📋 CRITICAL ENVIRONMENT VARIABLES:\n');
console.log('=' .repeat(50));

// Check critical variables
Object.entries(criticalVars).forEach(([name, config]) => {
  const value = process.env[name];
  
  if (!value) {
    console.log(`❌ ${name}: MISSING`);
    console.log(`   ${config.description}`);
    hasErrors = true;
  } else if (config.validator && !config.validator(value)) {
    console.log(`⚠️  ${name}: INVALID`);
    console.log(`   ${config.description}`);
    if (!config.sensitive) {
      console.log(`   Current: ${value}`);
    }
    hasErrors = true;
  } else {
    console.log(`✅ ${name}: SET`);
    if (!config.sensitive) {
      console.log(`   Value: ${value}`);
    } else {
      console.log(`   Value: [REDACTED - ${value.length} chars]`);
    }
  }
  console.log('');
});

console.log('\n📋 ADDITIONAL CONFIGURATION:\n');
console.log('=' .repeat(50));

// Check important variables
Object.entries(importantVars).forEach(([name, config]) => {
  const value = process.env[name];
  
  if (!value) {
    if (config.required) {
      console.log(`❌ ${name}: MISSING`);
      hasErrors = true;
    } else {
      console.log(`⚠️  ${name}: NOT SET (optional)`);
      hasWarnings = true;
    }
    console.log(`   ${config.description}`);
  } else if (config.validator && !config.validator(value)) {
    console.log(`⚠️  ${name}: POTENTIALLY INVALID`);
    console.log(`   ${config.description}`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${name}: SET`);
    if (!config.sensitive) {
      console.log(`   Value: ${value}`);
    } else {
      console.log(`   Value: [REDACTED]`);
    }
  }
  console.log('');
});

// Check for secret consistency
console.log('\n🔐 SECRET CONSISTENCY CHECK:\n');
console.log('=' .repeat(50));

const authSecret = process.env.AUTH_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (authSecret && nextAuthSecret) {
  if (authSecret === nextAuthSecret) {
    console.log('✅ AUTH_SECRET and NEXTAUTH_SECRET match (recommended)');
  } else {
    console.log('⚠️  AUTH_SECRET and NEXTAUTH_SECRET are different');
    console.log('   This may cause issues. Consider using the same value.');
    hasWarnings = true;
  }
} else if (!authSecret && !nextAuthSecret) {
  console.log('❌ Both AUTH_SECRET and NEXTAUTH_SECRET are missing!');
  hasErrors = true;
} else {
  console.log('⚠️  Only one secret is set. Both should be set for compatibility.');
  hasWarnings = true;
}

// Check Google OAuth configuration
console.log('\n\n🔗 GOOGLE OAUTH CONFIGURATION:\n');
console.log('=' .repeat(50));

const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

if (googleId && googleSecret) {
  console.log('Client ID:', googleId);
  console.log('\n📌 Required Google Console Settings:');
  console.log('\nAuthorized Redirect URIs (add ALL):');
  console.log(`  • ${nextAuthUrl}/api/auth/callback/google`);
  
  if (nextAuthUrl && nextAuthUrl.includes('gangrunprinting.com')) {
    console.log(`  • https://www.gangrunprinting.com/api/auth/callback/google`);
  }
  
  console.log('\nAuthorized JavaScript Origins:');
  console.log(`  • ${nextAuthUrl}`);
  if (nextAuthUrl && nextAuthUrl.includes('gangrunprinting.com')) {
    console.log(`  • https://www.gangrunprinting.com`);
  }
  
  console.log('\n🔗 Configure at:');
  console.log('https://console.cloud.google.com/apis/credentials');
} else {
  console.log('❌ Google OAuth not configured');
  hasErrors = true;
}

// Docker/Container check
console.log('\n\n🐳 CONTAINER ENVIRONMENT:\n');
console.log('=' .repeat(50));

const isDocker = fs.existsSync('/.dockerenv');
const isDokploy = process.env.DOKPLOY_PROJECT_ID || process.env.DOKPLOY_ENABLED;

if (isDocker) {
  console.log('✅ Running in Docker container');
} else {
  console.log('⚠️  Not running in Docker container');
}

if (isDokploy) {
  console.log('✅ Dokploy environment detected');
  if (process.env.DOKPLOY_PROJECT_ID) {
    console.log(`   Project ID: ${process.env.DOKPLOY_PROJECT_ID}`);
  }
} else {
  console.log('⚠️  Dokploy environment not detected');
}

// Summary
console.log('\n\n📊 VALIDATION SUMMARY:\n');
console.log('=' .repeat(50));

if (hasErrors) {
  console.log('❌ CRITICAL ERRORS FOUND!');
  console.log('   Authentication will likely fail.');
  console.log('   Fix the errors above before proceeding.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Some warnings found.');
  console.log('   Authentication should work but review warnings.');
} else {
  console.log('✅ All checks passed!');
  console.log('   Authentication configuration looks good.');
}

console.log('\n💡 Next Steps:');
console.log('1. If errors exist, update environment variables in Dokploy');
console.log('2. Verify Google OAuth redirect URIs match exactly');
console.log('3. Force rebuild with no cache in Dokploy');
console.log('4. Clear browser cache and test authentication');
console.log('5. Check application logs for any runtime errors');

console.log('\n' + '=' .repeat(50));
console.log('Validation completed at:', new Date().toISOString());