import { Google } from 'arctic'

// CRITICAL: API routes do NOT use locale prefixes (/en/, /es/)
// Only customer-facing pages in /[locale]/ directory use locale routing
// OAuth is a server-to-server callback and should remain locale-agnostic
// This prevents redirect_uri_mismatch errors with Google Cloud Console
// See: docs/BMAD-FIX-GOOGLE-OAUTH-LOCALE-2025-10-25.md
export const google = new Google(
  process.env.AUTH_GOOGLE_ID!,
  process.env.AUTH_GOOGLE_SECRET!,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
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
