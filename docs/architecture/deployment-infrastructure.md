## Unified Project Structure

```plaintext
gangrunprinting/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── deploy.yaml
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (customer)/         # Customer routes
│   │   ├── admin/              # Admin routes
│   │   ├── api/                # API routes
│   │   ├── auth/               # Auth pages
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form components
│   │   ├── layouts/            # Layout components
│   │   └── features/           # Feature components
│   ├── lib/                    # Utilities
│   │   ├── auth/               # Auth utilities
│   │   ├── db/                 # Database utilities
│   │   ├── services/           # External services
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── server/                 # Server-side code
│       ├── actions/            # Server actions
│       └── services/           # Business logic
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── public/                     # Static assets
│   ├── images/
│   └── manifest.json           # PWA manifest
├── docs/                       # Documentation
│   ├── prd.md
│   ├── architecture.md
│   └── bmad/
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                # Environment template
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # Project readme
```

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Required software
node --version  # v20.x or higher
npm --version   # v10.x or higher
git --version   # v2.x or higher

# Database
psql --version  # PostgreSQL 15+
redis-server --version  # Redis 7.0+
```

#### Initial Setup

```bash
# Clone repository
git clone https://github.com/iradwatkins/gangrunprinting.git
cd gangrunprinting

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Seed database (optional)
npm run db:seed
```

#### Development Commands

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:api

# Run tests
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:all    # All tests
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/gangrun_db
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key

# External Services
RESEND_API_KEY=re_xxxxxxxxxxxx
SQUARE_ACCESS_TOKEN=sq_xxxxxxxxxxxx
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
REDIS_URL=redis://localhost:6379

# Shared
NODE_ENV=development
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**

- **Platform:** VPS with Dokploy
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **CDN/Edge:** Cloudflare (future)

**Backend Deployment:**

- **Platform:** Same VPS (monolithic)
- **Build Command:** `npm run build`
- **Deployment Method:** PM2 process manager via Dokploy

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:all

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /root/websites/gangrunprinting
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart gangrun
```

### Environments

| Environment | Frontend URL                        | Backend URL                             | Purpose                |
| ----------- | ----------------------------------- | --------------------------------------- | ---------------------- |
| Development | http://localhost:3002               | http://localhost:3002/api               | Local development      |
| Staging     | https://staging.gangrunprinting.com | https://staging.gangrunprinting.com/api | Pre-production testing |
| Production  | https://gangrunprinting.com         | https://gangrunprinting.com/api         | Live environment       |

