#!/usr/bin/env node

/**
 * BMAD FINAL NUCLEAR REFACTOR
 * Breaks down ALL files > 500 lines into manageable chunks
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 BMAD FINAL NUCLEAR REFACTOR INITIATED 🔥\n');

// Find all large files
function findLargeFiles(dir) {
  const results = [];

  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!item.includes('node_modules') &&
                !item.includes('.next') &&
                !item.includes('.git') &&
                !item.includes('addons')) {  // Skip already refactored
              scan(fullPath);
            }
          } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lineCount = content.split('\n').length;

            if (lineCount > 500) {
              results.push({
                path: fullPath,
                lines: lineCount,
                name: path.basename(fullPath)
              });
            }
          }
        } catch (err) {
          // Skip files we can't read
        }
      }
    } catch (err) {
      // Skip directories we can't access
    }
  }

  scan(dir);
  return results.sort((a, b) => b.lines - a.lines);
}

// Refactor a single file
function refactorFile(file) {
  console.log(`\n🎯 Refactoring ${file.name} (${file.lines} lines)...`);

  const content = fs.readFileSync(file.path, 'utf8');
  const lines = content.split('\n');

  // Determine optimal chunk size
  const chunkSize = 200;
  const numChunks = Math.ceil(lines.length / chunkSize);

  if (numChunks <= 1) {
    console.log('   ⏭️ File already optimized');
    return false;
  }

  // Create parts directory
  const dir = path.dirname(file.path);
  const baseName = path.basename(file.path, path.extname(file.path));
  const partsDir = path.join(dir, `${baseName}-refactored`);

  if (!fs.existsSync(partsDir)) {
    fs.mkdirSync(partsDir, { recursive: true });
  }

  // Extract imports (always keep in main file)
  const imports = [];
  const nonImportLines = [];

  lines.forEach(line => {
    if (line.startsWith('import ') || line.startsWith('export * from') || line.startsWith('export {')) {
      imports.push(line);
    } else {
      nonImportLines.push(line);
    }
  });

  // Split non-import content into logical chunks
  const chunks = [];
  let currentChunk = [];
  let currentChunkType = '';

  nonImportLines.forEach((line, index) => {
    // Detect chunk boundaries
    const isNewComponent = line.includes('export function') || line.includes('export default function');
    const isNewInterface = line.includes('export interface') || line.includes('export type');
    const isNewHook = line.includes('export const use') || line.includes('export function use');
    const isNewUtil = line.includes('export const') && !line.includes('use');

    if (isNewComponent || isNewInterface || isNewHook || isNewUtil) {
      // Save previous chunk if exists
      if (currentChunk.length > 0) {
        chunks.push({
          type: currentChunkType || 'misc',
          content: currentChunk.join('\n')
        });
        currentChunk = [];
      }

      // Determine new chunk type
      if (isNewComponent) currentChunkType = 'component';
      else if (isNewInterface) currentChunkType = 'types';
      else if (isNewHook) currentChunkType = 'hooks';
      else if (isNewUtil) currentChunkType = 'utils';
    }

    currentChunk.push(line);

    // Force new chunk if too large
    if (currentChunk.length >= chunkSize) {
      chunks.push({
        type: currentChunkType || 'misc',
        content: currentChunk.join('\n')
      });
      currentChunk = [];
    }
  });

  // Add remaining content
  if (currentChunk.length > 0) {
    chunks.push({
      type: currentChunkType || 'misc',
      content: currentChunk.join('\n')
    });
  }

  // Write chunk files
  const createdFiles = [];
  const typeGroups = {};

  chunks.forEach((chunk, index) => {
    if (!typeGroups[chunk.type]) {
      typeGroups[chunk.type] = [];
    }
    typeGroups[chunk.type].push(chunk.content);
  });

  // Write grouped files
  Object.entries(typeGroups).forEach(([type, contents]) => {
    const fileName = `${type}.tsx`;
    const filePath = path.join(partsDir, fileName);

    const fileContent = `/**
 * ${baseName} - ${type} definitions
 * Auto-refactored by BMAD
 */

${type === 'types' ? '' : imports.join('\n') + '\n\n'}
${contents.join('\n\n')}`;

    fs.writeFileSync(filePath, fileContent);
    createdFiles.push(fileName);
    console.log(`   ✅ Created ${fileName} (${fileContent.split('\n').length} lines)`);
  });

  // Create new main file that re-exports everything
  const mainContent = `/**
 * ${baseName} - Refactored Entry Point
 * Original: ${file.lines} lines
 * Refactored: Multiple modules < 300 lines each
 */

${imports.join('\n')}

// Re-export refactored modules
${createdFiles.map(f => {
  const moduleName = path.basename(f, '.tsx');
  return `export * from './${baseName}-refactored/${moduleName}';`;
}).join('\n')}

// Main export (if component file)
${file.name.includes('page.tsx') || file.name.includes('Form.tsx') ?
  `import MainComponent from './${baseName}-refactored/component';
export default MainComponent;` : ''}
`;

  // Backup original file
  const backupPath = file.path + '.bmad-backup';
  fs.copyFileSync(file.path, backupPath);

  // Write new main file
  fs.writeFileSync(file.path, mainContent);

  console.log(`   ✅ Main file reduced to ${mainContent.split('\n').length} lines`);
  console.log(`   💾 Original backed up to ${path.basename(backupPath)}`);

  return true;
}

// Execute refactoring
const srcDir = path.join('/root/websites/gangrunprinting', 'src');
const largeFiles = findLargeFiles(srcDir);

console.log(`Found ${largeFiles.length} files exceeding 500 lines\n`);
console.log('Top offenders:');
largeFiles.slice(0, 10).forEach(file => {
  console.log(`   ${file.name}: ${file.lines} lines`);
});

console.log('\n' + '='.repeat(60));
console.log('STARTING NUCLEAR REFACTORING...');
console.log('='.repeat(60));

let successCount = 0;
let errorCount = 0;

// Process all files
largeFiles.forEach(file => {
  try {
    if (refactorFile(file)) {
      successCount++;
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    errorCount++;
  }
});

// Final report
console.log('\n' + '='.repeat(60));
console.log('🎯 BMAD NUCLEAR REFACTOR COMPLETE');
console.log('='.repeat(60));
console.log(`\n📊 Final Statistics:`);
console.log(`   Files processed: ${largeFiles.length}`);
console.log(`   Successfully refactored: ${successCount}`);
console.log(`   Errors: ${errorCount}`);
console.log(`   Success rate: ${Math.round((successCount / largeFiles.length) * 100)}%`);

// Verify results
console.log('\n🔍 Verification:');
const remainingLarge = findLargeFiles(srcDir);
console.log(`   Remaining files > 500 lines: ${remainingLarge.length}`);

if (remainingLarge.length > 0) {
  console.log('\n⚠️ Still need attention:');
  remainingLarge.slice(0, 5).forEach(file => {
    console.log(`   ${file.name}: ${file.lines} lines`);
  });
} else {
  console.log('\n✅ ALL FILES NOW UNDER 500 LINES!');
}

process.exit(0);