import { Google } from 'arctic'

// SEO-COMPLIANT OAUTH: Callback URL must include locale prefix (/en/)
// Default to English for OAuth callback - user can change language after login
export const google = new Google(
  process.env.AUTH_GOOGLE_ID!,
  process.env.AUTH_GOOGLE_SECRET!,
  `${process.env.NEXTAUTH_URL}/en/api/auth/google/callback`
)

export interface GoogleUser {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}
