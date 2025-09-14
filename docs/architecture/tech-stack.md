# GangRun Printing Technology Stack

## Core Technologies

### Frontend Framework
**Next.js 15.5.2** - Full-stack React framework
- App Router for file-based routing
- React Server Components for performance
- Built-in API routes
- Automatic code splitting
- Image optimization

### UI Framework
**React 19.1.1** - Component library
- Latest concurrent features
- Improved performance
- Better developer experience

### Language
**TypeScript 5.9.2** - Type-safe JavaScript
- Static type checking
- Better IDE support
- Reduced runtime errors
- Self-documenting code

### Styling
**Tailwind CSS 4.1.13** - Utility-first CSS
- Rapid development
- Consistent design system
- Small production bundle
- Built-in dark mode support

### Component Library
**shadcn/ui** - Customizable components
- Built on Radix UI primitives
- Fully accessible (ARIA compliant)
- Owns the code (no external dependency)
- Tailwind CSS styled

## Backend Technologies

### Database
**PostgreSQL 15** - Relational database
- ACID compliance
- JSON/JSONB support for flexible data
- Full-text search capabilities
- Strong consistency for e-commerce

### ORM
**Prisma 6.15.0** - Type-safe database client
- Auto-generated TypeScript types
- Database migrations
- Query builder
- Connection pooling

### Authentication
**NextAuth.js 5.0.0-beta.29** - Authentication library
- Multiple provider support (Google, Email)
- Database sessions
- JWT tokens
- Role-based access control

### Caching
**Redis 7.0** - In-memory data store
- Session storage
- API response caching
- Rate limiting
- Pub/sub for real-time features

## Storage & Files

### Object Storage
**MinIO** - S3-compatible storage
- Self-hosted option
- Artwork file storage
- Image hosting
- Backup storage

### Image Processing
**Sharp** - High-performance image processing
- Automatic optimization
- Format conversion
- Responsive images
- Metadata extraction

## External Services

### Email Service
**Resend** - Transactional email
- React Email templates
- High deliverability
- Webhook events
- Email analytics

### Payment Processing
**Square SDK** - Payment gateway
- Credit card processing
- Digital wallets (including CashApp)
- Recurring payments
- PCI compliance

### Analytics
**Google Analytics 4** - Web analytics
- User behavior tracking
- E-commerce tracking
- Custom events
- Conversion tracking

### Automation
**N8N** - Workflow automation
- Visual workflow builder
- Webhook triggers
- Custom integrations
- Self-hosted option

## Development Tools

### Package Manager
**npm 10.x** - Node package manager
- Dependency management
- Script runner
- Package publishing

### Build Tools
**Next.js CLI** - Build system
- Development server
- Production builds
- Static export
- API route compilation

### Code Quality

#### Linting
**ESLint 8.57** - JavaScript linter
- Code style enforcement
- Error prevention
- Best practices
- Custom rules

#### Formatting
**Prettier 3.3** - Code formatter
- Consistent formatting
- Team standards
- Auto-format on save

### Testing (Planned)

#### Unit Testing
**Jest 29.5** - Testing framework
- Component testing
- Utility testing
- Snapshot testing
- Coverage reports

#### Integration Testing
**React Testing Library** - Component testing
- User-centric tests
- Accessibility testing
- Event simulation

#### E2E Testing
**Playwright 1.49** - Browser automation
- Cross-browser testing
- Visual regression
- API testing
- Mobile testing

## Infrastructure

### Deployment Platform
**Dokploy** - Container orchestration
- Docker management
- Automatic SSL
- Domain routing
- Service discovery

### Web Server
**Node.js 20.x** - JavaScript runtime
- Server-side rendering
- API endpoints
- WebSocket support

### Process Manager
**PM2** - Node.js process manager
- Automatic restarts
- Load balancing
- Log management
- Monitoring

### Reverse Proxy
**Traefik** (via Dokploy) - Edge router
- Automatic HTTPS
- Load balancing
- Domain routing
- Middleware support

## Progressive Web App

### Service Worker
**Workbox** (via next-pwa) - PWA toolkit
- Offline support
- Background sync
- Push notifications
- Cache strategies

### Web Manifest
**PWA Manifest** - App metadata
- Install prompts
- App icons
- Theme colors
- Display modes

## State Management

### Client State
**Zustand 5.0.4** - State management
- Simple API
- TypeScript support
- DevTools integration
- Persistence middleware

### Server State
**React Query** (TanStack Query) - Server state management
- Data fetching
- Caching
- Background refetching
- Optimistic updates

### Form State
**React Hook Form 7.55** - Form library
- Performance optimized
- Built-in validation
- TypeScript support
- Field arrays

## Security

### Input Validation
**Zod 3.24** - Schema validation
- Runtime type checking
- Error messages
- Transform functions
- Composable schemas

### CORS
**Next.js Middleware** - Cross-origin control
- Request filtering
- Header management
- Origin validation

### Environment Variables
**dotenv** - Environment management
- Secret management
- Configuration separation
- Development/production configs

## Monitoring & Logging

### Application Logs
**Custom File Logger** - Log management
- Error tracking
- Request logging
- Performance metrics
- Debug information

### Error Tracking (Planned)
**Sentry** - Error monitoring
- Real-time alerts
- Performance monitoring
- Release tracking
- User context

## Version Control & CI/CD

### Version Control
**Git** - Source control
- Branch management
- Code review
- History tracking

### Repository Hosting
**GitHub** - Code hosting
- Pull requests
- Issues tracking
- Actions CI/CD
- Documentation

### CI/CD (Planned)
**GitHub Actions** - Automation
- Automated testing
- Build verification
- Deployment pipeline
- Security scanning

## Dependencies Summary

### Production Dependencies (Key)
```json
{
  "next": "15.5.2",
  "react": "19.1.1",
  "typescript": "5.9.2",
  "@prisma/client": "6.15.0",
  "next-auth": "5.0.0-beta.29",
  "tailwindcss": "4.1.13",
  "zustand": "5.0.4",
  "zod": "3.24.2",
  "react-hook-form": "7.55.1",
  "@hookform/resolvers": "3.10.2",
  "framer-motion": "12.23.12",
  "date-fns": "4.2.0",
  "sharp": "0.33.6",
  "resend": "4.0.3",
  "square": "43.0.1"
}
```

### Development Dependencies (Key)
```json
{
  "@types/node": "22.13.7",
  "@types/react": "19.1.5",
  "eslint": "8.57.1",
  "prettier": "3.3.4",
  "prisma": "6.15.0",
  "jest": "29.5.0",
  "@testing-library/react": "16.1.3",
  "playwright": "1.49.1"
}
```

## Technology Decisions Rationale

### Why Next.js?
- Full-stack capabilities in one framework
- Excellent SEO with SSR/SSG
- Built-in optimizations
- Great developer experience
- Strong community support

### Why PostgreSQL?
- ACID compliance crucial for e-commerce
- Complex queries for reporting
- JSON support for flexible product data
- Proven reliability at scale

### Why Prisma?
- Type safety across stack
- Excellent migration system
- Great developer experience
- Active development and community

### Why Tailwind CSS?
- Rapid prototyping
- Consistent design system
- Small production bundle
- Maintainable styles

### Why Zustand?
- Simpler than Redux
- TypeScript first
- Small bundle size
- No providers needed

### Why MinIO?
- S3 compatibility
- Self-hosted option
- Cost-effective
- Good performance

## Future Technology Considerations

### Potential Additions
- **GraphQL** - For complex data requirements
- **tRPC** - For end-to-end type safety
- **Temporal** - For complex workflows
- **Elasticsearch** - For advanced search
- **Cloudflare** - For CDN and edge computing

### Scaling Considerations
- Database read replicas
- Redis clustering
- Microservices architecture
- Container orchestration (Kubernetes)
- Message queuing (RabbitMQ/Kafka)

## Performance Benchmarks

### Current Performance
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: 245KB gzipped
- **API Response Time**: < 300ms avg
- **Database Query Time**: < 100ms avg

### Target Performance
- **Page Load**: < 2s (95th percentile)
- **API Response**: < 200ms (95th percentile)
- **Search Results**: < 500ms
- **Image Load**: < 1s (optimized)
- **Cart Operations**: < 100ms