'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Phone, 
  Mail,
  Package,
  Info,
  FileText,
  ChevronDown
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartItemCount] = useState(2) // This would come from cart context/state

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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer flex items-center gap-2" href="/auth/signin">
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer flex items-center gap-2" href="/auth/signup">
                    <User className="h-4 w-4" />
                    Create Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer flex items-center gap-2" href="/track">
                    <Package className="h-4 w-4" />
                    Track Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer flex items-center gap-2" href="/account/orders">
                    <FileText className="h-4 w-4" />
                    Order History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer flex items-center gap-2" href="/account/settings">
                    <User className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link href="/cart">
              <Button className="relative flex items-center gap-2" variant="ghost">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">Cart</span>
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Cart */}
            <Link href="/cart">
              <Button className="relative" size="icon" variant="ghost">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

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
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start" variant="ghost">
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4 mt-4 space-y-1">
                    <Link href="/track" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start" variant="ghost">
                        <Package className="mr-2 h-4 w-4" />
                        Track Orders
                      </Button>
                    </Link>
                    <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start" variant="ghost">
                        <FileText className="mr-2 h-4 w-4" />
                        Order History
                      </Button>
                    </Link>
                    <Link href="/account/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start" variant="ghost">
                        <User className="mr-2 h-4 w-4" />
                        Account Settings
                      </Button>
                    </Link>
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