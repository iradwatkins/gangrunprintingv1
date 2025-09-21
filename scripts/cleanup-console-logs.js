#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search for files
const patterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  'scripts/**/*.{ts,tsx,js,jsx}',
  'tests/**/*.{ts,tsx,js,jsx}',
  'playwright-tests/**/*.{ts,tsx,js,jsx}',
  'prisma/**/*.{ts,tsx,js,jsx}'
];

// Files to exclude from cleanup
const excludeFiles = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  // Keep console.warn and console.error for production debugging
];

let totalFilesProcessed = 0;
let totalLinesRemoved = 0;

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove console.log, console.info, console.debug statements
    // Keep console.warn and console.error for production error handling
    const patterns = [
      // Remove simple console.log/info/debug statements
      /^\s*console\.(log|info|debug)\([^)]*\);?\s*$/gm,
      // Remove multi-line console statements
      /^\s*console\.(log|info|debug)\([^)]*\n([^)]*\n)*[^)]*\);?\s*$/gm,
      // Remove console statements with template literals
      /^\s*console\.(log|info|debug)\(`[^`]*`\);?\s*$/gm,
      // Remove inline console statements in conditionals
      /\s*&&\s*console\.(log|info|debug)\([^)]*\);?/g,
      /\s*\?\s*console\.(log|info|debug)\([^)]*\)\s*:\s*null;?/g,
      // Remove console statements in if blocks (single line)
      /^\s*if\s*\([^)]*\)\s*console\.(log|info|debug)\([^)]*\);?\s*$/gm,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        totalLinesRemoved += matches.length;
      }
      content = content.replace(pattern, '');
    });

    // Clean up any resulting double blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processFiles() {

  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludeFiles,
      absolute: true
    });

    files.forEach(file => {
      if (removeConsoleLogs(file)) {
        totalFilesProcessed++;

      }
    });
  });

  // Run ESLint fix after cleanup

  const { execSync } = require('child_process');
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });

  } catch (error) {
    console.warn('⚠️ ESLint reported some issues that need manual fixing');
  }
}

// Check if glob is installed
try {
  require.resolve('glob');
  processFiles();
} catch (error) {

  const { execSync } = require('child_process');
  execSync('npm install --no-save glob', { stdio: 'inherit' });
  processFiles();
}