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

