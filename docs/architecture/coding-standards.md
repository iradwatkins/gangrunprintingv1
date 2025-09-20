# GangRun Printing Coding Standards

## Overview

This document defines the coding standards and best practices for the GangRun Printing platform. All developers and AI agents must follow these standards to ensure consistency, maintainability, and quality.

## TypeScript Standards

### General Rules

```typescript
// ✅ ALWAYS use TypeScript strict mode
// ✅ ALWAYS define explicit return types for functions
// ✅ NEVER use 'any' type - use 'unknown' if type is truly unknown
// ✅ ALWAYS handle null/undefined with optional chaining and nullish coalescing
```

### Type Definitions

```typescript
// ✅ Good - Explicit types with proper naming
interface ProductConfiguration {
  size: string
  quantity: number
  options?: ProductOption[]
}

// ❌ Bad - Using 'any' and poor naming
interface Config {
  data: any
  opts?: any
}
```

### Shared Types Location

```typescript
// ✅ Good - Types defined in src/types and imported
import { Product, Order, User } from '@/types'

// ❌ Bad - Types defined inline in components
// Never define shared types in component files
```

## React/Next.js Standards

### Component Structure

```typescript
// ✅ Good - Well-structured component
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  title: string;
  children?: React.ReactNode;
}

export const Component: FC<ComponentProps> = ({
  className,
  title,
  children
}) => {
  // Hooks at the top
  const [state, setState] = useState(false);
  const router = useRouter();

  // Event handlers
  const handleClick = useCallback(() => {
    setState(prev => !prev);
  }, []);

  // Early returns for conditionals
  if (!title) return null;

  // Main render
  return (
    <div className={cn('base-class', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Server Components vs Client Components

```typescript
// ✅ Good - Server Component (default)
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts(); // Server-side data fetch
  return <ProductList products={products} />;
}

// ✅ Good - Client Component (when needed)
// components/interactive/SearchBar.tsx
'use client';

export function SearchBar() {
  const [query, setQuery] = useState('');
  // Interactive component logic
}
```

### Data Fetching

```typescript
// ✅ Good - Use server components for data fetching
async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  });
  return <ProductDetail product={product} />;
}

// ❌ Bad - Client-side fetching when not necessary
'use client';
function ProductPage() {
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch('/api/products/...')
  }, []);
}
```

## API Development Standards

### API Route Structure

```typescript
// ✅ Good - Properly structured API route
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Define schema for validation
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate input
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // 3. Business logic
    const product = await prisma.product.create({
      data,
    })

    // 4. Return response
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### API Response Format

```typescript
// ✅ Good - Consistent response format
// Success response
{
  data: Product | Product[];
  meta?: {
    page: number;
    total: number;
  };
}

// Error response
{
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
```

## Database Standards

### Prisma Usage

```typescript
// ✅ Good - Use Prisma with proper error handling
import { prisma } from '@/lib/prisma'

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch product')
  }
}

// ❌ Bad - Direct SQL or missing error handling
const product = await prisma.$queryRaw`SELECT * FROM products`
```

### Transaction Handling

```typescript
// ✅ Good - Use transactions for related operations
const order = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: orderData,
  })

  await tx.orderItem.createMany({
    data: orderItems,
  })

  await tx.cart.delete({
    where: { userId },
  })

  return order
})
```

## State Management Standards

### Client State (Zustand)

```typescript
// ✅ Good - Well-structured store
// stores/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartState {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
          total: state.total + item.price * item.quantity,
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          total: calculateTotal(state.items),
        })),
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

## Error Handling Standards

### Try-Catch Patterns

```typescript
// ✅ Good - Proper error handling
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  // Log error for debugging
  console.error('Operation failed:', error)

  // Return user-friendly error
  if (error instanceof KnownError) {
    return { success: false, error: error.message }
  }

  return { success: false, error: 'An unexpected error occurred' }
}
```

### Error Boundaries

```typescript
// ✅ Good - Use error boundaries for React components
export function ProductSection() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## CSS/Styling Standards

### Tailwind CSS Usage

```typescript
// ✅ Good - Use Tailwind utilities with cn() helper
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center justify-between',
  'px-4 py-2',
  isActive && 'bg-primary text-white',
  className
)} />

// ❌ Bad - Inline styles or CSS modules when Tailwind suffices
<div style={{ display: 'flex', padding: '8px' }} />
```

### Component Styling

```typescript
// ✅ Good - Consistent styling approach
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

## Environment Variables

### Access Patterns

```typescript
// ✅ Good - Access through config object
// lib/config.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },
  api: {
    resendKey: process.env.RESEND_API_KEY!,
  },
} as const

// Use in code
import { config } from '@/lib/config'
const client = new ResendClient(config.api.resendKey)

// ❌ Bad - Direct process.env access throughout code
const key = process.env.RESEND_API_KEY
```

## Security Standards

### Input Validation

```typescript
// ✅ Good - Always validate user input with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const validated = schema.safeParse(input)
if (!validated.success) {
  return { error: validated.error }
}
```

### Authentication Checks

```typescript
// ✅ Good - Check authentication on protected routes
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Proceed with protected content
}
```

### SQL Injection Prevention

```typescript
// ✅ Good - Use Prisma's query builder
const products = await prisma.product.findMany({
  where: {
    category: userInput, // Prisma handles escaping
  },
})

// ❌ Bad - Never use raw SQL with user input
const products = await prisma.$queryRawUnsafe(
  `SELECT * FROM products WHERE category = '${userInput}'`
)
```

## Performance Standards

### Image Optimization

```typescript
// ✅ Good - Use Next.js Image component
import Image from 'next/image';

<Image
  src="/products/card.jpg"
  alt="Business Card"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>

// ❌ Bad - Regular img tag
<img src="/products/card.jpg" alt="Business Card" />
```

### Code Splitting

```typescript
// ✅ Good - Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false,
  }
);
```

### Memoization

```typescript
// ✅ Good - Memoize expensive computations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

## Git Commit Standards

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
# ✅ Good
feat(cart): add quantity selector to cart items
fix(auth): resolve session timeout issue
docs(api): update API documentation for products endpoint

# ❌ Bad
updated stuff
fix
changes
```

## File Organization Standards

### Import Order

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External library imports
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 4. Relative imports
import { localHelper } from './utils'

// 5. Type imports
import type { Product, Order } from '@/types'
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-price.ts`)
- Hooks: `use-kebab-case.ts` (e.g., `use-auth.ts`)
- Types: `kebab-case.d.ts` (e.g., `api-types.d.ts`)

## Testing Standards

### Test Structure

```typescript
// ✅ Good - Well-structured test
describe('ProductCard', () => {
  it('should display product information', () => {
    const product = mockProduct();
    render(<ProductCard product={product} />);

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct()} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Documentation Standards

### Component Documentation

```typescript
/**
 * ProductCard displays a product with its image, name, and price.
 *
 * @param product - The product data to display
 * @param onClick - Optional click handler
 * @param className - Additional CSS classes
 *
 * @example
 * <ProductCard
 *   product={product}
 *   onClick={() => router.push(`/products/${product.slug}`)}
 * />
 */
export function ProductCard({ product, onClick, className }: ProductCardProps) {
  // Component implementation
}
```

### API Documentation

```typescript
/**
 * GET /api/products
 *
 * Fetches a paginated list of products with optional filtering.
 *
 * Query Parameters:
 * - category: string (optional) - Filter by category
 * - search: string (optional) - Search term
 * - page: number (default: 1) - Page number
 * - limit: number (default: 20) - Items per page
 *
 * Response:
 * - 200: { products: Product[], total: number, page: number }
 * - 400: { error: { message: string } }
 */
```

## Critical Rules Summary

1. **NEVER** use `any` type - use `unknown` or proper types
2. **ALWAYS** validate user input with Zod schemas
3. **NEVER** access `process.env` directly - use config objects
4. **ALWAYS** use Prisma ORM - never raw SQL with user input
5. **ALWAYS** check authentication on protected routes
6. **NEVER** mutate state directly - use proper state updates
7. **ALWAYS** handle errors with try-catch and user-friendly messages
8. **ALWAYS** use Next.js Image for images
9. **NEVER** commit sensitive data or .env files
10. **ALWAYS** follow the established file structure and naming conventions
