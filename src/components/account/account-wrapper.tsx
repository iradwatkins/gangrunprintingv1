'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AccountSidebar from './account-sidebar'

export default function AccountWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)

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
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          aria-label="Close navigation"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Floating Mobile Toggle Button */}
      <Button
        aria-label="Toggle navigation menu"
        className="fixed top-4 left-4 z-50 lg:hidden"
        size="icon"
        variant="outline"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Account Sidebar - Overlay on mobile, collapsible on desktop */}
      <AccountSidebar
        isDesktopOpen={isDesktopSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        showMobileToggle={true}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}
      >
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center px-4 lg:px-6">
          {/* Desktop sidebar toggle */}
          <Button
            aria-label="Toggle sidebar"
            className="hidden lg:flex mr-3"
            size="icon"
            variant="ghost"
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold hidden lg:block">My Account</h1>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
