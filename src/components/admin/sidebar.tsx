'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  FileText,
  Users,
  Printer,
  Package,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  Layers,
  Clock,
  Palette,
  Grid3x3,
  ScrollText,
  Ruler
} from 'lucide-react'

const gangRunMenuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview & metrics'
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: FileText,
    description: 'Customer orders',
    badge: '3' // Active orders
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Layers,
    description: 'Product categories'
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Product catalog'
  },
  {
    title: 'Material Types',
    href: '/admin/paper-stocks',
    icon: ScrollText,
    description: 'Material management'
  },
  {
    title: 'Add-ons',
    href: '/admin/add-ons',
    icon: Palette,
    description: 'Printing add-ons & pricing'
  },
  {
    title: 'Quantities',
    href: '/admin/quantities',
    icon: Grid3x3,
    description: 'Quantity options & pricing'
  },
  {
    title: 'Sizes',
    href: '/admin/sizes',
    icon: Ruler,
    description: 'Print sizes & dimensions'
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer management'
  },
  {
    title: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    description: 'Payments & invoices'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Business insights'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <div className="space-y-1">
        {gangRunMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive && "bg-accent text-accent-foreground"
              )}
              href={item.href}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {item.badge && (
                <Badge className="ml-auto" variant="secondary">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}