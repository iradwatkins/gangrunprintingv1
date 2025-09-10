import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

// Admin email - hardcoded for simplicity and reliability
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

// Get auth secret with fallback
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

if (!authSecret) {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set')
}

// Simple, working auth configuration without complex database queries
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
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
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  
  callbacks: {
    // SIMPLIFIED JWT CALLBACK - NO DATABASE QUERIES
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        // Simple admin check based on email
        token.isAdmin = user.email === ADMIN_EMAIL
        token.role = user.email === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER'
      }
      return token
    },
    
    // SIMPLIFIED SESSION CALLBACK
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id
        session.user.email = token.email as string
        session.user.name = token.name as string
        (session.user as any).role = token.role
        (session.user as any).isAdmin = token.isAdmin
      }
      return session
    },
    
    // SIMPLE SIGN IN - JUST LOG AND ALLOW
    async signIn({ user, account }) {
      console.log(`[AUTH] Sign in: ${user.email} via ${account?.provider}`)
      return true
    },
  },
  
  // Trust the host header
  trustHost: true,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
})