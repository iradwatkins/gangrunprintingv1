'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthorized: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthorized: false,
})

export const useAdminAuth = () => useContext(AuthContext)

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
        console.error('AdminAuthWrapper: Authentication check timed out after 10 seconds')
        setIsRedirecting(true)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      }
    }, 10000) // 10 second timeout

    const checkAdminAuth = async () => {
      console.log('AdminAuthWrapper: Starting authentication check')
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store', // Prevent caching of auth status
        })

        if (!response.ok) {
          console.log('AdminAuthWrapper: Auth check failed - response not ok')
          setIsRedirecting(true)
          setIsLoading(false)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        const userData = await response.json()

        if (!userData.user) {
          console.log('AdminAuthWrapper: No user data found')
          setIsRedirecting(true)
          setIsLoading(false)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        if (userData.user.role !== 'ADMIN') {
          console.log('AdminAuthWrapper: User is not an admin')
          setIsRedirecting(true)
          setIsLoading(false)
          router.push('/?error=unauthorized')
          return
        }

        // User is authenticated and is an admin
        console.log('AdminAuthWrapper: User authenticated as admin:', userData.user.email)
        setUser(userData.user)
        setIsAuthorized(true)
        clearTimeout(timeout)
        setIsLoading(false)
      } catch (error) {
        console.error('AdminAuthWrapper: Auth check failed:', error)
        setIsRedirecting(true)
        setIsLoading(false)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      }
    }

    checkAdminAuth()

    // Cleanup timeout on unmount
    return () => clearTimeout(timeout)
  }, [])

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

  // User is authorized admin, show the admin interface with context
  return (
    <AuthContext.Provider value={{ user, isLoading: false, isAuthorized: true }}>
      {children}
    </AuthContext.Provider>
  )
}
