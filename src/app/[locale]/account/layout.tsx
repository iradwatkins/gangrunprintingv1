'use client'

import { AppSidebarCustomer } from '@/components/account/app-sidebar-customer'
import { CustomerHeader } from '@/components/account/customer-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebarCustomer />
        <SidebarInset className="flex-1">
          <CustomerHeader />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
