# 🏛️ ARCHITECTURE DECISION RECORDS (ADR)

**Project**: GangRun Printing
**Last Updated**: 2025-09-27
**Status**: Living Document

---

## 📚 Table of Contents

1. [Authentication Strategy](#adr-001-authentication-strategy)
2. [Server Components Pattern](#adr-002-server-components-pattern)
3. [Error Handling Philosophy](#adr-003-error-handling-philosophy)
4. [Database Query Strategy](#adr-004-database-query-strategy)
5. [Session Management](#adr-005-session-management)
6. [API Security Model](#adr-006-api-security-model)
7. [Caching Strategy](#adr-007-caching-strategy)
8. [File Storage Architecture](#adr-008-file-storage-architecture)

---

## ADR-001: Authentication Strategy

### Status

✅ Accepted and Implemented

### Context

We needed a robust authentication system that provides:

- Full control over user sessions
- No vendor lock-in
- Seamless integration with our Prisma database
- Support for multiple authentication methods

### Decision

We chose **Lucia Auth** over alternatives like NextAuth.js, Clerk, or Supabase Auth.

### Rationale

1. **Full Control**: Complete ownership of authentication logic
2. **Database Integration**: Native Prisma adapter support
3. **Flexibility**: Supports magic links, OAuth, and traditional auth
4. **Performance**: Lightweight with minimal overhead
5. **Type Safety**: Full TypeScript support

### Implementation

```typescript
// Core configuration
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(90, 'd'),
  sessionCookie: {
    name: 'auth_session',
    attributes: {
      secure: true,
      sameSite: 'lax',
      httpOnly: true,
      domain: '.gangrunprinting.com',
    },
  },
})

// Validation pattern used everywhere
export const validateRequest = async () => {
  const { user, session } = await lucia.validateSession()
  if (!user) return { user: null, session: null }
  return { user, session }
}
```

### Consequences

✅ **Positive**:

- Complete control over auth flow
- No external dependencies
- Cost-effective (no per-user pricing)
- Customizable to business needs

⚠️ **Negative**:

- More code to maintain
- Security responsibility on us
- No built-in UI components

### Lessons Learned

- Magic links require dedicated API routes for cookie setting
- Cookie domain configuration critical for subdomains
- Session extension on activity prevents unexpected logouts

---

## ADR-002: Server Components Pattern

### Status

✅ Accepted and Implemented

### Context

Product pages were experiencing JSON parsing errors due to BOM characters and complex client-side data fetching patterns.

### Decision

Adopt **Server Components** as the default pattern for data fetching, with client components only for interactivity.

### Rationale

1. **No JSON Parsing**: Data fetched server-side as JavaScript objects
2. **Better Performance**: No client-side loading states
3. **SEO Benefits**: Content rendered on server
4. **Simpler Error Handling**: Server-side try-catch
5. **Security**: API keys stay on server

### Implementation

```typescript
// ✅ CORRECT: Server Component Pattern
// app/products/[slug]/page.tsx
export default async function ProductPage({ params }) {
  // Direct database access - no JSON parsing
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { /* relations */ }
  })

  if (!product) notFound()

  // Pass to client component for interactivity
  return <ProductDetailClient product={product} />
}

// components/product/product-detail-client.tsx
'use client'
export default function ProductDetailClient({ product }) {
  // Receives data as props, handles interactions only
}
```

### Anti-Pattern to Avoid

```typescript
// ❌ INCORRECT: Client-side fetching
'use client'
export default function ProductPage() {
  useEffect(() => {
    fetch('/api/products/...') // Causes JSON parsing issues
      .then((res) => res.json()) // BOM character errors here
  })
}
```

### Consequences

✅ **Positive**:

- Eliminated JSON parsing errors completely
- Improved initial page load performance
- Better SEO and social sharing
- Simplified error handling

⚠️ **Negative**:

- Learning curve for team
- More complex data refresh patterns
- Careful prop drilling needed

---

## ADR-003: Error Handling Philosophy

### Status

✅ Accepted and Implemented

### Context

Need consistent error handling that provides good UX while maintaining security and debuggability.

### Decision

Implement **Defense in Depth** error handling with user-friendly messages and detailed server logs.

### Principles

1. **Fail Gracefully**: Never crash, always recover
2. **User-Friendly Messages**: Generic messages to users
3. **Detailed Server Logs**: Full context for debugging
4. **Request Tracking**: Unique IDs for every request
5. **Security First**: Never leak sensitive information

### Implementation

```typescript
// Custom error classes
export class MagicLinkError extends Error {
  public readonly code: string
  public readonly userMessage: string

  constructor(code: string, message: string, userMessage: string) {
    super(message)
    this.code = code
    this.userMessage = userMessage
  }
}

// API route error handling
export async function POST(request: Request) {
  const requestId = generateRequestId()

  try {
    // Business logic
    return NextResponse.json({ success: true })
  } catch (error) {
    // Detailed server log
    logger.error(`[${requestId}] Operation failed`, {
      error: error.message,
      stack: error.stack,
      request: await request.json(),
    })

    // Generic user response
    return NextResponse.json({ error: 'Operation failed. Please try again.' }, { status: 500 })
  }
}
```

### Error Response Standards

| Error Type   | HTTP Status | User Message           | Log Level |
| ------------ | ----------- | ---------------------- | --------- |
| Validation   | 400         | Specific field errors  | INFO      |
| Auth Failed  | 401         | "Please sign in"       | WARN      |
| Forbidden    | 403         | "Access denied"        | WARN      |
| Not Found    | 404         | "Resource not found"   | INFO      |
| Server Error | 500         | "Something went wrong" | ERROR     |

### Consequences

✅ **Positive**:

- Consistent error experience
- Easy debugging with request IDs
- No information leakage
- Graceful degradation

⚠️ **Negative**:

- Generic messages less helpful to users
- More logging infrastructure needed
- Request ID tracking overhead

---

## ADR-004: Database Query Strategy

### Status

✅ Accepted and Implemented

### Context

Database queries were slow and causing memory issues with deep nested includes.

### Decision

Implement **Optimized Query Patterns** with pagination, selective includes, and parallel execution.

### Principles

1. **Pagination Always**: Never return unlimited results
2. **Selective Includes**: Only fetch needed relations
3. **Parallel Queries**: Use Promise.all() for independent queries
4. **Index Everything**: Foreign keys and search fields
5. **Query Depth Limit**: Maximum 2 levels deep

### Implementation

```typescript
// Pagination pattern
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export async function getOrders(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const safePageSize = Math.min(pageSize, MAX_PAGE_SIZE)

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * safePageSize,
      take: safePageSize,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count(),
  ])

  return {
    data: orders,
    pagination: {
      page,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize),
    },
  }
}
```

### Query Optimization Rules

| Pattern            | Before           | After        | Impact     |
| ------------------ | ---------------- | ------------ | ---------- |
| Deep includes      | 5+ levels        | Max 2 levels | 80% faster |
| Unlimited results  | findMany()       | Paginated    | No OOM     |
| Sequential queries | await x; await y | Promise.all  | 50% faster |
| No indexes         | Scan all rows    | Index seek   | 90% faster |

### Consequences

✅ **Positive**:

- Query times <100ms average
- No memory exhaustion
- Predictable performance
- Scalable to millions of records

⚠️ **Negative**:

- More complex query construction
- Pagination state management
- Some N+1 queries unavoidable

---

## ADR-005: Session Management

### Status

✅ Accepted and Implemented

### Context

Users were experiencing unexpected logouts and session inconsistencies.

### Decision

Implement **90-day sessions** with automatic extension on activity.

### Configuration

```typescript
// Session lifetime configuration
const SESSION_CONFIG = {
  lifetime: 90 * 24 * 60 * 60 * 1000, // 90 days
  extensionThreshold: 30 * 24 * 60 * 60 * 1000, // Extend if <30 days left
  cookie: {
    name: 'auth_session',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: '.gangrunprinting.com',
    maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
  },
}

// Automatic session extension
export async function validateRequest() {
  const { session, user } = await lucia.validateSession()

  if (session && session.expiresAt) {
    const daysRemaining = differenceInDays(session.expiresAt, new Date())

    if (daysRemaining < 30) {
      await lucia.extendSession(session.id)
    }
  }

  return { session, user }
}
```

### Session States

| State    | Description                  | Action             |
| -------- | ---------------------------- | ------------------ |
| Active   | Valid session, >30 days left | Use normally       |
| Expiring | Valid session, <30 days left | Auto-extend        |
| Expired  | Past expiration              | Redirect to login  |
| Invalid  | Not found or tampered        | Clear and redirect |

### Consequences

✅ **Positive**:

- Users stay logged in for months
- Automatic extension prevents disruption
- Secure cookie configuration
- Cross-subdomain support

⚠️ **Negative**:

- Longer sessions = larger attack window
- More session data to manage
- Cookie size considerations

---

## ADR-006: API Security Model

### Status

✅ Accepted and Implemented

### Context

APIs need protection against abuse while maintaining good performance for legitimate users.

### Decision

Implement **Multi-Layer Security** with rate limiting, validation, and role-based access.

### Security Layers

```typescript
// 1. Rate Limiting
import { rateLimiter } from '@/lib/rate-limit'

const limiter = rateLimiter({
  window: '1m',
  max: 60,
  strategy: 'sliding-window',
})

// 2. Input Validation
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(1).max(10000),
      })
    )
    .min(1)
    .max(100),
  shippingAddress: addressSchema,
})

// 3. Authentication & Authorization
export async function POST(request: Request) {
  // Rate limit check
  const identifier = getClientIdentifier(request)
  const { success } = await limiter.check(identifier)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Authentication
  const { user, session } = await validateRequest()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Validation
  const body = await request.json()
  const result = createOrderSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: result.error.errors },
      { status: 400 }
    )
  }

  // Authorization
  if (requiredRole && user.role !== requiredRole) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Process request...
}
```

### Security Configuration

| Layer          | Configuration      | Purpose               |
| -------------- | ------------------ | --------------------- |
| Rate Limiting  | 60 req/min default | Prevent abuse         |
| Validation     | Zod schemas        | Input sanitization    |
| Authentication | Lucia sessions     | Identity verification |
| Authorization  | Role-based         | Access control        |
| CORS           | Same-origin        | XSS prevention        |
| CSRF           | SameSite cookies   | CSRF protection       |

### Consequences

✅ **Positive**:

- Comprehensive protection
- DDoS mitigation
- SQL injection prevention
- XSS protection

⚠️ **Negative**:

- Additional latency (~10ms)
- Complex debugging
- Rate limit tuning needed

---

## ADR-007: Caching Strategy

### Status

✅ Accepted and Implemented

### Context

Repeated database queries and API calls causing performance issues.

### Decision

Implement **Multi-Tier Caching** with Redis for sessions and in-memory for static data.

### Cache Layers

```typescript
// 1. Redis for sessions and dynamic data
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
})

// 2. In-memory for static data
const memoryCache = new Map()

// 3. HTTP cache headers
export async function GET(request: Request) {
  const data = await fetchData()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      ETag: generateETag(data),
    },
  })
}

// Cache-aside pattern
export async function getCachedProduct(id: string) {
  // Check cache
  const cacheKey = `product:${id}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const product = await prisma.product.findUnique({
    where: { id },
  })

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(product))

  return product
}
```

### Cache Configuration

| Data Type     | Storage | TTL     | Invalidation   |
| ------------- | ------- | ------- | -------------- |
| Sessions      | Redis   | 90 days | On logout      |
| Products      | Redis   | 5 min   | On update      |
| Categories    | Memory  | 1 hour  | On change      |
| Static assets | CDN     | 1 year  | Version change |
| API responses | HTTP    | 60 sec  | Varies         |

### Consequences

✅ **Positive**:

- 50% reduction in database load
- <50ms response times
- Better user experience
- Cost reduction

⚠️ **Negative**:

- Cache invalidation complexity
- Potential stale data
- Additional infrastructure

---

## ADR-008: File Storage Architecture

### Status

✅ Accepted and Planned

### Context

Need reliable, scalable file storage for product images and documents.

### Decision

Use **MinIO** for object storage with CDN distribution.

### Architecture

```typescript
// MinIO configuration
const minioClient = new Minio.Client({
  endPoint: 'minio.gangrunprinting.com',
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

// File upload pattern
export async function uploadFile(file: File, bucket: string) {
  const fileName = `${uuidv4()}-${file.name}`
  const fileBuffer = await file.arrayBuffer()

  // Upload to MinIO
  await minioClient.putObject(bucket, fileName, Buffer.from(fileBuffer), file.size, {
    'Content-Type': file.type,
    'Cache-Control': 'public, max-age=31536000',
  })

  // Generate CDN URL
  const cdnUrl = `https://cdn.gangrunprinting.com/${bucket}/${fileName}`

  return {
    url: cdnUrl,
    bucket,
    key: fileName,
    size: file.size,
    mimeType: file.type,
  }
}
```

### Storage Strategy

| File Type      | Bucket   | Retention | Backup |
| -------------- | -------- | --------- | ------ |
| Product images | products | Permanent | Daily  |
| Order files    | orders   | 1 year    | Weekly |
| User uploads   | uploads  | 30 days   | None   |
| System files   | system   | Permanent | Daily  |

### Consequences

✅ **Positive**:

- S3-compatible API
- Self-hosted option
- Cost-effective
- CDN integration

⚠️ **Negative**:

- Additional infrastructure
- Backup complexity
- Scaling considerations

---

## 📋 Decision Framework

### When to Create an ADR

1. Significant architectural change
2. Technology selection
3. Major pattern adoption
4. Security model change
5. Performance optimization strategy

### ADR Template

```markdown
## ADR-XXX: [Decision Title]

### Status

[Proposed | Accepted | Deprecated | Superseded]

### Context

[What is the issue that we're seeing that is motivating this decision?]

### Decision

[What is the change that we're proposing/doing?]

### Rationale

[Why is this the best choice?]

### Implementation

[Code examples and patterns]

### Consequences

[What becomes easier or harder?]

### Lessons Learned

[What did we learn after implementation?]
```

---

## 🔄 Review Schedule

- **Quarterly Review**: Assess all ADRs for relevance
- **On Major Change**: Create new ADR
- **On Issue**: Update existing ADR with lessons learned

---

---

## ADR-009: Cart Drawer Shipping Display Order

### Status

✅ Accepted and Implemented (2025-10-19)

### Context

Users were unable to see shipping costs clearly before making the decision to proceed to checkout. The shipping estimate was positioned below the total price summary, requiring users to scroll past the checkout button to view shipping options.

### Decision

Reorder the cart drawer layout to display the **Shipping Preview** component immediately above the "Proceed to Checkout" button.

### Rationale

1. **Transparency First**: Users should see all costs (including shipping) before clicking checkout
2. **Reduced Cart Abandonment**: Unexpected shipping costs at checkout are a major cause of abandonment
3. **Better UX Flow**: Natural reading order from top to bottom: Items → Totals → Shipping → Checkout
4. **Mobile Optimization**: On mobile devices, keeping shipping visible before CTA is critical

### Implementation

```typescript
// New layout order in cart-drawer.tsx
<div className="border-t pt-4 space-y-4">
  {/* 1. Price Summary (Subtotal, Tax, Total) */}
  <div className="space-y-2 text-sm">...</div>

  {/* 2. Shipping Preview - Moved here */}
  <div className="px-2">
    <ShippingPreview
      cartItems={items}
      selectedShipping={selectedShipping}
      onShippingSelected={setSelectedShipping}
    />
  </div>

  {/* 3. Checkout Button - Now below shipping */}
  <div className="space-y-2">
    <Button onClick={() => router.push('/checkout')}>
      Proceed to Checkout
    </Button>
  </div>
</div>
```

### Layout Flow

**Before:**
```
Items
---
Subtotal: $X
Shipping: $Y  (if selected)
Tax: $Z
Total: $XYZ
---
[Proceed to Checkout]
---
Shipping Preview (below button) ❌
```

**After:**
```
Items
---
Subtotal: $X
Shipping: $Y  (if selected)
Tax: $Z
Total: $XYZ
---
Shipping Preview (above button) ✅
---
[Proceed to Checkout]
```

### Consequences

✅ **Positive**:
- Users see shipping costs before checkout decision
- Reduced surprise at checkout page
- Better mobile experience
- Improved conversion rate (expected)
- More transparent pricing

⚠️ **Negative**:
- Checkout button pushed slightly lower (requires minimal scroll)
- Slightly more vertical space used

### Metrics to Monitor

- Cart abandonment rate (target: reduce by 5-10%)
- Checkout button click-through rate
- Average time spent in cart drawer
- Shipping selection rate before checkout

### Related Files

- `/src/components/cart/cart-drawer.tsx:165-172`
- `/src/components/cart/shipping-preview.tsx`

---

## ADR-010: Dedicated Cart Page with Artwork Upload

### Status

✅ Accepted and Implemented (2025-10-19)

### Context

Users needed a way to upload artwork files for their print orders. The cart drawer (side panel) was too small and cramped for a proper drag-and-drop file upload interface. Additionally, users expected a standard e-commerce cart page experience for reviewing their order before checkout.

### Decision

Create a **dedicated `/cart` page** that includes:
1. Full cart review with item details and quantity controls
2. Drag-and-drop artwork upload section
3. Shipping preview and selection
4. Order summary before checkout

**Customer Flow:**
```
Product Page → Add to Cart → /cart Page → Upload Artwork → Checkout
```

### Rationale

1. **Better Upload UX**: Full-page layout provides adequate space for drag-and-drop zones, file previews, and upload progress
2. **Standard E-commerce Pattern**: Users expect a dedicated cart page in online stores
3. **Mobile-Friendly**: Full page is more usable than side drawer on mobile devices
4. **Order Review**: Dedicated space for reviewing items, uploading files, and selecting shipping before committing to checkout
5. **Cart Drawer Limitations**: Side drawer (320-400px wide) insufficient for multi-file upload interface

### Implementation

**Files Created:**
```typescript
// /src/app/(customer)/cart/page.tsx
export default function CartPage() {
  // Full cart page with:
  // - Cart items list with quantity controls
  // - ArtworkUpload component (drag & drop)
  // - ShippingPreview component
  // - Order summary
  // - Proceed to Checkout button
}
```

**Files Modified:**

1. **AddToCartSection.tsx** - Changed behavior on add to cart:
```typescript
// Before:
addItem(cartItem)
// Cart drawer opens automatically (isOpen: true)

// After:
addItem(cartItem)
router.push('/cart') // Redirect to cart page
```

2. **cart-context.tsx** - Removed auto-open drawer:
```typescript
// Before:
case 'ADD_ITEM':
  return { ...state, items: [...], isOpen: true }

// After:
case 'ADD_ITEM':
  return { ...state, items: [...] } // No auto-open
```

### Cart Page Layout

```
┌─────────────────────────────────────────────┐
│  Shopping Cart (Header)                     │
│  [N items] [Clear All]                      │
├──────────────────┬──────────────────────────┤
│  Cart Items      │  Order Summary (Sticky)  │
│  ├─ Item 1       │  ├─ Subtotal: $XX.XX    │
│  ├─ Item 2       │  ├─ Shipping: $XX.XX    │
│  └─ Quantity     │  ├─ Tax: $XX.XX         │
│                  │  └─ Total: $XXX.XX      │
├──────────────────┤                          │
│  Upload Artwork  │  [Shipping Preview]     │
│  [Drag & Drop]   │                          │
│  • PDF, JPG, PNG │  [Proceed to Checkout]  │
│  • Max 10 files  │  [Continue Shopping]    │
│  • 50MB each     │                          │
└──────────────────┴──────────────────────────┘
```

### File Upload Integration

**Storage Strategy:**
- Files uploaded to temporary storage via `/api/upload/temporary`
- File metadata stored in `sessionStorage` with key `cart_artwork_files`
- Files associated with order after payment completion in checkout
- Temporary files cleaned up after 24 hours if not associated

**Supported Formats:**
- PDF, JPG, JPEG, PNG, GIF
- AI, EPS, SVG (design files)
- Max 10 files per order
- Max 50MB per file

### Cart Drawer vs. Cart Page

**Cart Drawer** (still available):
- Quick view from header cart icon
- Limited to displaying items and quick actions
- No longer auto-opens on "Add to Cart"
- Optional "View Cart" button to navigate to full page

**Cart Page** (new primary):
- Full order review before checkout
- Artwork upload capability
- Shipping method selection
- Better mobile experience

### Consequences

✅ **Positive**:
- Professional file upload experience
- Standard e-commerce cart page pattern
- Better mobile and desktop UX
- Room for future enhancements (promo codes, gift messages, etc.)
- Clearer customer journey: Product → Cart → Checkout

⚠️ **Negative**:
- One extra page in checkout flow (but expected by users)
- Cart drawer less prominent (now secondary feature)
- Slightly more complex routing logic

⚠️ **Trade-offs**:
- Users must navigate to separate page (not instant drawer)
- However, file upload requires full page anyway

### Metrics to Monitor

- Cart page bounce rate
- Upload completion rate
- Time spent on cart page
- Cart-to-checkout conversion rate
- File upload success rate

### Related Files

- `/src/app/(customer)/cart/page.tsx` - Main cart page
- `/src/components/product/AddToCartSection.tsx:82-85` - Add to cart redirect
- `/src/contexts/cart-context.tsx:40-63` - Cart state management
- `/src/components/product/ArtworkUpload.tsx` - Upload component
- `/src/components/cart/shipping-preview.tsx` - Shipping selection

### Future Enhancements

- [ ] Promo code input on cart page
- [ ] Saved carts for logged-in users
- [ ] Bulk upload from previous orders
- [ ] File requirement checking (bleed, resolution, etc.)
- [ ] Real-time file validation feedback

---

**Maintained by**: Engineering Team
**Last Review**: 2025-10-19
**Next Review**: 2025-12-27
