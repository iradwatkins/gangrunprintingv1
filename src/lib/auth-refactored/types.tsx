/**
 * auth - types definitions
 * Auto-refactored by BMAD
 */

export type User = {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
}

export type Session = {
  id: string
  userId: string
  expiresAt: Date
}

// Session debugging and monitoring utilities
