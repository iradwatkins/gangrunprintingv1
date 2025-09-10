'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  Package, 
  Download, 
  MapPin, 
  CreditCard, 
  User, 
  LogOut,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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

export default function AccountSidebar() {
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

  const { signOut } = useClerk()
  
  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
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

  return (
    <div className="w-64 min-h-[calc(100vh-4rem)] border-r bg-background flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-lg font-semibold mb-4">My Account</h2>
        <nav className="space-y-1">
          {accountNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      {/* PWA Install Container at Bottom */}
      {showInstallOption && (
        <div className="p-4 border-t">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-sm">Get the App</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Install our app for a better experience with offline access and faster loading.
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={handleInstallApp}
              >
                Download App
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}