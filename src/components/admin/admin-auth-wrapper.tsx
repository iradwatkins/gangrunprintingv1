'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

interface AuthContextType {
  user: Record<string, unknown> | null
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
        // Give more time for sessions to be ready, especially after magic link login
        const delay = attempt === 1 ? 500 : Math.min(attempt * 1200, 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))

        if (!isMounted) return

        // Add timeout to individual requests
        const controller = new AbortController()
        const requestTimeout = setTimeout(() => controller.abort(), 15000) // 15 second timeout per request

        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'X-Request-Source': 'admin-auth-wrapper',
            'X-Attempt': attempt.toString(),
          },
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(requestTimeout)

        if (!isMounted) return

        // console.log(`Admin auth check attempt ${attempt}`)

        if (!response.ok) {
          // console.log(`Admin auth check failed with status:`, response.status)

          // Be more lenient with retries for server errors and network issues
          if (
            attempt < maxRetries &&
            (response.status === 0 ||
              response.status >= 500 ||
              response.status === 502 ||
              response.status === 503)
          ) {
            // console.log(`Retrying after server error (attempt ${attempt + 1}/${maxRetries})`)
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 2000)
            return
          }

          // Only redirect on auth errors (401, 403) after multiple attempts
          if (attempt >= maxRetries && (response.status === 401 || response.status === 403)) {
            if (isMounted) {
              setIsRedirecting(true)
              setIsLoading(false)
              router.push(
                '/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname)
              )
            }
          } else if (attempt < maxRetries) {
            // console.log(`Retrying auth check (attempt ${attempt + 1}/${maxRetries})`)
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 2000)
          }
          return
        }

        const userData = await response.json()
        if (!userData.user) {
          // console.log(`No user data received (attempt ${attempt}/${maxRetries})`)

          // Be more patient with user data - sometimes sessions need time to propagate
          if (attempt < maxRetries) {
            timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), 2000)
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
        console.error(`Admin auth check error (attempt ${attempt}/${maxRetries}):`, error)

        // Handle specific error types
        const isNetworkError =
          error instanceof Error &&
          (error.name === 'AbortError' ||
            error.message.includes('fetch') ||
            error.message.includes('network'))
        const isTimeoutError = error instanceof Error && error.name === 'AbortError'

        // Be more lenient with network errors - these might be temporary
        if (attempt < maxRetries && isMounted && (isNetworkError || isTimeoutError)) {
          const retryDelay = isTimeoutError ? 4000 : 2500 // Longer delays for recovery
          // console.log(
          //   `Network/timeout error, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`
          // )
          timeoutId = setTimeout(() => checkAdminAuth(attempt + 1), retryDelay)
          return
        }

        // Only redirect after all retries are exhausted and we're sure it's not a temporary issue
        if (attempt >= maxRetries && isMounted) {
          setIsRedirecting(true)
          setIsLoading(false)
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
        }
      }
    }

    // Disabled the overall timeout - let the auth check retry as needed
    // This prevents premature logouts when the server is slow
    // const overallTimeout = setTimeout(() => {
    //   if (isLoading && !isRedirecting && isMounted) {
    //     //     setIsRedirecting(true)
    //     setIsLoading(false)
    //     router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
    //   }
    // }, 60000) // 60 second overall timeout

    checkAdminAuth()

    // Cleanup timeouts on unmount
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      // clearTimeout(overallTimeout) // Disabled overall timeout
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
