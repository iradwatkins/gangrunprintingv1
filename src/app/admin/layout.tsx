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
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <AdminHeader />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6 space-y-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  )
}