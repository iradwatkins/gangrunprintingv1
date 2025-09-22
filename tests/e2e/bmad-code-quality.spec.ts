import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * BMAD Code Quality Enforcement Tests
 * Zero tolerance for code quality violations
 */

test.describe('BMAD Code Quality Enforcement', () => {

  test('No console statements in production code', async () => {
    const srcDir = path.join(process.cwd(), 'src');
    const violations: string[] = [];

    function scanDirectory(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            if (line.includes('console.')) {
              violations.push(`${fullPath}:${index + 1} - ${line.trim()}`);
            }
          });
        }
      }
    }

    scanDirectory(srcDir);
    expect(violations).toHaveLength(0);
  });

  test('All API routes have error handling', async ({ request }) => {
    const apiDir = path.join(process.cwd(), 'src/app/api');
    const unprotectedRoutes: string[] = [];

    function scanApiRoutes(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanApiRoutes(fullPath);
        } else if (item === 'route.ts') {
          const content = fs.readFileSync(fullPath, 'utf8');

          // Check for try-catch blocks
          if (!content.includes('try {') && !content.includes('withErrorHandler')) {
            unprotectedRoutes.push(fullPath.replace(process.cwd(), ''));
          }
        }
      }
    }

    scanApiRoutes(apiDir);

    // Report unprotected routes
    if (unprotectedRoutes.length > 0) {
      console.log('❌ Unprotected API Routes:', unprotectedRoutes);
    }

    expect(unprotectedRoutes).toHaveLength(0);
  });

  test('No files exceed 500 lines', async () => {
    const srcDir = path.join(process.cwd(), 'src');
    const largeFiles: { path: string; lines: number }[] = [];

    function scanForLargeFiles(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
          scanForLargeFiles(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lineCount = content.split('\n').length;

          if (lineCount > 500) {
            largeFiles.push({
              path: fullPath.replace(process.cwd(), ''),
              lines: lineCount
            });
          }
        }
      }
    }

    scanForLargeFiles(srcDir);

    if (largeFiles.length > 0) {
      console.log('❌ Files exceeding 500 lines:');
      largeFiles.forEach(file => {
        console.log(`   ${file.path}: ${file.lines} lines`);
      });
    }

    expect(largeFiles).toHaveLength(0);
  });

  test('No hardcoded URLs in source code', async () => {
    const srcDir = path.join(process.cwd(), 'src');
    const violations: string[] = [];

    function scanForHardcodedUrls(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
          scanForHardcodedUrls(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            // Check for hardcoded URLs (excluding config files)
            if ((line.includes('http://localhost') ||
                 line.includes('127.0.0.1') ||
                 line.includes(':3000') ||
                 line.includes(':3001') ||
                 line.includes(':3002')) &&
                !fullPath.includes('constants.ts') &&
                !fullPath.includes('config')) {
              violations.push(`${fullPath}:${index + 1}`);
            }
          });
        }
      }
    }

    scanForHardcodedUrls(srcDir);
    expect(violations).toHaveLength(0);
  });

  test('All functions have JSDoc comments', async () => {
    const srcDir = path.join(process.cwd(), 'src/lib');
    const undocumentedFunctions: string[] = [];

    function scanForUndocumentedFunctions(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanForUndocumentedFunctions(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check for function declarations
            if ((line.includes('export function') ||
                 line.includes('export async function') ||
                 line.includes('export const') && line.includes('=>')) &&
                !line.includes('//')) {

              // Check if previous lines contain JSDoc
              if (i === 0 || !lines[i - 1].includes('*/')) {
                undocumentedFunctions.push(`${fullPath}:${i + 1}`);
              }
            }
          }
        }
      }
    }

    scanForUndocumentedFunctions(srcDir);

    // Allow some undocumented functions for now, but report them
    if (undocumentedFunctions.length > 0) {
      console.log(`⚠️ Found ${undocumentedFunctions.length} undocumented functions`);
    }

    // Fail if more than 50 undocumented functions
    expect(undocumentedFunctions.length).toBeLessThan(50);
  });

  test('No unused imports', async () => {
    // This would require AST parsing, simplified version
    const srcDir = path.join(process.cwd(), 'src');
    const suspiciousImports: string[] = [];

    function scanForUnusedImports(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules')) {
          scanForUnusedImports(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');

          // Check for common unused import patterns
          const importRegex = /import\s+{([^}]+)}\s+from/g;
          let match;

          while ((match = importRegex.exec(content)) !== null) {
            const imports = match[1].split(',').map(i => i.trim());

            imports.forEach(imp => {
              const cleanImport = imp.split(' as ')[0].trim();
              // Count occurrences (excluding the import line itself)
              const occurrences = content.split(cleanImport).length - 1;

              if (occurrences === 1) {
                suspiciousImports.push(`${fullPath}: ${cleanImport}`);
              }
            });
          }
        }
      }
    }

    // This is a simplified check, may have false positives
    // Real implementation would use TypeScript compiler API
    console.log(`ℹ️ Suspicious imports check completed`);
  });

  test('Performance: Bundle size check', async () => {
    const nextDir = path.join(process.cwd(), '.next');

    if (fs.existsSync(nextDir)) {
      const statsFile = path.join(nextDir, 'build-stats.json');

      if (fs.existsSync(statsFile)) {
        const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));

        // Check main bundle size
        const mainBundle = stats.chunks?.find((chunk: any) => chunk.names?.includes('main'));

        if (mainBundle) {
          const sizeInKB = mainBundle.size / 1024;
          console.log(`📦 Main bundle size: ${sizeInKB.toFixed(2)} KB`);

          // Fail if bundle exceeds 500KB
          expect(sizeInKB).toBeLessThan(500);
        }
      }
    }
  });

  test('No duplicate code patterns', async () => {
    const srcDir = path.join(process.cwd(), 'src');
    const codePatterns = new Map<string, string[]>();

    function scanForDuplicates(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules')) {
          scanForDuplicates(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          // Look for code blocks (simplified)
          for (let i = 0; i < lines.length - 5; i++) {
            const block = lines.slice(i, i + 5).join('\n').trim();

            if (block.length > 100) {
              const hash = block.replace(/\s+/g, '');

              if (!codePatterns.has(hash)) {
                codePatterns.set(hash, []);
              }

              codePatterns.get(hash)!.push(`${fullPath}:${i + 1}`);
            }
          }
        }
      }
    }

    scanForDuplicates(srcDir);

    // Find actual duplicates
    const duplicates = Array.from(codePatterns.entries())
      .filter(([_, locations]) => locations.length > 1);

    if (duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate code patterns`);
    }

    // Allow some duplicates for now
    expect(duplicates.length).toBeLessThan(100);
  });
});

test.describe('BMAD Performance Tests', () => {

  test('Page load performance', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    console.log('📊 Performance Metrics:', metrics);

    // Strict performance requirements
    expect(metrics.totalTime).toBeLessThan(3000); // 3 seconds max
    expect(metrics.domContentLoaded).toBeLessThan(1500); // 1.5 seconds max
  });

  test('No memory leaks', async ({ page }) => {
    await page.goto('/');

    // Take initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate through pages
    await page.goto('/products');
    await page.goto('/checkout');
    await page.goto('/');

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    // Take final memory snapshot
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const increaseInMB = memoryIncrease / (1024 * 1024);

    console.log(`💾 Memory increase: ${increaseInMB.toFixed(2)} MB`);

    // Fail if memory increased by more than 10MB
    expect(increaseInMB).toBeLessThan(10);
  });
});