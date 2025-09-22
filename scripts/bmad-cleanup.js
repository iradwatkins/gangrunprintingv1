#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let totalFilesProcessed = 0;
let totalLinesRemoved = 0;
let filesModified = [];

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove console.* statements (including multiline)
    const consoleRegex = /console\.(log|error|warn|info|debug|trace|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd|table)\s*\([^)]*\)[;,]?\s*(\n)?/gm;

    // Count occurrences before removal
    const matches = content.match(consoleRegex);
    const matchCount = matches ? matches.length : 0;

    if (matchCount > 0) {
      content = content.replace(consoleRegex, '');

      // Clean up extra blank lines left behind
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Only write if content actually changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        totalLinesRemoved += matchCount;
        filesModified.push({
          path: filePath.replace('/root/websites/gangrunprinting/', ''),
          count: matchCount
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
        processDirectory(fullPath);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      totalFilesProcessed++;
      removeConsoleLogs(fullPath);
    }
  }
}

console.log('🔥 BMAD Console.log Exterminator Starting...\n');

const srcPath = path.join(__dirname, '..', 'src');
processDirectory(srcPath);

console.log('\n✅ BMAD Cleanup Complete!');
console.log('📊 Statistics:');
console.log(`   Files Scanned: ${totalFilesProcessed}`);
console.log(`   Files Modified: ${filesModified.length}`);
console.log(`   Console Statements Removed: ${totalLinesRemoved}`);

if (filesModified.length > 0) {
  console.log('\n📝 Modified Files:');
  filesModified.sort((a, b) => b.count - a.count).slice(0, 20).forEach(file => {
    console.log(`   ${file.path}: ${file.count} removed`);
  });
  if (filesModified.length > 20) {
    console.log(`   ... and ${filesModified.length - 20} more files`);
  }
}

process.exit(0);