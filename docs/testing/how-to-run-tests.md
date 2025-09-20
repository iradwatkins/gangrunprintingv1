# How to Run Tests - GangRun Printing

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Prerequisites

### System Requirements

- Node.js 20+
- PostgreSQL 14+
- Redis (for session storage)
- Git

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/iradwatkins/gangrunprinting.git
   cd gangrunprinting
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up test environment file**

   ```bash
   cp .env.example .env.test
   # Edit .env.test with test-specific values
   ```

4. **Set up test database**

   ```bash
   # Create test database
   createdb gangrunprinting_test

   # Generate Prisma client
   npx prisma generate

   # Set up database schema
   npm run test:db:setup

   # Seed test data
   npm run test:db:seed
   ```

5. **Install Playwright browsers (for E2E tests)**
   ```bash
   npx playwright install
   ```

## Test Commands

### Unit and Integration Tests

#### Basic Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run specific test file
npm test tests/unit/auth.test.ts

# Run tests matching a pattern
npm test -- --grep "authentication"
```

#### Coverage Commands

```bash
# Run with coverage
npm run test:coverage

# Run with coverage and open report
npm run test:coverage && open coverage/index.html
```

#### Test UI

```bash
# Open Vitest UI (interactive test runner)
npm run test:ui
```

### End-to-End Tests

#### Basic E2E Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (see browser)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific E2E test file
npm run test:e2e tests/e2e/auth.spec.ts
```

#### Browser-Specific Tests

```bash
# Run tests on specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run on mobile
npm run test:e2e -- --project="Mobile Chrome"
```

#### E2E Test Options

```bash
# Run tests with headed browser (visible)
npm run test:e2e -- --headed

# Run tests with slow motion
npm run test:e2e -- --headed --slow-mo=1000

# Run tests and keep browser open on failure
npm run test:e2e -- --headed --pause-on-failure
```

### Database Management

```bash
# Setup test database schema
npm run test:db:setup

# Seed test database with sample data
npm run test:db:seed

# Reset test database (drops all data)
npm run test:db:reset

# Run custom seed script
dotenv -e .env.test -- node prisma/seed-custom.js
```

## Test Filtering and Selection

### By File Pattern

```bash
# Run all auth tests
npm test auth

# Run all API tests
npm test api

# Run all unit tests
npm test tests/unit

# Run all integration tests
npm test tests/integration
```

### By Test Name Pattern

```bash
# Run tests with "login" in the name
npm test -- --grep "login"

# Run tests with "payment" in the name
npm test -- --grep "payment"

# Exclude tests (run everything except these)
npm test -- --grep "skip" --invert
```

### By Test Status

```bash
# Run only failing tests
npm test -- --reporter=verbose --run-only-failed

# Run tests related to changed files (if using git)
npm test -- --changed
```

## Debugging Tests

### Unit/Integration Test Debugging

1. **Using VS Code**
   - Set breakpoints in test files
   - Run "Debug: JavaScript Debug Terminal"
   - Execute test commands

2. **Using Node Inspector**

   ```bash
   node --inspect-brk ./node_modules/.bin/vitest run tests/unit/auth.test.ts
   ```

3. **Console Debugging**

   ```bash
   # Verbose output
   npm test -- --reporter=verbose

   # Debug specific test
   npm test tests/unit/auth.test.ts -- --reporter=verbose
   ```

### E2E Test Debugging

1. **Visual Debugging**

   ```bash
   # Run with UI for step-by-step debugging
   npm run test:e2e:ui

   # Run in headed mode to see browser
   npm run test:e2e -- --headed
   ```

2. **Debug Mode**

   ```bash
   # Pause on first line of test
   npm run test:e2e:debug

   # Debug specific test
   npm run test:e2e tests/e2e/checkout.spec.ts -- --debug
   ```

3. **Screenshots and Videos**
   ```bash
   # Screenshots are automatically taken on failures
   # Videos are recorded for failed tests
   # Files are saved to test-results/
   ```

## Environment Configuration

### Test Environment Variables

Create `.env.test` with these variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gangrunprinting_test"

# Authentication
NEXTAUTH_SECRET="test-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3002"

# External Services (use test/sandbox credentials)
SQUARE_APPLICATION_ID="test-square-app-id"
SQUARE_ACCESS_TOKEN="test-access-token"
SQUARE_ENVIRONMENT="sandbox"

# Email (use test service)
RESEND_API_KEY="test-resend-key"

# File Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="test-access"
MINIO_SECRET_KEY="test-secret"
MINIO_BUCKET_NAME="test-bucket"

# Redis
REDIS_URL="redis://localhost:6379/1"
```

### Port Configuration

Tests use specific ports to avoid conflicts:

- **Application**: 3002 (not 3000, which is reserved for Dokploy)
- **Database**: 5432
- **Redis**: 6379
- **MinIO**: 9000

## Continuous Integration

### GitHub Actions

Tests automatically run on:

- Push to main/develop branches
- Pull requests to main
- Manual workflow dispatch

### Local CI Simulation

```bash
# Run the same tests as CI
npm run test:run
npm run test:e2e -- --reporter=github
npm run lint
npx tsc --noEmit
```

## Performance Optimization

### Faster Test Execution

```bash
# Run tests in parallel (default)
npm test

# Limit number of workers
npm test -- --threads 2

# Run single-threaded
npm test -- --no-threads
```

### Database Optimization

```bash
# Use transactions for faster cleanup
export TEST_DATABASE_STRATEGY=transaction

# Use in-memory database for unit tests
export TEST_DATABASE_URL="sqlite::memory:"
```

## Common Issues and Solutions

### Database Issues

```bash
# Connection refused
# Solution: Ensure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Database doesn't exist
# Solution: Create test database
createdb gangrunprinting_test
```

### Port Conflicts

```bash
# Port 3002 already in use
# Solution: Kill process or change port
lsof -ti:3002 | xargs kill
# or change PORT in test environment
```

### Playwright Issues

```bash
# Browsers not installed
npx playwright install

# Permission issues
npx playwright install --with-deps
```

### Mock Service Worker Issues

```bash
# MSW not intercepting requests
# Solution: Check server setup in tests/setup.ts
# Ensure handlers are properly configured
```

## Test Reports

### Coverage Reports

- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

### E2E Test Reports

- **HTML Report**: `playwright-report/index.html`
- **Videos**: `test-results/*/video.webm`
- **Screenshots**: `test-results/*/screenshot.png`
- **Traces**: `test-results/*/trace.zip`

### Viewing Reports

```bash
# Open coverage report
open coverage/index.html

# Open Playwright report
npm run test:e2e:report

# Serve reports locally
npx http-server coverage -p 8080
npx playwright show-report
```

## Best Practices

### Before Running Tests

1. Ensure clean git working directory
2. Pull latest changes
3. Install/update dependencies
4. Set up test database
5. Check environment variables

### During Development

1. Run tests frequently
2. Write tests for new features
3. Update tests for bug fixes
4. Keep test data realistic but safe
5. Use descriptive test names

### After Changes

1. Run full test suite
2. Check coverage reports
3. Review failed tests
4. Update documentation if needed
5. Commit test changes with code

## Getting Help

### Documentation

- Check `/docs/testing/` directory
- Review test examples in codebase
- Consult tool documentation

### Common Commands Reference

```bash
# Quick test run
npm test

# Full test suite with coverage
npm run test:coverage && npm run test:e2e

# Debug failing test
npm test failing-test.ts -- --reporter=verbose

# Reset everything and start fresh
npm run test:db:reset && npm run test:db:setup && npm run test:db:seed
```
