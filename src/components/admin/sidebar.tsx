'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  Ruler,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const navigationStructure = [
  // Core Operations - Top Level
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
    badge: '3'
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer management'
  },

  // Products Management - Dropdown
  {
    title: 'Products Management',
    icon: Package,
    isDropdown: true,
    children: [
      {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
        description: 'Product catalog'
      },
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: Layers,
        description: 'Product categories'
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
        description: 'Printing add-ons'
      },
      {
        title: 'Quantities',
        href: '/admin/quantities',
        icon: Grid3x3,
        description: 'Quantity options'
      },
      {
        title: 'Sizes',
        href: '/admin/sizes',
        icon: Ruler,
        description: 'Print sizes'
      }
    ]
  },

  // Business Management - Dropdown
  {
    title: 'Business',
    icon: BarChart3,
    isDropdown: true,
    children: [
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Business insights'
      },
      {
        title: 'Billing',
        href: '/admin/billing',
        icon: CreditCard,
        description: 'Payments & invoices'
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'System settings'
      }
    ]
  }
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedDropdowns, setExpandedDropdowns] = useState<string[]>([])

  // Auto-expand dropdowns containing active pages
  useEffect(() => {
    navigationStructure.forEach(item => {
      if (item.isDropdown && item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href)
        if (hasActiveChild && !expandedDropdowns.includes(item.title)) {
          setExpandedDropdowns(prev => [...prev, item.title])
        }
      }
    })
  }, [pathname, expandedDropdowns])

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  const toggleDropdown = (title: string) => {
    setExpandedDropdowns(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isChildActive = (children: any[]) => {
    return children.some(child => pathname === child.href)
  }

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <div className="space-y-1">
        {navigationStructure.map((item) => {
          if (item.isDropdown) {
            const isExpanded = expandedDropdowns.includes(item.title)
            const hasActiveChild = isChildActive(item.children || [])

            return (
              <div key={item.title}>
                {/* Dropdown Header */}
                <button
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-3 lg:py-2 text-sm transition-all hover:bg-accent",
                    "min-h-[44px] lg:min-h-auto text-left",
                    hasActiveChild && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => toggleDropdown(item.title)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 lg:h-4 lg:w-4" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Dropdown Children */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={handleNavClick}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                            "min-h-[40px] lg:min-h-auto",
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{child.title}</p>
                            <p className="text-xs text-muted-foreground">{child.description}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Regular navigation item
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-3 lg:py-2 text-sm transition-all hover:bg-accent",
                "min-h-[44px] lg:min-h-auto",
                isActive && "bg-accent text-accent-foreground"
              )}
              href={item.href}
              onClick={handleNavClick}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 lg:h-4 lg:w-4" />
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