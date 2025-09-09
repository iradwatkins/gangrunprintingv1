'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Search, 
  Phone, 
  Mail,
  Package,
  Upload,
  Home,
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { ThemeToggle, MobileThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { 
    name: 'Products', 
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
  { name: 'My Orders', href: '/track', icon: FileText },
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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">GR</span>
              </div>
              <span className="hidden sm:block font-bold text-xl">GangRun Printing</span>
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
                    <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
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
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <Button size="icon" variant="ghost">
              <Search className="h-5 w-5" />
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/auth/signin">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/auth/signup">Create Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/track">Track Orders</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
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

            {/* Get Started Button */}
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
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

                  <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 mt-4">
                      Get Started
                    </Button>
                  </Link>
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