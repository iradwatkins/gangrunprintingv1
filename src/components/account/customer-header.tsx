'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'

export function CustomerHeader() {
  const pathname = usePathname()

  // Parse pathname to create breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean)
  // Remove locale segment (en/es)
  const segments = pathSegments.slice(1)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/account/dashboard">My Account</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const href = `/${segments.slice(0, index + 1).join('/')}`
            const title = segment
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            return (
              <BreadcrumbItem key={segment}>
                <BreadcrumbSeparator className="hidden md:block" />
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
