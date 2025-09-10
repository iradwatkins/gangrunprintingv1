import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"

// Admin email - hardcoded for simplicity and reliability
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

// Validate required environment variables
function validateEnv() {
  const required = {
    authSecret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    googleId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || process.env.AUTH_URL
  }
  
  const missing = []
  if (!required.authSecret) missing.push('AUTH_SECRET or NEXTAUTH_SECRET')
  if (!required.googleId) missing.push('AUTH_GOOGLE_ID or GOOGLE_CLIENT_ID')
  if (!required.googleSecret) missing.push('AUTH_GOOGLE_SECRET or GOOGLE_CLIENT_SECRET')
  
  if (missing.length > 0) {
    console.error('[AUTH CONFIG] Missing environment variables:', missing.join(', '))
  }
  
  return required
}

const env = validateEnv()

export const authConfig: NextAuthConfig = {
  // Core configuration
  secret: env.authSecret,
  basePath: '/api/auth',
  
  // Providers
  providers: [
    GoogleProvider({
      clientId: env.googleId || "",
      clientSecret: env.googleSecret || "",
      allowDangerousEmailAccountLinking: true,
      // CRITICAL: Authorization params for NextAuth v5
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Add scope explicitly
          scope: "openid email profile"
        }
      },
      // Profile mapping
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    EmailProvider({
      server: {
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY || ""
        }
      },
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@gangrunprinting.com",
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  
  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  
  // Callbacks
  callbacks: {
    // SIMPLIFIED JWT CALLBACK
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        // Simple admin check based on email
        token.isAdmin = user.email === ADMIN_EMAIL
        token.role = user.email === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER'
      }
      
      // Return previous token if no update
      return token
    },
    
    // SESSION CALLBACK
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        ;(session.user as any).role = token.role
        ;(session.user as any).isAdmin = token.isAdmin
      }
      return session
    },
    
    // SIGN IN CALLBACK
    async signIn({ user, account, profile }) {
      // Log the sign in attempt
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] Sign in attempt:', {
          email: user?.email,
          provider: account?.provider,
          id: user?.id
        })
      }
      
      // Always allow sign in
      return true
    },
    
    // REDIRECT CALLBACK - Important for NextAuth v5
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  
  // Trust host - important for production
  trustHost: true,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  
  // Cookies configuration for production
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
  
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
}

export default authConfig