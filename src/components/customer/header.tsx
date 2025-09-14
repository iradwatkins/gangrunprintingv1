'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  Phone, 
  Mail,
  Package,
  Info,
  FileText,
  ChevronDown,
  LayoutDashboard,
  Download,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ThemeToggle, MobileThemeToggle } from '@/components/theme-toggle'
import { CartButton } from '@/components/cart/cart-button'

const navigation = [
  { 
    name: 'Print Products', 
    href: '/products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/products' },
      { name: 'Business Cards', href: '/products?category=business-cards' },
      { name: 'Flyers & Brochures', href: '/products?category=flyers' },
      { name: 'Banners & Signs', href: '/products?category=banners' },
      { name: 'Stickers & Labels', href: '/products?category=stickers' },
      { name: 'Apparel', href: '/products?category=apparel' },
      { name: 'Postcards', href: '/products?category=postcards' },
    ]
  },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Help', href: '/help-center', icon: FileText },
  { name: 'Contact', href: '/contact', icon: Phone },
]

const productCategories = [
  { name: 'Business Cards', href: '/products?category=business-cards', description: 'Premium quality cards' },
  { name: 'Flyers & Brochures', href: '/products?category=flyers', description: 'Marketing materials' },
  { name: 'Banners & Signs', href: '/products?category=banners', description: 'Large format printing' },
  { name: 'Stickers & Labels', href: '/products?category=stickers', description: 'Custom die-cut stickers' },
  { name: 'Apparel', href: '/products?category=apparel', description: 'Custom printed t-shirts' },
  { name: 'Postcards', href: '/products?category=postcards', description: 'Direct mail postcards' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showInstallOption, setShowInstallOption] = useState(false)
  
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
        console.error('Auth check failed:', error)
        setUser(null)
        setIsSignedIn(false)
      } finally {
        setIsLoaded(true)
      }
    }

    checkAuth()
  }, [])

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
        setUser(null)
        setIsSignedIn(false)
        router.refresh()
        router.push('/')
      } else {
        console.error('Failed to sign out')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleInstallApp = async () => {
    // Trigger PWA installation
    const installEvent = (window as any).deferredPrompt
    if (installEvent) {
      installEvent.prompt()
      const { outcome } = await installEvent.userChoice
      console.log('PWA install outcome:', outcome)
      if (outcome === 'accepted') {
        setShowInstallOption(false)
      }
      ;(window as any).deferredPrompt = null
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-4">
              <a className="flex items-center gap-1 hover:text-primary transition-colors" href="tel:1-800-PRINTING">
                <Phone className="h-3 w-3" />
                1-800-PRINTING
              </a>
              <a className="hidden sm:flex items-center gap-1 hover:text-primary transition-colors" href="mailto:support@gangrunprinting.com">
                <Mail className="h-3 w-3" />
                support@gangrunprinting.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                Same Day Printing Available
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link className="flex items-center space-x-2" href="/">
              <Image 
                src="/gangrunprinting_logo_new_1448921366__42384-268x50.png" 
                alt="GangRun Printing" 
                width={268}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              item.children ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={cn(
                        "flex items-center gap-1",
                        pathname === item.href && "text-primary bg-primary/10"
                      )}
                      variant="ghost"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Print Product Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link className="cursor-pointer" href={child.href}>
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                >
                  <Button
                    className={cn(
                      "flex items-center gap-1",
                      pathname === item.href && "text-primary bg-primary/10"
                    )}
                    variant="ghost"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">Account</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isSignedIn ? (
                  <>
                    <DropdownMenuLabel>
                      {user?.email || 'My Account'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/orders">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/downloads">
                        <Download className="h-4 w-4" />
                        Downloads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/addresses">
                        <MapPin className="h-4 w-4" />
                        Addresses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/payment-methods">
                        <CreditCard className="h-4 w-4" />
                        Payment Methods
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/account/details">
                        <Settings className="h-4 w-4" />
                        Account Details
                      </Link>
                    </DropdownMenuItem>
                    {showInstallOption && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2" 
                          onClick={handleInstallApp}
                        >
                          <Smartphone className="h-4 w-4" />
                          Download App
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer flex items-center gap-2 text-red-600" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/auth/signin">
                        <User className="h-4 w-4" />
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/auth/signin">
                        <User className="h-4 w-4" />
                        Create Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link className="cursor-pointer flex items-center gap-2" href="/track">
                        <Package className="h-4 w-4" />
                        Track Order (Guest)
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <CartButton />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Cart */}
            <CartButton />

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px]" side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        <>
                          <Button
                            className={cn(
                              "w-full justify-start",
                              pathname === item.href && "text-primary bg-primary/10"
                            )}
                            variant="ghost"
                            onClick={() => {}}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Button>
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Button
                                  className="w-full justify-start text-sm"
                                  size="sm"
                                  variant="ghost"
                                >
                                  {child.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            className={cn(
                              "w-full justify-start",
                              pathname === item.href && "text-primary bg-primary/10"
                            )}
                            variant="ghost"
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <MobileThemeToggle />
                  </div>
                  
                  <div className="border-t pt-4 mt-4 space-y-1">
                    {isSignedIn ? (
                      <>
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                          {user?.email}
                        </div>
                        <Link href="/account/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <Package className="mr-2 h-4 w-4" />
                            Orders
                          </Button>
                        </Link>
                        <Link href="/account/downloads" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <Download className="mr-2 h-4 w-4" />
                            Downloads
                          </Button>
                        </Link>
                        <Link href="/account/addresses" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <MapPin className="mr-2 h-4 w-4" />
                            Addresses
                          </Button>
                        </Link>
                        <Link href="/account/payment-methods" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Payment Methods
                          </Button>
                        </Link>
                        <Link href="/account/details" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <Settings className="mr-2 h-4 w-4" />
                            Account Details
                          </Button>
                        </Link>
                        {showInstallOption && (
                          <Button 
                            className="w-full justify-start" 
                            variant="ghost"
                            onClick={() => {
                              handleInstallApp()
                              setMobileMenuOpen(false)
                            }}
                          >
                            <Smartphone className="mr-2 h-4 w-4" />
                            Download App
                          </Button>
                        )}
                        <Button 
                          className="w-full justify-start text-red-600" 
                          variant="ghost"
                          onClick={() => {
                            handleSignOut()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <User className="mr-2 h-4 w-4" />
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <User className="mr-2 h-4 w-4" />
                            Create Account
                          </Button>
                        </Link>
                        <Link href="/track" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full justify-start" variant="ghost">
                            <Package className="mr-2 h-4 w-4" />
                            Track Order (Guest)
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Mega Menu for Products */}
      <div className="hidden lg:block border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-6 py-2">
            <span className="text-sm font-medium text-muted-foreground">Quick Links:</span>
            {productCategories.slice(0, 4).map((category) => (
              <Link
                key={category.href}
                className="text-sm hover:text-primary transition-colors"
                href={category.href}
              >
                {category.name}
              </Link>
            ))}
            <Link className="text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-auto" href="/products">
              View All Products →
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}