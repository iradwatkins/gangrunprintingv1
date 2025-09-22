/**
 * header - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
import { cn } from '@/lib/utils'
import { ThemeToggle, MobileThemeToggle } from '@/components/theme-toggle'
import { CartButton } from '@/components/cart/cart-button'


'use client'

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
  Smartphone,
} from 'lucide-react'
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
    ],
  },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Help', href: '/help-center', icon: FileText },
  { name: 'Contact', href: '/contact', icon: Phone },
]

const productCategories = [
  {
    name: 'Business Cards',
    href: '/products?category=business-cards',
    description: 'Premium quality cards',
  },
  {
    name: 'Flyers & Brochures',
    href: '/products?category=flyers',
    description: 'Marketing materials',
  },
  {
    name: 'Banners & Signs',
    href: '/products?category=banners',
    description: 'Large format printing',
  },
  {
    name: 'Stickers & Labels',
    href: '/products?category=stickers',
    description: 'Custom die-cut stickers',
  },
  { name: 'Apparel', href: '/products?category=apparel', description: 'Custom printed t-shirts' },
  { name: 'Postcards', href: '/products?category=postcards', description: 'Direct mail postcards' },
]
