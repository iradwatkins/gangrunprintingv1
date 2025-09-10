# Clerk Authentication Setup

## Overview
GangRun Printing now uses Clerk for authentication instead of NextAuth. This provides a more robust, feature-rich authentication solution with better support.

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVubnktY2hlZXRhaC0yMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_IGyYjjCwJPvGqfTlAeP3zRyGDTJkriCg1q1qbUyUki
```

### Production (.env.production)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVubnktY2hlZXRhaC0yMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_IGyYjjCwJPvGqfTlAeP3zRyGDTJkriCg1q1qbUyUki
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Features

### Authentication Methods
- Email/Password
- Google OAuth (configured in Clerk Dashboard)
- Magic Links
- Social logins (can be added via Clerk Dashboard)

### Protected Routes
The middleware protects routes automatically:
- `/admin/*` - Admin only routes
- `/account/*` - Authenticated users only
- `/api/*` - API routes (except webhooks and public endpoints)

### Public Routes
These routes are accessible without authentication:
- `/` - Homepage
- `/products/*` - Product pages
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/about`, `/contact`, `/help-center`
- `/privacy-policy`, `/terms-of-service`

## User Roles

To set a user as admin in Clerk:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users
3. Select the user
4. Edit their Public Metadata
5. Add: `{ "role": "admin" }`

## Components

### Sign In/Out
```tsx
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'

// Sign in button
<SignInButton />

// Sign out button
<SignOutButton />

// User menu with profile
<UserButton />
```

### Check Authentication
```tsx
import { useUser } from '@clerk/nextjs'

function MyComponent() {
  const { isSignedIn, user } = useUser()
  
  if (isSignedIn) {
    return <div>Hello {user.firstName}</div>
  }
}
```

### Server-Side Auth Check
```tsx
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // User is authenticated
}
```

## Customization

### Appearance
Sign-in/up pages can be customized:
```tsx
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
      card: 'shadow-xl',
    }
  }}
/>
```

### Redirects
Configure in environment variables:
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Where to redirect after sign in
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Where to redirect after sign up

## Migration from NextAuth

### What Changed
1. **Routes**: `/auth/signin` → `/sign-in`, `/auth/signup` → `/sign-up`
2. **Hooks**: `useSession()` → `useUser()`
3. **Sign Out**: `signOut()` → `useClerk().signOut()`
4. **Server Auth**: `getServerSession()` → `auth()`

### Database
User data is now stored in Clerk's infrastructure. The local database only stores:
- Orders linked by Clerk user ID
- User preferences and settings
- Application-specific data

## Testing

### Local Development
1. Run `npm run dev`
2. Visit http://localhost:3013/sign-in
3. Create a test account or use Google OAuth

### Production
After deployment, test at https://gangrunprinting.com/sign-in

## Troubleshooting

### Common Issues

1. **"Invalid publishable key"**
   - Check that environment variables are set correctly
   - Ensure no spaces or quotes in the keys

2. **Redirect loops**
   - Check middleware configuration
   - Verify public routes are properly defined

3. **User not persisting**
   - Clear cookies and local storage
   - Check Clerk Dashboard for user status

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Support](https://clerk.com/support)