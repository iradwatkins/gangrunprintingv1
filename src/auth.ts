import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

// Create the auth configuration with explicit environment variable handling
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      // Explicitly set the authorization parameters
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
    async jwt({ token, user, account, profile }) {
      // On initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        
        // Fetch user role from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, email: true }
          })
          
          // Special handling for admin email
          if (dbUser?.email === 'iradwatkins@gmail.com' && dbUser.role !== 'ADMIN') {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'ADMIN' }
            })
            token.role = 'ADMIN'
          } else {
            token.role = dbUser?.role || 'CUSTOMER'
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          token.role = 'CUSTOMER'
        }
      }
      
      // Always ensure email is set (for OAuth providers)
      if (!token.email && profile?.email) {
        token.email = profile.email
      }
      
      // If we don't have a role yet, fetch it from database by email
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { role: true, email: true }
          })
          
          // Ensure admin email is always ADMIN
          if (token.email === 'iradwatkins@gmail.com') {
            token.role = 'ADMIN'
          } else {
            token.role = dbUser?.role || 'CUSTOMER'
          }
        } catch (error) {
          console.error('Error fetching user role by email:', error)
          token.role = 'CUSTOMER'
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id
        session.user.email = token.email as string
        session.user.name = token.name as string
        (session.user as any).role = token.role
        (session.user as any).isAdmin = token.role === 'ADMIN'
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Log sign in attempts for debugging
      console.log('Sign in attempt:', {
        provider: account?.provider,
        email: user?.email,
        userId: user?.id
      })
      
      // Always allow sign in
      return true
    },
  },
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Trust the host header
  trustHost: true,
  
  // Explicitly set the base URL
  ...(process.env.NEXTAUTH_URL && { 
    url: process.env.NEXTAUTH_URL 
  }),
})