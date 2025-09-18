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
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading && !isRedirecting) {
        setIsRedirecting(true)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      }
    }, 10000) // 10 second timeout

    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        })

        if (!response.ok) {
          setIsRedirecting(true)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        const userData = await response.json()

        if (!userData.user) {
          setIsRedirecting(true)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        if (userData.user.role !== 'ADMIN') {
          setIsRedirecting(true)
          router.push('/?error=unauthorized')
          return
        }

        // User is authenticated and is an admin
        setUser(userData.user)
        setIsAuthorized(true)
      } catch (error) {
        console.error('AdminAuthWrapper: Auth check failed:', error)
        setIsRedirecting(true)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    checkAdminAuth()

    // Cleanup timeout on unmount
    return () => clearTimeout(timeout)
  }, [router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRedirecting ? 'Redirecting to sign in...' : 'Verifying admin access...'}
          </p>
        </div>
      </div>
    )
  }

  // Show redirecting state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting unauthorized users
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Please sign in as an admin.</p>
        </div>
      </div>
    )
  }

  // User is authorized admin, show the admin interface
  return <>{children}</>
}