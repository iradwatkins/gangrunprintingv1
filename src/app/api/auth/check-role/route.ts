import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ 
      authenticated: false,
      message: 'Not logged in' 
    })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.user?.email,
      name: session.user?.name,
      role: (session.user as any)?.role,
      isAdmin: (session.user as any)?.isAdmin,
      id: (session.user as any)?.id
    },
    expectedRedirect: (session.user as any)?.role === 'ADMIN' 
      ? '/admin/dashboard' 
      : '/account/dashboard'
  })
}