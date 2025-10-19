import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  // Only run .spec.ts files for E2E tests
  testMatch: '**/*.spec.ts',
  /* Run tests in files in parallel - disabled for auth tests to avoid conflicts */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Single worker for auth tests
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://gangrunprinting.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshots on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: 'retain-on-failure',

    /* Timeout for each action */
    actionTimeout: 30000,

    /* Timeout for navigation */
    navigationTimeout: 60000,
  },

  /* Test timeout - increased for slow authentication checks */
  timeout: 120000, // 2 minutes per test

  /* Expect timeout */
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },

  /* Output directory */
  outputDir: 'test-results/',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox needs slightly longer timeouts
        actionTimeout: 45000,
        navigationTimeout: 90000,
      },
      timeout: 150000, // 2.5 minutes for Firefox
      expect: {
        timeout: 40000,
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // WebKit/Safari needs longer timeouts
        actionTimeout: 45000,
        navigationTimeout: 90000,
      },
      timeout: 150000, // 2.5 minutes for WebKit
      expect: {
        timeout: 40000,
      },
    },

    /* Test against mobile viewports - need significantly longer timeouts */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Mobile browsers are slower - increased timeouts for stability
        actionTimeout: 90000, // 1.5 minutes per action
        navigationTimeout: 180000, // 3 minutes for navigation
      },
      timeout: 240000, // 4 minutes per test for mobile
      expect: {
        timeout: 60000, // 1 minute for assertions
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        // Mobile Safari is often the slowest - most generous timeouts
        actionTimeout: 120000, // 2 minutes per action
        navigationTimeout: 180000, // 3 minutes for navigation
      },
      timeout: 300000, // 5 minutes per test for Mobile Safari
      expect: {
        timeout: 90000, // 1.5 minutes for assertions
      },
    },
  ],

  /* Testing against production - webServer disabled */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3002',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
})
