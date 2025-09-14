import { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AdminAuthWrapper } from '@/components/admin/admin-auth-wrapper'
import { brandConfig } from '@/lib/brand-config'

export default function GangRunAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar with Gang Run branding */}
        <aside className="w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">GR</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Gang Run Printing</h2>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
              </div>
            </div>

            <AdminSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  )
}