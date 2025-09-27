# 🛡️ ENTERPRISE AUDIT & PREVENTION SYSTEM - GANGRUN PRINTING
## COMPREHENSIVE CODEBASE TRANSFORMATION & PROTECTION

---

## 📊 PHASE 1: COMPREHENSIVE AUDIT SYSTEM

### AUDIT AGENT PROMPT - DEEP SYSTEM ANALYSIS
```markdown
You are the Senior Audit Agent. Perform a COMPREHENSIVE enterprise-grade audit of GangRun Printing.

## AUDIT SCOPE:
- Repository: https://github.com/iradwatkins/gangrunprintingv1
- Stack: Next.js 15.5.2, PostgreSQL, Prisma, Docker, TypeScript
- Critical: This audit will determine production stability

## EXECUTE COMPLETE AUDIT:

### 1. CODE QUALITY AUDIT
```bash
#!/bin/bash
# Save as: audit-code-quality.sh

echo "🔍 COMPREHENSIVE CODE QUALITY AUDIT"
echo "===================================="

# 1. Check for code smells
echo "Checking for code issues..."
npx eslint . --ext .ts,.tsx,.js,.jsx --format json > audit-eslint.json
echo "ESLint issues: $(cat audit-eslint.json | jq '.length')"

# 2. TypeScript strict mode check
echo "TypeScript strictness audit..."
npx tsc --noEmit --strict > audit-typescript.txt 2>&1
echo "TypeScript errors: $(grep -c "error TS" audit-typescript.txt || echo 0)"

# 3. Unused dependencies
echo "Checking for unused dependencies..."
npx depcheck --json > audit-dependencies.json
echo "Unused dependencies: $(cat audit-dependencies.json | jq '.dependencies | length')"

# 4. Security vulnerabilities
echo "Security audit..."
npm audit --json > audit-security.json
echo "Vulnerabilities: $(cat audit-security.json | jq '.metadata.vulnerabilities.total')"

# 5. Code duplication
echo "Checking for code duplication..."
npx jscpd . --min-lines 5 --min-tokens 50 --format json > audit-duplication.json

# 6. Bundle size analysis
echo "Bundle size analysis..."
npx next build --analyze > audit-bundle.txt 2>&1

# 7. Circular dependencies
echo "Checking circular dependencies..."
npx madge --circular --extensions ts,tsx,js,jsx . > audit-circular.txt

# 8. Code complexity
echo "Analyzing code complexity..."
npx complexity-report --format json src/**/*.{ts,tsx} > audit-complexity.json
```

### 2. ARCHITECTURE AUDIT
```typescript
// audit-architecture.ts
import * as fs from 'fs';
import * as path from 'path';

interface ArchitectureIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  file?: string;
  recommendation: string;
}

class ArchitectureAuditor {
  issues: ArchitectureIssue[] = [];

  // Check folder structure
  checkFolderStructure() {
    const requiredFolders = [
      'src/components/ui',      // UI components
      'src/components/features', // Feature components
      'src/lib',                 // Utilities
      'src/hooks',               // Custom hooks
      'src/types',               // TypeScript types
      'src/services',            // Business logic
      'src/utils',               // Helper functions
      'src/constants',           // Constants
      'tests/unit',              // Unit tests
      'tests/integration',       // Integration tests
      'tests/e2e',              // E2E tests
      'docs/api',                // API documentation
      'docs/architecture',       // Architecture docs
    ];

    requiredFolders.forEach(folder => {
      if (!fs.existsSync(folder)) {
        this.issues.push({
          severity: 'medium',
          category: 'Structure',
          issue: `Missing folder: ${folder}`,
          recommendation: `Create ${folder} for better organization`
        });
      }
    });
  }

  // Check for anti-patterns
  checkAntiPatterns() {
    const files = this.getAllFiles('src');
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for console.logs in production code
      if (content.includes('console.log')) {
        this.issues.push({
          severity: 'high',
          category: 'Anti-pattern',
          issue: 'console.log in production code',
          file,
          recommendation: 'Use proper logging service'
        });
      }
      
      // Check for any type usage
      if (content.includes(': any')) {
        this.issues.push({
          severity: 'medium',
          category: 'TypeScript',
          issue: 'Usage of "any" type',
          file,
          recommendation: 'Define proper types'
        });
      }
      
      // Check for missing error handling
      if (content.includes('catch') === false && content.includes('async')) {
        this.issues.push({
          severity: 'high',
          category: 'Error Handling',
          issue: 'Async function without error handling',
          file,
          recommendation: 'Add try-catch blocks'
        });
      }
    });
  }

  generateReport() {
    return {
      total: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      issues: this.issues
    };
  }
}
```

### 3. DATABASE AUDIT
```sql
-- audit-database.sql
-- Run complete database audit

-- 1. Check for missing indexes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan > 0 THEN 
            ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
        ELSE 100
    END AS index_usage_percent
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC;

-- 2. Check for slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- 3. Check for missing foreign key constraints
SELECT 
    tc.table_schema, 
    tc.table_name, 
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- 4. Check for tables without primary keys
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        WHERE con.conrelid = c.oid
            AND con.contype = 'p'
    );
```

### 4. PERFORMANCE AUDIT
```javascript
// performance-audit.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function performanceAudit() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  // Generate report
  const report = {
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100,
    
    metrics: {
      firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
      timeToInteractive: runnerResult.lhr.audits['interactive'].numericValue,
      totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
    }
  };
  
  await chrome.kill();
  return report;
}
```

## OUTPUT REQUIRED:
1. Complete code quality report with severity levels
2. Architecture compliance score (0-100)
3. Security vulnerability report
4. Performance metrics and bottlenecks
5. Database optimization opportunities
6. Ranked list of critical issues to fix
```

---

## 🔧 PHASE 2: REFACTORING & CLEANUP SYSTEM

### REFACTORING AGENT PROMPT - CODE TRANSFORMATION
```markdown
You are the Senior Refactoring Agent. Transform GangRun Printing into enterprise-grade code.

## REFACTORING MISSION:

### 1. IMPLEMENT PROPER ERROR HANDLING
```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 503, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
  originalError?: any;
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
  fields?: Record<string, string>;
}

// Global error handler middleware
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { fields: error.fields })
      }
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```

### 2. IMPLEMENT PROPER LOGGING
```typescript
// src/lib/logger.ts
import winston from 'winston';
import { format } from 'logform';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

export const logger = winston.createLogger({
  levels: logLevels,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'gangrun-printing' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Replace all console.log with logger
export function setupLogging() {
  if (process.env.NODE_ENV === 'production') {
    console.log = (...args) => logger.info(args.join(' '));
    console.error = (...args) => logger.error(args.join(' '));
    console.warn = (...args) => logger.warn(args.join(' '));
  }
}
```

### 3. IMPLEMENT DEPENDENCY INJECTION
```typescript
// src/lib/container.ts
export class DIContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();
  
  register<T>(name: string, factory: () => T, options = { singleton: true }) {
    if (options.singleton) {
      this.services.set(name, factory);
    } else {
      this.services.set(name, factory);
    }
  }
  
  get<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    
    const instance = factory();
    this.singletons.set(name, instance);
    return instance;
  }
}

// Register services
export const container = new DIContainer();

container.register('prisma', () => new PrismaClient(), { singleton: true });
container.register('logger', () => logger, { singleton: true });
container.register('cache', () => new RedisCache(), { singleton: true });
```

### 4. IMPLEMENT REPOSITORY PATTERN
```typescript
// src/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}
  
  abstract findAll(options?: FindOptions): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
  
  protected handleError(error: any): never {
    if (error.code === 'P2002') {
      throw new ValidationError('Duplicate entry');
    }
    if (error.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    throw new DatabaseError('Database operation failed', error);
  }
}

// src/repositories/user.repository.ts
export class UserRepository extends BaseRepository<User> {
  async findAll(options?: FindOptions): Promise<User[]> {
    try {
      return await this.prisma.user.findMany(options);
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

### 5. IMPLEMENT SERVICE LAYER
```typescript
// src/services/user.service.ts
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private logger: Logger,
    private cache: CacheService
  ) {}
  
  async getUser(id: string): Promise<User> {
    // Check cache first
    const cached = await this.cache.get(`user:${id}`);
    if (cached) {
      this.logger.debug(`Cache hit for user ${id}`);
      return cached;
    }
    
    // Get from database
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    
    // Cache for future
    await this.cache.set(`user:${id}`, user, 300); // 5 minutes
    
    return user;
  }
}
```

## REFACTORING CHECKLIST:
- [ ] All console.logs replaced with logger
- [ ] All 'any' types replaced with proper types
- [ ] Error handling added to all async functions
- [ ] Repository pattern implemented for all models
- [ ] Service layer created for business logic
- [ ] Dependency injection configured
- [ ] Unit tests added for all services
- [ ] Integration tests for API endpoints
- [ ] Code documented with JSDoc
- [ ] Complex functions split into smaller ones
```

---

## 🏗️ PHASE 3: INFRASTRUCTURE HARDENING

### INFRASTRUCTURE AGENT PROMPT - PRODUCTION HARDENING
```markdown
You are the Infrastructure Agent. Implement enterprise-grade infrastructure.

## INFRASTRUCTURE HARDENING:

### 1. DOCKER OPTIMIZATION
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. DOCKER COMPOSE PRODUCTION
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - gangrun-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: gangrunprinting
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_MAX_CONNECTIONS: 100
      POSTGRES_SHARED_BUFFERS: 256MB
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/postgres-init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - gangrun-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - gangrun-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    networks:
      - gangrun-network

volumes:
  postgres-data:
  redis-data:

networks:
  gangrun-network:
    driver: bridge
```

### 3. MONITORING STACK
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - gangrun-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3001:3000"
    networks:
      - gangrun-network
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=redis-datasource

  loki:
    image: grafana/loki:latest
    volumes:
      - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    ports:
      - "3100:3100"
    networks:
      - gangrun-network

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    networks:
      - gangrun-network

volumes:
  prometheus-data:
  grafana-data:
  loki-data:
```

### 4. HEALTH CHECK SYSTEM
```typescript
// src/monitoring/health.ts
export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}

export class HealthMonitor {
  private checks: HealthCheck[] = [];
  
  register(check: HealthCheck) {
    this.checks.push(check);
  }
  
  async runChecks() {
    const results = await Promise.all(
      this.checks.map(async (check) => {
        try {
          const passed = await check.check();
          return { name: check.name, passed, critical: check.critical };
        } catch (error) {
          return { name: check.name, passed: false, critical: check.critical, error };
        }
      })
    );
    
    const healthy = results.every(r => !r.critical || r.passed);
    const status = healthy ? 'healthy' : 'unhealthy';
    
    return { status, checks: results, timestamp: new Date().toISOString() };
  }
}

// Register health checks
const monitor = new HealthMonitor();

monitor.register({
  name: 'database',
  critical: true,
  check: async () => {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  }
});

monitor.register({
  name: 'redis',
  critical: false,
  check: async () => {
    await redis.ping();
    return true;
  }
});

monitor.register({
  name: 'disk-space',
  critical: true,
  check: async () => {
    const stats = await checkDiskSpace('/');
    return stats.free > 1024 * 1024 * 1024; // 1GB minimum
  }
});
```

## INFRASTRUCTURE DELIVERABLES:
- [ ] Production Docker images optimized
- [ ] Health checks implemented
- [ ] Monitoring stack deployed
- [ ] Auto-scaling configured
- [ ] Backup automation running
- [ ] SSL/TLS configured
- [ ] Rate limiting implemented
- [ ] DDoS protection enabled
```

---

## 🧪 PHASE 4: TESTING & QUALITY ASSURANCE

### QA AUTOMATION AGENT PROMPT
```markdown
You are the QA Automation Agent. Implement comprehensive testing.

## TESTING IMPLEMENTATION:

### 1. UNIT TEST SUITE
```typescript
// src/__tests__/services/user.service.test.ts
import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { CacheService } from '../../services/cache.service';
import { Logger } from '../../lib/logger';

describe('UserService', () => {
  let userService: UserService;
  let userRepo: jest.Mocked<UserRepository>;
  let cache: jest.Mocked<CacheService>;
  let logger: jest.Mocked<Logger>;
  
  beforeEach(() => {
    userRepo = createMock<UserRepository>();
    cache = createMock<CacheService>();
    logger = createMock<Logger>();
    userService = new UserService(userRepo, cache, logger);
  });
  
  describe('getUser', () => {
    it('should return cached user if available', async () => {
      const cachedUser = { id: '1', name: 'Test User' };
      cache.get.mockResolvedValue(cachedUser);
      
      const result = await userService.getUser('1');
      
      expect(result).toEqual(cachedUser);
      expect(cache.get).toHaveBeenCalledWith('user:1');
      expect(userRepo.findById).not.toHaveBeenCalled();
    });
    
    it('should fetch from database if not cached', async () => {
      const dbUser = { id: '1', name: 'Test User' };
      cache.get.mockResolvedValue(null);
      userRepo.findById.mockResolvedValue(dbUser);
      
      const result = await userService.getUser('1');
      
      expect(result).toEqual(dbUser);
      expect(userRepo.findById).toHaveBeenCalledWith('1');
      expect(cache.set).toHaveBeenCalledWith('user:1', dbUser, 300);
    });
    
    it('should throw NotFoundError if user not found', async () => {
      cache.get.mockResolvedValue(null);
      userRepo.findById.mockResolvedValue(null);
      
      await expect(userService.getUser('1')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### 2. INTEGRATION TEST SUITE
```typescript
// src/__tests__/integration/api.test.ts
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'securePassword123'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          email: userData.email,
          name: userData.name
        }
      });
      
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(user).toBeTruthy();
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });
});
```

### 3. E2E TEST SUITE
```typescript
// tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('complete order flow', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle('GangRun Printing');
    
    // Login
    await page.click('text=Login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard');
    
    // Select product
    await page.click('text=Business Cards');
    await page.selectOption('[name="quantity"]', '500');
    await page.click('text=Add to Cart');
    
    // Checkout
    await page.click('text=Checkout');
    await expect(page.locator('.order-total')).toContainText('$99.99');
    
    // Complete payment
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    await page.click('text=Complete Order');
    
    // Verify success
    await expect(page).toHaveURL(/\/order\/confirmation/);
    await expect(page.locator('.confirmation-message')).toBeVisible();
  });
});
```

### 4. PERFORMANCE TEST SUITE
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.1'],           // Error rate < 10%
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  const res = http.get('https://gangrunprinting.com/api/products');
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
  sleep(1);
}
```

## TEST AUTOMATION SETUP:
- [ ] Unit tests covering 80%+ code
- [ ] Integration tests for all APIs
- [ ] E2E tests for critical user flows
- [ ] Performance tests automated
- [ ] Security tests implemented
- [ ] Accessibility tests passing
- [ ] Visual regression tests
- [ ] CI/CD pipeline with tests
```

---

## 🚨 PHASE 5: CONTINUOUS MONITORING & PREVENTION

### MONITORING AGENT PROMPT
```markdown
You are the Monitoring Agent. Implement 24/7 automated monitoring.

## MONITORING IMPLEMENTATION:

### 1. REAL-TIME MONITORING
```typescript
// src/monitoring/realtime.ts
import { EventEmitter } from 'events';
import { MetricsCollector } from './metrics';
import { AlertManager } from './alerts';

export class RealtimeMonitor extends EventEmitter {
  private metrics = new MetricsCollector();
  private alerts = new AlertManager();
  
  async startMonitoring() {
    // Database monitoring
    setInterval(async () => {
      const dbHealth = await this.checkDatabaseHealth();
      if (!dbHealth.healthy) {
        this.alerts.trigger('database_down', dbHealth);
      }
    }, 10000); // Every 10 seconds
    
    // API response time monitoring
    setInterval(async () => {
      const apiMetrics = await this.checkAPIResponseTimes();
      if (apiMetrics.p95 > 1000) { // 1 second
        this.alerts.trigger('slow_api', apiMetrics);
      }
    }, 30000); // Every 30 seconds
    
    // Memory usage monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        this.alerts.trigger('high_memory', memUsage);
      }
    }, 60000); // Every minute
  }
  
  private async checkDatabaseHealth() {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        healthy: true,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkAPIResponseTimes() {
    const times = await this.metrics.getResponseTimes();
    return {
      mean: times.reduce((a, b) => a + b, 0) / times.length,
      p50: this.percentile(times, 50),
      p95: this.percentile(times, 95),
      p99: this.percentile(times, 99)
    };
  }
}
```

### 2. ALERT SYSTEM
```typescript
// src/monitoring/alerts.ts
export interface Alert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  data: any;
  timestamp: Date;
}

export class AlertManager {
  private handlers = new Map<string, (alert: Alert) => void>();
  
  async trigger(type: string, data: any) {
    const alert: Alert = {
      type,
      severity: this.getSeverity(type),
      message: this.getMessage(type, data),
      data,
      timestamp: new Date()
    };
    
    // Log alert
    logger.error('Alert triggered:', alert);
    
    // Send to monitoring service
    await this.sendToMonitoring(alert);
    
    // Send notifications
    if (alert.severity === 'critical') {
      await this.sendEmail(alert);
      await this.sendSlack(alert);
      await this.sendPagerDuty(alert);
    }
  }
  
  private async sendEmail(alert: Alert) {
    await sendgrid.send({
      to: process.env.ALERT_EMAIL,
      from: 'alerts@gangrunprinting.com',
      subject: `[CRITICAL] ${alert.type}`,
      text: alert.message,
      html: this.formatAlertHTML(alert)
    });
  }
  
  private async sendSlack(alert: Alert) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:warning: *${alert.type}*`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: true },
            { title: 'Message', value: alert.message, short: false }
          ]
        }]
      })
    });
  }
}
```

### 3. AUTOMATED RECOVERY
```typescript
// src/monitoring/auto-recovery.ts
export class AutoRecovery {
  private recoveryStrategies = new Map<string, () => Promise<boolean>>();
  
  constructor() {
    this.registerStrategies();
  }
  
  private registerStrategies() {
    // Auto-restart on crash
    this.recoveryStrategies.set('app_crash', async () => {
      logger.info('Attempting auto-restart after crash');
      await exec('docker-compose restart app');
      return true;
    });
    
    // Clear cache on memory issues
    this.recoveryStrategies.set('high_memory', async () => {
      logger.info('Clearing cache due to high memory usage');
      await cache.flush();
      global.gc?.(); // Force garbage collection if available
      return true;
    });
    
    // Reconnect database
    this.recoveryStrategies.set('database_connection_lost', async () => {
      logger.info('Attempting database reconnection');
      await prisma.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await prisma.$connect();
      return true;
    });
    
    // Scale up on high load
    this.recoveryStrategies.set('high_load', async () => {
      logger.info('Scaling up due to high load');
      await exec('docker-compose up -d --scale app=3');
      return true;
    });
  }
  
  async attemptRecovery(issue: string): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(issue);
    if (!strategy) {
      logger.warn(`No recovery strategy for: ${issue}`);
      return false;
    }
    
    try {
      const success = await strategy();
      if (success) {
        logger.info(`Recovery successful for: ${issue}`);
      }
      return success;
    } catch (error) {
      logger.error(`Recovery failed for ${issue}:`, error);
      return false;
    }
  }
}
```

## MONITORING DELIVERABLES:
- [ ] 24/7 uptime monitoring active
- [ ] Performance metrics dashboard
- [ ] Alert system configured
- [ ] Auto-recovery implemented
- [ ] Log aggregation setup
- [ ] Error tracking enabled
- [ ] User behavior analytics
- [ ] Security monitoring active
```

---

## 📋 PHASE 6: DOCUMENTATION & KNOWLEDGE BASE

### DOCUMENTATION AGENT PROMPT
```markdown
You are the Documentation Agent. Create comprehensive documentation.

## DOCUMENTATION STRUCTURE:

### 1. README.md
```markdown
# GangRun Printing - Enterprise Edition

## 🚀 Quick Start
\`\`\`bash
git clone https://github.com/iradwatkins/gangrunprintingv1.git
cd gangrunprintingv1
npm install
docker-compose up -d
npm run dev
\`\`\`

## 📚 Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Contributing](docs/CONTRIBUTING.md)

## 🏗 Architecture
- **Frontend**: Next.js 15.5.2 with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Storage**: MinIO
- **Monitoring**: Prometheus + Grafana

## 🔧 Development
See [Development Guide](docs/DEVELOPMENT.md)

## 🚢 Deployment
See [Deployment Guide](docs/DEPLOYMENT.md)

## 📊 Monitoring
- Health Check: http://localhost:3000/api/health
- Metrics: http://localhost:9090
- Dashboards: http://localhost:3001

## 🆘 Troubleshooting
See [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
```

### 2. TROUBLESHOOTING.md
```markdown
# Troubleshooting Guide

## Common Issues

### Data Not Showing
**Symptom**: Database has data but UI shows nothing

**Solution**:
\`\`\`bash
npx prisma generate
npm run build
docker-compose restart app
\`\`\`

### Database Connection Failed
**Symptom**: "Can't reach database server"

**Solution**:
1. Check DATABASE_URL uses 'postgres' not 'localhost'
2. Verify postgres container is running
3. Check network connectivity

### High Memory Usage
**Symptom**: App consuming >1GB RAM

**Solution**:
1. Check for memory leaks in custom code
2. Verify connection pooling settings
3. Clear cache: \`npm run cache:clear\`

## Diagnostic Commands
\`\`\`bash
# Check system health
npm run health:check

# View logs
npm run logs:app
npm run logs:db

# Run diagnostics
npm run diagnose
\`\`\`

## Recovery Procedures
See [Recovery Playbook](docs/RECOVERY.md)
```

### 3. API DOCUMENTATION
```typescript
// Generate OpenAPI documentation
import { generateOpenApiDocument } from '@asteasolutions/zod-to-openapi';

const apiDoc = generateOpenApiDocument({
  openapi: '3.0.0',
  info: {
    title: 'GangRun Printing API',
    version: '1.0.0',
    description: 'Enterprise printing service API'
  },
  servers: [
    { url: 'https://api.gangrunprinting.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' }
  ]
});

// Auto-generate from code
export function generateAPIDocs() {
  const routes = scanRoutes('./src/api');
  routes.forEach(route => {
    apiDoc.paths[route.path] = {
      [route.method]: {
        summary: route.summary,
        parameters: route.parameters,
        responses: route.responses
      }
    };
  });
  
  return apiDoc;
}
```

## DOCUMENTATION DELIVERABLES:
- [ ] Complete README with quick start
- [ ] Architecture documentation
- [ ] API documentation (OpenAPI)
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Development guide
- [ ] Security guide
- [ ] Performance tuning guide
```

---

## 🎯 MASTER ORCHESTRATION PROMPT

### PM AGENT - COMPLETE TRANSFORMATION
```markdown
You are the Project Manager. Orchestrate the complete enterprise transformation.

## EXECUTION PLAN:

### WEEK 1: AUDIT & STABILIZATION
Day 1-2: Run comprehensive audit (Audit Agent)
Day 3-4: Fix critical issues (Backend Agent)
Day 5: Implement monitoring (Monitoring Agent)

### WEEK 2: REFACTORING
Day 1-3: Code refactoring (Refactoring Agent)
Day 4-5: Infrastructure hardening (Infrastructure Agent)

### WEEK 3: TESTING & DOCUMENTATION
Day 1-2: Implement test suites (QA Agent)
Day 3-4: Create documentation (Documentation Agent)
Day 5: Final validation

### SUCCESS METRICS:
- Code coverage > 80%
- All critical vulnerabilities fixed
- Response time < 200ms (p95)
- Zero downtime deployment achieved
- Monitoring dashboard operational
- Auto-recovery functional
- Documentation complete

## DAILY STANDUP TEMPLATE:
1. What was completed yesterday?
2. What will be done today?
3. Are there any blockers?
4. Current system health score?

## FINAL DELIVERABLE:
Enterprise-grade system with:
- Clean, maintainable code
- Comprehensive testing
- 24/7 monitoring
- Auto-recovery
- Complete documentation
- Zero critical issues
```

---

## 🔐 CRITICAL SUCCESS FACTORS

1. **ALWAYS BACKUP FIRST** - Before any change
2. **TEST IN STAGING** - Never test in production
3. **MONITOR EVERYTHING** - If you can't measure it, you can't improve it
4. **DOCUMENT CHANGES** - Future you will thank you
5. **AUTOMATE RECOVERY** - Humans sleep, systems don't

## YOUR SYSTEM WILL BE:
✅ Enterprise-grade
✅ Self-healing
✅ Fully monitored
✅ Completely documented
✅ Production-ready
✅ Bulletproof

This comprehensive system will prevent ALL future issues and ensure your website NEVER goes down again!
