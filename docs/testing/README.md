# Testing Strategy - GangRun Printing

## Overview

This document outlines the comprehensive testing strategy for the GangRun Printing e-commerce platform. Our testing approach ensures reliability, security, and performance across all critical user journeys.

## Testing Stack

- **Unit & Integration Testing**: Vitest with React Testing Library
- **End-to-End Testing**: Playwright
- **API Testing**: Supertest with MSW (Mock Service Worker)
- **Coverage Reporting**: Istanbul/c8 via Vitest
- **CI/CD**: GitHub Actions

## Test Structure

```
tests/
├── setup.ts                 # Global test setup
├── utils/                   # Test utilities and helpers
│   ├── test-utils.tsx      # React testing utilities
│   └── db-helpers.ts       # Database test helpers
├── mocks/                  # Mock data and handlers
│   ├── server.ts          # MSW server setup
│   └── handlers.ts        # API mock handlers
├── unit/                   # Unit tests
│   ├── auth.test.ts       # Authentication utilities
│   └── utils.test.ts      # Utility functions
├── integration/            # Integration tests
│   ├── auth-api.test.ts   # Authentication API routes
│   └── orders-api.test.ts # Orders API routes
└── e2e/                   # End-to-end tests
    ├── auth.spec.ts       # Authentication flow
    ├── checkout.spec.ts   # Checkout process
    └── admin.spec.ts      # Admin dashboard
```

## Running Tests

### All Tests
```bash
npm test                    # Watch mode
npm run test:run           # Single run
npm run test:coverage      # With coverage
```

### Unit Tests
```bash
npm test tests/unit
```

### Integration Tests
```bash
npm test tests/integration
```

### End-to-End Tests
```bash
npm run test:e2e           # All browsers
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:debug     # Debug mode
```

### Test UI
```bash
npm run test:ui            # Vitest UI
npm run test:e2e:ui        # Playwright UI
```

## Test Database Setup

### Initial Setup
```bash
# Setup test database
npm run test:db:setup

# Seed test data
npm run test:db:seed

# Reset database
npm run test:db:reset
```

### Environment Variables
Create `.env.test` with test-specific configurations:
```env
NODE_ENV=test
DATABASE_URL="postgresql://username:password@localhost:5432/gangrunprinting_test"
NEXTAUTH_SECRET=test-secret-key
# ... other test configurations
```

## Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### 1. Unit Tests
Test individual functions and components in isolation.

**Coverage Areas**:
- Authentication utilities
- Utility functions
- Form validation
- Data transformations
- React components

### 2. Integration Tests
Test API routes and database interactions.

**Coverage Areas**:
- Authentication flows
- Order processing
- Payment integration
- Admin operations
- Database operations

### 3. End-to-End Tests
Test complete user journeys across the application.

**Coverage Areas**:
- User authentication
- Product browsing
- Quote generation
- Checkout process
- Order management
- Admin dashboard

## Critical Test Scenarios

### Authentication
- Magic link sign-in
- Google OAuth
- Session management
- Access control

### E-commerce Flow
- Product configuration
- Quote generation
- Cart management
- Checkout process
- Payment processing
- Order confirmation

### Admin Functions
- Order management
- Product management
- User management
- Vendor assignment
- Dashboard analytics

## Mock Strategy

### API Mocking (MSW)
- Mock external APIs (Square, Google, etc.)
- Simulate various response scenarios
- Test error conditions

### Database Mocking
- Use test database with clean slate per test
- Factory functions for test data
- Automated cleanup

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test both happy and error paths
4. Use data-testid attributes for E2E tests
5. Keep tests independent and idempotent

### Test Data
1. Use factory functions for consistent test data
2. Clean up after each test
3. Use realistic but safe test data
4. Avoid hardcoded values where possible

### Performance
1. Run unit tests in parallel
2. Use database transactions for faster cleanup
3. Mock external services appropriately
4. Use proper test isolation

## Continuous Integration

### GitHub Actions Workflow
- Automated testing on push/PR
- Multi-browser E2E testing
- Coverage reporting
- Security audits
- Build verification

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No high-severity security vulnerabilities
- Successful build completion

## Debugging Tests

### Unit/Integration Tests
```bash
npm test -- --reporter=verbose
npm run test:ui  # Visual debugging
```

### E2E Tests
```bash
npm run test:e2e:debug     # Debug mode
npm run test:e2e -- --headed  # See browser
```

### Common Issues
- Database connection issues
- Mock data inconsistencies
- Timing issues in E2E tests
- Environment variable problems

## Maintenance

### Regular Tasks
- Update test dependencies
- Review and update mock data
- Monitor test performance
- Update documentation
- Review coverage reports

### Adding New Tests
1. Identify test category (unit/integration/e2e)
2. Follow existing patterns
3. Add appropriate mock data
4. Update documentation if needed
5. Ensure proper cleanup

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)

## Support

For testing questions or issues:
1. Check this documentation
2. Review existing test files for patterns
3. Consult team members
4. Update documentation with solutions