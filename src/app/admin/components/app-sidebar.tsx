'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Printer,
  Palette,
  BarChart3,
  Home,
  Droplets,
  Layers,
} from 'lucide-react'

import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Ira Watkins',
    email: 'iradwatkins@gmail.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'GangRun Printing',
      logo: Printer,
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Orders',
      url: '/admin/orders',
      icon: ShoppingCart,
      items: [
        {
          title: 'All Orders',
          url: '/admin/orders',
        },
        {
          title: 'Pending',
          url: '/admin/orders?status=pending',
        },
        {
          title: 'In Production',
          url: '/admin/orders?status=production',
        },
        {
          title: 'Completed',
          url: '/admin/orders?status=completed',
        },
      ],
    },
    {
      title: 'Products',
      url: '/admin/products',
      icon: Package,
      items: [
        {
          title: 'All Products',
          url: '/admin/products',
        },
        {
          title: 'Categories',
          url: '/admin/products/categories',
        },
        {
          title: 'Templates',
          url: '/admin/products/templates',
        },
        {
          title: 'Pricing',
          url: '/admin/products/pricing',
        },
      ],
    },
    {
      title: 'Design Studio',
      url: '/admin/design',
      icon: Palette,
      items: [
        {
          title: 'Templates',
          url: '/admin/design/templates',
        },
        {
          title: 'Assets',
          url: '/admin/design/assets',
        },
        {
          title: 'Fonts',
          url: '/admin/design/fonts',
        },
      ],
    },
    {
      title: 'Customers',
      url: '/admin/customers',
      icon: Users,
      items: [
        {
          title: 'All Customers',
          url: '/admin/customers',
        },
        {
          title: 'Corporate',
          url: '/admin/customers/corporate',
        },
        {
          title: 'Individual',
          url: '/admin/customers/individual',
        },
      ],
    },
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: BarChart3,
      items: [
        {
          title: 'Sales',
          url: '/admin/reports/sales',
        },
        {
          title: 'Production',
          url: '/admin/reports/production',
        },
        {
          title: 'Inventory',
          url: '/admin/reports/inventory',
        },
        {
          title: 'Analytics',
          url: '/admin/reports/analytics',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/admin/settings',
        },
        {
          title: 'Material Types',
          url: '/admin/material-types',
        },
        {
          title: 'Add-ons',
          url: '/admin/add-ons',
        },
        {
          title: 'Paper Stocks',
          url: '/admin/paper-stocks',
        },
        {
          title: 'Quantities',
          url: '/admin/quantities',
        },
        {
          title: 'Sizes',
          url: '/admin/sizes',
        },
        {
          title: 'Printing',
          url: '/admin/settings/printing',
        },
        {
          title: 'Shipping',
          url: '/admin/settings/shipping',
        },
        {
          title: 'Payments',
          url: '/admin/settings/payments',
        },
        {
          title: 'Integrations',
          url: '/admin/settings/integrations',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Quick Actions',
      url: '#',
      icon: Frame,
    },
    {
      name: 'New Order',
      url: '/admin/orders/new',
      icon: ShoppingCart,
    },
    {
      name: 'Add Product',
      url: '/admin/products/new',
      icon: Package,
    },
    {
      name: 'Print Queue',
      url: '/admin/queue',
      icon: Printer,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}