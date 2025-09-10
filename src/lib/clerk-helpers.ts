import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return userId
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Check if user has admin role in metadata
  const isAdmin = sessionClaims?.metadata?.role === 'admin'
  
  if (!isAdmin) {
    redirect('/')
  }
  
  return userId
}

export function isAdmin(user: any) {
  return user?.publicMetadata?.role === 'admin'
}