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
    const retryCount = 0
    const maxRetries = 5 // Increased retries
    let timeoutId: NodeJS.Timeout
    let isMounted = true

    const checkAdminAuth = async (attempt = 1) => {
      if (!isMounted) return

      try {
        // Reduced initial delay and progressive backoff
        const delay = attempt === 1 ? 200 : Math.min(attempt * 800, 3000)
        await new Promise((resolve) => setTimeout(resolve, delay))

        if (!isMounted) return

        // Add timeout to individual requests
        const controller = new AbortController()
        const requestTimeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout per request

        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'X-Request-Source': 'admin-auth-wrapper',
          },
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(requestTimeout)

        if (!isMounted) return

        if (!response.ok) {
          console.log(
            `AdminAuthWrapper: Auth check failed - response not ok (attempt ${attempt})`,
            response.status
          )

          // Differentiate between server errors (retry) and auth errors (redirect)
          if (response.status >= 500 && attempt < maxRetries) {
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 1500)
            return
          }

          if (attempt < maxRetries && (response.status === 0 || response.status >= 500)) {
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 1500)
            return
          }

          if (isMounted) {
            setIsRedirecting(true)
            setIsLoading(false)
            router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          }
          return
        }

        const userData = await response.json()

        if (!userData.user) {
          if (attempt < maxRetries) {
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 1500)
            return
          }
          if (isMounted) {
            setIsRedirecting(true)
            setIsLoading(false)
            router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          }
          return
        }

        if (userData.user.role !== 'ADMIN') {
          if (isMounted) {
            setIsRedirecting(true)
            setIsLoading(false)
            router.push('/?error=unauthorized')
          }
          return
        }

        // User is authenticated and is an admin

        if (isMounted) {
          setUser(userData.user)
          setIsAuthorized(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(`AdminAuthWrapper: Auth check failed (attempt ${attempt}):`, error)

        // Handle specific error types
        const isNetworkError =
          error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))
        const isTimeoutError = error instanceof Error && error.name === 'AbortError'

        if (isTimeoutError) {
        } else if (isNetworkError) {
        }

        if (attempt < maxRetries && isMounted && (isNetworkError || isTimeoutError)) {
          const retryDelay = isTimeoutError ? 3000 : 1500 // Longer delay for timeouts
          timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), retryDelay)
          return
        }

        if (isMounted) {
          console.error('AdminAuthWrapper: All retry attempts failed, redirecting to signin')
          setIsRedirecting(true)
          setIsLoading(false)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
        }
      }
    }

    // Set overall timeout to prevent infinite loading - increased from 20s to 60s
    const overallTimeout = setTimeout(() => {
      if (isLoading && !isRedirecting && isMounted) {
        console.error('AdminAuthWrapper: Authentication check timed out after 60 seconds')
        setIsRedirecting(true)
        setIsLoading(false)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      }
    }, 60000) // 60 second overall timeout

    checkAdminAuth()

    // Cleanup timeouts on unmount
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      clearTimeout(overallTimeout)
    }
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
