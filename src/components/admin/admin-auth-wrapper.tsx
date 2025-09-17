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
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        const userData = await response.json()
        console.log('📋 AdminAuthWrapper: Response data:', userData)

        if (!userData.user) {
          console.log('❌ AdminAuthWrapper: No user data, redirecting to signin')
          router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }

        if (userData.user.role !== 'ADMIN') {
          console.log('❌ AdminAuthWrapper: User not admin, redirecting home')
          router.push('/?error=unauthorized')
          return
        }

        // User is authenticated and is an admin
        console.log('✅ AdminAuthWrapper: Authentication successful, setting authorized state')
        setUser(userData.user)
        setIsAuthorized(true)
      } catch (error) {
        console.error('❌ AdminAuthWrapper: Auth check failed:', error)
        router.push('/auth/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      } finally {
        console.log('🏁 AdminAuthWrapper: Setting loading to false')
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