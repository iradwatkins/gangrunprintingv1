# GangRun Printing Source Tree Documentation

## Project Structure Overview

```
gangrunprinting/
├── .bmad-core/                 # BMad Method configuration and templates
│   ├── agents/                 # AI agent configurations
│   ├── checklists/            # Project checklists
│   ├── data/                  # Reference data
│   ├── tasks/                 # Task definitions
│   ├── templates/             # Document templates
│   └── core-config.yaml       # BMad configuration
│
├── .github/                    # GitHub configuration
│   └── workflows/             # CI/CD pipelines
│
├── docs/                       # Project documentation
│   ├── architecture/          # Architecture shards
│   │   ├── shard-005-admin.md
│   │   ├── shard-006-marketing.md
│   │   └── shard-007-localization.md
│   ├── bmad/                  # BMad documentation
│   │   ├── agents/            # Agent logs
│   │   ├── shards/            # Implementation shards
│   │   ├── progress.md        # Progress tracker
│   │   └── story.md           # Project story
│   ├── trash/                 # Archived documentation
│   ├── architecture.md        # Main architecture document
│   ├── prd.md                 # Product requirements
│   └── *.md                   # Various documentation files
│
├── prisma/                     # Database configuration
│   ├── migrations/            # Database migrations
│   └── schema.prisma          # Database schema definition
│
├── public/                     # Static assets
│   ├── fonts/                 # Custom fonts
│   ├── images/                # Static images
│   │   └── products/          # Product images
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
│
├── src/                        # Source code
│   ├── app/                   # Next.js App Router
│   │   ├── (customer)/        # Customer-facing routes
│   │   │   ├── cart/          # Shopping cart page
│   │   │   ├── checkout/      # Checkout flow
│   │   │   ├── products/      # Product pages
│   │   │   ├── track/         # Order tracking
│   │   │   └── upload/        # File upload
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── analytics/     # Analytics views
│   │   │   ├── components/    # Admin components
│   │   │   └── orders/        # Order management
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── cart/          # Cart operations
│   │   │   ├── health/        # Health check
│   │   │   ├── orders/        # Order endpoints
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── search/        # Search functionality
│   │   │   └── upload/        # File upload endpoint
│   │   ├── auth/              # Authentication pages
│   │   │   ├── error/         # Auth error page
│   │   │   ├── signin/        # Sign in page
│   │   │   └── verify-request/ # Email verification
│   │   ├── fonts/             # Font configuration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 page
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/             # React components
│   │   ├── cart/              # Cart components
│   │   ├── forms/             # Form components
│   │   ├── layouts/           # Layout components
│   │   ├── products/          # Product components
│   │   ├── search/            # Search components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── GoogleAnalytics.tsx # Analytics component
│   │   └── OptimizedImage.tsx  # Image optimization
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-toast.ts       # Toast notifications
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Database client
│   │   ├── minio.ts           # MinIO storage
│   │   ├── redis.ts           # Redis cache
│   │   ├── resend.ts          # Email service
│   │   └── utils.ts           # Helper utilities
│   │
│   ├── server/                 # Server-side code
│   │   └── auth.ts            # Auth configuration
│   │
│   ├── stores/                 # State management
│   │   └── cart.ts            # Cart store (Zustand)
│   │
│   └── types/                  # TypeScript definitions
│       └── next-auth.d.ts     # NextAuth types
│
├── Configuration Files
├── .env                        # Environment variables
├── .env.example               # Environment template
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # AI assistant instructions
├── README.md                  # Project readme
├── components.json            # shadcn/ui configuration
├── deploy-direct.sh           # Deployment script
├── middleware.ts              # Next.js middleware
├── next-env.d.ts              # Next.js types
├── next.config.js             # Next.js configuration
├── package-lock.json          # Locked dependencies
├── package.json               # Project dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Directories Explained

### `/src/app/` - Next.js App Router

The main application routing structure using Next.js 15's App Router pattern. Routes are file-system based with special file conventions.

### `/src/components/` - Component Library

Reusable React components organized by feature. The `ui/` folder contains shadcn/ui base components.

### `/src/lib/` - Core Libraries

Utility functions, service configurations, and shared logic. Critical integrations like auth, database, and external services.

### `/prisma/` - Database Management

Prisma ORM schema and migration files. The single source of truth for database structure.

### `/docs/` - Documentation

Comprehensive project documentation following BMad Method. Includes architecture, requirements, and progress tracking.

### `/.bmad-core/` - BMad Configuration

BMad Method templates, agents, and workflows for AI-assisted development.

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **API Routes**: kebab-case folders (e.g., `/api/user-profile/`)
- **Documentation**: kebab-case (e.g., `shard-001-setup.md`)

## Important Files

### Configuration Files

- `next.config.js` - Next.js configuration with PWA setup
- `tailwind.config.ts` - Tailwind CSS theme and plugins
- `tsconfig.json` - TypeScript compiler options
- `prisma/schema.prisma` - Database schema definition

### Environment Configuration

- `.env` - Production environment variables
- `.env.example` - Template for environment setup

### Documentation

- `docs/prd.md` - Product requirements document
- `docs/architecture.md` - System architecture
- `docs/bmad/progress.md` - Development progress tracker

## Build Outputs

- `.next/` - Next.js build output (not in repo)
- `node_modules/` - Dependencies (not in repo)
- `public/sw.js` - Generated service worker

## Development Patterns

### Route Groups

- `(customer)` - Customer-facing routes without URL prefix
- `admin` - Admin routes with /admin prefix
- `api` - API endpoints under /api

### Component Organization

- Feature-based grouping (cart/, products/, etc.)
- Shared UI components in ui/
- Form components separated for reusability

### State Management

- Server state: React Server Components
- Client state: Zustand stores
- Form state: React Hook Form
- Cache: Redis for sessions and data

## Security Considerations

- Environment variables never committed
- API routes protected by authentication
- Admin routes require role verification
- Sensitive operations use server actions

## Performance Optimizations

- Image optimization with Next.js Image
- Code splitting by route
- API response caching with Redis
- Static generation where possible
- PWA with offline support

## Testing Structure

```
tests/                          # Test files (planned)
├── unit/                       # Unit tests
│   ├── components/            # Component tests
│   ├── lib/                   # Utility tests
│   └── api/                   # API logic tests
├── integration/               # Integration tests
│   ├── auth/                  # Auth flow tests
│   └── workflows/             # User workflow tests
└── e2e/                       # End-to-end tests
    ├── checkout.spec.ts       # Checkout flow
    └── admin.spec.ts          # Admin operations
```

## Deployment Structure

The application is deployed as a monolithic Next.js application with:

- PostgreSQL database (separate container)
- Redis cache (separate container)
- MinIO storage (separate container)
- Main application on port 3002

All services managed through Dokploy on VPS at 72.60.28.175.
