# GangRun Printing Architecture Documentation

**Last Updated:** 2025-09-30
**Architecture Version:** 2.0 (Sharded)

---

## 📁 Architecture Documentation Structure

This directory contains the complete architecture documentation for GangRun Printing, organized into focused, maintainable files. Each file covers a specific aspect of the system architecture.

### Quick Navigation

| File | Description | Lines | Topics Covered |
|------|-------------|-------|----------------|
| **[overview.md](./overview.md)** | System Overview | 121 | Introduction, High-Level Architecture, Tech Stack, Diagrams |
| **[data-architecture.md](./data-architecture.md)** | Data Layer | 633 | Data Models, Prisma Schema, Database Design, Relationships |
| **[api-architecture.md](./api-architecture.md)** | API Layer | 399 | API Specification, Endpoints, External APIs, Core Workflows |
| **[frontend-architecture.md](./frontend-architecture.md)** | Frontend Layer | 200 | React Architecture, Components, State Management, UI Patterns |
| **[backend-architecture.md](./backend-architecture.md)** | Backend Layer | 160 | API Routes, Services, Business Logic, Server-Side Patterns |
| **[deployment-infrastructure.md](./deployment-infrastructure.md)** | Infrastructure | 207 | Project Structure, Deployment Process, Docker, CI/CD |
| **[development-practices.md](./development-practices.md)** | Development | 258 | Dev Workflow, Testing, Standards, Error Handling |
| **[monitoring-observability.md](./monitoring-observability.md)** | Operations | 30 | Monitoring, Logging, Observability, Health Checks |

**Total Documentation:** ~2,000 lines across 8 focused files

---

## 🚀 Getting Started

### For New Developers
**Recommended Reading Order:**
1. Start with **[overview.md](./overview.md)** - Understand the system at a high level
2. Review **[data-architecture.md](./data-architecture.md)** - Learn the data models
3. Read **[api-architecture.md](./api-architecture.md)** - Understand API structure
4. Study **[frontend-architecture.md](./frontend-architecture.md)** OR **[backend-architecture.md](./backend-architecture.md)** - Based on your role

### For System Architects
**Recommended Reading Order:**
1. **[overview.md](./overview.md)** - System design and patterns
2. **[deployment-infrastructure.md](./deployment-infrastructure.md)** - Infrastructure decisions
3. **[development-practices.md](./development-practices.md)** - Standards and practices
4. **[monitoring-observability.md](./monitoring-observability.md)** - Operations strategy

### For DevOps Engineers
**Recommended Reading Order:**
1. **[deployment-infrastructure.md](./deployment-infrastructure.md)** - Infrastructure setup
2. **[monitoring-observability.md](./monitoring-observability.md)** - Monitoring implementation
3. **[overview.md](./overview.md)** - System context
4. **[development-practices.md](./development-practices.md)** - CI/CD pipelines

---

## 📚 Documentation Files

### 1. [overview.md](./overview.md)
**Purpose:** High-level system overview and architectural decisions

**Contents:**
- Introduction and project context
- High-level architecture diagram
- Technical summary
- Platform and infrastructure choices
- Repository structure
- Architectural patterns (Jamstack, Server Components, PWA)
- Complete technology stack table

**Key Diagrams:**
- System architecture (Mermaid)
- Client → Application → Data → External Services flow

**When to Reference:**
- Starting a new feature
- Making technology decisions
- Onboarding new team members
- Presenting system to stakeholders

---

### 2. [data-architecture.md](./data-architecture.md)
**Purpose:** Complete data layer documentation

**Contents:**
- All Prisma data models with TypeScript interfaces
- Database relationships and foreign keys
- Data model purpose and key attributes
- JSON field structures
- Database schema design decisions

**Key Models:**
- User, Session, Product, Order
- ProductCategory, QuantityGroup, SizeGroup
- PaperStock, AddOnSet, TurnaroundTime
- Cart, CartItem, Address
- Plus 20+ more models

**When to Reference:**
- Creating new API endpoints
- Implementing new features
- Database migrations
- Understanding data relationships
- Query optimization

---

### 3. [api-architecture.md](./api-architecture.md)
**Purpose:** Complete API specification and integration points

**Contents:**
- RESTful API endpoint documentation
- Request/response formats
- Authentication requirements
- Rate limiting policies
- External API integrations (Square, Resend, N8N)
- Core workflow implementations
- API component architecture

**Key Sections:**
- Product APIs (CRUD, configuration, pricing)
- Order APIs (creation, status, tracking)
- User APIs (authentication, profile, addresses)
- Admin APIs (management, reporting)
- Payment APIs (Square, CashApp, PayPal)
- External service integrations

**When to Reference:**
- Building API clients
- Implementing new endpoints
- Integrating external services
- Understanding request flows
- API security implementation

---

### 4. [frontend-architecture.md](./frontend-architecture.md)
**Purpose:** React/Next.js frontend architecture

**Contents:**
- React architecture patterns
- Component hierarchy
- State management strategy (Zustand)
- Next.js App Router usage
- Server Components vs Client Components
- Form handling with React Hook Form
- UI component library (shadcn/ui)
- Routing structure

**Key Patterns:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- Client-side rendering (CSR)
- Data fetching strategies
- Error boundaries
- Loading states

**When to Reference:**
- Creating new pages
- Building UI components
- State management decisions
- Performance optimization
- SEO implementation

---

### 5. [backend-architecture.md](./backend-architecture.md)
**Purpose:** Server-side architecture and business logic

**Contents:**
- Next.js API Routes structure
- Service layer pattern
- Business logic organization
- Authentication middleware
- Error handling strategy
- Background jobs
- Caching strategy (Redis)

**Key Services:**
- ProductService (product operations)
- OrderService (order processing)
- UserService (user management)
- PricingService (price calculations)
- EmailService (notifications)

**When to Reference:**
- Implementing business logic
- Creating new services
- Database transaction handling
- Authentication implementation
- Background job creation

---

### 6. [deployment-infrastructure.md](./deployment-infrastructure.md)
**Purpose:** Infrastructure and deployment documentation

**Contents:**
- Project structure and file organization
- Development workflow
- Docker containerization
- Deployment process
- Environment configuration
- CI/CD pipeline (GitHub Actions)
- Database migrations
- File storage (MinIO)

**Key Sections:**
- Directory structure explanation
- Docker Compose setup
- Environment variables
- Production deployment checklist
- Rollback procedures

**When to Reference:**
- Setting up development environment
- Deploying to production
- Infrastructure changes
- Environment troubleshooting
- Scaling considerations

---

### 7. [development-practices.md](./development-practices.md)
**Purpose:** Development standards and best practices

**Contents:**
- Development workflow and Git flow
- Testing strategy (unit, integration, E2E)
- Code review process
- Coding standards and conventions
- TypeScript best practices
- Error handling patterns
- Logging strategy
- Performance optimization

**Key Standards:**
- Naming conventions
- File organization
- Component patterns
- Testing requirements
- Documentation requirements

**When to Reference:**
- Code reviews
- Writing new code
- Setting up testing
- Resolving merge conflicts
- Performance optimization

---

### 8. [monitoring-observability.md](./monitoring-observability.md)
**Purpose:** Operations, monitoring, and observability

**Contents:**
- Application monitoring
- Error tracking (Sentry integration)
- Performance monitoring
- Health check endpoints
- Logging strategy
- Alerting configuration
- Metrics collection

**Key Metrics:**
- Application health score
- API response times
- Error rates
- Database query performance
- User analytics

**When to Reference:**
- Setting up monitoring
- Debugging production issues
- Performance analysis
- Creating alerts
- Health check implementation

---

## 🔄 Architecture Evolution

### Version History

**Version 2.0 (2025-09-30) - Sharded Architecture**
- Split monolithic architecture.md into 8 focused files
- Improved navigability and maintainability
- Added comprehensive index and navigation
- Enhanced documentation for BMAD compliance

**Version 1.1 (2025-09-15) - BMAD Compliance**
- Updated with remaining implementation details
- Added BMad Method compliance sections
- Enhanced workflow documentation

**Version 1.0 (2025-09-14) - Initial Documentation**
- Created unified architecture document
- Documented deployed implementation
- Established architectural patterns

---

## 🎯 Architecture Principles

### Core Principles
1. **Simplicity First:** Choose simpler solutions that solve 80% of needs
2. **Type Safety:** TypeScript everywhere for compile-time safety
3. **Progressive Enhancement:** Start with server-rendered, enhance with client features
4. **Modular Design:** Independent, pluggable modules (products, checkout, admin)
5. **Performance:** Optimize for initial page load and interactivity
6. **Security:** Authentication required for sensitive operations
7. **Testability:** Write testable code with clear separation of concerns

### Technology Decisions
- **Next.js 15:** Unified fullstack framework with App Router
- **PostgreSQL:** ACID compliance, JSON flexibility
- **Prisma:** Type-safe ORM with migrations
- **Tailwind CSS:** Utility-first, rapid development
- **shadcn/ui:** Own your components, Radix UI base
- **Zustand:** Simple, performant state management

---

## 📖 Related Documentation

### PRD (Product Requirements)
- [Epic 1: Foundation & Theming](../prd/epic-1-foundation-theming.md)
- [Epic 2: Product Catalog & Configuration](../prd/epic-2-product-catalog-config.md)
- [Epic 3: Commerce & Checkout](../prd/epic-3-commerce-checkout.md)
- [Epic 4: Customer Account Management](../prd/epic-4-customer-account-mgmt.md)
- [Epic 5: Admin Order & User Management](../prd/epic-5-admin-order-user-mgmt.md)
- [Epic 6: Marketing & CRM Platform](../prd/epic-6-marketing-crm-platform.md)

### Stories (Development Tasks)
- [Stories Directory](../stories/) - All user stories for development

### Other Documentation
- [BMAD Method](../bmad/) - Development methodology
- [QA Gates](../qa/gates/) - Quality assurance checklists

---

## 🛠️ Maintenance

### Updating Architecture Documentation
When making significant architectural changes:

1. **Identify the Affected File:**
   - System-wide changes → **overview.md**
   - Data model changes → **data-architecture.md**
   - API changes → **api-architecture.md**
   - Frontend changes → **frontend-architecture.md**
   - Backend changes → **backend-architecture.md**
   - Infrastructure changes → **deployment-infrastructure.md**
   - Practice changes → **development-practices.md**
   - Monitoring changes → **monitoring-observability.md**

2. **Update the File:**
   - Make changes in the appropriate file
   - Update diagrams if needed (Mermaid format)
   - Add changelog entry

3. **Update This Index:**
   - Update version number in this README
   - Add entry to Version History section
   - Update relevant cross-references

4. **Commit Changes:**
   ```bash
   git add docs/architecture/
   git commit -m "docs: update architecture - [brief description]"
   ```

### Documentation Standards
- Use Mermaid for diagrams
- Include code examples in TypeScript
- Provide rationale for decisions
- Link to related documentation
- Keep examples up-to-date with codebase

---

## 💡 Quick Reference

### Common Tasks

**Need to understand the system?**
→ Start with [overview.md](./overview.md)

**Adding a new feature?**
→ Check [data-architecture.md](./data-architecture.md) → [api-architecture.md](./api-architecture.md) → [frontend-architecture.md](./frontend-architecture.md) OR [backend-architecture.md](./backend-architecture.md)

**Deploying to production?**
→ Follow [deployment-infrastructure.md](./deployment-infrastructure.md)

**Debugging an issue?**
→ Check [monitoring-observability.md](./monitoring-observability.md) → [development-practices.md](./development-practices.md)

**Setting up development environment?**
→ Follow [deployment-infrastructure.md](./deployment-infrastructure.md) → [development-practices.md](./development-practices.md)

**Writing tests?**
→ Refer to [development-practices.md](./development-practices.md)

---

## 📞 Support

For questions about architecture decisions or clarifications on any documentation:
- Review the specific architecture file
- Check related PRD epic documents
- Consult the BMAD documentation
- Refer to inline code comments in the codebase

---

**Last Updated:** 2025-09-30
**Maintained By:** Development Team
**Architecture Version:** 2.0 (Sharded)