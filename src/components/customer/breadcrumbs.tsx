'use client'

import { Link } from '@/lib/i18n/navigation'
import { useLocale } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  // LOCALE FIX: Get current locale for home link
  const locale = useLocale()

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      {/* Home link */}
      <Link
        className="flex items-center hover:text-primary transition-colors"
        href={`/${locale}/`}
        title="Home"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.href} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 flex-shrink-0" />

            {isLast ? (
              <span
                aria-current="page"
                className="font-medium text-foreground truncate max-w-[200px] md:max-w-none"
              >
                {item.label}
              </span>
            ) : (
              <Link
                className="hover:text-primary transition-colors truncate max-w-[150px] md:max-w-none"
                href={item.href}
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/**
 * Generate breadcrumb schema.org JSON-LD for SEO
 */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gangrunprinting.com'

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: `${baseUrl}${item.href}`,
      })),
    ],
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      type="application/ld+json"
    />
  )
}
