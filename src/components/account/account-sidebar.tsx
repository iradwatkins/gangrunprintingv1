'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Download,
  MapPin,
  CreditCard,
  User,
  LogOut,
  Smartphone,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import NotificationToggle from '@/components/notifications/notification-toggle'

const accountNavItems = [
  {
    name: 'Dashboard',
    href: '/account/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Orders',
    href: '/account/orders',
    icon: Package,
  },
  {
    name: 'Downloads',
    href: '/account/downloads',
    icon: Download,
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    name: 'Payment Methods',
    href: '/account/payment-methods',
    icon: CreditCard,
  },
  {
    name: 'Account Details',
    href: '/account/details',
    icon: User,
  },
]

interface AccountSidebarProps {
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
  isDesktopOpen?: boolean
  showMobileToggle?: boolean
}

export default function AccountSidebar({
  isMobileOpen = false,
  setIsMobileOpen = () => {},
  isDesktopOpen = true,
  showMobileToggle = true,
}: AccountSidebarProps) {
  const pathname = usePathname()
  const [showInstallOption, setShowInstallOption] = useState(false)

  useEffect(() => {
    // Check if PWA install prompt is available
    const checkInstallPrompt = () => {
      if ((window as any).deferredPrompt) {
        setShowInstallOption(true)
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
      setShowInstallOption(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    checkInstallPrompt()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (response.ok) {
        window.location.href = '/auth/signin'
      } else {
      }
    } catch (error) {}
  }

  const handleInstallApp = async () => {
    const installEvent = (window as any).deferredPrompt
    if (installEvent) {
      installEvent.prompt()
      const { outcome } = await installEvent.userChoice
      if (outcome === 'accepted') {
        setShowInstallOption(false)
      }
      ;(window as any).deferredPrompt = null
    }
  }

  const handleMobileNavClick = () => {
    if (showMobileToggle) {
      setIsMobileOpen(false)
    }
  }

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen, setIsMobileOpen])

  return (
    <div
      className={cn(
        // Base sidebar container
        'w-64 bg-background border-r flex flex-col',
        // Fixed positioning for both mobile and desktop - higher z-index to be above header
        'fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 ease-in-out',
        // Mobile transform based on state
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop transform based on state - always fixed, collapsible
        isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'
      )}
    >
      <div className="flex-1 flex flex-col">
        {/* Mobile Header - "My Account" only on mobile */}
        {showMobileToggle && (
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">My Account</h2>
            <Button
              aria-label="Close navigation"
              className="h-8 w-8"
              size="icon"
              variant="ghost"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 lg:p-6 flex-1">
          {/* Desktop Title */}
          <h2 className="text-lg font-semibold mb-4 hidden lg:block">My Account</h2>

          {/* Navigation */}
          <nav className="space-y-1">
            {accountNavItems.map((item) => (
              <Link
                key={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2 rounded-lg text-sm transition-colors',
                  'min-h-[44px] lg:min-h-auto', // Mobile touch targets
                  pathname === item.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted/50'
                )}
                href={item.href}
                onClick={handleMobileNavClick}
              >
                <item.icon className="h-5 w-5 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="font-medium lg:font-normal">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Notification Toggle - positioned after navigation */}
          <div className="mt-4 pt-4 border-t">
            <NotificationToggle />
          </div>

          {/* Logout Button */}
          <div className="mt-8 lg:mt-6 pt-6 border-t">
            <Button
              className={cn(
                'w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50',
                'min-h-[44px] lg:min-h-auto px-4 py-3 lg:px-3 lg:py-2'
              )}
              variant="ghost"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 lg:mr-2 h-5 w-5 lg:h-4 lg:w-4" />
              <span className="font-medium lg:font-normal">Log Out</span>
            </Button>
          </div>
        </div>

        {/* PWA Install Container at Bottom */}
        {showInstallOption && (
          <div className="p-4 border-t mt-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-sm">Get the App</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Install our app for a better experience with offline access and faster loading.
                </p>
                <Button className="w-full min-h-[40px]" size="sm" onClick={handleInstallApp}>
                  Download App
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
