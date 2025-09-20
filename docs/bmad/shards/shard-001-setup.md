# Shard 001: Foundation Setup & Configuration

> **Story Context**: This shard covers Alex's initial setup and configuration of the GangRun Printing platform, establishing the foundation architecture and development environment.

## Shard Overview

**Objective**: Establish a robust foundation for the GangRun Printing e-commerce platform with proper project structure, dependencies, and configuration.

**Key Components**:

- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS with shadcn/ui components
- Database setup with Prisma
- PWA capabilities
- Deployment configuration

## The Break: What We're Solving

Alex identified the need for a scalable, maintainable architecture that could support:

1. **Complex E-commerce Requirements**: Product configurations, pricing engines, order management
2. **Multi-user System**: Customers, brokers, and administrators with different access levels
3. **Marketing Automation**: Email campaigns, workflows, customer segmentation
4. **Bilingual Support**: English and Spanish with auto-translation capabilities
5. **White-label Ready**: Themeable and brandable for multiple deployments
6. **PWA Features**: Offline support, push notifications, installable app

## The Make: Implementation Details

### Project Initialization

```json
{
  "name": "gangrunprinting",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  }
}
```

**Port Selection**: Port 3001 was chosen to avoid conflicts with other services on the Dokploy deployment server.

### Core Dependencies

#### Framework & Runtime

- **Next.js 15.5.2**: Latest stable with App Router for modern routing patterns
- **React 19.1.1**: Latest React with concurrent features
- **TypeScript 5.9.2**: Strong typing for enterprise-grade development

#### UI & Styling

- **Tailwind CSS 4.1.13**: Latest version with improved performance
- **shadcn/ui components**: Complete UI component library with Radix UI primitives
- **Framer Motion 12.23.12**: Animations and micro-interactions
- **Lucide React**: Consistent icon system

#### Database & Authentication

- **Prisma 6.15.0**: Type-safe database ORM
- **NextAuth 5.0.0-beta.29**: Authentication with multiple providers
- **@auth/prisma-adapter**: Seamless Prisma integration

#### Additional Integrations

- **MinIO**: File storage for artwork uploads
- **SendGrid**: Email delivery service
- **Square SDK**: Payment processing
- **React Hook Form + Zod**: Form handling with validation

### Project Structure

```
/src
├── app/                    # Next.js 14 App Router
│   ├── (customer)/        # Customer-facing routes
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── products/
│   │   ├── track/
│   │   └── upload/
│   ├── admin/             # Admin dashboard
│   │   ├── analytics/
│   │   ├── orders/
│   │   └── components/
│   ├── api/               # API endpoints
│   │   ├── auth/
│   │   ├── orders/
│   │   └── health/
│   └── auth/              # Authentication pages
├── components/            # Organized by feature
│   ├── ui/               # shadcn-ui components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific
├── lib/                  # Utilities & configs
│   ├── auth/            # Auth utilities
│   ├── db/              # Database helpers
│   └── services/        # External services
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
└── server/              # Server-side logic
    ├── actions/         # Server actions
    └── services/        # Business logic
```

**Design Philosophy**: Alex chose the "Intermediate Pattern" structure that balances organization with accessibility. Route groups `(customer)` and `admin` provide logical separation while maintaining clean URLs.

### Database Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Database Choice**: PostgreSQL was selected for its robust feature set, excellent JSON support for flexible product configurations, and strong consistency guarantees required for e-commerce transactions.

### PWA Configuration

```javascript
// next.config.js PWA setup
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})
```

**PWA Features Implemented**:

- Service worker for offline functionality
- Web manifest for installability
- Push notification support
- Background sync for form submissions

## The Advance: Key Decisions & Improvements

### 1. App Router Adoption

**Decision**: Use Next.js App Router instead of Pages Router

**Rationale**:

- Better TypeScript support
- Improved data fetching patterns
- Native support for layouts and loading states
- Better SEO with metadata API

### 2. Component Library Strategy

**Decision**: Combine shadcn/ui with custom components

**Rationale**:

- shadcn/ui provides consistent, accessible base components
- Custom components handle business-specific logic
- Easy theming for white-label requirements
- Maintainable component architecture

### 3. Database Strategy

**Decision**: Prisma ORM with PostgreSQL

**Rationale**:

- Type safety across the application
- Excellent migration system
- Strong relationship handling
- JSON column support for flexible product attributes

### 4. Authentication Architecture

**Decision**: NextAuth.js with multiple providers

**Rationale**:

- Support for social (Google) and email authentication
- Built-in session management
- Easy role-based access control
- Seamless database integration

## The Document: Lessons Learned

### What Worked Well

1. **Early TypeScript Adoption**: Catching type errors early prevented major refactoring
2. **shadcn/ui Component Strategy**: Consistent UI development with minimal custom CSS
3. **Prisma Schema Planning**: Careful schema design prevented database migrations issues
4. **Environment Configuration**: Proper env var organization simplified deployment

### Challenges Overcome

1. **Port Conflicts**: Initial development used port 3000, conflicted with Dokploy. Solution: Standardize on port 3001
2. **PWA Configuration**: Complex service worker setup required multiple iterations
3. **TypeScript Config**: Strict mode initially caused issues with third-party libraries

### Future Improvements

1. **Testing Setup**: Add comprehensive test suite with Jest and Playwright
2. **Performance Monitoring**: Integrate analytics and performance monitoring
3. **Error Tracking**: Add Sentry or similar error tracking service
4. **Documentation Generation**: Automated API documentation from TypeScript interfaces

## Related Shards

- **Next**: [Shard 002 - Authentication](./shard-002-auth.md)
- **References**: [Shard 003 - Products](./shard-003-products.md)

## Files Modified

- `/package.json` - Dependencies and scripts
- `/next.config.js` - PWA and build configuration
- `/tailwind.config.js` - Styling configuration
- `/tsconfig.json` - TypeScript configuration
- `/src/app/layout.tsx` - Root layout and providers
- `/src/app/globals.css` - Global styles and CSS variables
- `/components.json` - shadcn/ui configuration

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@gangrunprinting.com

# File Storage
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-minio-access
MINIO_SECRET_KEY=your-minio-secret
```

## Success Metrics

- ✅ Clean build without TypeScript errors
- ✅ PWA lighthouse score > 90
- ✅ Development environment runs on port 3001
- ✅ All shadcn/ui components integrate properly
- ✅ Database connection established
- ✅ Basic authentication flow functional

---

_This shard establishes the foundation that all subsequent development builds upon. The decisions made here influence the entire project's architecture and maintainability._
