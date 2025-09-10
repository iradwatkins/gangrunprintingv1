import NextAuth from "next-auth"
import { type NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

// Validate required environment variables
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET is not set')
}

if (!process.env.AUTH_GOOGLE_ID) {
  console.error('AUTH_GOOGLE_ID is not set - Google OAuth will not work')
}

if (!process.env.AUTH_GOOGLE_SECRET) {
  console.error('AUTH_GOOGLE_SECRET is not set - Google OAuth will not work')
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    EmailProvider({
      server: {
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY!
        }
      },
      from: process.env.SENDGRID_FROM_EMAIL!,
      maxAge: 24 * 60 * 60, // Magic links valid for 24 hours
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
    async jwt({ token, user, account, profile }: any) {
      // On initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, email: true }
        })
        
        // Special handling for iradwatkins@gmail.com - always ADMIN
        if (dbUser?.email === 'iradwatkins@gmail.com' && dbUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
          })
          token.role = 'ADMIN'
        } else {
          token.role = dbUser?.role || 'CUSTOMER'
        }
      }
      
      // Always ensure email is set (for OAuth providers)
      if (!token.email && profile?.email) {
        token.email = profile.email
      }
      
      // If we don't have a role yet, fetch it from database by email
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, email: true }
        })
        
        // Ensure iradwatkins@gmail.com is always ADMIN
        if (token.email === 'iradwatkins@gmail.com') {
          token.role = 'ADMIN'
        } else {
          token.role = dbUser?.role || 'CUSTOMER'
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.isAdmin = token.role === 'ADMIN'
      }
      return session
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)