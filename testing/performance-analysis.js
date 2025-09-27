const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://gangrunprinting.com';
const REPORTS_DIR = './reports';

// Ensure reports directory exists
async function ensureReportsDir() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating reports directory:', error);
  }
}

// Performance analysis
async function analyzePerformance() {
  console.log('🚀 Starting Performance Analysis for GangRun Printing');
  console.log('=====================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set up performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.performanceMarkers = {
        start: Date.now(),
        marks: []
      };
    });

    // Enable CDP domains
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await client.send('Network.enable');

    // Collect network requests
    const networkRequests = [];
    const failedRequests = [];

    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });

    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure(),
        resourceType: request.resourceType()
      });
    });

    // Console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Navigate to homepage
    console.log('📊 Analyzing Homepage Performance...\n');
    const startTime = Date.now();

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;

    // Get performance metrics
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    const performanceMetrics = await page.metrics();

    // Calculate Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay (simulated)
        if (window.PerformanceEventTiming) {
          new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            fid = firstInput ? firstInput.processingStart - firstInput.startTime : 0;
          }).observe({ type: 'first-input', buffered: true });
        }

        // Cumulative Layout Shift
        let clsValue = 0;
        let clsEntries = [];

        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              clsEntries.push({ value: entry.value, time: entry.startTime });
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // Get paint timing
        const paintEntries = performance.getEntriesByType('paint');
        const fp = paintEntries.find(e => e.name === 'first-paint');
        const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');

        setTimeout(() => {
          resolve({
            lcp,
            fid,
            cls: clsValue,
            fp: fp ? fp.startTime : 0,
            fcp: fcp ? fcp.startTime : 0,
            ttfb: performance.timing.responseStart - performance.timing.requestStart,
            domInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
            domComplete: performance.timing.domComplete - performance.timing.navigationStart
          });
        }, 2000);
      });
    });

    // Analyze resources
    const resourceTimings = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const grouped = {
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        xhr: [],
        other: []
      };

      resources.forEach(resource => {
        const entry = {
          name: resource.name.split('/').pop() || resource.name,
          url: resource.name,
          duration: resource.duration,
          transferSize: resource.transferSize || 0,
          startTime: resource.startTime
        };

        if (resource.initiatorType === 'img' || resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)) {
          grouped.images.push(entry);
        } else if (resource.initiatorType === 'script' || resource.name.match(/\.js/i)) {
          grouped.scripts.push(entry);
        } else if (resource.initiatorType === 'link' || resource.name.match(/\.css/i)) {
          grouped.stylesheets.push(entry);
        } else if (resource.name.match(/\.(woff|woff2|ttf|otf)/i)) {
          grouped.fonts.push(entry);
        } else if (resource.initiatorType === 'xmlhttprequest' || resource.initiatorType === 'fetch') {
          grouped.xhr.push(entry);
        } else {
          grouped.other.push(entry);
        }
      });

      return grouped;
    });

    // Check for optimization opportunities
    const optimizationOpportunities = await page.evaluate(() => {
      const opportunities = [];

      // Check for unoptimized images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.loading || img.loading !== 'lazy') {
          opportunities.push({
            type: 'image-lazy-loading',
            element: img.src,
            suggestion: 'Add lazy loading to images below the fold'
          });
        }
        if (!img.width || !img.height) {
          opportunities.push({
            type: 'image-dimensions',
            element: img.src,
            suggestion: 'Specify width and height to prevent layout shift'
          });
        }
      });

      // Check for render-blocking resources
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(link => {
        if (!link.media || link.media === 'all') {
          opportunities.push({
            type: 'render-blocking-css',
            element: link.href,
            suggestion: 'Consider inlining critical CSS or using media queries'
          });
        }
      });

      return opportunities;
    });

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      loadTime: loadTime,
      coreWebVitals: {
        lcp: {
          value: webVitals.lcp,
          rating: webVitals.lcp < 2500 ? 'Good' : webVitals.lcp < 4000 ? 'Needs Improvement' : 'Poor'
        },
        fid: {
          value: webVitals.fid,
          rating: webVitals.fid < 100 ? 'Good' : webVitals.fid < 300 ? 'Needs Improvement' : 'Poor'
        },
        cls: {
          value: webVitals.cls,
          rating: webVitals.cls < 0.1 ? 'Good' : webVitals.cls < 0.25 ? 'Needs Improvement' : 'Poor'
        }
      },
      performanceTiming: {
        firstPaint: webVitals.fp,
        firstContentfulPaint: webVitals.fcp,
        timeToFirstByte: webVitals.ttfb,
        domInteractive: webVitals.domInteractive,
        domComplete: webVitals.domComplete
      },
      metrics: performanceMetrics,
      resources: {
        images: {
          count: resourceTimings.images.length,
          totalSize: resourceTimings.images.reduce((a, b) => a + b.transferSize, 0),
          avgLoadTime: resourceTimings.images.reduce((a, b) => a + b.duration, 0) / (resourceTimings.images.length || 1)
        },
        scripts: {
          count: resourceTimings.scripts.length,
          totalSize: resourceTimings.scripts.reduce((a, b) => a + b.transferSize, 0),
          avgLoadTime: resourceTimings.scripts.reduce((a, b) => a + b.duration, 0) / (resourceTimings.scripts.length || 1)
        },
        stylesheets: {
          count: resourceTimings.stylesheets.length,
          totalSize: resourceTimings.stylesheets.reduce((a, b) => a + b.transferSize, 0),
          avgLoadTime: resourceTimings.stylesheets.reduce((a, b) => a + b.duration, 0) / (resourceTimings.stylesheets.length || 1)
        }
      },
      networkRequests: networkRequests.length,
      failedRequests: failedRequests.length,
      consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
      optimizationOpportunities: optimizationOpportunities.slice(0, 10)
    };

    // Print results
    console.log('=== PERFORMANCE REPORT ===\n');

    console.log('📈 Core Web Vitals:');
    console.log(`   LCP (Largest Contentful Paint): ${webVitals.lcp.toFixed(2)}ms [${report.coreWebVitals.lcp.rating}]`);
    console.log(`   FID (First Input Delay): ${webVitals.fid.toFixed(2)}ms [${report.coreWebVitals.fid.rating}]`);
    console.log(`   CLS (Cumulative Layout Shift): ${webVitals.cls.toFixed(3)} [${report.coreWebVitals.cls.rating}]`);

    console.log('\n⏱️  Loading Timeline:');
    console.log(`   First Paint: ${webVitals.fp.toFixed(2)}ms`);
    console.log(`   First Contentful Paint: ${webVitals.fcp.toFixed(2)}ms`);
    console.log(`   Time to First Byte: ${webVitals.ttfb}ms`);
    console.log(`   DOM Interactive: ${webVitals.domInteractive}ms`);
    console.log(`   DOM Complete: ${webVitals.domComplete}ms`);
    console.log(`   Total Load Time: ${loadTime}ms`);

    console.log('\n📦 Resource Analysis:');
    console.log(`   Images: ${report.resources.images.count} files, ${(report.resources.images.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Scripts: ${report.resources.scripts.count} files, ${(report.resources.scripts.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Stylesheets: ${report.resources.stylesheets.count} files, ${(report.resources.stylesheets.totalSize / 1024).toFixed(2)} KB`);

    console.log('\n🔍 Network Summary:');
    console.log(`   Total Requests: ${networkRequests.length}`);
    console.log(`   Failed Requests: ${failedRequests.length}`);
    console.log(`   Console Errors: ${report.consoleErrors}`);

    if (optimizationOpportunities.length > 0) {
      console.log('\n💡 Optimization Opportunities:');
      optimizationOpportunities.slice(0, 5).forEach((opp, i) => {
        console.log(`   ${i + 1}. ${opp.suggestion}`);
        console.log(`      Resource: ${opp.element.substring(0, 60)}...`);
      });
    }

    // Save detailed report
    await ensureReportsDir();
    const reportPath = path.join(REPORTS_DIR, `performance-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    // Generate recommendations
    console.log('\n🎯 Recommendations:');
    const recommendations = [];

    if (webVitals.lcp > 2500) {
      recommendations.push('• Optimize Largest Contentful Paint - consider preloading critical resources');
    }
    if (webVitals.cls > 0.1) {
      recommendations.push('• Reduce Cumulative Layout Shift - specify image dimensions');
    }
    if (report.resources.images.totalSize > 1024 * 500) {
      recommendations.push('• Optimize images - use WebP format and implement lazy loading');
    }
    if (report.resources.scripts.count > 10) {
      recommendations.push('• Reduce JavaScript bundles - consider code splitting');
    }
    if (webVitals.ttfb > 600) {
      recommendations.push('• Improve server response time - consider CDN or caching');
    }

    if (recommendations.length > 0) {
      recommendations.forEach(rec => console.log(rec));
    } else {
      console.log('   ✅ Performance is generally good!');
    }

  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
  } finally {
    await browser.close();
  }
}

// Run analysis
analyzePerformance().catch(console.error);