'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          // Not authenticated
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        const userData = await response.json()

        if (!userData.user) {
          // No user data
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        if (userData.user.role !== 'ADMIN') {
          // Not an admin - redirect to home with error
          router.push('/?error=unauthorized')
          return
        }

        // User is authenticated and is an admin
        setUser(userData.user)
        setIsAuthorized(true)
      } catch (error) {
        console.error('Admin auth check failed:', error)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAuth()
  }, [router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting unauthorized users
  if (!isAuthorized) {
    return null
  }

  // User is authorized admin, show the admin interface
  return <>{children}</>
}