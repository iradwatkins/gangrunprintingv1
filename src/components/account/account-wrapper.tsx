'use client'

// import { useUser } from '@clerk/nextjs' // TODO: Replace with Lucia auth
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AccountSidebar from './account-sidebar'

export default function AccountWrapper({ children }: { children: React.ReactNode }) {
  // const { user, isLoaded, isSignedIn } = useUser()
  // TODO: Replace with Lucia auth
  const user = null
  const isLoaded = true
  const isSignedIn = false
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in?redirectUrl=' + window.location.pathname)
    }
  }, [isSignedIn, isLoaded, router])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AccountSidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}