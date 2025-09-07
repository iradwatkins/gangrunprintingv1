'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Palette,
  Printer,
  FileText,
  CreditCard,
} from 'lucide-react'

const items = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Design Studio',
    href: '/admin/design',
    icon: Palette,
  },
  {
    title: 'Invoices',
    href: '/admin/invoices',
    icon: FileText,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Print Queue',
    href: '/admin/queue',
    icon: Printer,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}