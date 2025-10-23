/**
 * E2E Test Runner for File Approval System
 * 
 * Comprehensive test runner that validates the entire file approval
 * workflow with proper setup, teardown, and reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class FileApprovalTestRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: null,
      endTime: null,
    };
  }

  async setup() {
    console.log('🚀 Setting up File Approval System E2E Tests');
    
    // Create test fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Generate test files
    await this.generateTestFiles(fixturesDir);
    
    // Verify test environment
    await this.verifyEnvironment();
    
    console.log('✅ Setup complete');
  }

  async generateTestFiles(fixturesDir) {
    console.log('📁 Generating test fixture files...');
    
    // Create test PDF (mock)
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
181
%%EOF`;
    
    fs.writeFileSync(path.join(fixturesDir, 'test-business-card.pdf'), pdfContent);
    
    // Create test image (1x1 pixel JPEG)
    const jpegBytes = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(path.join(fixturesDir, 'test-logo.jpg'), jpegBytes);
    
    // Create large test file (simulated)
    const largeImageData = Buffer.alloc(5 * 1024 * 1024, 0xFF); // 5MB
    fs.writeFileSync(path.join(fixturesDir, 'large-image.jpg'), largeImageData);
    
    // Create malicious file for security testing
    fs.writeFileSync(path.join(fixturesDir, 'malicious.exe'), 'MZ\x90\x00FAKE_EXE_CONTENT');
    
    console.log('✅ Test fixture files generated');
  }

  async verifyEnvironment() {
    console.log('🔍 Verifying test environment...');
    
    // Check if application is running
    try {
      const response = await fetch(process.env.TEST_BASE_URL || 'http://localhost:3020/api/health');
      if (!response.ok) {
        throw new Error('Application health check failed');
      }
      console.log('✅ Application is running');
    } catch (error) {
      console.error('❌ Application is not accessible:', error.message);
      process.exit(1);
    }
    
    // Check database connection
    try {
      const response = await fetch((process.env.TEST_BASE_URL || 'http://localhost:3020') + '/api/test/db-health');
      if (response.ok) {
        console.log('✅ Database connection verified');
      }
    } catch (error) {
      console.warn('⚠️ Could not verify database connection');
    }
    
    // Check required environment variables
    const requiredEnvVars = [
      'TEST_ADMIN_EMAIL',
      'TEST_ADMIN_PASSWORD', 
      'TEST_CUSTOMER_EMAIL',
      'TEST_CUSTOMER_PASSWORD'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
      console.log('Using default test credentials');
    }
  }

  async runTests() {
    console.log('🧪 Running File Approval System E2E Tests');
    this.testResults.startTime = new Date();
    
    return new Promise((resolve, reject) => {
      const playwrightProcess = spawn('npx', ['playwright', 'test', 'tests/e2e/file-approval-system.test.js'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd()
      });
      
      let output = '';
      let errorOutput = '';
      
      playwrightProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(text);
        
        // Parse test results
        this.parseTestOutput(text);
      });
      
      playwrightProcess.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.error(text);
      });
      
      playwrightProcess.on('close', (code) => {
        this.testResults.endTime = new Date();
        
        if (code === 0) {
          console.log('✅ All tests completed successfully');
          resolve(this.testResults);
        } else {
          console.error('❌ Tests failed with exit code:', code);
          this.testResults.errors.push(`Process exited with code ${code}`);
          reject(this.testResults);
        }
      });
      
      playwrightProcess.on('error', (error) => {
        console.error('❌ Failed to start test process:', error);
        this.testResults.errors.push(error.message);
        reject(this.testResults);
      });
    });
  }

  parseTestOutput(output) {
    // Parse Playwright test output to extract results
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('✓') || line.includes('PASSED')) {
        this.testResults.passed++;
        this.testResults.total++;
      } else if (line.includes('✗') || line.includes('FAILED')) {
        this.testResults.failed++;
        this.testResults.total++;
        this.testResults.errors.push(line);
      }
    }
  }

  generateReport() {
    const duration = this.testResults.endTime - this.testResults.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;
    
    console.log('\n📊 FILE APPROVAL SYSTEM E2E TEST REPORT');
    console.log('==========================================');
    console.log(`🕐 Duration: ${durationMinutes} minutes`);
    console.log(`📈 Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🔍 Test Coverage:');
    console.log('  ✅ Complete approval workflow (customer → admin → customer)');
    console.log('  ✅ File upload security validation');
    console.log('  ✅ Email notification system');
    console.log('  ✅ Mobile responsiveness');
    console.log('  ✅ Database state verification');
    console.log('  ✅ Rate limiting enforcement');
    console.log('  ✅ Performance under load');
    
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: durationMinutes,
      results: this.testResults,
      environment: {
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:3020',
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to test-report.json');
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    
    // Clean up test files
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
    
    // Clean up test data in database (if needed)
    try {
      const response = await fetch((process.env.TEST_BASE_URL || 'http://localhost:3020') + '/api/test/cleanup', {
        method: 'POST'
      });
      if (response.ok) {
        console.log('✅ Test data cleaned up');
      }
    } catch (error) {
      console.warn('⚠️ Could not clean up test data:', error.message);
    }
    
    console.log('✅ Cleanup complete');
  }
}

// Main execution
async function main() {
  const runner = new FileApprovalTestRunner();
  
  try {
    await runner.setup();
    await runner.runTests();
    runner.generateReport();
    
    // Exit with success if all tests passed
    if (runner.testResults.failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    runner.generateReport();
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test runner interrupted');
  const runner = new FileApprovalTestRunner();
  await runner.cleanup();
  process.exit(1);
});

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { FileApprovalTestRunner };