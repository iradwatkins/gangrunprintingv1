'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Package,
  MapPin,
  CreditCard,
  Settings,
  Download,
  ShoppingCart,
  Heart,
  User,
} from 'lucide-react'

import { NavMainEnhanced, type NavMainItem } from '@/app/[locale]/admin/components/nav-main-enhanced'
import { NavUserCustomer } from '@/components/account/nav-user-customer'
import { ThemeToggle } from '@/components/admin/theme-toggle'
import { CompactLanguageSwitcher } from '@/components/i18n/language-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { useNavigationState } from '@/hooks/useNavigationState'
import Image from 'next/image'

const navItems: NavMainItem[] = [
  {
    title: 'Dashboard',
    url: '/account/dashboard',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'Orders',
    url: '/account/orders',
    icon: Package,
    isActive: true,
  },
  {
    title: 'Addresses',
    url: '/account/addresses',
    icon: MapPin,
  },
  {
    title: 'Payment Methods',
    url: '/account/payment-methods',
    icon: CreditCard,
  },
  {
    title: 'Downloads',
    url: '/account/downloads',
    icon: Download,
  },
  {
    title: 'Account Details',
    url: '/account/details',
    icon: Settings,
  },
]

const shopItems: NavMainItem[] = [
  {
    title: 'Browse Products',
    url: '/products',
    icon: ShoppingCart,
  },
  {
    title: 'Track Order',
    url: '/track',
    icon: Package,
  },
]

export function AppSidebarCustomer({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigationState = useNavigationState()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Image
            alt="GangRun Printing"
            className="h-8 w-auto object-contain"
            height={40}
            src="/gangrunprinting_logo_new_1448921366__42384-268x50.png"
            width={107}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMainEnhanced items={navItems} navigationState={navigationState} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMainEnhanced items={shopItems} navigationState={navigationState} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <CompactLanguageSwitcher />
          <ThemeToggle />
        </div>
        <NavUserCustomer />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
