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
        console.log('⏰ AdminAuthWrapper: Auth check timed out, redirecting to signin')
        setIsRedirecting(true)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      }
    }, 10000) // 10 second timeout

    const checkAdminAuth = async () => {
      console.log('🔍 AdminAuthWrapper: Starting authentication check...')

      try {
        console.log('🌐 AdminAuthWrapper: Fetching /api/auth/me...')
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        })

        console.log('📡 AdminAuthWrapper: Response status:', response.status, response.statusText)
        console.log('🍪 AdminAuthWrapper: Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          console.log('❌ AdminAuthWrapper: Response not OK, redirecting to signin')
          setIsRedirecting(true)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        const userData = await response.json()
        console.log('📋 AdminAuthWrapper: Response data:', userData)

        if (!userData.user) {
          console.log('❌ AdminAuthWrapper: No user data, redirecting to signin')
          setIsRedirecting(true)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        if (userData.user.role !== 'ADMIN') {
          console.log('❌ AdminAuthWrapper: User not admin, redirecting home')
          setIsRedirecting(true)
          router.push('/?error=unauthorized')
          return
        }

        // User is authenticated and is an admin
        console.log('✅ AdminAuthWrapper: Authentication successful, setting authorized state')
        setUser(userData.user)
        setIsAuthorized(true)
      } catch (error) {
        console.error('❌ AdminAuthWrapper: Auth check failed:', error)
        setIsRedirecting(true)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      } finally {
        console.log('🏁 AdminAuthWrapper: Setting loading to false')
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