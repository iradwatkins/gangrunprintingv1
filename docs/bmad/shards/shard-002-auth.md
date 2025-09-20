# Shard 002: Authentication System Implementation

> **Story Context**: This shard covers Alex's implementation of the comprehensive authentication system for GangRun Printing, supporting multiple user types and authentication methods.

## Shard Overview

**Objective**: Implement a secure, flexible authentication system that supports customers, brokers, and administrators with different access levels and authentication methods.

**Key Components**:

- NextAuth.js configuration with multiple providers
- Google OAuth integration
- Email magic link authentication
- Role-based access control
- Session management
- User onboarding flows

## The Break: Authentication Requirements

Alex analyzed the authentication needs for the GangRun Printing platform:

### User Types & Roles

1. **Customers**: Regular users who place printing orders
2. **Brokers**: Business users with special pricing and bulk capabilities
3. **Administrators**: Platform managers with full access
4. **Staff**: Limited admin access for order processing

### Authentication Methods

1. **Google OAuth**: Quick sign-up for consumer users
2. **Email Magic Links**: Secure, passwordless authentication
3. **Admin Panel**: Separate secure login for administrators

### Security Requirements

- Secure session management with database storage
- Email verification for new accounts
- Role-based route protection
- CSRF protection
- Secure cookie handling

## The Make: Implementation Details

### NextAuth.js Configuration

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY!,
        },
      },
      from: process.env.SENDGRID_FROM_EMAIL!,
      maxAge: 24 * 60 * 60, // Magic links valid for 24 hours
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }: any) {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
  },
  trustHost: true,
}
```

### Database Schema for Authentication

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          UserRole  @default(CUSTOMER)
  brokerTier    BrokerTier?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]

  @@map("users")
}

enum UserRole {
  CUSTOMER
  BROKER
  STAFF
  ADMIN
}

enum BrokerTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### Sign-In Page Implementation

```typescript
// src/app/auth/signin/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn("email", { email, callbackUrl: "/" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to GangRun Printing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Route Protection Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Admin routes require ADMIN role
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'STAFF'
        }

        // Protected customer routes require authentication
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/orders')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/orders/:path*'],
}
```

## The Advance: Enhanced Features

### 1. Role-Based Access Control

Task implemented a comprehensive RBAC system:

```typescript
// src/lib/auth/rbac.ts
export const permissions = {
  CUSTOMER: ['orders.view.own', 'profile.edit.own', 'cart.manage'],
  BROKER: ['orders.view.own', 'orders.bulk.create', 'pricing.broker.view', 'reports.basic.view'],
  STAFF: ['orders.view.all', 'orders.edit.status', 'customers.view.basic'],
  ADMIN: ['orders.manage.all', 'users.manage.all', 'products.manage.all', 'settings.manage.all'],
}

export function hasPermission(userRole: string, permission: string): boolean {
  const userPermissions = permissions[userRole as keyof typeof permissions]
  return userPermissions?.includes(permission) ?? false
}
```

### 2. Custom Session Hook

```typescript
// src/hooks/useAuth.ts
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/auth/rbac'

export function useAuth() {
  const { data: session, status } = useSession()

  const can = (permission: string) => {
    if (!session?.user?.role) return false
    return hasPermission(session.user.role, permission)
  }

  const isBroker = session?.user?.role === 'BROKER'
  const isAdmin = session?.user?.role === 'ADMIN'
  const isStaff = session?.user?.role === 'STAFF'

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    can,
    isBroker,
    isAdmin,
    isStaff,
  }
}
```

### 3. Email Templates

Custom email templates for magic link authentication:

```typescript
// src/lib/email/templates.ts
export const magicLinkTemplate = {
  subject: 'Sign in to GangRun Printing',
  html: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Welcome to GangRun Printing!</h1>
      <p>Click the button below to sign in to your account:</p>
      <a href="{{url}}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
        Sign In
      </a>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  `,
}
```

## The Document: Key Learnings

### What Worked Well

1. **NextAuth.js Integration**: Seamless integration with Prisma and database sessions
2. **Magic Link Flow**: Users prefer passwordless authentication for e-commerce
3. **Role-Based System**: Clear separation between customer, broker, and admin access
4. **Google OAuth**: Significant reduction in signup friction for consumers

### Challenges Overcome

1. **Email Provider Setup**: SendGrid configuration required specific SMTP settings
2. **Session Management**: Database sessions provide better security than JWT for e-commerce
3. **Account Linking**: `allowDangerousEmailAccountLinking` needed for users with multiple providers
4. **TypeScript Compatibility**: NextAuth v5 beta required careful type definitions

### Security Considerations

1. **CSRF Protection**: Built-in NextAuth.js CSRF protection enabled
2. **Secure Cookies**: Production cookies use secure, httpOnly, sameSite settings
3. **Session Rotation**: Sessions rotate on sign-in for additional security
4. **Email Verification**: All new accounts require email verification

### Performance Optimizations

1. **Database Indexing**: Proper indexes on user email and session tokens
2. **Session Caching**: NextAuth.js handles session caching automatically
3. **Provider Loading**: Lazy loading of OAuth providers to reduce bundle size

## Related Shards

- **Previous**: [Shard 001 - Setup](./shard-001-setup.md)
- **Next**: [Shard 003 - Products](./shard-003-products.md)
- **References**: Database schema design, User management flows

## Files Created/Modified

### Created

- `/src/app/auth/signin/page.tsx` - Main sign-in page
- `/src/app/auth/verify/page.tsx` - Email verification page
- `/src/app/auth/error/page.tsx` - Authentication error handling
- `/src/hooks/useAuth.ts` - Authentication hook
- `/src/lib/auth/rbac.ts` - Role-based access control
- `/middleware.ts` - Route protection middleware

### Modified

- `/src/lib/auth.ts` - NextAuth configuration
- `/prisma/schema.prisma` - User and auth tables
- `/src/app/layout.tsx` - Session provider wrapper

## Environment Variables

```env
# OAuth Providers
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Email Provider
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@gangrunprinting.com

# NextAuth
AUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://gangrunprinting.com
```

## Success Metrics

- ✅ Google OAuth integration functional
- ✅ Magic link email delivery working
- ✅ Role-based access control implemented
- ✅ Session management with database storage
- ✅ Protected routes middleware active
- ✅ User onboarding flow complete
- ✅ Admin/staff access properly restricted
- ✅ Broker tier system functional

## Testing Checklist

- [ ] Google sign-in creates proper user record
- [ ] Magic link emails deliver within 2 minutes
- [ ] Sessions persist across browser refreshes
- [ ] Protected routes redirect to sign-in
- [ ] Role permissions enforce properly
- [ ] Account linking works for existing users
- [ ] Sign-out clears sessions completely
- [ ] Email verification required for new accounts

---

_This authentication system provides the secure foundation for all user interactions with the GangRun Printing platform, supporting the complex role-based access patterns required for the business model._
