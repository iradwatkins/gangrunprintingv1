# GangRun Printing Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for GangRun Printing, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Status**: Greenfield project with custom implementation

The project was built from scratch using Next.js 15 with modern best practices. No starter templates were used, allowing for complete customization to meet the specific requirements of the printing e-commerce platform.

### Change Log

| Date       | Version | Description                                                              | Author              |
| ---------- | ------- | ------------------------------------------------------------------------ | ------------------- |
| 2025-09-14 | 1.0     | Initial architecture document based on deployed implementation           | Winston (Architect) |
| 2025-09-15 | 1.1     | Updated with BMad Method compliance and remaining implementation details | Winston (Architect) |

## High Level Architecture

### Technical Summary

GangRun Printing is a Progressive Web App (PWA) built on Next.js 15 with App Router, providing a unified fullstack JavaScript/TypeScript architecture. The platform uses PostgreSQL for persistent data storage, Redis for caching, and MinIO for file storage. The frontend leverages React 19 with Tailwind CSS and shadcn/ui components for a modern, responsive UI. Backend services are implemented as Next.js API routes with Prisma ORM for database operations. The architecture achieves PRD goals through its modular design, supporting complex product configurations, multi-user roles, and scalable order processing workflows.

### Platform and Infrastructure Choice

**Platform:** VPS with Docker (via Dokploy)
**Key Services:** PostgreSQL, Redis, MinIO, N8N, Resend
**Deployment Host and Regions:** Single VPS instance at 72.60.28.175 (US Central)

### Repository Structure

**Structure:** Monolithic Next.js application
**Monorepo Tool:** N/A - Single application structure
**Package Organization:** Feature-based with shared components and utilities

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        PWA[Progressive Web App]
        Mobile[Mobile Browser]
        Desktop[Desktop Browser]
    end

    subgraph "Application Layer"
        Next[Next.js 15 App]
        API[API Routes]
        Auth[NextAuth.js]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
        MinIO[(MinIO Storage)]
    end

    subgraph "External Services"
        Resend[Resend Email]
        Square[Square Payments]
        GA[Google Analytics]
        N8N[N8N Automation]
    end

    PWA --> Next
    Mobile --> Next
    Desktop --> Next

    Next --> API
    API --> Auth
    API --> PG
    API --> Redis
    API --> MinIO

    API --> Resend
    API --> Square
    Next --> GA
    API --> N8N
```

### Architectural Patterns

- **Jamstack Architecture:** Static generation with dynamic API routes - _Rationale:_ Optimal performance and SEO for product pages
- **Component-Based UI:** Reusable React components with TypeScript - _Rationale:_ Maintainability and type safety across large codebase
- **Repository Pattern:** Prisma ORM abstracts data access - _Rationale:_ Clean separation of concerns and testability
- **Server Components:** React Server Components for data fetching - _Rationale:_ Reduced client bundle size and improved performance
- **Hybrid Rendering:** Mix of SSG, SSR, and CSR as needed - _Rationale:_ Flexibility to optimize each page type
- **PWA Pattern:** Service worker with offline support - _Rationale:_ Enhanced user experience and mobile app-like features

## Tech Stack

### Technology Stack Table

| Category             | Technology                   | Version    | Purpose                    | Rationale                                        |
| -------------------- | ---------------------------- | ---------- | -------------------------- | ------------------------------------------------ |
| Frontend Language    | TypeScript                   | 5.9.2      | Type-safe development      | Catch errors at compile time, better IDE support |
| Frontend Framework   | Next.js                      | 15.5.2     | Full-stack React framework | App Router, RSC, built-in optimization           |
| UI Component Library | shadcn/ui                    | Latest     | Accessible components      | Customizable, owns the code, Radix UI based      |
| State Management     | Zustand                      | 5.0.4      | Client state management    | Simple, TypeScript-friendly, minimal boilerplate |
| Backend Language     | TypeScript                   | 5.9.2      | Type-safe backend          | Shared types with frontend                       |
| Backend Framework    | Next.js API Routes           | 15.5.2     | API endpoints              | Integrated with frontend, serverless-ready       |
| API Style            | REST                         | -          | HTTP APIs                  | Simple, well-understood, cacheable               |
| Database             | PostgreSQL                   | 15         | Primary database           | ACID compliance, JSON support for flexibility    |
| Cache                | Redis                        | 7.0        | Session & data cache       | High performance, pub/sub capability             |
| File Storage         | MinIO                        | Latest     | Object storage             | S3-compatible, self-hosted option                |
| Authentication       | NextAuth.js                  | 5.0.0-beta | Auth system                | Flexible providers, database sessions            |
| Frontend Testing     | Jest + React Testing Library | 29.5       | Unit/integration tests     | Standard React testing stack                     |
| Backend Testing      | Jest                         | 29.5       | API testing                | Consistent with frontend                         |
| E2E Testing          | Playwright                   | 1.49       | End-to-end tests           | Cross-browser, reliable                          |
| Build Tool           | Next.js CLI                  | 15.5.2     | Build system               | Integrated webpack config                        |
| Bundler              | Webpack (via Next.js)        | 5          | Module bundling            | Optimized by Next.js                             |
| IaC Tool             | Docker Compose               | 2.0        | Infrastructure             | Container orchestration                          |
| CI/CD                | GitHub Actions               | -          | Automation                 | Native GitHub integration                        |
| Monitoring           | Custom logging               | -          | Application logs           | Simple file-based logging                        |
| Logging              | File-based                   | -          | Log storage                | Local file system                                |
| CSS Framework        | Tailwind CSS                 | 4.1.13     | Utility-first CSS          | Rapid development, consistent design             |

## Data Models

### User

**Purpose:** Represents system users including customers, brokers, and administrators

**Key Attributes:**

- id: String (cuid) - Unique identifier
- email: String - User email address
- name: String? - Display name
- role: Enum - User role (CUSTOMER, BROKER, STAFF, ADMIN)
- emailVerified: DateTime? - Email verification timestamp
- image: String? - Profile image URL

**TypeScript Interface:**

```typescript
interface User {
  id: string
  email: string
  name?: string | null
  role: 'CUSTOMER' | 'BROKER' | 'STAFF' | 'ADMIN'
  emailVerified?: Date | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}
```

**Relationships:**

- Has many Orders
- Has many Carts
- Has many Accounts (OAuth providers)
- Has many Sessions

### Product

**Purpose:** Represents configurable printing products with dynamic pricing

**Key Attributes:**

- id: String - Unique identifier
- name: String - Product name
- slug: String - URL-friendly identifier
- description: String? - Product description
- category: String - Product category
- basePrice: Decimal - Starting price
- featured: Boolean - Homepage display flag
- images: String[] - Product image URLs
- attributes: JSON - Dynamic product attributes
- options: JSON - Configuration options

**TypeScript Interface:**

```typescript
interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  category: string
  basePrice: number
  featured: boolean
  images: string[]
  attributes: Record<string, any>
  options: ProductOption[]
  createdAt: Date
  updatedAt: Date
}

interface ProductOption {
  name: string
  type: 'select' | 'number' | 'checkbox'
  values: Array<{
    label: string
    value: string
    priceModifier?: number
  }>
}
```

**Relationships:**

- Has many CartItems
- Has many OrderItems

### Order

**Purpose:** Represents customer orders with full transaction details

**Key Attributes:**

- id: String - Unique identifier
- orderNumber: String - GRP-prefixed order number
- userId: String - Customer reference
- status: Enum - Order status
- subtotal: Decimal - Pre-tax amount
- tax: Decimal - Tax amount
- total: Decimal - Total amount
- shippingAddress: JSON - Delivery address
- billingAddress: JSON - Payment address

**TypeScript Interface:**

```typescript
interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  paymentMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface Address {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}
```

**Relationships:**

- Belongs to User
- Has many OrderItems
- Has one Payment

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: GangRun Printing API
  version: 1.0.0
  description: E-commerce API for printing products
servers:
  - url: http://localhost:3002/api
    description: Development server
  - url: https://gangrunprinting.com/api
    description: Production server

paths:
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
                name: { type: string }
      responses:
        201: { description: User created }
        400: { description: Validation error }

  /products:
    get:
      summary: List products with filtering
      parameters:
        - name: category
          in: query
          schema: { type: string }
        - name: search
          in: query
          schema: { type: string }
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
      responses:
        200:
          description: Product list
          content:
            application/json:
              schema:
                type: object
                properties:
                  products: { type: array }
                  total: { type: integer }
                  page: { type: integer }

  /products/{slug}:
    get:
      summary: Get product details
      parameters:
        - name: slug
          in: path
          required: true
          schema: { type: string }
      responses:
        200: { description: Product details }
        404: { description: Product not found }

  /cart:
    get:
      summary: Get current cart
      security: [{ bearerAuth: [] }]
      responses:
        200: { description: Cart contents }

    post:
      summary: Add item to cart
      security: [{ bearerAuth: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [productId, quantity]
              properties:
                productId: { type: string }
                quantity: { type: integer, minimum: 1 }
                configuration: { type: object }
      responses:
        200: { description: Item added }

  /orders:
    post:
      summary: Create order from cart
      security: [{ bearerAuth: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [shippingAddress, billingAddress]
      responses:
        201: { description: Order created }

    get:
      summary: List user orders
      security: [{ bearerAuth: [] }]
      responses:
        200: { description: Order list }

  /orders/{id}:
    get:
      summary: Get order details
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200: { description: Order details }
        404: { description: Order not found }

  /upload:
    post:
      summary: Upload artwork file
      security: [{ bearerAuth: [] }]
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file: { type: string, format: binary }
                orderId: { type: string }
      responses:
        200: { description: File uploaded }

  /search:
    get:
      summary: Search products with autocomplete
      parameters:
        - name: q
          in: query
          required: true
          schema: { type: string }
      responses:
        200:
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results: { type: array }
                  suggestions: { type: array }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Components

### Frontend Application

**Responsibility:** Customer-facing web interface with PWA capabilities

**Key Interfaces:**

- React components for UI rendering
- API client services for backend communication
- Zustand stores for state management

**Dependencies:** Next.js, React, Tailwind CSS, shadcn/ui

**Technology Stack:** TypeScript, React 19, Next.js 15 App Router

### API Layer

**Responsibility:** RESTful API endpoints for all business operations

**Key Interfaces:**

- /api/auth/\* - Authentication endpoints
- /api/products/\* - Product management
- /api/orders/\* - Order processing
- /api/cart/\* - Shopping cart operations

**Dependencies:** Prisma ORM, NextAuth.js, PostgreSQL

**Technology Stack:** Next.js API Routes, TypeScript, Prisma

### Authentication Service

**Responsibility:** User authentication and session management

**Key Interfaces:**

- OAuth providers (Google)
- Email/password authentication
- Session management
- Role-based access control

**Dependencies:** NextAuth.js, Prisma Adapter, PostgreSQL

**Technology Stack:** NextAuth.js v5, JWT/Database sessions

### File Storage Service

**Responsibility:** Artwork and asset file management

**Key Interfaces:**

- Upload API for artwork files
- Image optimization for products
- Secure file access with presigned URLs

**Dependencies:** MinIO, Sharp for image processing

**Technology Stack:** MinIO (S3-compatible), Next.js Image optimization

### Email Service

**Responsibility:** Transactional and marketing email delivery

**Key Interfaces:**

- Order confirmation emails
- Password reset emails
- Marketing campaigns
- Email templates

**Dependencies:** Resend API

**Technology Stack:** Resend, React Email templates

### Payment Processing

**Responsibility:** Handle payment transactions

**Key Interfaces:**

- Square payment integration
- Payment method storage
- Refund processing
- Webhook handlers

**Dependencies:** Square SDK

**Technology Stack:** Square API, Webhook processing

### Cache Layer

**Responsibility:** Performance optimization through caching

**Key Interfaces:**

- Session storage
- API response caching
- Product catalog caching
- Search result caching

**Dependencies:** Redis

**Technology Stack:** Redis 7.0, ioredis client

### Component Diagrams

```mermaid
graph LR
    subgraph "Frontend Components"
        UI[UI Components]
        Pages[Page Components]
        Hooks[Custom Hooks]
        Stores[Zustand Stores]
        Services[API Services]
    end

    subgraph "Backend Components"
        Routes[API Routes]
        Auth[Auth Middleware]
        Validators[Zod Validators]
        DB[Database Layer]
        Cache[Cache Layer]
    end

    Pages --> UI
    Pages --> Hooks
    Pages --> Stores
    Hooks --> Services
    Services --> Routes
    Routes --> Auth
    Routes --> Validators
    Routes --> DB
    Routes --> Cache
```

## External APIs

### Resend API

- **Purpose:** Email delivery service for transactional and marketing emails
- **Documentation:** https://resend.com/docs
- **Base URL(s):** https://api.resend.com
- **Authentication:** API Key (Bearer token)
- **Rate Limits:** 100 emails/day (free tier), 10,000/month (paid)

**Key Endpoints Used:**

- `POST /emails` - Send transactional emails
- `POST /batch` - Send bulk emails
- `GET /emails/{id}` - Check email status

**Integration Notes:** Integrated with React Email for template rendering

### Square API

- **Purpose:** Payment processing and transaction management
- **Documentation:** https://developer.squareup.com/docs
- **Base URL(s):** https://connect.squareup.com
- **Authentication:** OAuth 2.0 with access token
- **Rate Limits:** 700 requests/minute

**Key Endpoints Used:**

- `POST /v2/payments` - Process payments
- `POST /v2/customers` - Create customer profiles
- `POST /v2/cards` - Store payment methods
- `POST /v2/refunds` - Process refunds

**Integration Notes:** Webhook handlers for payment events

### Google Analytics

- **Purpose:** Website analytics and user behavior tracking
- **Documentation:** https://developers.google.com/analytics
- **Base URL(s):** https://www.google-analytics.com
- **Authentication:** Measurement ID (public)
- **Rate Limits:** 10 million hits per month per property

**Key Endpoints Used:**

- `POST /mp/collect` - Send events (GA4)
- Page view tracking (automatic)
- Custom events for e-commerce

**Integration Notes:** Implemented via gtag.js with custom event tracking

## Core Workflows

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Auth
    participant DB
    participant Payment
    participant Email

    User->>Frontend: Browse Products
    Frontend->>API: GET /api/products
    API->>DB: Query products
    DB-->>API: Product data
    API-->>Frontend: Product list
    Frontend-->>User: Display products

    User->>Frontend: Add to Cart
    Frontend->>API: POST /api/cart
    API->>Auth: Verify session
    Auth-->>API: User authenticated
    API->>DB: Save cart item
    DB-->>API: Cart updated
    API-->>Frontend: Success
    Frontend-->>User: Cart updated

    User->>Frontend: Checkout
    Frontend->>API: POST /api/orders
    API->>Auth: Verify user
    API->>DB: Create order
    API->>Payment: Process payment
    Payment-->>API: Payment success
    API->>DB: Update order status
    API->>Email: Send confirmation
    Email-->>User: Order email
    API-->>Frontend: Order created
    Frontend-->>User: Order confirmation
```

## Database Schema

```sql
-- Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "emailVerified" TIMESTAMP,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Products table
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "attributes" JSONB,
    "options" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Orders table
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- OrderItems table
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "configuration" JSONB,
    "artwork" TEXT[],
    FOREIGN KEY ("orderId") REFERENCES "Order"("id"),
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Cart table
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- CartItems table
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "configuration" JSONB,
    FOREIGN KEY ("cartId") REFERENCES "Cart"("id"),
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Indexes for performance
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");
```

## Frontend Architecture

### Component Architecture

#### Component Organization

```text
src/components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── forms/              # Form components
│   ├── LoginForm.tsx
│   ├── CheckoutForm.tsx
│   └── ProductConfigForm.tsx
├── layouts/            # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
├── features/           # Feature-specific components
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   └── CartItem.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   └── ProductGrid.tsx
│   └── checkout/
│       ├── AddressForm.tsx
│       └── PaymentForm.tsx
└── shared/             # Shared components
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

#### Component Template

```typescript
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const Component: FC<ComponentProps> = ({
  className,
  children
}) => {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  );
};
```

### State Management Architecture

#### State Structure

```typescript
interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean

  // Cart state
  cart: {
    items: CartItem[]
    total: number
    isOpen: boolean
  }

  // UI state
  ui: {
    isSidebarOpen: boolean
    isLoading: boolean
    notifications: Notification[]
  }
}
```

#### State Management Patterns

- Use Zustand for global client state
- Server state managed by React Query
- Form state managed by React Hook Form
- URL state managed by Next.js router
- Local component state with useState

### Routing Architecture

#### Route Organization

```text
src/app/
├── (customer)/         # Customer routes
│   ├── page.tsx        # Homepage
│   ├── products/
│   │   ├── page.tsx    # Product list
│   │   └── [slug]/
│   │       └── page.tsx # Product detail
│   ├── cart/
│   │   └── page.tsx    # Cart page
│   └── checkout/
│       └── page.tsx    # Checkout
├── admin/              # Admin routes
│   ├── layout.tsx      # Admin layout
│   ├── page.tsx        # Dashboard
│   └── orders/
│       └── page.tsx    # Order management
├── auth/               # Auth routes
│   ├── login/
│   └── register/
└── api/                # API routes
```

#### Protected Route Pattern

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function ProtectedPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <ProtectedContent user={session.user} />;
}
```

### Frontend Services Layer

#### API Client Setup

```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
```

#### Service Example

```typescript
// services/products.ts
import { api } from '@/lib/api-client'

export const productService = {
  async getAll(params?: ProductFilters) {
    return api.get<Product[]>('/products', { params })
  },

  async getBySlug(slug: string) {
    return api.get<Product>(`/products/${slug}`)
  },

  async search(query: string) {
    return api.get<SearchResults>('/search', {
      params: { q: query },
    })
  },
}
```

## Backend Architecture

### Service Architecture

#### Traditional Server

##### Controller/Route Organization

```text
src/app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts    # NextAuth handler
│   ├── register/
│   │   └── route.ts    # Registration
│   └── logout/
│       └── route.ts    # Logout
├── products/
│   ├── route.ts        # List products
│   └── [slug]/
│       └── route.ts    # Product detail
├── orders/
│   ├── route.ts        # Create/list orders
│   └── [id]/
│       └── route.ts    # Order detail
└── cart/
    ├── route.ts        # Cart operations
    └── items/
        └── route.ts    # Cart items
```

##### Controller Template

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const products = await prisma.product.findMany({
      where: query.category ? { category: query.category } : {},
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Database Architecture

#### Schema Design

```sql
-- See Database Schema section above for complete schema
```

#### Data Access Layer

```typescript
// lib/repositories/product.repository.ts
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class ProductRepository {
  async findAll(params: {
    where?: Prisma.ProductWhereInput
    orderBy?: Prisma.ProductOrderByWithRelationInput
    skip?: number
    take?: number
  }) {
    return prisma.product.findMany(params)
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
    })
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data })
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    })
  }
}

export const productRepo = new ProductRepository()
```

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextAuth
    participant Database

    User->>Frontend: Login request
    Frontend->>NextAuth: Authenticate
    NextAuth->>Database: Verify credentials
    Database-->>NextAuth: User data
    NextAuth-->>Frontend: Session token
    Frontend-->>User: Logged in

    User->>Frontend: Access protected route
    Frontend->>NextAuth: Verify session
    NextAuth-->>Frontend: Session valid
    Frontend-->>User: Show protected content
```

#### Middleware/Guards

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Admin routes require admin role
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'ADMIN'
      }
      // User routes require authentication
      if (req.nextUrl.pathname.startsWith('/account')) {
        return !!token
      }
      return true
    },
  },
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
```

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

## Security and Performance

### Security Requirements

**Frontend Security:**

- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline' *.google-analytics.com`
- XSS Prevention: React's built-in escaping, sanitize user input
- Secure Storage: HttpOnly cookies for sessions, no sensitive data in localStorage

**Backend Security:**

- Input Validation: Zod schemas on all API endpoints
- Rate Limiting: 100 requests per minute per IP
- CORS Policy: Configured for specific origins only

**Authentication Security:**

- Token Storage: HttpOnly cookies with SameSite=Strict
- Session Management: Database sessions with 30-day expiry
- Password Policy: Minimum 8 characters, complexity requirements

### Performance Optimization

**Frontend Performance:**

- Bundle Size Target: < 300KB gzipped
- Loading Strategy: Code splitting, lazy loading, dynamic imports
- Caching Strategy: SWR for data fetching, service worker for assets

**Backend Performance:**

- Response Time Target: < 200ms p95
- Database Optimization: Indexed queries, connection pooling
- Caching Strategy: Redis for sessions, API response caching

## Testing Strategy

### Testing Pyramid

```text
        E2E Tests
       /        \
    Integration Tests
    /            \
Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests

```text
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── pages/
│   └── api-client/
```

#### Backend Tests

```text
tests/
├── unit/
│   ├── services/
│   ├── validators/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
```

#### E2E Tests

```text
tests/
└── e2e/
    ├── auth/
    ├── checkout/
    └── admin/
```

### Test Examples

#### Frontend Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = {
      name: 'Business Cards',
      price: 49.99,
      image: '/images/business-cards.jpg',
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText('Business Cards')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });
});
```

#### Backend API Test

```typescript
import request from 'supertest'
import { app } from '@/app'

describe('GET /api/products', () => {
  it('returns product list', async () => {
    const response = await request(app).get('/api/products').expect(200)

    expect(response.body).toHaveProperty('products')
    expect(Array.isArray(response.body.products)).toBe(true)
  })
})
```

#### E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('complete checkout flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('text=Business Cards')
  await page.click('text=Add to Cart')
  await page.click('text=Checkout')

  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=cardNumber]', '4242424242424242')
  await page.click('text=Place Order')

  await expect(page).toHaveURL(/\/order-confirmation/)
})
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define shared types in src/types and import from there
- **API Calls:** Never make direct fetch calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Database Access:** Always use Prisma ORM, never raw SQL
- **Authentication:** Check session on all protected routes
- **Validation:** Use Zod schemas for all user input

### Naming Conventions

| Element         | Frontend             | Backend    | Example             |
| --------------- | -------------------- | ---------- | ------------------- |
| Components      | PascalCase           | -          | `UserProfile.tsx`   |
| Hooks           | camelCase with 'use' | -          | `useAuth.ts`        |
| API Routes      | -                    | kebab-case | `/api/user-profile` |
| Database Tables | -                    | snake_case | `user_profiles`     |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant Database

    Client->>API: Request
    API->>Service: Process
    Service->>Database: Query
    Database-->>Service: Error
    Service-->>API: Throw AppError
    API-->>Client: Error Response
    Client-->>Client: Display Error
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: string
    requestId: string
  }
}
```

### Frontend Error Handling

```typescript
// lib/error-handler.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'An unexpected error occurred'
}
```

### Backend Error Handling

```typescript
// lib/api-error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

export function errorHandler(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 })
}
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Custom error logging to file
- **Backend Monitoring:** Winston logger with file rotation
- **Error Tracking:** Logged to /var/log/gangrunprinting.log
- **Performance Monitoring:** Lighthouse CI (planned)

### Key Metrics

**Frontend Metrics:**

- Core Web Vitals
- JavaScript errors
- API response times
- User interactions

**Backend Metrics:**

- Request rate
- Error rate
- Response time
- Database query performance

## Summary

This architecture document defines a modern, scalable e-commerce platform built on Next.js 15 with a focus on performance, maintainability, and user experience. The system leverages React Server Components, edge caching, and a robust backend to deliver a fast, reliable shopping experience while maintaining flexibility for future enhancements.

The architecture supports all Phase 1 MVP requirements including product configuration, multi-user roles, order processing, and payment integration, with a clear path for Phase 2 features including marketing automation and white-label capabilities.
