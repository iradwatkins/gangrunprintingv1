'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AdminAuthWrapper } from '@/components/admin/admin-auth-wrapper'

export default function GangRunAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-background">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}

        {/* Floating Mobile Toggle Button */}
        <Button
          className="fixed top-4 left-4 z-50 lg:hidden"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar with Gang Run branding */}
        <aside className={`w-64 border-r bg-card fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}>
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
        <div className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <AdminHeader
            onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
          <main className="p-6 bg-muted/10 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  )
}