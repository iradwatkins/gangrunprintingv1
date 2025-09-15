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
  Mail,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
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
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChart3,
      items: [
        {
          title: 'Overview',
          url: '/admin/analytics',
        },
        {
          title: 'Revenue',
          url: '/admin/analytics?tab=revenue',
        },
        {
          title: 'Customers',
          url: '/admin/analytics?tab=customers',
        },
        {
          title: 'Products',
          url: '/admin/analytics?tab=products',
        },
        {
          title: 'Performance',
          url: '/admin/analytics?tab=performance',
        },
      ],
    },
    {
      title: 'Marketing & Automation',
      url: '/admin/marketing',
      icon: Mail,
      items: [
        {
          title: 'Campaigns',
          url: '/admin/marketing/campaigns',
        },
        {
          title: 'Email Builder',
          url: '/admin/marketing/email-builder',
        },
        {
          title: 'Automation',
          url: '/admin/marketing/automation',
        },
        {
          title: 'Segments',
          url: '/admin/marketing/segments',
        },
        {
          title: 'Analytics',
          url: '/admin/marketing/analytics',
        },
        {
          title: 'Templates',
          url: '/admin/marketing/templates',
        },
        {
          title: 'A/B Testing',
          url: '/admin/marketing/ab-testing',
        },
        {
          title: 'SMS Marketing',
          url: '/admin/marketing/sms',
        },
      ],
    },
    {
      title: 'Staff',
      url: '/admin/staff',
      icon: Users,
      items: [
        {
          title: 'All Staff',
          url: '/admin/staff',
        },
        {
          title: 'Roles & Permissions',
          url: '/admin/staff?tab=roles',
        },
        {
          title: 'Activity Log',
          url: '/admin/staff?tab=activity',
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
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/admin/settings',
        },
        {
          title: 'Printing',
          url: '/admin/settings?tab=printing',
        },
        {
          title: 'Payments',
          url: '/admin/settings?tab=payments',
        },
        {
          title: 'Shipping',
          url: '/admin/settings?tab=shipping',
        },
        {
          title: 'Notifications',
          url: '/admin/settings?tab=notifications',
        },
        {
          title: 'Integrations',
          url: '/admin/settings?tab=integrations',
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