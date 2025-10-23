'use client'

import { useState, type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  badge?: ReactNode
}

export function CollapsibleSection({
  title,
  description,
  icon,
  defaultOpen = true,
  children,
  className,
  headerClassName,
  contentClassName,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className={cn('cursor-pointer hover:bg-accent/50 transition-colors', headerClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {badge}
              </div>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          <div className="ml-2">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent
          className={cn('animate-in slide-in-from-top-2 duration-200', contentClassName)}
        >
          {children}
        </CardContent>
      )}
    </Card>
  )
}
