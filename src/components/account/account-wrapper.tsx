'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AccountSidebar from './account-sidebar'

export default function AccountWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          setIsSignedIn(!!userData.user)
        } else {
          setUser(null)
          setIsSignedIn(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        setIsSignedIn(false)
      } finally {
        setIsLoaded(true)
      }
    }

    checkAuth()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
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