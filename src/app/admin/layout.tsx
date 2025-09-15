'use client'
import { AppSidebar } from './components/app-sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AdminAuthWrapper } from '@/components/admin/admin-auth-wrapper'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function GangRunAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthWrapper>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 p-6 bg-muted/10 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthWrapper>
  )
}